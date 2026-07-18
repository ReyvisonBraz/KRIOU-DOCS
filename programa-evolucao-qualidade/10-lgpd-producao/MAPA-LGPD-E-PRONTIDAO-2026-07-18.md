# Mapa LGPD e prontidão de produção

Este registro é técnico e operacional. A validação das bases legais, prazos e textos públicos deve ser feita por profissional jurídico qualificado antes da publicação definitiva.

## Inventário mínimo

| Dado | Finalidade | Local | Acesso | Retenção proposta | Exclusão |
|---|---|---|---|---|---|
| ID, nome, sobrenome, CPF, telefone e avatar | autenticação, identificação e suporte | Supabase `profiles` | titular e administradores autorizados | enquanto a conta estiver ativa; depois, somente obrigação legal | solicitação do titular e rotina administrativa auditada |
| Conteúdo de currículos e documentos jurídicos | criação, edição e recuperação do documento | `documents`, `document_drafts` e armazenamento local | somente titular por RLS | enquanto a conta estiver ativa ou até exclusão pelo titular | exclusão individual já disponível; exclusão de conta ainda precisa de fluxo dedicado |
| Identidade fixada no documento pago | prevenção de fraude e política de correção | `paid_identity_snapshot` | backend e titular no próprio documento | pelo prazo necessário à relação contratual e defesa de direitos | anonimização/exclusão conforme obrigação aplicável |
| ID, estado e valor do pagamento | conciliação, liberação e suporte | `documents`, eventos do webhook e Mercado Pago | backend e operação autorizada | prazo fiscal/contábil definido pelo responsável legal | não apagar antes do prazo obrigatório; restringir e anonimizar quando possível |
| E-mail e ID de confirmação | comprovante transacional | documento e provedor de e-mail | backend e operação autorizada | prazo da relação contratual e suporte | conforme política do operador e obrigação aplicável |
| Logs técnicos | diagnóstico e segurança | navegador, Edge Functions e plataforma | equipe técnica autorizada | proposta: 30 dias para aplicação; ampliar apenas para incidente | rotação automática; nunca registrar conteúdo documental ou credenciais |

## Operadores e suboperadores conhecidos

- Supabase: autenticação, banco e Edge Functions.
- Mercado Pago: processamento financeiro.
- Vercel: hospedagem do frontend.
- Provedor de e-mail configurado na Edge Function: mensagem transacional.
- GitHub Actions: validação de código; não deve receber dados reais de usuários.

## Controles implementados

- RLS por `auth.uid()` em perfis, documentos e rascunhos.
- funções privilegiadas com `search_path` fixo e helpers internos sem execução pública;
- documento e usuário validados server-side em download, checkout e confirmação;
- campos financeiros protegidos por trigger e gravados somente pelo backend;
- logger com remoção de CPF, e-mail, telefone, tokens, conteúdo de formulário e segredos;
- nenhuma credencial real em fixtures de teste ou CI;
- exclusão individual de documentos com confirmação.

## Pendências impeditivas de publicação definitiva

1. Aprovar Política de Privacidade e Termos de Uso com responsável jurídico.
2. Definir formalmente controlador, encarregado/canal LGPD, bases legais e prazos de retenção.
3. Criar exportação estruturada dos dados do titular.
4. Criar fluxo autenticado de exclusão de conta, com tratamento separado para registros de retenção obrigatória.
5. Registrar contratos/DPA e políticas dos operadores.
6. Realizar revisão jurídica das 22 variantes; os modelos não substituem orientação jurídica individual.
7. Aplicar e validar a migration 012 no ambiente alvo antes do teste financeiro final.

## Checklist técnico antes de produção

- [x] lint, testes unitários e build automatizados em CI;
- [x] E2E público reproduzível com artefatos de falha;
- [x] download autorizado pelo backend e vinculado ao documento exato;
- [x] dependências de produção sem vulnerabilidades conhecidas em 18/07/2026;
- [ ] revisão jurídica e textos públicos aprovados;
- [ ] exportação e exclusão de conta implementadas;
- [ ] migration 012 aplicada e RLS verificada com duas identidades reais de teste;
- [ ] rollback de aplicação e banco ensaiado;
- [ ] pagamento real Q11 executado somente após os itens anteriores.
