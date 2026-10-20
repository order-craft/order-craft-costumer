import React, { useEffect, useRef, useState } from "react";
import tw from "twin.macro";
import styled, { keyframes, css } from "styled-components";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { io } from "socket.io-client";
import axios from "axios";
import { baseUrl } from "helpers/BaseUrl";
import { GetToken } from "helpers/GetToken";

/* ---------- feather icons ---------- */
import { ReactComponent as LifeBuoyIcon } from "feather-icons/dist/icons/life-buoy.svg";
import { ReactComponent as XIcon } from "feather-icons/dist/icons/x.svg";
import { ReactComponent as CheckCircleIcon } from "feather-icons/dist/icons/check-circle.svg";
import { ReactComponent as AlertCircleIcon } from "feather-icons/dist/icons/alert-circle.svg";
import { ReactComponent as HelpCircleIcon } from "feather-icons/dist/icons/help-circle.svg";
import { ReactComponent as CreditCardIcon } from "feather-icons/dist/icons/credit-card.svg";
import { ReactComponent as DropletIcon } from "feather-icons/dist/icons/droplet.svg";
import { ReactComponent as ShoppingBagIcon } from "feather-icons/dist/icons/shopping-bag.svg";
import { ReactComponent as FileTextIcon } from "feather-icons/dist/icons/file-text.svg";
import { ReactComponent as CoffeeIcon } from "feather-icons/dist/icons/coffee.svg";
import { ReactComponent as BellIcon } from "feather-icons/dist/icons/bell.svg";
import { ReactComponent as MoreHorizontalIcon } from "feather-icons/dist/icons/more-horizontal.svg";

/* ---------- icon resolver ---------- */
/* Map a request-type name or icon key to a Feather SVG. */
const iconByName = {
  "life-buoy": LifeBuoyIcon,
  "help-circle": HelpCircleIcon,
  "credit-card": CreditCardIcon,
  droplet: DropletIcon,
  "shopping-bag": ShoppingBagIcon,
  "file-text": FileTextIcon,
  coffee: CoffeeIcon,
  bell: BellIcon,
  "alert-circle": AlertCircleIcon,
};

/* Fallback: guess icon from name keywords */
const guessIconFromName = (name) => {
  const n = (name || "").toLowerCase();
  if (n.includes("bill") || n.includes("check") || n.includes("pay"))
    return CreditCardIcon;
  if (n.includes("water") || n.includes("clean")) return DropletIcon;
  if (n.includes("order") || n.includes("food")) return ShoppingBagIcon;
  if (n.includes("menu") || n.includes("note")) return FileTextIcon;
  if (n.includes("coffee") || n.includes("drink")) return CoffeeIcon;
  if (n.includes("wait") || n.includes("call")) return BellIcon;
  return MoreHorizontalIcon;
};

const resolveIcon = (iconName, label) => {
  if (iconName && iconByName[iconName]) return iconByName[iconName];
  return guessIconFromName(label || iconName);
};

