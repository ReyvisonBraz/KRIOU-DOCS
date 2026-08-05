# Plano de autenticidade, QR e recuperação de documentos — KRIOU-DOCS

Data-base: 2026-08-03  
Estado: planejado após diagnóstico; bloqueado para produção até Q0–Q3  
Relação: segurança, versionamento de templates, pagamentos, download e painel

## Decisão fundamental

O QR de documento e o QR de cadastro MFA são mecanismos diferentes:

- **QR MFA:** contém segredo TOTP, aparece somente durante o cadastro do segundo
  fator e nunca pode ser impresso, compartilhado ou armazenado no documento;
- **QR de autenticidade:** contém apenas uma URL pública com token opaco e serve
  para consultar um registro mínimo, versionado e controlado pelo backend.

O QR de autenticidade comprovará que uma versão foi registrada/emitida pela
KRIOU-DOCS e se permanece ativa. Ele não deve afirmar validade jurídica absoluta,
autenticidade de assinatura, reconhecimento de firma ou certificação ICP-Brasil.

## Diagnóstico do comportamento atual

1. `getValidationURL()` gera `https://krioudocs.com.br/v/{code}`;
2. não existe rota `/v/:code` nem página pública de verificação;
3. o domínio codificado não é o endereço publicado atual;
4. `generateLegalPDF()` gera um novo código no momento do PDF, sem consultar uma
   versão registrada no servidor;
5. o código atual usa data, timestamp, `Math.random()` e hash simples de 32 bits;
   é identificador visual, não credencial ou prova criptográfica;
6. não existe tabela de versões emitidas, token público, hash canônico, revogação
   ou histórico de consultas;
7. o QR desenhado está correto como imagem, mas aponta para um fluxo inexistente.

Conclusão: o QR atual não pode ser descrito como autenticador até existir vínculo
backend entre token, versão imutável e estado do documento.

## Experiência proposta

### Pessoa que escaneia o documento impresso

1. câmera abre `https://<domínio-oficial>/verificar/<token-opaco>`;
2. página pública consulta uma Edge Function, nunca a tabela diretamente;
3. tela apresenta um dos estados:
   - **Documento registrado**;
   - **Documento revogado/substituído**;
   - **Código não encontrado**;
   - **Verificação temporariamente indisponível**;
4. quando válido, mostra somente:
   - código público de autenticidade;
   - tipo/título controlado do documento;
   - data e hora de emissão da versão;
   - nomes principais mascarados por padrão;
   - estado da versão e, se aplicável, data de revogação;
   - mensagem clara sobre o alcance da verificação;
5. oferece `Sou o titular — entrar para acessar`, preservando o destino;
6. após Google/login, somente a conta proprietária vê o documento no painel e
   pode baixá-lo se o pagamento e as demais regras backend permitirem.

### Titular dentro do painel

1. abre `Escanear documento` no painel mobile/PWA;
2. concede câmera somente após ação explícita;
3. scanner aceita exclusivamente origem e formato de token KRIOU-DOCS;
4. o backend resolve o token e confirma que o documento pertence à sessão;
5. o painel abre o detalhe correspondente;
6. botão `Baixar` usa o fluxo backend existente de autorização de download;
7. se não for proprietário, mostra apenas a verificação pública permitida, sem
   revelar qual conta criou o documento.

Também haverá digitação manual do código para aparelhos sem câmera ou sem API de
leitura compatível.

## Privacidade dos nomes das partes

Nomes completos em uma página acessível por qualquer pessoa podem expor dados
pessoais e permitir enumeração. Política inicial recomendada:

- exibir forma mascarada, por exemplo `M*** S***`, sem CPF, endereço, telefone,
  e-mail, valores, cláusulas ou conteúdo;
- permitir nomes completos somente quando a natureza do documento exigir,
  houver base/finalidade documentada e o emissor aceitar essa publicação;
- nunca retornar dados diferentes apenas porque alguém tentou vários códigos;
- limitar tentativas e evitar indexação por buscadores (`noindex`, headers e
  ausência de listagem pública);
