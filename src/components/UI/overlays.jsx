import React from "react";
import { createPortal } from "react-dom";
import { useOverlayFocus } from "../../hooks/useOverlayFocus";
import { IconButton } from "./primitives";

const useOverlayIds = (prefix) => {
  const generatedId = React.useId().replace(/:/g, "");
  return {
    titleId: `kriou-${prefix}-title-${generatedId}`,
    descriptionId: `kriou-${prefix}-description-${generatedId}`,
  };
};

export const Modal = ({
  open,
  title,
  description,
  eyebrow,
  children,
  footer,
  onClose,
  onSubmit,
  busy = false,
  closeLabel = "Fechar modal",
  closeOnBackdrop = true,
  dismissible = true,
  width = 480,
  initialFocusRef,
}) => {
  const { titleId, descriptionId } = useOverlayIds("modal");
  const panelRef = React.useRef(null);
  const closeButtonRef = React.useRef(null);

  useOverlayFocus({
    open,
    containerRef: panelRef,
    initialFocusRef: initialFocusRef || closeButtonRef,
    onClose,
    closeDisabled: busy || !dismissible,
    inertRoot: true,
  });

  if (!open || typeof document === "undefined") return null;
  const Panel = onSubmit ? "form" : "section";

  return createPortal(
    <div className="kriou-modal-layer">
      <div
        className="kriou-modal-backdrop"
        aria-hidden="true"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget && dismissible && closeOnBackdrop && !busy) onClose?.();
        }}
      />
      <Panel
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        aria-busy={busy || undefined}
        tabIndex={-1}
        className="kriou-modal-panel"
        style={{ "--kriou-modal-width": `${width}px` }}
        onSubmit={onSubmit}
      >
        <header className="kriou-modal-header">
          <div className="kriou-modal-heading">
            {eyebrow && <span className="kriou-modal-eyebrow">{eyebrow}</span>}
            <h2 id={titleId}>{title}</h2>
            {description && <p id={descriptionId}>{description}</p>}
          </div>
          {dismissible && (
            <IconButton
              ref={closeButtonRef}
              icon="X"
              label={closeLabel}
              variant="secondary"
              disabled={busy}
              onClick={onClose}
            />
          )}
        </header>
        <div className="kriou-modal-body" tabIndex={0} aria-label={`Conteúdo de ${title}`}>{children}</div>
        {footer && <footer className="kriou-modal-footer">{footer}</footer>}
      </Panel>
    </div>,
    document.body,
  );
};

export const Drawer = ({
  open,
  title,
  description,
  children,
  footer,
  onClose,
  busy = false,
  closeLabel = "Fechar painel",
  width = 560,
  initialFocusRef,
}) => {
  const { titleId, descriptionId } = useOverlayIds("drawer");
  const panelRef = React.useRef(null);
  const closeButtonRef = React.useRef(null);

  useOverlayFocus({
    open,
    containerRef: panelRef,
    initialFocusRef: initialFocusRef || closeButtonRef,
    onClose,
    closeDisabled: busy,
    inertRoot: true,
  });

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="kriou-drawer-layer">
      <div
        className="kriou-drawer-backdrop"
        aria-hidden="true"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget && !busy) onClose?.();
        }}
      />
      <section
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        aria-busy={busy || undefined}
        tabIndex={-1}
        className="kriou-drawer-panel"
        style={{ "--kriou-drawer-width": `${width}px` }}
      >
        <header className="kriou-drawer-header">
          <div className="kriou-drawer-heading">
            <h2 id={titleId}>{title}</h2>
            {description && <p id={descriptionId}>{description}</p>}
          </div>
          <IconButton
            ref={closeButtonRef}
            icon="X"
            label={closeLabel}
            variant="secondary"
            disabled={busy}
            onClick={onClose}
          />
        </header>
        <div className="kriou-drawer-body" tabIndex={0} aria-label={`Conteúdo de ${title}`}>{children}</div>
        {footer && <footer className="kriou-drawer-footer">{footer}</footer>}
      </section>
    </div>,
    document.body,
  );
};

export default Drawer;
