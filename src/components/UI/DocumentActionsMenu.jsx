import React, { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "../Icons";

const TOUCH_SIZE = 44;

export const DocumentActionsMenu = ({ documentTitle, items }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const firstItemRef = useRef(null);
  const menuId = useId();
  const availableItems = items.filter((item) => item && item.onSelect);
  const [position, setPosition] = useState(null);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      const insideTrigger = containerRef.current?.contains(event.target);
      const insideMenu = menuRef.current?.contains(event.target);
      if (!insideTrigger && !insideMenu) setOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    const handleViewportChange = () => setOpen(false);

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);
    const focusFrame = window.requestAnimationFrame(() => firstItemRef.current?.focus());

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
      window.cancelAnimationFrame(focusFrame);
    };
  }, [open]);

  const closeMenu = () => setOpen(false);

  const toggleMenu = () => {
    if (open) {
      closeMenu();
      return;
    }

    const triggerRect = triggerRef.current?.getBoundingClientRect();
    if (!triggerRect) return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const estimatedHeight = Math.min(availableItems.length * TOUCH_SIZE + 12, 280);
    const opensAbove = triggerRect.top >= estimatedHeight + 16;

    setPosition({
      left: Math.max(8, Math.min(triggerRect.right - 220, viewportWidth - 228)),
      top: opensAbove ? triggerRect.top - 8 : triggerRect.bottom + 8,
      transform: opensAbove ? "translateY(-100%)" : "none",
      maxHeight: Math.max(132, opensAbove ? triggerRect.top - 24 : viewportHeight - triggerRect.bottom - 24),
    });
    setOpen(true);
  };

  if (availableItems.length === 0) return null;

  return (
    <div ref={containerRef} style={{ position: "relative", marginLeft: "auto" }}>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`Mais ações para ${documentTitle}`}
        title="Mais ações"
        onClick={toggleMenu}
        className="focus-ring"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: TOUCH_SIZE,
          height: TOUCH_SIZE,
          border: "1px solid var(--border)",
          borderRadius: 9,
          background: open ? "var(--surface-3)" : "var(--surface-2)",
          color: "var(--text-dim)",
          cursor: "pointer",
        }}
      >
        <Icon name="MoreHorizontal" className="w-5 h-5" />
      </button>

      {open && position && createPortal(
        <div
          ref={menuRef}
          id={menuId}
          aria-label={`Ações para ${documentTitle}`}
          style={{
            position: "fixed",
            left: position.left,
            top: position.top,
            transform: position.transform,
            zIndex: 1000,
            width: 220,
            maxWidth: "calc(100vw - 16px)",
            maxHeight: position.maxHeight,
            overflowY: "auto",
            padding: 6,
            border: "1px solid var(--border-strong)",
            borderRadius: 12,
            background: "var(--surface)",
            boxShadow: "var(--shadow-elevated)",
          }}
        >
          {availableItems.map((item, index) => (
            <button
              key={item.label}
              ref={index === 0 ? firstItemRef : undefined}
              type="button"
              className="focus-ring"
              onClick={() => {
                closeMenu();
                triggerRef.current?.focus();
                item.onSelect();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                minHeight: TOUCH_SIZE,
                padding: "9px 11px",
                border: 0,
                borderRadius: 8,
                background: "transparent",
                color: item.danger ? "var(--danger)" : "var(--text-dim)",
                fontFamily: "var(--font-body)",
                fontSize: 13,
                fontWeight: item.danger ? 800 : 700,
                textAlign: "left",
                cursor: "pointer",
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.background = item.danger
                  ? "color-mix(in srgb, var(--danger) 10%, transparent)"
                  : "var(--surface-2)";
                event.currentTarget.style.color = item.danger ? "var(--danger)" : "var(--text)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background = "transparent";
                event.currentTarget.style.color = item.danger ? "var(--danger)" : "var(--text-dim)";
              }}
            >
              <Icon name={item.icon} className="w-4 h-4 shrink-0" />
              {item.label}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </div>
  );
};

export default DocumentActionsMenu;