- o login do titular não prova que as demais partes assinaram o documento.

A decisão final sobre nomes completos deve passar por revisão jurídica/LGPD antes
da ativação em produção.

## Modelo de dados proposto

### `document_versions`

- `id` UUID interno;
- `document_id` e `user_id`;
- número sequencial da versão;
- `issued_at` e estado `active/revoked/superseded`;
- tipo/título normalizados;
- snapshot mínimo dos nomes exibíveis, já classificado/mascarável;
- `content_hash` SHA-256 de representação canônica definida;
- `pdf_hash` SHA-256 quando o arquivo final for persistido;
- versão do template/renderer;
- motivo e ator de revogação;
- imutável após emissão, exceto transição de estado auditada.

### `document_verification_tokens`

- token aleatório de pelo menos 128 bits gerado no backend;
- apenas `token_hash` armazenado, nunca o token puro recuperável;
- vínculo com uma única versão;
- criado/expirado/revogado;
- rotação cria novo token sem reescrever histórico;
- índice único no hash.

O código visual amigável pode continuar existindo, mas não será segredo nem
chave de consulta suficiente. A URL usará o token opaco.

## Contratos backend

### Verificação pública

`GET /verify-document?token=...`

- valida formato antes de consultar;
- aplica rate limit por IP/rede e token hash;
- usa comparação/consulta por hash;
- retorna envelope estável com `status`, `publicCode`, `documentType`,
  `issuedAt`, `partiesMasked` e aviso legal;
- não retorna `user_id`, e-mail, CPF, conteúdo, pagamento ou IDs internos;
- respostas inválidas não ajudam enumeração;
- possui `request_id`, métricas e logs sem token puro.

### Resolução autenticada no painel

`POST /resolve-owned-document-token`

- autentica a sessão;
- deriva o usuário do JWT;
- resolve o token e exige `version.user_id = auth.uid()`;
- retorna apenas o ID necessário para navegar ao documento próprio;
- não concede download: a autorização continua separada e revalida pagamento;
- registra abuso e limita tentativas.

## Hash e significado de autenticidade

Antes de emitir uma versão deve existir uma representação canônica estável dos
campos que compõem o documento. Ordenação de chaves, normalização Unicode,
datas, espaços e versão do renderer precisam ser definidos; caso contrário o
mesmo documento produz hashes diferentes.

O hash permite detectar alteração em relação à versão registrada. Para provar
assinatura das partes será necessária uma camada posterior de assinatura
eletrônica/digital com evidências próprias. O QR sozinho não cria assinatura.

## Fases

### Q0 — Contrato, privacidade e linguagem

- [ ] definir o que significa `registrado`, `emitido`, `revogado` e `substituído`;
- [ ] aprovar texto que não prometa validade jurídica absoluta;
- [ ] classificar nomes/dados exibíveis e obter decisão LGPD/jurídica;
- [ ] definir domínio canônico e estratégia para ambientes preview/local;
- [ ] inventariar todos os geradores de currículo e documentos jurídicos;
- [ ] remover da interface qualquer promessa de QR autenticador até Q3.

Aceite: produto, jurídico e segurança concordam com o significado e os dados
públicos da verificação.

### Q1 — Versão imutável e token seguro

- [ ] criar migrations de versões e tokens com RLS bloqueada;
- [ ] gerar token criptográfico exclusivamente no backend;
- [ ] definir canonicalização e SHA-256 com vetores de teste;
- [ ] criar emissão idempotente ligada a pagamento/estado válido;
- [ ] impedir alteração de versão emitida;
- [ ] criar revogação/substituição auditada sem apagar histórico.

Aceite: duas emissões repetidas da mesma operação não criam versões divergentes;
token previsível ou código visual não acessa dados.

### Q2 — Verificador público mínimo

