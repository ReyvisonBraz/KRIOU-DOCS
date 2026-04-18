/**
 * Motor de limpeza de texto para interpolação de documentos legais em português.
 *
 * Após a interpolação de campos opcionais (marcados com \x00 quando ausentes),
 * este módulo remove artefatos gramaticais que ficam suspensos no texto.
 *
 * Exemplo de bug que este módulo corrige:
 *   Input:  "portador(a) do RG n.º \x00 e inscrito(a) no CPF"
 *   Output: "inscrito(a) no CPF"
 */

/**
 * Regras de limpeza ordenadas para artefatos gramaticais em português.
 * Cada regra é [padrão, substituição].
 * A ordem importa: regras mais específicas primeiro.
 */
const CLEANUP_RULES = [
  // ─── Padrões com marcador de campo ausente (\x00) ─────────────────────────

  // "portador(a) do RG n.º \x00 e" → remove toda a frase do RG
  [/portador\(a\) da? (?:Cédula de Identidade )?RG?\s+n\.º\s+\x00\s+e\b/g, ""],
  // "portador(a) do RG n.º \x00," → remove a frase + vírgula
  [/portador\(a\) da? (?:Cédula de Identidade )?RG?\s+n\.º\s+\x00\s*,/g, ""],
  // "portador(a) do RG n.º \x00" no fim de frase
  [/portador\(a\) da? (?:Cédula de Identidade )?RG?\s+n\.º\s+\x00/g, ""],

  // "inscrito(a) no CPF sob n.º \x00" (quando CPF também falta — edge case)
  [/inscrito\(a\) no CPF\/?(?:MF)?\s+sob\s+n\.º\s+\x00\s*,?/g, ""],

  // "portador(a) do Passaporte n.º \x00" (autorização de viagem)
  [/portador\(a\) do Passaporte\s+n\.º\s+\x00\s*,?/g, ""],

  // "n.º \x00 e" → "e" (resquício quando só "n.º" sobra)
  [/\bn\.º\s+\x00\s+e\b/g, "e"],
  // "n.º \x00," ou "n.º \x00."
  [/\bn\.º\s+\x00\s*([,.])/g, "$1"],
  // "n.º \x00" isolado
  [/\bn\.º\s+\x00/g, ""],

  // "em \x00," → remove preposição + vírgula
  [/\bem\s+\x00\s*,/g, ""],
  // "em \x00." → mantém ponto
  [/\bem\s+\x00\s*\./g, "."],
  // "em \x00" no meio ou fim
  [/\bem\s+\x00/g, ""],

  // "de \x00," ou "de \x00"
  [/\bde\s+\x00\s*,/g, ""],
  [/\bde\s+\x00/g, ""],

  // "por \x00"
  [/\bpor\s+\x00\s*[,.]?/g, ""],

  // "para \x00"
  [/\bpara\s+\x00\s*[,.]?/g, ""],

  // "com \x00," ou "com \x00"
  [/\bcom\s+\x00\s*,/g, ""],
  [/\bcom\s+\x00/g, ""],

  // "ao \x00" / "à \x00"
  [/\b[àa]o?\s+\x00\s*[,.]?/g, ""],

  // ", \x00," → ","
  [/,\s*\x00\s*,/g, ","],
  // "\x00," → remove marcador e vírgula
  [/\x00\s*,\s*/g, ""],
  // ", \x00" → remove vírgula e marcador
  [/,\s*\x00/g, ""],
  // "\x00 e" → "e"
  [/\x00\s+e\b/g, "e"],
  // qualquer \x00 restante
  [/\x00/g, ""],

  // ─── Limpeza de pontuação residual ──────────────────────────────────────

  // "e e " → "e " (conector duplicado após remoção)
  [/\be\s+e\b/g, "e"],
  // ", ," → "," (vírgula dupla)
  [/,\s*,/g, ","],
  // Espaço antes de vírgula: " ," → ","
  [/\s+,/g, ","],
  // Vírgula antes de ponto, dois-pontos ou ponto-e-vírgula
  [/,\s*([.;:])/g, "$1"],
  // Vírgula antes de "e de outro lado" (padrão de contratos com duas partes)
  [/,\s*(e de outro lado)/g, " $1"],
  // Vírgula antes de "doravante"
  [/,\s*,\s*(doravante)/g, ", $1"],
  // Ponto final duplo
  [/\.\s*\./g, "."],
  // Dois espaços → um
  [/\s{2,}/g, " "],
  // ", ." → "."
  [/,\s*\./g, "."],
  // ". ," → "."
  [/\.\s*,/g, "."],

  // ─── Vírgulas solitárias no início ou final de frase ─────────────────────
  // ", e " no início de cláusula
  [/^,\s*/g, ""],
  // " ," no fim de frase
  [/\s*,$/, ""],
];

/**
 * Aplica todas as regras de limpeza gramatical ao texto.
 * @param {string} text - Texto após interpolação, podendo conter \x00
 * @returns {string} - Texto limpo, sem artefatos
 */
export const applyPortugueseCleanup = (text) => {
  let result = text;

  for (const [pattern, replacement] of CLEANUP_RULES) {
    result = result.replace(pattern, replacement);
  }

  return result.trim();
};
