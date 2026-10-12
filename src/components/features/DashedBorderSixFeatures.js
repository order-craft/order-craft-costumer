import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import tw from "twin.macro";
import styled from "styled-components";
import { baseUrl } from "helpers/BaseUrl";
import axios from "axios";
import { GetToken } from "helpers/GetToken";
import AnimationRevealPage from "helpers/AnimationRevealPage";
import translations from "app/language";
import { io } from "socket.io-client";
import { setActiveCount } from "../../features/ordersSlice";

import { ReactComponent as ChevronLeftIcon } from "feather-icons/dist/icons/chevron-left.svg";
import { ReactComponent as ChevronDownIcon } from "feather-icons/dist/icons/chevron-down.svg";
import { ReactComponent as ChevronUpIcon } from "feather-icons/dist/icons/chevron-up.svg";
import { ReactComponent as ClockIcon } from "feather-icons/dist/icons/clock.svg";
import { ReactComponent as FlameIcon } from "feather-icons/dist/icons/alert-circle.svg";
import { ReactComponent as CheckCircleIcon } from "feather-icons/dist/icons/check-circle.svg";
import { ReactComponent as XCircleIcon } from "feather-icons/dist/icons/x-circle.svg";
import { ReactComponent as StarIcon } from "feather-icons/dist/icons/star.svg";
import { ReactComponent as PlusIcon } from "feather-icons/dist/icons/plus.svg";
import { ReactComponent as PencilIcon } from "feather-icons/dist/icons/edit-2.svg";
import { ReactComponent as TrashIcon } from "feather-icons/dist/icons/trash-2.svg";
import { ReactComponent as DollarIcon } from "feather-icons/dist/icons/dollar-sign.svg";
import { ReactComponent as ShoppingBagIcon } from "feather-icons/dist/icons/shopping-bag.svg";

/* ---------- layout ---------- */
const Page = tw.div`min-h-screen bg-gray-100 pb-24`;
const StickyHeader = tw.div`sticky top-[0px] z-30 bg-white border-b border-gray-200`;
const HeaderInner = tw.div`max-w-2xl mx-auto px-4 py-3 flex items-center gap-3`;
const BackButton = tw.button`flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors text-gray-700 flex-shrink-0`;
const HeaderText = tw.div`min-w-0 flex-1`;
const HeaderTitle = tw.h1`text-base sm:text-lg font-black text-gray-900 truncate`;
const HeaderSub = tw.div`text-xs text-gray-500 truncate`;

const NewOrderPill = styled.button`
  ${tw`flex items-center gap-1 px-3 py-2 rounded-full text-xs font-bold flex-shrink-0`}
  background: ${({ $brandColor }) => $brandColor || "#8B5A2B"};
  color: #fff;
  border: none;
  cursor: pointer;
  transition: transform 0.12s ease;

  &:active {
    transform: scale(0.97);
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const Content = tw.div`max-w-2xl mx-auto px-4 pt-4`;

/* ---------- order row ---------- */
const Row = styled(motion.div)`
  ${tw`bg-white rounded-2xl overflow-hidden mb-3`}
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
  border: 1px solid #eef0f3;
`;

const RowHead = styled.div`
  display: grid;
  grid-template-columns: 44px 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 14px 16px;
  cursor: pointer;
`;

const StatusChip = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #fff;
  background: ${({ $status }) => {
    switch ($status) {
      case "pending":
        return "#d69e2e";
      case "preparing":
        return "#3182ce";
      case "completed":
        return "#38a169";
      case "cancelled":
        return "#e53e3e";
      default:
        return "#718096";
    }
  }};

  svg {
    width: 20px;
    height: 20px;
  }
`;

const RowMain = tw.div`min-w-0`;

const RowTop = tw.div`flex items-center gap-2 mb-1 flex-wrap`;
const OrderNum = tw.div`text-sm font-black text-gray-900`;
const StatusPill = styled.span`
  ${tw`text-xs font-bold px-2 py-1 rounded-full`}
  background: ${({ $status }) => {
    switch ($status) {
      case "pending":
        return "#fef3c7";
      case "preparing":
        return "#dbeafe";
      case "completed":
        return "#dcfce7";
      case "cancelled":
        return "#fee2e2";
      default:
        return "#e2e8f0";
    }
  }};
  color: ${({ $status }) => {
    switch ($status) {
      case "pending":
        return "#92400e";
      case "preparing":
        return "#1e40af";
      case "completed":
        return "#166534";
      case "cancelled":
        return "#991b1b";
      default:
        return "#475569";
    }
  }};
`;

