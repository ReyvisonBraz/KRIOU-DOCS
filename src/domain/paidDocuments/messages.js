export const paidDocumentMessages = {
  criticalChange:
    "As alterações indicam um novo documento. O plano avulso permite editar o documento pago, mas troca de tipo ou modelo exige criar um novo documento.",

  alreadyUsedSensitiveEdit(fields) {
    return `Este documento já utilizou a correção gratuita de dados principais. Para alterar ${fields}, crie um novo documento. Você ainda pode editar endereço, datas, valores, cláusulas e textos gerais.`;
  },

  firstSensitiveEdit(fields) {
    return `Detectamos alteração em dados principais (${fields}). Você pode fazer uma correção gratuita agora caso seja ajuste de dados digitados incorretamente. Após confirmar, novas alterações em dados principais poderão exigir a criação de um novo documento.`;
  },
};
