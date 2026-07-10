# Etapa 07 — Performance e PDFs

## Linha de base

- worker de PDF próximo de 973 KB;
- jsPDF próximo de 401 KB;
- dados jurídicos próximos de 159 KB;
- html2canvas próximo de 200 KB.

## Tarefas

- medir Web Vitals e Lighthouse em mobile;
- definir orçamento de bundle por rota;
- investigar duplicação entre worker e chunks da aplicação;
- carregar modelos jurídicos por tipo/categoria;
- manter geração pesada fora da thread principal;
- medir memória e tempo com documentos longos;
- testar paginação, fontes, caracteres e impressão;
- avaliar geração server-side/signed URL para entrega paga.

## Critérios de aceite

- rota inicial não carrega geradores de PDF;
- interação permanece responsiva durante geração;
- PDF determinístico nos navegadores suportados;
- orçamento de bundle verificado automaticamente.