const PreviewLine = styled.div`
  ${tw`text-xs text-gray-500`}
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RowRight = tw.div`flex flex-col items-end`;

const PriceText = styled.div`
  ${tw`text-sm font-black`}
  color: ${({ $brandColor }) => $brandColor || "#8B5A2B"};
`;

const TimeText = tw.div`text-xs text-gray-400 mt-1`;

const ChevronBox = styled.div`
  ${tw`flex items-center justify-center text-gray-400`}
  width: 24px;
  height: 24px;
  grid-column: 3 / 4;

  svg {
    width: 18px;
    height: 18px;
  }
`;

/* ---------- expanded panel ---------- */
const Panel = styled(motion.div)`
  border-top: 1px solid #eef0f3;
  background: #fafbfc;
  padding: 14px 16px 16px 16px;
`;

const SectionTitle = tw.div`text-xs font-black uppercase tracking-wider text-gray-500 mb-2`;
const ItemLine = tw.div`flex items-start justify-between gap-3 text-sm py-1`;
const ItemName = tw.div`text-gray-900 min-w-0`;
const ItemQty = tw.div`text-gray-500 whitespace-nowrap`;
const ItemTotal = tw.div`text-gray-900 font-bold whitespace-nowrap`;

const TotalsBlock = tw.div`mt-3 pt-3 border-t border-gray-200`;
const TotalLine = tw.div`flex justify-between text-sm py-1`;
const TotalLabel = tw.div`text-gray-500`;
const TotalValue = styled.div`
  ${tw`font-bold`}
  color: ${({ $highlight, $brandColor }) =>
    $highlight ? $brandColor || "#8B5A2B" : "#1a202c"};
