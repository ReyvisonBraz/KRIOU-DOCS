import React from "react";

/**
 * Mini gráfico de barras em SVG puro — sem dependências externas.
 *
 * - As barras são desenhadas em SVG (preenchem a largura disponível).
 * - Os rótulos do eixo X são HTML abaixo do gráfico, sem distorção.
 *
 * @param {Array<{key:string,label:string,value:number}>} data
 *   Série temporal vinda de `series` do admin-metrics (receita ou documentos).
 * @param {string} [color]  cor das barras (hex ou var CSS)
 * @param {number} [height] altura do gráfico em px (padrão 140)
 * @param {Function} [formatValue] formata o valor no tooltip (padrão pt-BR)
 * @param {string} [emptyMessage] texto quando não há dados no período
 */
const MiniChart = ({
  data = [],
  color = "var(--coral)",
  height = 140,
  formatValue,
  emptyMessage = "Sem dados no período",
  isLoading = false,
}) => {
  const fmt =
    formatValue ||
    ((v) => new Intl.NumberFormat("pt-BR").format(v));

  if (isLoading) {
    return (
      <div
        style={{
          height,
          borderRadius: 12,
          background: "var(--surface-2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      />
    );
  }

  const hasData = Array.isArray(data) && data.some((d) => Number(d.value) > 0);

  if (!hasData) {
    return (
      <div
        style={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-faint)",
          fontSize: 13,
        }}
      >
        {emptyMessage}
      </div>
    );
  }

  // ViewBox fixo (320×140): a proporção das barras não distorce.
  const W = 320;
  const H = 140;
  const padBottom = 10;
  const baseline = H - padBottom;
  const max = Math.max(...data.map((d) => Number(d.value)), 1);
  const n = data.length;
  const slot = W / n;
  const barWidth = Math.max(2, slot * 0.62);

  // Mostra no máximo 6 rótulos no eixo X (evita sobreposição).
  const labelStep = Math.max(1, Math.ceil(n / 6));
  const visibleLabels = data
    .map((d, i) => ({ label: d.label, index: i }))
    .filter((_, i) => i % labelStep === 0);

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ width: "100%", height, display: "block" }}
        role="img"
        aria-label="Gráfico de barras"
      >
        {data.map((d, i) => {
          const value = Number(d.value) || 0;
          const h = Math.max(2, (value / max) * (baseline - 6));
          const x = i * slot + (slot - barWidth) / 2;
          const y = baseline - h;
          return (
            <rect
              key={d.key}
              x={x}
              y={y}
              width={barWidth}
              height={h}
              rx={2}
              fill={color}
              opacity={value > 0 ? 0.9 : 0.12}
            >
              <title>{`${d.label}: ${fmt(value)}`}</title>
            </rect>
          );
        })}
      </svg>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 6,
          fontSize: 10,
          color: "var(--text-faint)",
          fontFamily: "var(--font-body)",
        }}
      >
        {visibleLabels.map(({ label, index }) => (
          <span key={`${label}-${index}`} style={{ whiteSpace: "nowrap" }}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default MiniChart;
