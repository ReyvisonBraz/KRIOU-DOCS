import React from "react";
import { Icon } from "../Icons";
import { Alert, Button, Drawer } from "../UI";

const DetailSection = ({ icon, title, children }) => (
  <section className="template-detail-section" aria-labelledby={undefined}>
    <h3>
      {icon && <Icon name={icon} aria-hidden="true" />}
      {title}
    </h3>
    {children}
  </section>
);

const PillList = ({ items = [], accent, icon }) => (
  <ul className="template-detail-pills" style={{ "--template-detail-accent": accent }}>
    {items.map((item) => (
      <li key={typeof item === "string" ? item : item.id}>
        {icon && <Icon name={icon} aria-hidden="true" />}
        {typeof item === "string" ? item : <><span aria-hidden="true">{item.icon}</span>{item.name}</>}
      </li>
    ))}
  </ul>
);

const InfoPanel = ({ icon, title, accent, children }) => (
  <div className="template-detail-info" style={{ "--template-detail-accent": accent }}>
    <h3>{icon && <Icon name={icon} aria-hidden="true" />}{title}</h3>
    <div>{children}</div>
  </div>
);

export const TemplateSpecModal = ({ template, onClose, onSelect }) => {
  const spec = template?.spec || {};
  return (
    <Drawer
      open={Boolean(template)}
      title={template?.name || "Detalhes do modelo"}
      description={template?.desc}
      onClose={onClose}
      width={500}
      footer={(
        <div className="template-detail-actions">
          <Button variant="secondary" onClick={onClose}>Fechar</Button>
          <Button icon="FileText" onClick={() => { onSelect?.(template); onClose?.(); }}>Usar este modelo</Button>
        </div>
      )}
    >
      {template && (
        <div className="template-detail-content" style={{ "--template-detail-accent": template.accent }}>
          <div className="template-detail-grid">
            <InfoPanel icon="Users" title="Público-alvo" accent={template.accent}>
              <p>{spec.target || "Não especificado"}</p>
            </InfoPanel>
            <InfoPanel title="Paleta visual" accent={template.accent}>
              <div className="template-color-palette">
                {[template.color, template.accent].map((color) => (
                  <span key={color}><i style={{ background: color }} aria-hidden="true" /><code>{color}</code></span>
                ))}
              </div>
            </InfoPanel>
          </div>
          {spec.bestFor?.length > 0 && <DetailSection icon="Star" title="Melhores áreas"><PillList items={spec.bestFor} accent={template.accent} /></DetailSection>}
          {spec.sections?.length > 0 && <DetailSection icon="Layout" title="Seções"><PillList items={spec.sections} /></DetailSection>}
          {spec.tips?.length > 0 && (
            <DetailSection icon="HelpCircle" title="Dicas">
              <ul className="template-tip-list">
                {spec.tips.map((tip) => <li key={tip}><Icon name="CheckCircle" aria-hidden="true" />{tip}</li>)}
              </ul>
            </DetailSection>
          )}
        </div>
      )}
    </Drawer>
  );
};

export const LegalDocSpecModal = ({ doc, colors, onClose, onCreate }) => {
  const spec = doc?.spec || {};
  const accent = colors?.accent || "var(--status-info)";
  return (
    <Drawer
      open={Boolean(doc)}
      title={doc?.name || "Detalhes do documento"}
      description={doc?.description}
      onClose={onClose}
      width={500}
      footer={(
        <div className="template-detail-actions">
          <Button variant="secondary" onClick={onClose}>Voltar</Button>
          <Button icon="ArrowRight" onClick={() => { onCreate?.(doc); onClose?.(); }}>Criar documento</Button>
        </div>
      )}
    >
      {doc && (
        <div className="template-detail-content" style={{ "--template-detail-accent": accent }}>
          {spec.whenUse && <InfoPanel icon="HelpCircle" title="Quando usar" accent={accent}><p>{spec.whenUse}</p></InfoPanel>}
          {doc.legislation && <div className="template-legislation"><Icon name="FileText" aria-hidden="true" />{doc.legislation}</div>}
          <div className="template-detail-grid">
            {spec.parties?.length > 0 && <InfoPanel icon="Users" title="Partes" accent={accent}><PillList items={spec.parties} /></InfoPanel>}
            {doc.variants?.length > 0 && <InfoPanel icon="Layout" title="Variantes" accent={accent}><PillList items={doc.variants} /></InfoPanel>}
          </div>
          {spec.sections?.length > 0 && <DetailSection icon="Layout" title="Seções"><PillList items={spec.sections} accent={accent} /></DetailSection>}
          {spec.requiredDocs?.length > 0 && <DetailSection icon="FileCheck" title="Documentos necessários"><PillList items={spec.requiredDocs} icon="FileCheck" /></DetailSection>}
          {spec.commonIssues?.length > 0 && (
            <Alert variant="warning" title="Pontos de atenção">
              <ul className="template-issue-list">{spec.commonIssues.map((issue) => <li key={issue}>{issue}</li>)}</ul>
            </Alert>
          )}
        </div>
      )}
    </Drawer>
  );
};