`;

const CommentBlock = tw.div`mt-3 p-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800`;

const ActionRow = tw.div`flex gap-2 mt-4`;

const ActionBtn = styled.button`
  ${tw`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold flex-1`}
  background: ${({ $variant, $brandColor }) => {
    if ($variant === "primary") return $brandColor || "#8B5A2B";
    if ($variant === "danger") return "transparent";
    return "#fff";
  }};
  color: ${({ $variant }) => {
    if ($variant === "primary") return "#fff";
    if ($variant === "danger") return "#dc2626";
    return "#4a5568";
  }};
  border: ${({ $variant }) => {
    if ($variant === "danger") return "1px solid #fca5a5";
    if ($variant === "secondary") return "1px solid #cbd5e0";
    return "none";
  }};
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  transition: transform 0.12s ease;

  &:active {
    transform: ${({ disabled }) => (disabled ? "none" : "scale(0.98)")};
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

/* ---------- totals summary ---------- */
const Summary = styled.div`
  ${tw`bg-white rounded-2xl p-4 mt-2`}
  border: 1px solid #eef0f3;
`;

const SummaryRow = tw.div`flex justify-between text-sm py-1`;
const SummaryLabel = tw.div`text-gray-500`;
const SummaryValue = styled.div`
  ${tw`font-black`}
  color: ${({ $highlight, $brandColor }) =>
    $highlight ? $brandColor || "#8B5A2B" : "#1a202c"};
`;

/* ---------- empty ---------- */
const EmptyWrap = tw.div`max-w-2xl mx-auto px-4 py-16 text-center`;
const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: #a0aec0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
`;
const EmptyTitle = tw.div`font-black text-gray-800 text-base mb-1`;
const EmptyBody = tw.div`text-sm text-gray-500 mb-6`;
const EmptyCta = styled.button`
  ${tw`inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold`}
  background: ${({ $brandColor }) => $brandColor || "#8B5A2B"};
  color: #fff;
  border: none;
  cursor: pointer;

  &:active {
    transform: scale(0.98);
  }
`;

/* ---------- main ---------- */
const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  //  const [errorMessage, setErrorMessage] = useState("");
  // const [showErrorModal, setShowErrorModal] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const navigate = useNavigate();
  const token = GetToken();
  const dispatch = useDispatch();
  const ringtoneRef = useRef(null);

  const t = useSelector((state) => state.language.language);
  const Language = translations[t];
  const brandColor = useSelector((state) => state.table.brandColor);
  const statusFlowEnabled = useSelector(
    (state) => state.table.statusFlowEnabled,
  );

  /* ---------- ringtone ---------- */
  const playRingtone = useCallback(() => {
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    }
    const audio = new Audio("/orderChange.m4a");
    audio.loop = false;
    audio.play().catch(() => {});
    ringtoneRef.current = audio;
  }, []);

  /* ---------- data ---------- */
  const fetchOrders = useCallback(async () => {
    try {
      const response = await axios.get(`${baseUrl}/order`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sortedOrders = response.data.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
      );
      setOrders(sortedOrders);
      const active = sortedOrders.filter(
        (o) => o.status !== "cancelled" && o.status !== "archived",
      ).length;
      dispatch(setActiveCount(active));
    } catch (error) {
      if (error.response?.status === 404) {
        setOrders([]);
        dispatch(setActiveCount(0));
      } else {
        console.error("Error fetching orders:", error);
        // setErrorMessage("Error fetching orders.");
        // setShowErrorModal(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, dispatch]);

  useEffect(() => {
    fetchOrders();

    const socket = io(baseUrl, { auth: { token } });
    socket.on("orderUpdated", (payload) => {
      fetchOrders();
      if (!payload || payload.payed !== true) {
        playRingtone();
      }
    });

    return () => {
      socket.disconnect();
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current = null;
      }
    };
  }, [token, fetchOrders, playRingtone]);

  /* ---------- derived ---------- */
  const { totalWithoutTips, totalWithTips } = useMemo(() => {
    let withoutTips = 0;
    let withTips = 0;
    orders.forEach((o) => {
      const price = Number(o.totalPrice) || 0;
      const tips = Number(o.tips) || 0;
      withoutTips += price;
      withTips += price + tips;
    });
    return {
      totalWithoutTips: withoutTips.toFixed(2),
      totalWithTips: withTips.toFixed(2),
    };
  }, [orders]);

  /* ---------- actions ---------- */
  const handleModify = (orderId) => {
    navigate(`/order/${orderId}`);
  };

  const handleCancel = (orderId) => {
    setConfirmId(orderId);
  };

  const confirmDelete = async () => {
    const id = confirmId;
    setConfirmId(null);
    try {
      await axios.delete(`${baseUrl}/order/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders((prev) => prev.filter((o) => o._id !== id));
    } catch (error) {
      console.error("Error canceling order:", error);
      // setErrorMessage("Error canceling order.");
      // setShowErrorModal(true);
    }
  };

  const handleRate = (orderId) => navigate(`/order/rate/${orderId}`);
  const handleTips = (orderId) => navigate(`/order/tips/${orderId}`);
  const handleAddNewOrder = () => navigate("/menu");

  const toggleRow = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  /* ---------- helpers ---------- */
  const statusLabel = (status) => {
    if (status === "pending") return Language.pending || "Pending";
    if (status === "preparing") return Language.preparing || "Preparing";
    if (status === "completed")
      return statusFlowEnabled
        ? Language.completed || "Completed"
        : Language.placed || "Placed";
    if (status === "cancelled") return Language.cancelled || "Cancelled";
    return status;
  };

  const statusIcon = (status) => {
    if (status === "pending") return <ClockIcon />;
    if (status === "preparing") return <FlameIcon />;
    if (status === "completed") return <CheckCircleIcon />;
    if (status === "cancelled") return <XCircleIcon />;
    return <ClockIcon />;
  };

  const previewText = (order) => {
    const names = (order.products || [])
      .slice(0, 2)
      .map((p) => p.product?.name)
      .filter(Boolean);
    if (names.length === 0) return "";
    const more = (order.products?.length || 0) - names.length;
    return `${names.join(", ")}${more > 0 ? ` +${more}` : ""}`;
  };

  const timeAgo = (iso) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  /* ---------- render ---------- */
  if (isLoading) {
    return (
      <AnimationRevealPage disabled>
        <Page>
          <StickyHeader>
            <HeaderInner>
              <BackButton
                type="button"
                onClick={() => navigate("/menu")}
                aria-label="Back"
              >
                <ChevronLeftIcon tw="w-5 h-5" />
              </BackButton>
              <HeaderText>
                <HeaderTitle>{Language.myOrders || "My Orders"}</HeaderTitle>
              </HeaderText>
            </HeaderInner>
          </StickyHeader>
          <Content>
            <div tw="text-center py-16 text-gray-500">Loading…</div>
          </Content>
        </Page>
      </AnimationRevealPage>
    );
  }

  return (
    <AnimationRevealPage disabled>
      <Page>
        {/* ---------- Sticky header ---------- */}
        <StickyHeader>
          <HeaderInner>
            <BackButton
              type="button"
              onClick={() => navigate("/menu")}
              aria-label="Back"
            >
              <ChevronLeftIcon tw="w-5 h-5" />
            </BackButton>
            <HeaderText>
              <HeaderTitle>{Language.myOrders || "My Orders"}</HeaderTitle>
              <HeaderSub>
                {orders.length}{" "}
                {orders.length === 1
                  ? Language.myOrder || "order"
                  : Language.myOrders || "orders"}
                {orders.length > 0 && ` · ${totalWithTips} TND`}
              </HeaderSub>
            </HeaderText>

            <NewOrderPill
              type="button"
              $brandColor={brandColor}
              onClick={handleAddNewOrder}
            >
              <PlusIcon />
              {Language.newOrderShort || "New"}
            </NewOrderPill>
          </HeaderInner>
        </StickyHeader>

        {/* ---------- Content ---------- */}
        {orders.length === 0 ? (
          <EmptyWrap>
            <EmptyIcon>
              <ShoppingBagIcon tw="w-8 h-8" />
            </EmptyIcon>
            <EmptyTitle>{Language.noOrdersYet || "No orders yet"}</EmptyTitle>
            <EmptyBody>
              {Language.noOrdersYetHint ||
                "Your placed orders will appear here."}
            </EmptyBody>
            <EmptyCta
              type="button"
              $brandColor={brandColor}
              onClick={handleAddNewOrder}
            >
              {Language.goToMenu || "Go to menu"}
            </EmptyCta>
          </EmptyWrap>
        ) : (
          <Content>
            <AnimatePresence>
              {orders.map((order) => {
                const isOpen = expandedId === order._id;
                const price = Number(order.totalPrice) || 0;
                const tips = Number(order.tips) || 0;
                const isCompleted = order.status === "completed";
                const isPending = order.status === "pending";
                const isCancelled = order.status === "cancelled";

                return (
                  <Row
                    key={order._id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <RowHead onClick={() => toggleRow(order._id)}>
                      <StatusChip $status={order.status}>
                        {statusIcon(order.status)}
                      </StatusChip>

                      <RowMain>
                        <RowTop>
                          <OrderNum>
                            #{order.orderNumber || order._id.slice(-4)}
                          </OrderNum>
                          <StatusPill $status={order.status}>
                            {statusLabel(order.status)}
                          </StatusPill>
                        </RowTop>
                        <PreviewLine>{previewText(order)}</PreviewLine>
                      </RowMain>

                      <RowRight>
                        <PriceText $brandColor={brandColor}>
                          {(price + tips).toFixed(2)} TND
                        </PriceText>
                        <TimeText>{timeAgo(order.timestamp)}</TimeText>
                      </RowRight>

                      <ChevronBox>
                        {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                      </ChevronBox>
                    </RowHead>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <Panel
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <SectionTitle>
                            {Language.Products || "Items"}
                          </SectionTitle>
                          {order.products.map((line, idx) => {
                            const p = line.product || {};
                            const qty = line.quantity || 0;
                            const raw = Number(p.price) || 0;
                            const disc = Number(p.discountPercentage) || 0;
                            const unit =
                              disc > 0 ? raw * (1 - disc / 100) : raw;
                            return (
                              <ItemLine key={idx}>
                                <ItemName>
                                  {p.name}
                                  {disc > 0 && (
                                    <span tw="ml-2 text-xs text-gray-400 line-through">
                                      {raw.toFixed(2)}
                                    </span>
                                  )}
                                </ItemName>
                                <ItemQty>× {qty}</ItemQty>
                                <ItemTotal>
                                  {(unit * qty).toFixed(2)} TND
                                </ItemTotal>
                              </ItemLine>
                            );
                          })}

                          <TotalsBlock>
                            <TotalLine>
                              <TotalLabel>
                                {Language.totalWithoutTips || "Subtotal"}
                              </TotalLabel>
                              <TotalValue>{price.toFixed(2)} TND</TotalValue>
                            </TotalLine>
                            {tips > 0 && (
                              <TotalLine>
                                <TotalLabel>{Language.tip || "Tip"}</TotalLabel>
                                <TotalValue>{tips.toFixed(2)} TND</TotalValue>
                              </TotalLine>
                            )}
                            <TotalLine>
                              <TotalLabel>
                                {Language.total || "Total"}
                              </TotalLabel>
                              <TotalValue $highlight $brandColor={brandColor}>
                                {(price + tips).toFixed(2)} TND
                              </TotalValue>
                            </TotalLine>
                          </TotalsBlock>

                          {order.comment && (
                            <CommentBlock>{order.comment}</CommentBlock>
                          )}

                          {isCompleted && (
                            <ActionRow>
                              <ActionBtn
                                type="button"
                                $variant="secondary"
                                disabled={order.rated}
                                onClick={() => handleRate(order._id)}
                              >
                                <StarIcon />
                                {order.rated
                                  ? Language.rated || "Rated"
                                  : Language.rate || "Rate"}
                              </ActionBtn>
                              <ActionBtn
                                type="button"
                                $variant="secondary"
                                disabled={!!order.tips}
                                onClick={() => handleTips(order._id)}
                              >
                                <DollarIcon />
                                {order.tips
                                  ? Language.tipped || "Tipped"
                                  : Language.tip || "Tip"}
                              </ActionBtn>
                            </ActionRow>
                          )}

                          {!isCompleted && !isCancelled && (
                            <ActionRow>
                              <ActionBtn
                                type="button"
                                $variant="primary"
                                $brandColor={brandColor}
                                disabled={!isPending}
                                onClick={() => handleModify(order._id)}
                              >
                                <PencilIcon />
                                {Language.modify || "Modify"}
                              </ActionBtn>
                              <ActionBtn
                                type="button"
                                $variant="danger"
                                disabled={!isPending}
                                onClick={() => handleCancel(order._id)}
                              >
                                <TrashIcon />
                                {Language.cancel || "Cancel"}
                              </ActionBtn>
                            </ActionRow>
                          )}
                        </Panel>
                      )}
                    </AnimatePresence>
                  </Row>
                );
              })}
            </AnimatePresence>

            {/* ---------- Totals summary ---------- */}
            <Summary>
              <SummaryRow>
                <SummaryLabel>
                  {Language.totalWithoutTips || "Total (without tips)"}
                </SummaryLabel>
                <SummaryValue>{totalWithoutTips} TND</SummaryValue>
              </SummaryRow>
              <SummaryRow>
                <SummaryLabel>
                  {Language.totalWithTips || "Total (with tips)"}
                </SummaryLabel>
                <SummaryValue $highlight $brandColor={brandColor}>
                  {totalWithTips} TND
                </SummaryValue>
              </SummaryRow>
            </Summary>
          </Content>
        )}

        {/* ---------- Cancel confirm ---------- */}
        <AnimatePresence>
          {confirmId && (
            <ConfirmOverlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ConfirmCard
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 12, opacity: 0 }}
              >
                <ConfirmTitle>{Language.cancel || "Cancel"} ?</ConfirmTitle>
                <ConfirmBody>
                  {Language.removeConfirm ||
                    "Are you sure you want to cancel this order?"}
                </ConfirmBody>
                <ConfirmActions>
                  <ConfirmBtn
                    type="button"
                    $variant="secondary"
                    onClick={() => setConfirmId(null)}
                  >
                    {Language.no || "No"}
                  </ConfirmBtn>
                  <ConfirmBtn
                    type="button"
                    $variant="danger"
                    onClick={confirmDelete}
                  >
                    {Language.yes || "Yes, cancel"}
                  </ConfirmBtn>
                </ConfirmActions>
              </ConfirmCard>
            </ConfirmOverlay>
          )}
        </AnimatePresence>
      </Page>
    </AnimationRevealPage>
  );
};

/* ---------- confirm modal bits ---------- */
const ConfirmOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ConfirmCard = styled(motion.div)`
  ${tw`bg-white rounded-2xl p-5 w-full`}
  max-width: 340px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
`;

const ConfirmTitle = tw.div`text-base font-black text-gray-900 mb-1`;
const ConfirmBody = tw.div`text-sm text-gray-500 mb-5`;

const ConfirmActions = tw.div`flex gap-2`;

const ConfirmBtn = styled.button`
  ${tw`flex-1 py-3 rounded-xl text-sm font-bold`}
  background: ${({ $variant }) =>
    $variant === "danger" ? "#dc2626" : "#f1f3f5"};
  color: ${({ $variant }) => ($variant === "danger" ? "#fff" : "#4a5568")};
  border: none;
  cursor: pointer;
  transition: transform 0.12s ease;

  &:active {
    transform: scale(0.97);
  }
`;

export default OrderList;