- [ ] criar Edge Function de verificação com rate limit;
- [ ] criar rota pública `/verificar/:token` lazy-loaded;
- [ ] implementar estados válido, revogado, inválido e indisponível;
- [ ] mostrar código, data, tipo e partes mascaradas conforme política;
- [ ] adicionar `noindex`, acessibilidade, mobile e digitação manual;
- [ ] testar enumeração, tokens malformados, revogados e de outro ambiente.

Aceite: escanear um QR de teste abre a tela correta sem login e sem PII indevida.

### Q3 — PDF vinculado à versão

- [ ] gerar código/token antes do PDF, nunca dentro do renderer;
- [ ] passar `verificationUrl` e código imutáveis ao gerador;
- [ ] usar domínio oficial configurado por ambiente, sem string fixa;
- [ ] preservar zona silenciosa, tamanho e contraste do QR;
- [ ] testar leitura em impressão real, telas, baixa luz e câmeras diferentes;
- [ ] garantir que rebaixar o mesmo PDF mantém código/hash da versão;
- [ ] impedir emissão offline com selo de autenticidade não registrado.

Aceite: QR, tela pública, banco e versão do PDF apontam para o mesmo registro.

### Q4 — Login e recuperação pelo titular

- [ ] preservar `returnTo` seguro durante Google OAuth/login;
- [ ] após login, resolver token somente contra documentos do titular;
- [ ] abrir detalhe no dashboard sem expor IDs na resposta pública;
- [ ] revalidar pagamento/download no backend;
- [ ] explicar quando a conta logada não é a criadora;
- [ ] testar refresh, sessão expirada, múltiplas contas e callback OAuth real.

Aceite: titular escaneia, entra com Google e chega ao próprio documento; outra
conta não obtém conteúdo nem confirmação de propriedade.

### Q5 — Scanner dentro do painel

- [ ] componente isolado de câmera com permissão sob demanda;
- [ ] usar API nativa quando disponível e fallback pequeno/auditado;
- [ ] validar origem, path e token antes de enviar ao backend;
- [ ] pausar leitura após primeiro resultado para evitar chamadas duplicadas;
- [ ] permitir colar/digitar código;
- [ ] desligar câmera ao fechar, trocar rota ou ir ao background;
- [ ] testar Android/iOS, navegadores principais e PWA.

Aceite: leitura abre documento próprio em poucos passos e nunca deixa câmera
ativa fora da tela de scanner.

### Q6 — Operação e evolução

- [ ] métricas de verificação válida/inválida sem PII;
- [ ] alerta de enumeração/abuso e kill switch;
- [ ] auditoria de emissão, revogação e acesso autenticado;
- [ ] runbook para QR incorreto, domínio indisponível e documento contestado;
- [ ] avaliar persistência do PDF, assinatura eletrônica e timestamp confiável;
- [ ] política de retenção para versões e eventos.

## Testes obrigatórios

- token aleatório, truncado, alterado, revogado, expirado e de outro ambiente;
- tentativa de adivinhar pelo código visual;
- usuário A tentando resolver documento de B;
- versão alterada após emissão;
- PDF regenerado e hash divergente;
- QR copiado para outro documento;
- callback OAuth com `returnTo` externo ou malicioso;
- rate limit, indisponibilidade e retry;
- leitura física de impressão em tamanhos/qualidades diferentes;
- ausência de CPF, e-mail, valores e conteúdo em resposta/log público.

## Fora do primeiro lançamento

- afirmar reconhecimento de firma ou assinatura digital;
- download público do arquivo;
- pesquisa pública por nome, CPF ou código sequencial;
- mostrar conteúdo/cláusulas ou valores;
- permitir que o QR do documento funcione como segundo fator MFA;
- aplicativo nativo obrigatório: o scanner começa responsivo/PWA.

## Ordem recomendada

Concluir a fundação MFA administrativa atual sem misturar segredos TOTP com o
QR público. Depois executar Q0/Q1 antes de alterar novamente o PDF. Q2 e Q3 devem
ser liberados juntos; uma página sem versão registrada ou um QR sem página não
devem chegar à produção.

