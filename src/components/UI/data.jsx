import React from "react";

const defaultRowKey = (row, index) => row?.id ?? index;
const getMobileLabel = (column) => {
  if (column.mobileLabel !== undefined) return column.mobileLabel;
  return typeof column.header === "string" ? column.header : column.key;
};

/**
 * Tabela semântica que se reorganiza como lista de cartões abaixo de 768 px.
 * Cada coluna define `key`, `header` e, opcionalmente, `render` e `mobile`.
 */
export const DataTable = ({
  columns,
  rows = [],
  caption,
  captionVisible = false,
  ariaLabel,
  getRowKey = defaultRowKey,
  getRowProps,
  isLoading = false,
  loadingRows = 3,
  emptyMessage = "Nenhum registro encontrado.",
  emptyState,
  className = "",
  style,
}) => {
  const safeColumns = Array.isArray(columns) ? columns.filter(Boolean) : [];
  const safeRows = Array.isArray(rows) ? rows : [];

  if (!isLoading && safeRows.length === 0) {
    if (emptyState) return emptyState;
    return (
      <div className="kriou-data-empty" role="status">
        {emptyMessage}
      </div>
    );
  }

  const displayedRows = isLoading
    ? Array.from({ length: Math.max(1, loadingRows) }, (_, index) => ({ __loading: true, id: `loading-${index}` }))
    : safeRows;

  return (
    <div
      className={["kriou-data-table-wrap", className].filter(Boolean).join(" ")}
      aria-busy={isLoading || undefined}
      style={style}
    >
      <table className="kriou-data-table" aria-label={caption ? undefined : ariaLabel}>
        {caption && (
          <caption className={captionVisible ? "kriou-data-caption" : "kriou-data-caption kriou-data-caption--sr"}>
            {caption}
          </caption>
        )}
        <thead>
          <tr>
            {safeColumns.map((column) => (
              <th key={column.key} scope="col" style={{ textAlign: column.align || "left", width: column.width }}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayedRows.map((row, rowIndex) => {
            const rowProps = isLoading ? {} : getRowProps?.(row, rowIndex);
            return (
              <tr key={getRowKey(row, rowIndex)} {...rowProps}>
                {safeColumns.map((column) => (
                  <td
                    key={column.key}
                    data-label={getMobileLabel(column)}
                    data-mobile={column.mobile || "default"}
                    style={{ textAlign: column.align || "left" }}
                  >
                    {isLoading ? (
                      <span className="kriou-data-skeleton" aria-hidden="true" />
                    ) : column.render ? (
                      column.render(row, rowIndex)
                    ) : (
                      row?.[column.key] ?? "—"
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      {isLoading && <span className="kriou-data-loading-label">Carregando registros…</span>}
    </div>
  );
};

export default DataTable;
