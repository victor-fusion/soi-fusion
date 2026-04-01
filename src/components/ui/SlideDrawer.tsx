"use client";

import { useEffect, useCallback } from "react";
import { IconX } from "@tabler/icons-react";

interface SlideDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  width?: number;
  children: React.ReactNode;
}

export function SlideDrawer({
  open,
  onClose,
  title,
  subtitle,
  width = 480,
  children,
}: SlideDrawerProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 400,
          backgroundColor: "rgba(0,0,0,0.25)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.2s ease",
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0,
          width, zIndex: 500,
          backgroundColor: "#fff",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.08)",
          display: "flex", flexDirection: "column",
          transform: open ? "translateX(0)" : `translateX(${width}px)`,
          transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex", alignItems: "flex-start",
            justifyContent: "space-between",
            padding: "24px 28px 20px",
            borderBottom: "1px solid #f3f4f6",
            flexShrink: 0,
          }}
        >
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>
              {title}
            </p>
            {subtitle && (
              <p style={{ fontSize: 13, color: "#9ca3af", margin: "4px 0 0" }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#9ca3af", padding: 4, display: "flex",
              borderRadius: 6, marginTop: -2,
            }}
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Content — scrollable */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          {children}
        </div>
      </div>
    </>
  );
}
