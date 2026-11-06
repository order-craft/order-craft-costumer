import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import tw from "twin.macro";
import styled from "styled-components";
import { useSelector } from "react-redux";
import translations from "app/language";

// ─────────────────────────────────────────────────────────────
// Global modal — a single point of truth for user-facing dialogs
// across the customer app. Replaces alert() / confirm() with
// something branded, accessible, and easy to reason about.
//
// Usage (from any component):
//
//   const modal = useGlobalModal();
//   modal.info({ title, message });
//   modal.error({ title, message });
//   const ok = await modal.confirm({ title, message });
//
// The modal is mounted once at the app root.
// ─────────────────────────────────────────────────────────────

/* ---------- layout ---------- */
const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const Card = styled(motion.div)`
  ${tw`bg-white rounded-2xl w-full`}
  max-width: 400px;
  overflow: hidden;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.18);
`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 18px 20px 6px 20px;
`;

const IconBubble = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: ${({ $tone }) => {
    if ($tone === "error") return "#fee2e2";
    if ($tone === "warning") return "#fef3c7";
    if ($tone === "success") return "#dcfce7";
    return "#e0f2fe";
  }};
  color: ${({ $tone }) => {
    if ($tone === "error") return "#dc2626";
    if ($tone === "warning") return "#d97706";
    if ($tone === "success") return "#16a34a";
    return "#0d6efd";
  }};
`;

const HeaderText = tw.div`min-w-0 flex-1`;

const Title = tw.div`text-base font-black text-gray-900 leading-snug`;
const Subtitle = tw.div`text-xs text-gray-500 mt-0.5`;

const Body = tw.div`px-5 pt-2 pb-5 text-sm text-gray-700 leading-relaxed whitespace-pre-line`;

const Actions = tw.div`flex gap-2 px-5 pb-5`;

const Btn = styled.button`
  ${tw`flex-1 py-3 rounded-xl text-sm font-bold`}
  border: none;
  cursor: pointer;
  transition: transform 0.12s ease;

  background: ${({ $variant, $brandColor }) => {
    if ($variant === "primary") return $brandColor || "#8B5A2B";
    if ($variant === "danger") return "#dc2626";
    if ($variant === "secondary") return "#f1f3f5";
    return "#fff";
  }};
  color: ${({ $variant }) =>
    $variant === "primary" || $variant === "danger" ? "#fff" : "#4a5568"};

  &:active {
    transform: scale(0.98);
  }
`;

/* ---------- icons (simple inline SVGs, no extra dep) ---------- */
const IconInfo = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);
const IconError = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const IconWarning = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const IconSuccess = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const toneIcon = (tone) => {
  if (tone === "error") return <IconError />;
  if (tone === "warning") return <IconWarning />;
  if (tone === "success") return <IconSuccess />;
  return <IconInfo />;
};

/* ---------- component ---------- */
const GlobalModal = ({ state, onResolve }) => {
  const t = useSelector((s) => s.language.language);
  const Language = translations[t];
  const brandColor = useSelector((s) => s.table.brandColor);

  // Allow closing by Escape only for non-confirm dialogs
  useEffect(() => {
    if (!state) return;
    if (state.kind === "confirm") return;

    const onKey = (e) => {
      if (e.key === "Escape") onResolve(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state, onResolve]);

  const visible = !!state;
  const kind = state?.kind || "info";
  const tone = state?.tone || (kind === "error" ? "error" : "info");

  return (
    <AnimatePresence>
      {visible && (
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (kind !== "confirm" && e.target === e.currentTarget) {
              onResolve(null);
            }
          }}
        >
          <Card
            initial={{ y: 16, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            role="dialog"
            aria-modal="true"
          >
            <Header>
              <IconBubble $tone={tone}>{toneIcon(tone)}</IconBubble>
              <HeaderText>
                <Title>{state.title}</Title>
                {state.subtitle && <Subtitle>{state.subtitle}</Subtitle>}
              </HeaderText>
            </Header>

            <Body>{state.message}</Body>

            <Actions>
              {kind === "confirm" ? (
                <>
                  <Btn
                    type="button"
                    $variant="secondary"
                    onClick={() => onResolve(false)}
                  >
                    {state.cancelLabel || Language.cancel || "Cancel"}
                  </Btn>
                  <Btn
                    type="button"
                    $variant={
                      state.confirmTone === "danger" ? "danger" : "primary"
                    }
                    $brandColor={brandColor}
                    onClick={() => onResolve(true)}
                  >
                    {state.confirmLabel || Language.confirm || "Confirm"}
                  </Btn>
                </>
              ) : (
                <Btn
                  type="button"
                  $variant="primary"
                  $brandColor={brandColor}
                  onClick={() => onResolve(null)}
                >
                  {state.okLabel || Language.close || "Close"}
                </Btn>
              )}
            </Actions>
          </Card>
        </Overlay>
      )}
    </AnimatePresence>
  );
};

export default GlobalModal;
