import React from "react";
import MetricCard from "./MetricCard";
import { formatCurrency } from "../../utils/formatting";

/**
 * Grade de indicadores da visão geral do painel.
 * Consome o objeto `summary` retornado pela Edge Function admin-metrics.
 *
 * Indicadores exibidos:
 *  - Usuários (total + novos no período)
 *  - Documentos (total + novos no período)
 *  - Pagamentos aprovados (funil financeiro + receita do período)
 *  - Pendências (pagamentos aguardando confirmação)
 *  - Receita aprovada (R$ do período + total histórico)
 */
const MetricsCards = ({ summary, isLoading = false }) => {
  const cards = [
    {
      label: "Usuários",
      value: summary?.totalUsers ?? 0,
      sub: summary ? `${summary.newUsers} no período` : undefined,
      icon: "Users",
      accent: "coral",
    },
    {
      label: "Documentos",
      value: summary?.totalDocuments ?? 0,
      sub: summary ? `${summary.newDocuments} no período` : undefined,
      icon: "FileText",
      accent: "teal",
    },
    {
      label: "Pagamentos aprovados",
      value: summary?.approvedPayments ?? 0,
      sub: summary ? `Receita: ${formatCurrency(summary.revenueInPeriod)}` : undefined,
      icon: "CheckCircle",
      accent: "teal",
    },
    {
      label: "Pendências",
      value: summary?.pendingPayments ?? 0,
      sub:
        summary && summary.failedPayments > 0
          ? `${summary.failedPayments} recusados no período`
          : "Aguardando confirmação",
      icon: "Clock",
      accent: "gold",
    },
    {
      label: "Receita aprovada",
      value: formatCurrency(summary?.revenueInPeriod ?? 0),
      sub: summary ? `Histórico: ${formatCurrency(summary.totalApprovedRevenue)}` : undefined,
      icon: "CreditCard",
      accent: "coral",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
        gap: 12,
      }}
    >
      {cards.map((c) => (
        <MetricCard key={c.label} {...c} isLoading={isLoading} />
      ))}
    </div>
  );
};

export default MetricsCards;