/* ---------- animations ---------- */
const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(139, 90, 43, 0.35); }
  70% { transform: scale(1.04); box-shadow: 0 0 0 16px rgba(139, 90, 43, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(139, 90, 43, 0); }
`;

const pulseActive = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.5); }
  70% { transform: scale(1.06); box-shadow: 0 0 0 20px rgba(220, 53, 69, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220, 53, 69, 0); }
`;

const slideUp = keyframes`
  from { transform: translateY(12px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

/* ---------- bubble ---------- */
const BubbleWrap = styled.div.attrs(({ $isDragging }) => ({
  style: { cursor: $isDragging ? "grabbing" : "grab" },
}))`
  position: fixed;
  z-index: 60;
  width: 56px;
  height: 56px;
  touch-action: none;
  user-select: none;
  ${({ $isDragging }) => $isDragging && "transition: none;"}
  ${({ $isDragging }) =>
    !$isDragging && "transition: left 0.25s ease, top 0.25s ease;"}
`;

const Bubble = styled.button`
  width: 100%;
  height: 100%;
  border-radius: 999px;
  border: none;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: ${({ $brandColor, $processing }) =>
    $processing ? "#dc2626" : $brandColor || "#8B5A2B"};
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
  animation: ${({ $processing }) =>
    $processing
      ? css`
          ${pulseActive} 1.6s ease-out infinite
        `
      : css`
          ${pulse} 3s ease-out infinite
        `};

  &:active {
    transform: scale(0.94);
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

/* ---------- message pill ---------- */
const MessagePill = styled.div`
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: 96px;
  z-index: 65;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 700;
  color: #fff;
  background: ${({ $tone, $brandColor }) => {
    if ($tone === "error") return "#dc2626";
    if ($tone === "success") return "#16a34a";
    return $brandColor || "#8B5A2B";
  }};
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.18);
  animation: ${fadeIn} 0.2s ease-out;
  max-width: calc(100vw - 32px);

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
`;

/* ---------- bottom sheet ---------- */
const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 70;
  background: rgba(0, 0, 0, 0.45);
  animation: ${fadeIn} 0.15s ease-out;
`;

const Sheet = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 80;
  background: #fff;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  padding: 8px 0 20px 0;
  max-height: 80vh;
  overflow-y: auto;
  animation: ${slideUp} 0.22s ease-out;

  @media (min-width: 640px) {
    left: 50%;
    transform: translateX(-50%);
    max-width: 480px;
    bottom: 24px;
    border-radius: 20px;
  }
`;

const SheetHandle = styled.div`
  width: 44px;
  height: 4px;
  border-radius: 999px;
  background: #cbd5e0;
  margin: 8px auto 4px auto;
`;

const SheetHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px 6px 20px;
`;

const SheetTitle = tw.div`text-base font-black text-gray-900`;
const SheetSub = tw.div`text-xs text-gray-500 mt-0.5`;
const CloseBtn = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f3f5;
  color: #4a5568;
  border: none;
  cursor: pointer;

  &:active {
    transform: scale(0.94);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const OptionList = styled.div`
  padding: 8px 12px 0 12px;
`;

const Option = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 10px;
  border-radius: 14px;
  border: 1px solid #eef0f3;
  background: #fff;
  cursor: pointer;
  text-align: left;
  margin-bottom: 8px;
  transition:
    background-color 0.12s ease,
    transform 0.12s ease;

  &:hover {
    background: #fafbfc;
  }

  &:active {
    transform: scale(0.99);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const OptionIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: ${({ $brandColor }) => `${$brandColor || "#8B5A2B"}18`};
  color: ${({ $brandColor }) => $brandColor || "#8B5A2B"};

  svg {
    width: 20px;
    height: 20px;
  }
`;

const OptionText = tw.div`flex-1 min-w-0`;
const OptionLabel = tw.div`text-sm font-bold text-gray-900`;
const OptionDesc = tw.div`text-xs text-gray-500 truncate`;

const LoadingRow = styled.div`
  height: 64px;
  border-radius: 14px;
  background: #f1f3f5;
  margin: 0 12px 8px 12px;
  animation: ${fadeIn} 0.4s ease-out;
`;

const FallbackNote = tw.div`text-[11px] text-center text-gray-400 px-4 pt-2`;

/* ---------- defaults when the API fails ---------- */
const DEFAULT_OPTIONS = [
  { id: "default-bill", name: "Bill", icon: "credit-card" },
  { id: "default-water", name: "Water", icon: "droplet" },
  { id: "default-clean", name: "Clean table", icon: "droplet" },
  { id: "default-help", name: "Something else", icon: "help-circle" },
];

/* ---------- component ---------- */
const NotifSupport = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [usingDefaults, setUsingDefaults] = useState(false);
  const [processing, setProcessing] = useState(null); // id of the option being processed
  const [message, setMessage] = useState(null); // { tone, text }
  const [position, setPosition] = useState(() => {
    if (typeof window === "undefined") return { x: 20, y: 500 };
    return { x: window.innerWidth - 76, y: window.innerHeight - 150 };
  });

  const dragState = useRef({
    dragging: false,
    moved: false,
    startX: 0,
    startY: 0,
    ox: 0,
    oy: 0,
  });
  const [isDraggingUi, setIsDraggingUi] = useState(false);
  const bubbleRef = useRef(null);

  const token = GetToken();
  const brandColor = useSelector((state) => state.table.brandColor);

  let tableNumber = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      tableNumber = decoded.table?.number;
    } catch (err) {
      console.error("Failed to decode token for support bubble:", err);
    }
  }

  /* ---------- fetch options ---------- */
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await axios.get(`${baseUrl}/sup/request-types`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const list = (res.data?.data || []).map((o) => ({
          id: o._id,
          name: o.name,
          icon: o.icon,
        }));
        if (!cancelled) {
          setOptions(list.length > 0 ? list : DEFAULT_OPTIONS);
          setUsingDefaults(list.length === 0);
          setOptionsLoading(false);
        }
      } catch (err) {
        console.error("Failed to load support options:", err);
        if (!cancelled) {
          setOptions(DEFAULT_OPTIONS);
          setUsingDefaults(true);
          setOptionsLoading(false);
        }
      }
    };
    if (token) load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  /* ---------- socket for callAnswered ---------- */
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token || !tableNumber) return;

    const socket = io(baseUrl, {
      auth: { token },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      // Optional: log for debugging
      // console.log("support socket connected:", socket.id);
    });

    socket.on("callAnswered", (data) => {
      if (data?.tableNumber === tableNumber) {
        setMessage({ tone: "success", text: "Help is on the way!" });
        setProcessing(null);
        setTimeout(() => setMessage(null), 4000);
      }
    });

    socket.on("supportRequestDeclined", (data) => {
      if (data?.tableNumber === tableNumber) {
        setMessage({
          tone: "error",
          text: "Staff can't take this right now — please try again.",
        });
        setProcessing(null);
        setTimeout(() => setMessage(null), 4000);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, tableNumber]);

  /* ---------- drag ---------- */
  const onPointerDown = (e) => {
    const p = e.touches ? e.touches[0] : e;
    dragState.current = {
      dragging: true,
      moved: false,
      startX: p.clientX,
      startY: p.clientY,
      ox: position.x,
      oy: position.y,
    };
    setIsDraggingUi(true);
  };

  useEffect(() => {
    const onMove = (e) => {
      if (!dragState.current.dragging) return;
      const p = e.touches ? e.touches[0] : e;
      const dx = p.clientX - dragState.current.startX;
      const dy = p.clientY - dragState.current.startY;
      if (Math.abs(dx) + Math.abs(dy) > 4) dragState.current.moved = true;

      const bubbleW = 56;
      const bubbleH = 56;
      const nx = Math.min(
        Math.max(8, dragState.current.ox + dx),
        window.innerWidth - bubbleW - 8,
      );
      const ny = Math.min(
        Math.max(8, dragState.current.oy + dy),
        window.innerHeight - bubbleH - 8,
      );
      setPosition({ x: nx, y: ny });
    };

    const onUp = () => {
      if (!dragState.current.dragging) return;
      dragState.current.dragging = false;
      setIsDraggingUi(false);
      // snap to nearest horizontal edge
      if (bubbleRef.current) {
        const rect = bubbleRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const snapX =
          centerX < window.innerWidth / 2
            ? 16
            : window.innerWidth - rect.width - 16;
        setPosition((prev) => ({ ...prev, x: snapX }));
      }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, []);

  const onBubbleClick = () => {
    if (dragState.current.moved) {
      dragState.current.moved = false;
      return;
    }
    setIsOpen(true);
  };

  /* ---------- emit support request ---------- */
  const requestType = async (option) => {
    if (!tableNumber) {
      setMessage({ tone: "error", text: "Table not identified." });
      setTimeout(() => setMessage(null), 3500);
      return;
    }
    setProcessing(option.id);
    setIsOpen(false);
    setMessage({ tone: "info", text: "Sending request…" });

    // The backend expects the type id when available; for defaults we send
    // a name-only payload the server can still log.
    const payload = {
      tableNumber,
      requestType: option.id,
      requestTypeName: option.name,
    };

    try {
      const socket = socketRef.current;
      if (!socket || !socket.connected) {
        // Wait briefly for the connection if it's still opening
        await new Promise((resolve, reject) => {
          if (!socket) return reject(new Error("No socket"));
          const t = setTimeout(
            () => reject(new Error("Socket connect timeout")),
            3000,
          );
          socket.once("connect", () => {
            clearTimeout(t);
            resolve();
          });
          if (socket.connected) {
            clearTimeout(t);
            resolve();
          }
        });
      }

      socket.emit("supportRequest", payload);
      setMessage({
        tone: "success",
        text: `${option.name} sent · waiter notified`,
      });
    } catch (err) {
      console.error("Failed to send support request:", err);
      setMessage({ tone: "error", text: "Could not send request." });
    } finally {
      setTimeout(() => {
        setProcessing(null);
        setMessage(null);
      }, 6000);
    }
  };

  return (
    <>
      {message && (
        <MessagePill $tone={message.tone} $brandColor={brandColor}>
          {message.tone === "error" ? (
            <AlertCircleIcon />
          ) : message.tone === "success" ? (
            <CheckCircleIcon />
          ) : (
            <BellIcon />
          )}
          {message.text}
        </MessagePill>
      )}

      <BubbleWrap
        ref={bubbleRef}
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
        $isDragging={isDraggingUi}
        onMouseDown={onPointerDown}
        onTouchStart={onPointerDown}
      >
        <Bubble
          type="button"
          $brandColor={brandColor}
          $processing={!!processing}
          onClick={onBubbleClick}
          aria-label="Request support"
        >
          <LifeBuoyIcon />
        </Bubble>
      </BubbleWrap>

      {isOpen && (
        <>
          <Backdrop onClick={() => setIsOpen(false)} />
          <Sheet role="dialog" aria-label="Request support">
            <SheetHandle />
            <SheetHeader>
              <div>
                <SheetTitle>Need something?</SheetTitle>
                <SheetSub>
                  Tap an option and a waiter will come to you.
                </SheetSub>
              </div>
              <CloseBtn
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close"
              >
                <XIcon />
              </CloseBtn>
            </SheetHeader>

            <OptionList>
              {optionsLoading ? (
                <>
                  <LoadingRow />
                  <LoadingRow />
                  <LoadingRow />
                </>
              ) : (
                options.map((opt) => {
                  const Icon = resolveIcon(opt.icon, opt.name);
                  return (
                    <Option
                      key={opt.id}
                      type="button"
                      disabled={!!processing}
                      onClick={() => requestType(opt)}
                    >
                      <OptionIcon $brandColor={brandColor}>
                        <Icon />
                      </OptionIcon>
                      <OptionText>
                        <OptionLabel>{opt.name}</OptionLabel>
                        <OptionDesc>
                          {processing === opt.id
                            ? "Sending…"
                            : "Notify the staff"}
                        </OptionDesc>
                      </OptionText>
                    </Option>
                  );
                })
              )}

              {usingDefaults && !optionsLoading && (
                <FallbackNote>
                  Using default options — the café hasn't configured any yet.
                </FallbackNote>
              )}
            </OptionList>
          </Sheet>
        </>
      )}
    </>
  );
};

export default NotifSupport;
