import React from "react";
import { createPortal } from "react-dom";
import { useOverlayFocus } from "../../hooks/useOverlayFocus";
import { IconButton } from "./primitives";

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
  const generatedId = React.useId().replace(/:/g, "");
  const titleId = `kriou-drawer-title-${generatedId}`;
  const descriptionId = `kriou-drawer-description-${generatedId}`;
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
        <div className="kriou-drawer-body">{children}</div>
        {footer && <footer className="kriou-drawer-footer">{footer}</footer>}
      </section>
    </div>,
    document.body,
  );
};

export default Drawer;
