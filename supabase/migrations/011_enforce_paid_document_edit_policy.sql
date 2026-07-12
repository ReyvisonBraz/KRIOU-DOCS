-- Backend guard for the one-off paid document policy.
--
-- The frontend may explain and confirm the rule, but the database is the
-- authoritative boundary. This trigger protects paid documents even if a user
-- bypasses the UI and updates the `documents` table directly through the API.

CREATE OR REPLACE FUNCTION public.kriou_normalize_identity_text(value TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    trim(
      regexp_replace(
        translate(
          coalesce(value, ''),
          'ÁÀÂÃÄÅáàâãäåÉÈÊËéèêëÍÌÎÏíìîïÓÒÔÕÖóòôõöÚÙÛÜúùûüÇçÑñ',
          'AAAAAAaaaaaaEEEEeeeeIIIIiiiiOOOOOoooooUUUUuuuuCcNn'
        ),
        '[^[:alnum:]]+',
        ' ',
        'g'
      )
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.kriou_normalize_identity_document(value TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN regexp_replace(coalesce(value, ''), '\D', '', 'g');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.kriou_identity_path_has_any(path TEXT, keywords TEXT[])
RETURNS BOOLEAN AS $$
DECLARE
  normalized_path TEXT := public.kriou_normalize_identity_text(path);
  keyword TEXT;
BEGIN
  FOREACH keyword IN ARRAY keywords LOOP
    IF normalized_path LIKE '%' || public.kriou_normalize_identity_text(keyword) || '%' THEN
      RETURN TRUE;
    END IF;
  END LOOP;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.kriou_identity_field_weight(path TEXT)
RETURNS INT AS $$
DECLARE
  normalized_path TEXT := public.kriou_normalize_identity_text(path);
BEGIN
  IF normalized_path LIKE '%cnpj%' THEN
    RETURN 45;
  ELSIF normalized_path LIKE '%cpf%' THEN
    RETURN 40;
  ELSIF normalized_path LIKE '%rg%' OR normalized_path LIKE '%identidade%' THEN
    RETURN 25;
  ELSIF normalized_path LIKE '%documento%' THEN
    RETURN 30;
  ELSIF normalized_path LIKE '%nome%' OR normalized_path LIKE '%name%' THEN
    RETURN 35;
  END IF;

  RETURN 25;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.kriou_identity_field_label(path TEXT)
RETURNS TEXT AS $$
DECLARE
  last_part TEXT;
BEGIN
  last_part := regexp_replace(coalesce(path, 'campo'), '^.*\.', '');
  last_part := regexp_replace(last_part, '\[(\d+)\]', ' \1', 'g');
  last_part := regexp_replace(last_part, '[_-]+', ' ', 'g');
  last_part := regexp_replace(last_part, '\s+', ' ', 'g');
  last_part := trim(last_part);

  IF last_part = '' THEN
    RETURN 'Campo';
  END IF;

  RETURN upper(substr(last_part, 1, 1)) || substr(last_part, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.kriou_should_collect_identity_field(path TEXT, value JSONB)
RETURNS BOOLEAN AS $$
DECLARE
  sensitive_keywords CONSTANT TEXT[] := ARRAY[
    'nome',
    'name',
    'cpf',
    'rg',
    'cnpj',
    'documento',
    'identidade',
    'locador',
    'locatario',
    'locatário',
    'comprador',
    'vendedor',
    'contratante',
    'contratado',
    'outorgante',
    'outorgado',
    'proprietario',
    'proprietário',
    'inquilino',
    'parte',
    'responsavel',
    'responsável'
  ];
  non_identity_keywords CONSTANT TEXT[] := ARRAY[
    'endereco',
    'endereço',
    'logradouro',
    'bairro',
    'cidade',
    'estado',
    'uf',
    'cep',
    'numero',
    'número',
    'telefone',
    'email',
    'e-mail',
    'valor',
    'data',
    'prazo',
    'clausula',
    'cláusula',
    'descricao',
    'descrição',
    'observacao',
    'observação'
  ];
BEGIN
  IF value IS NULL OR value = 'null'::jsonb THEN
    RETURN FALSE;
  END IF;

  IF jsonb_typeof(value) NOT IN ('string', 'number') THEN
    RETURN FALSE;
  END IF;

  IF trim(value #>> '{}') = '' THEN
    RETURN FALSE;
  END IF;

  IF NOT public.kriou_identity_path_has_any(path, sensitive_keywords) THEN
    RETURN FALSE;
  END IF;

  IF public.kriou_identity_path_has_any(path, non_identity_keywords) THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.kriou_collect_identity_fields(value JSONB, base_path TEXT DEFAULT '')
RETURNS TABLE(path TEXT, label TEXT, raw_value TEXT, normalized TEXT, weight INT) AS $$
DECLARE
  child RECORD;
  child_path TEXT;
  is_document_number BOOLEAN;
BEGIN
  IF value IS NULL OR value = 'null'::jsonb THEN
    RETURN;
  END IF;

  IF jsonb_typeof(value) = 'object' THEN
    FOR child IN SELECT entry.key, entry.child_value FROM jsonb_each(value) AS entry(key, child_value) LOOP
      child_path := CASE
        WHEN base_path = '' THEN child.key
        ELSE base_path || '.' || child.key
      END;

      RETURN QUERY
        SELECT *
        FROM public.kriou_collect_identity_fields(child.child_value, child_path);
    END LOOP;

    RETURN;
  END IF;

  IF jsonb_typeof(value) = 'array' THEN
    FOR child IN
      SELECT entry.ordinality, entry.child_value
      FROM jsonb_array_elements(value) WITH ORDINALITY AS entry(child_value, ordinality)
    LOOP
      child_path := base_path || '[' || (child.ordinality - 1)::TEXT || ']';

      RETURN QUERY
        SELECT *
        FROM public.kriou_collect_identity_fields(child.child_value, child_path);
    END LOOP;

    RETURN;
  END IF;

  IF NOT public.kriou_should_collect_identity_field(base_path, value) THEN
    RETURN;
  END IF;

  is_document_number := public.kriou_identity_path_has_any(
    base_path,
    ARRAY['cpf', 'rg', 'cnpj', 'documento', 'identidade']
  );

  path := base_path;
  label := public.kriou_identity_field_label(base_path);
  raw_value := value #>> '{}';
  normalized := CASE
    WHEN is_document_number THEN public.kriou_normalize_identity_document(raw_value)
    ELSE public.kriou_normalize_identity_text(raw_value)
  END;
  weight := public.kriou_identity_field_weight(base_path);

  IF normalized <> '' THEN
    RETURN NEXT;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.kriou_create_paid_identity_snapshot(
  document_type_value TEXT,
  legal_document_type_value TEXT,
  form_data_value JSONB,
  legal_data_value JSONB
)
RETURNS JSONB AS $$
DECLARE
  source_data JSONB;
  fields JSONB;
BEGIN
  source_data := CASE
    WHEN document_type_value = 'legal' THEN legal_data_value
    ELSE form_data_value
  END;

  SELECT coalesce(
    jsonb_agg(
      jsonb_build_object(
        'path', path,
        'label', label,
        'value', raw_value,
        'normalized', normalized,
        'weight', weight
      )
      ORDER BY path
    ),
    '[]'::jsonb
  )
  INTO fields
  FROM public.kriou_collect_identity_fields(source_data);

  RETURN jsonb_build_object(
    'version', 1,
    'type', document_type_value,
    'documentType', legal_document_type_value,
    'fields', fields,
    'createdAt', now()
  );
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION public.kriou_paid_identity_change_check(previous_snapshot JSONB, next_snapshot JSONB)
RETURNS JSONB AS $$
DECLARE
  score INT := 0;
  change_count INT := 0;
  changes JSONB := '[]'::jsonb;
  change RECORD;
BEGIN
  IF previous_snapshot IS NULL OR next_snapshot IS NULL THEN
    RETURN jsonb_build_object('level', 'normal', 'score', 0, 'changes', '[]'::jsonb);
  END IF;

  IF previous_snapshot->>'type' IS NOT NULL
    AND next_snapshot->>'type' IS NOT NULL
    AND previous_snapshot->>'type' IS DISTINCT FROM next_snapshot->>'type' THEN
    RETURN jsonb_build_object(
      'level', 'critical',
      'score', 100,
      'changes', jsonb_build_array(jsonb_build_object(
        'label', 'Tipo de documento',
        'before', previous_snapshot->>'type',
        'after', next_snapshot->>'type'
      ))
    );
  END IF;

  IF previous_snapshot->>'documentType' IS NOT NULL
    AND next_snapshot->>'documentType' IS NOT NULL
    AND previous_snapshot->>'documentType' IS DISTINCT FROM next_snapshot->>'documentType' THEN
    RETURN jsonb_build_object(
      'level', 'critical',
      'score', 100,
      'changes', jsonb_build_array(jsonb_build_object(
        'label', 'Modelo jurídico',
        'before', previous_snapshot->>'documentType',
        'after', next_snapshot->>'documentType'
      ))
    );
  END IF;

  FOR change IN
    WITH previous_fields AS (
      SELECT *
      FROM jsonb_to_recordset(coalesce(previous_snapshot->'fields', '[]'::jsonb))
        AS field(path TEXT, label TEXT, value TEXT, normalized TEXT, weight INT)
    ),
    next_fields AS (
      SELECT *
      FROM jsonb_to_recordset(coalesce(next_snapshot->'fields', '[]'::jsonb))
        AS field(path TEXT, label TEXT, value TEXT, normalized TEXT, weight INT)
    )
    SELECT
      coalesce(next_fields.path, previous_fields.path) AS path,
      coalesce(next_fields.label, previous_fields.label, public.kriou_identity_field_label(coalesce(next_fields.path, previous_fields.path))) AS label,
      coalesce(previous_fields.value, '') AS before_value,
      coalesce(next_fields.value, '') AS after_value,
      greatest(
        coalesce(previous_fields.weight, 0),
        coalesce(next_fields.weight, 0),
        public.kriou_identity_field_weight(coalesce(next_fields.path, previous_fields.path))
      ) AS weight
    FROM previous_fields
    FULL JOIN next_fields ON next_fields.path = previous_fields.path
    WHERE coalesce(previous_fields.normalized, '') IS DISTINCT FROM coalesce(next_fields.normalized, '')
  LOOP
    score := score + change.weight;
    change_count := change_count + 1;
    changes := changes || jsonb_build_array(jsonb_build_object(
      'path', change.path,
      'label', change.label,
      'before', change.before_value,
      'after', change.after_value,
      'weight', change.weight
    ));
  END LOOP;

  IF change_count > 1 THEN
    score := score + least(20, (change_count - 1) * 5);
  END IF;

  RETURN jsonb_build_object(
    'level', CASE WHEN score > 0 THEN 'sensitive' ELSE 'normal' END,
    'score', score,
    'changes', changes
  );
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION public.kriou_enforce_paid_document_edit_policy()
RETURNS TRIGGER AS $$
DECLARE
  old_is_paid BOOLEAN;
  previous_snapshot JSONB;
  next_snapshot JSONB;
  identity_check JSONB;
  identity_level TEXT;
  payment_approval_changed BOOLEAN;
BEGIN
  payment_approval_changed := coalesce(OLD.payment_status, '') IS DISTINCT FROM coalesce(NEW.payment_status, '')
    AND NEW.payment_status = 'approved';

  IF payment_approval_changed AND coalesce(auth.role(), '') <> 'service_role' THEN
    RAISE EXCEPTION 'Pagamento aprovado só pode ser gravado pelo backend.'
      USING ERRCODE = 'P0001';
  END IF;

  old_is_paid := OLD.status = 'finalizado' AND OLD.payment_status = 'approved';

  IF NOT old_is_paid THEN
    RETURN NEW;
  END IF;

  IF OLD.sensitive_edit_used AND NOT NEW.sensitive_edit_used THEN
    RAISE EXCEPTION 'A correção gratuita de dados principais já foi usada e não pode ser resetada.'
      USING ERRCODE = 'P0001';
  END IF;

  previous_snapshot := coalesce(
    OLD.paid_identity_snapshot,
    public.kriou_create_paid_identity_snapshot(OLD.type, OLD.document_type, OLD.form_data, OLD.legal_data)
  );
  next_snapshot := public.kriou_create_paid_identity_snapshot(NEW.type, NEW.document_type, NEW.form_data, NEW.legal_data);
  identity_check := public.kriou_paid_identity_change_check(previous_snapshot, next_snapshot);
  identity_level := identity_check->>'level';

  IF identity_level = 'critical' THEN
    RAISE EXCEPTION 'Troca de tipo/modelo exige criar e pagar um novo documento.'
      USING ERRCODE = 'P0001';
  END IF;

  IF identity_level = 'sensitive' AND OLD.sensitive_edit_used THEN
    RAISE EXCEPTION 'Este documento já utilizou a correção gratuita de dados principais. Crie um novo documento para alterar novamente esses dados.'
      USING ERRCODE = 'P0001';
  END IF;

  IF identity_level = 'sensitive' AND NOT NEW.sensitive_edit_used THEN
    RAISE EXCEPTION 'Alteração de dados principais exige confirmação explícita da correção gratuita.'
      USING ERRCODE = 'P0001';
  END IF;

  IF identity_level = 'sensitive' THEN
    NEW.paid_identity_snapshot := next_snapshot;
    NEW.sensitive_edit_used := TRUE;
    NEW.sensitive_edit_used_at := coalesce(NEW.sensitive_edit_used_at, now());
    NEW.sensitive_edit_summary := coalesce(NEW.sensitive_edit_summary, identity_check);
  ELSE
    NEW.paid_identity_snapshot := previous_snapshot;
    NEW.sensitive_edit_used := OLD.sensitive_edit_used;
    NEW.sensitive_edit_used_at := OLD.sensitive_edit_used_at;
    NEW.sensitive_edit_summary := OLD.sensitive_edit_summary;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.kriou_protect_backend_payment_fields()
RETURNS TRIGGER AS $$
DECLARE
  is_backend_role BOOLEAN := coalesce(auth.role(), '') = 'service_role';
BEGIN
  IF is_backend_role THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.payment_status = 'approved'
      OR NEW.payment_id IS NOT NULL
      OR NEW.payment_amount IS NOT NULL
      OR NEW.payment_preference_id IS NOT NULL
      OR NEW.paid_at IS NOT NULL THEN
      RAISE EXCEPTION 'Campos de pagamento só podem ser gravados pelo backend.'
        USING ERRCODE = 'P0001';
    END IF;

    RETURN NEW;
  END IF;

  IF coalesce(OLD.payment_status, '') IS DISTINCT FROM coalesce(NEW.payment_status, '')
    OR coalesce(OLD.payment_id, '') IS DISTINCT FROM coalesce(NEW.payment_id, '')
    OR OLD.payment_amount IS DISTINCT FROM NEW.payment_amount
    OR coalesce(OLD.payment_preference_id, '') IS DISTINCT FROM coalesce(NEW.payment_preference_id, '')
    OR OLD.paid_at IS DISTINCT FROM NEW.paid_at THEN
    RAISE EXCEPTION 'Campos de pagamento só podem ser atualizados pelo backend.'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS protect_backend_payment_fields ON documents;
CREATE TRIGGER protect_backend_payment_fields
  BEFORE INSERT OR UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION public.kriou_protect_backend_payment_fields();

DROP TRIGGER IF EXISTS enforce_paid_document_edit_policy ON documents;
CREATE TRIGGER enforce_paid_document_edit_policy
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION public.kriou_enforce_paid_document_edit_policy();
