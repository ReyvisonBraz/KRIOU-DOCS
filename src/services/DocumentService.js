/**
 * ============================================
 * KRIOU DOCS - Document Service
 * ============================================
 * Fachada para operações de documentos e perfil no Supabase.
 */

import { supabase } from "../lib/supabase";

export const DocumentService = {
  /**
   * Busca todos os documentos do usuário autenticado.
   */
  async fetchAll() {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("status", "finalizado")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data.map((row) => ({
      id:               row.id,
      type:             row.type,
      title:            row.title,
      template:         row.template,
      templateId:       row.template_id,
      templateName:     row.template_name,
      status:           row.status,
      formData:         row.form_data,
      legalData:        row.legal_data,
      documentType:     row.document_type,
      documentTypeName: row.document_type_name,
      variantId:        row.variant_id,
      variantName:      row.variant_name,
      variant:         row.variant,
      date:             new Date(row.created_at).toLocaleDateString("pt-BR", { day: "numeric", month: "short" }),
      createdAt:        row.created_at,
      userId:           row.user_id,
    }));
  },

  /**
   * Insere um documento finalizado.
   */
  async insert(doc, userId) {
    const { data, error } = await supabase
      .from("documents")
      .insert({
        user_id:            userId,
        type:               doc.type,
        title:              doc.title || "Sem título",
        template:           doc.template || null,
        template_id:        doc.templateId || null,
        template_name:      doc.templateName || null,
        status:             doc.status || "finalizado",
        form_data:          doc.formData   || null,
        legal_data:         doc.legalData  || null,
        document_type:      doc.documentType || null,
        document_type_name: doc.documentTypeName || null,
        variant_id:         doc.variantId || null,
        variant_name:       doc.variantName || null,
        variant:            doc.variant || null,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      ...doc,
      id:        data.id,
      createdAt: data.created_at,
      date:      new Date(data.created_at).toLocaleDateString("pt-BR", { day: "numeric", month: "short" }),
    };
  },

  /**
   * Remove um documento pelo ID.
   */
  async remove(documentId) {
    const { error } = await supabase
      .from("documents")
      .delete()
      .eq("id", documentId);

    if (error) throw error;
    return true;
  },

  /**
   * Busca o perfil do usuário autenticado.
   */
  async fetchProfile() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data || null;
  },

  /**
   * Atualiza nome, sobrenome, CPF e dados do Google.
   * Salva tudo para o painel admin futuro.
   */
  async updateProfile({ nome, sobrenome, cpf, googleData }) {
    // Pega o user atual do Supabase Auth
    const { data: { user } } = await supabase.auth.getUser();
    
    // Se tiver googleData, usa ela. Senão, pega do user atual
    const email = googleData?.email || user?.email || null;
    const avatar_url = googleData?.avatar_url || user?.raw_user_meta_data?.avatar_url || null;
    const google_id = user?.raw_user_meta_data?.sub || null;

    const { data, error } = await supabase
      .from("profiles")
      .update({ 
        nome, 
        sobrenome, 
        cpf,
        email,
        avatar_url,
        google_id,
      })
      .eq("id", user?.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Verifica se o perfil está completo (nome, sobrenome e CPF preenchidos).
   */
  isProfileComplete(profile) {
    return !!(profile?.nome?.trim() && profile?.sobrenome?.trim() && profile?.cpf?.trim());
  },

  /**
   * Verifica se o onboarding foi concluído.
   */
  isOnboardingDone(profile) {
    return !!profile?.onboarding_done;
  },

  /**
   * Marca o onboarding como concluído no perfil do usuário.
   */
  async markOnboardingDone() {
    const { error } = await supabase
      .from("profiles")
      .update({ onboarding_done: true })
      .eq("id", (await supabase.auth.getUser()).data.user?.id);

    if (error) throw error;
    return true;
  },
};
