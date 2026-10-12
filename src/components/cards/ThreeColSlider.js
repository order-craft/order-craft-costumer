import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import tw from "twin.macro";
import styled from "styled-components";
import axios from "axios";
import { baseUrl } from "helpers/BaseUrl";
import { GetToken } from "helpers/GetToken";
import Loading from "helpers/Loading";
import AnimationRevealPage from "helpers/AnimationRevealPage";
import translations from "app/language";
import socket from "helpers/soket/socket";
import { removeItem, clearBasket } from "../../features/basketSlice";

import { ReactComponent as ChevronLeftIcon } from "feather-icons/dist/icons/chevron-left.svg";
import { ReactComponent as PlusIcon } from "feather-icons/dist/icons/plus.svg";
import { ReactComponent as MinusIcon } from "feather-icons/dist/icons/minus.svg";
import { ReactComponent as TrashIcon } from "feather-icons/dist/icons/trash-2.svg";
import { ReactComponent as ArrowRightIcon } from "feather-icons/dist/icons/arrow-right.svg";
import { ReactComponent as MessageSquareIcon } from "feather-icons/dist/icons/message-square.svg";
import { ReactComponent as ShoppingBagIcon } from "feather-icons/dist/icons/shopping-bag.svg";

/* ---------- layout ---------- */
const Page = tw.div`min-h-screen bg-gray-100 pb-32`;
const StickyHeader = tw.div`sticky top-0 z-30 bg-white border-b border-gray-200`;
const HeaderInner = tw.div`max-w-2xl mx-auto px-4 py-3 flex items-center gap-3`;
const BackButton = tw.button`flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors text-gray-700 flex-shrink-0`;
const HeaderText = tw.div`min-w-0 flex-1`;
const HeaderTitle = tw.h1`text-base sm:text-lg font-black text-gray-900 truncate`;
const HeaderSub = tw.div`text-xs text-gray-500 truncate`;

const Content = tw.div`max-w-2xl mx-auto px-4 pt-4`;

/* ---------- item row ---------- */
const Row = styled(motion.div)`
  ${tw`bg-white rounded-2xl p-3 flex items-center gap-3`}
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
  border: 1px solid #eef0f3;
`;

const Thumb = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 12px;
  overflow: hidden;
  background: ${({ $color }) => $color || "#eef0f3"};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  color: #fff;
  font-size: 1.25rem;
  flex-shrink: 0;
`;

const ThumbImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const Info = tw.div`flex-1 min-w-0`;

const Name = styled.div`
  ${tw`text-sm font-bold text-gray-900 leading-tight`}
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PriceLine = tw.div`flex items-center gap-2 mt-1 flex-wrap`;
const UnitPrice = styled.span`
  ${tw`text-xs font-bold`}
  color: ${({ $brandColor }) => $brandColor || "#8B5A2B"};
`;
const Strike = tw.span`text-xs text-gray-400 line-through`;

const Controls = tw.div`flex flex-col items-end gap-2 flex-shrink-0`;

const Stepper = styled.div`
  ${tw`flex items-center rounded-full`}
  border: 1px solid #e2e8f0;
  background: #fff;
  overflow: hidden;
`;

const StepBtn = styled.button`
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: ${({ $brandColor, disabled }) =>
    disabled ? "#cbd5e0" : $brandColor || "#8B5A2B"};
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  transition: background-color 0.12s ease;

  &:hover {
    background: ${({ disabled }) =>
      disabled ? "transparent" : "rgba(0, 0, 0, 0.04)"};
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const StepValue = styled.span`
  ${tw`text-sm font-bold text-gray-900 px-2 text-center`}
  min-width: 24px;
`;
const RemoveBtn = styled.button`
  ${tw`flex items-center justify-center w-8 h-8 rounded-full transition-colors`}

  border: none;
  background: transparent;
  color: #a0aec0;
  cursor: pointer;

  &:hover {
    background: #fff5f5;
    color: #e53e3e;
  }

  svg {
    width: 15px;
    height: 15px;
  }
`;

/* ---------- comment ---------- */
const SectionLabel = tw.div`text-xs font-black uppercase text-gray-500 tracking-wider mt-6 mb-2`;
const CommentCard = tw.div`bg-white rounded-2xl p-3 border border-gray-200`;
const CommentIcon = tw.div`flex items-center gap-2 text-gray-500 text-xs font-bold mb-2`;
const Textarea = styled.textarea`
  ${tw`w-full text-sm text-gray-900 bg-transparent outline-none resize-none`}
  border: none;
  min-height: 68px;
  line-height: 1.5;

  &::placeholder {
    color: #a0aec0;
  }
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
const EmptyCta = styled(Link)`
  ${tw`inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold`}
  background: ${({ $brandColor }) => $brandColor || "#8B5A2B"};
  color: #fff;
  text-decoration: none;

  &:active {
    transform: scale(0.98);
  }
`;

/* ---------- sticky bottom bar ---------- */
const BottomBar = styled.div`
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: 12px;
  z-index: 40;
  background: #fff;
  border: 1px solid #eef0f3;
  border-radius: 14px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);

  @media (min-width: 1024px) {
    max-width: 640px;
    left: 50%;
    right: auto;
    transform: translateX(-50%);
  }
`;

const TotalBlock = tw.div`flex flex-col min-w-0`;
const TotalLabel = styled.div`
  ${tw`font-black uppercase tracking-wider text-gray-500`}
  font-size: 10px;
`;
const TotalValue = styled.div`
  ${tw`text-lg font-black leading-tight`}
  color: ${({ $brandColor }) => $brandColor || "#8B5A2B"};
`;

const PrimaryButton = styled.button`
  ${tw`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold ml-auto whitespace-nowrap`}
  background: ${({ $brandColor, disabled }) =>
    disabled ? "#cbd5e0" : $brandColor || "#8B5A2B"};
  color: #fff;
  border: none;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  transition: transform 0.12s ease;

  &:active {
    transform: ${({ disabled }) => (disabled ? "none" : "scale(0.98)")};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

/* ---------- deterministic fallback color for missing images ---------- */
const placeholderPalette = [
  "#8B5A2B",
  "#C05621",
  "#DD6B20",
  "#B7791F",
  "#2C7A7B",
  "#9F7AEA",
];
const placeholderColorFor = (id) => {
  let h = 0;
  const s = String(id || "");
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return placeholderPalette[Math.abs(h) % placeholderPalette.length];
};

/* ---------- main ---------- */
export default function OrderScreen() {
  const [order, setOrder] = useState(null);
  const [updatedQuantities, setUpdatedQuantities] = useState({});
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orderId } = useParams();
  const token = GetToken();

  const t = useSelector((state) => state.language.language);
  const Language = translations[t];
  const brandColor = useSelector((state) => state.table.brandColor);
  const items = useSelector((state) => state.basket.items);

  /* ---------- fetch (edit mode) ---------- */
  const fetchOrder = useCallback(async () => {
    try {
      const response = await axios.get(`${baseUrl}/order/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        setOrder(response.data);
        setComment(response.data.comment || "");
      }
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setIsLoading(false);
    }
  }, [orderId, token]);

  useEffect(() => {
    if (orderId) fetchOrder();
    else setIsLoading(false);
  }, [orderId, fetchOrder]);

  /* ---------- derived rows ---------- */
  const displayRows = useMemo(() => {
    if (orderId) {
      return (order?.products || []).map((p) => ({
        product: p.product,
        quantity: p.quantity,
      }));
    }
    return items.map((i) => ({
      product: i.product,
      quantity: i.quantity,
    }));
  }, [orderId, order, items]);

  const getQty = (product) =>
    updatedQuantities[product._id] ??
    displayRows.find((r) => r.product._id === product._id)?.quantity ??
    1;

  const totalPrice = useMemo(() => {
    return displayRows.reduce((sum, row) => {
      const p = row.product || {};
      const raw = Number(p.price) || 0;
      const disc = Number(p.discountPercentage) || 0;
      const unit = disc > 0 ? raw * (1 - disc / 100) : raw;
      const qty = updatedQuantities[p._id] ?? row.quantity;
      return sum + unit * qty;
    }, 0);
  }, [displayRows, updatedQuantities]);

  const totalItems = displayRows.reduce((sum, row) => {
    const qty = updatedQuantities[row.product._id] ?? row.quantity;
    return sum + qty;
  }, 0);

  /* ---------- quantity ---------- */
  const handleIncrease = (product) => {
    setUpdatedQuantities((prev) => ({
      ...prev,
      [product._id]: getQty(product) + 1,
    }));
  };

  const handleDecrease = (product) => {
    const current = getQty(product);
    if (current <= 1) return; // clamp at 1
    setUpdatedQuantities((prev) => ({
      ...prev,
      [product._id]: current - 1,
    }));
  };

  /* ---------- remove ---------- */
  const handleRemove = async (row) => {
    const confirmed = window.confirm(
      Language.removeConfirm || "Are you sure you want to remove this?",
    );
    if (!confirmed) return;

    if (orderId) {
      setIsLoading(true);
      const updatedProducts = order.products.filter(
        (p) => p.product._id !== row.product._id,
      );
      try {
        const response = await axios.put(
          `${baseUrl}/order/${orderId}`,
          { ...order, products: updatedProducts, comment },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (response.status === 200) {
          setOrder(response.data);
          await fetchOrder();
        }
      } catch (error) {
        console.error("Error removing item:", error);
        alert("Error removing item from order");
      } finally {
        setIsLoading(false);
      }
    } else {
      dispatch(removeItem(row.product));
    }
  };

  /* ---------- submit ---------- */
  const handlePlaceOrder = async () => {
    if (displayRows.length === 0) return;
    setIsLoading(true);

    const products = displayRows.map((row) => ({
      product: row.product._id,
      quantity: updatedQuantities[row.product._id] ?? row.quantity,
    }));
    const orderType = "dine-in";
    const orderData = { products, comment, orderType };

    try {
      let response;
      if (orderId) {
        response = await axios.put(`${baseUrl}/order/${orderId}`, orderData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        response = await axios.post(`${baseUrl}/order`, orderData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }

      if (response.status === 200 || response.status === 201) {
        socket.emit("newOrder", { orderId: orderId || response.data._id });
        if (!orderId) dispatch(clearBasket());
        navigate("/orders");
      } else {
        alert("Failed to place order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Error placing order");
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------- render ---------- */
  if (isLoading) return <Loading />;

  if (displayRows.length === 0) {
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
                <HeaderTitle>{Language.myOrder || "My order"}</HeaderTitle>
              </HeaderText>
            </HeaderInner>
          </StickyHeader>

          <EmptyWrap>
            <EmptyIcon>
              <ShoppingBagIcon tw="w-8 h-8" />
            </EmptyIcon>
            <EmptyTitle>
              {Language.pleaseSelectItems || "Your basket is empty"}
            </EmptyTitle>
            <EmptyBody>
              {Language.pleaseSelectItemsHint ||
                "Pick something from the menu to get started."}
            </EmptyBody>
            <EmptyCta to="/menu" $brandColor={brandColor}>
              {Language.goToMenu || "Go to menu"}
            </EmptyCta>
          </EmptyWrap>
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
              onClick={() => navigate(orderId ? "/orders" : "/menu")}
              aria-label={Language.backToMenu || "Back"}
            >
              <ChevronLeftIcon tw="w-5 h-5" />
            </BackButton>
            <HeaderText>
              <HeaderTitle>
                {orderId
                  ? Language.myOrder || "My order"
                  : Language.myOrder || "My order"}
              </HeaderTitle>
              <HeaderSub>
                {totalItems}{" "}
                {totalItems === 1
                  ? Language.item || "item"
                  : Language.items || "items"}
              </HeaderSub>
            </HeaderText>
          </HeaderInner>
        </StickyHeader>

        {/* ---------- Content ---------- */}
        <Content>
          <div tw="flex flex-col gap-3">
            <AnimatePresence>
              {displayRows.map((row) => {
                const product = row.product || {};
                const qty = getQty(product);
                const raw = Number(product.price) || 0;
                const disc = Number(product.discountPercentage) || 0;
                const unit = disc > 0 ? raw * (1 - disc / 100) : raw;
                const placeholder = placeholderColorFor(product._id);

                return (
                  <Row
                    key={product._id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Thumb $color={placeholder}>
                      {product.img ? (
                        <ThumbImg src={product.img} alt={product.name} />
                      ) : (
                        (product.name || "?").charAt(0).toUpperCase()
                      )}
                    </Thumb>

                    <Info>
                      <Name>{product.name}</Name>
                      <PriceLine>
                        <UnitPrice $brandColor={brandColor}>
                          {unit.toFixed(2)} TND
                        </UnitPrice>
                        {disc > 0 && <Strike>{raw.toFixed(2)}</Strike>}
                      </PriceLine>
                    </Info>

                    <Controls>
                      <Stepper>
                        <StepBtn
                          type="button"
                          $brandColor={brandColor}
                          disabled={qty <= 1}
                          onClick={() => handleDecrease(product)}
                          aria-label="Decrease"
                        >
                          <MinusIcon />
                        </StepBtn>
                        <StepValue>{qty}</StepValue>
                        <StepBtn
                          type="button"
                          $brandColor={brandColor}
                          onClick={() => handleIncrease(product)}
                          aria-label="Increase"
                        >
                          <PlusIcon />
                        </StepBtn>
                      </Stepper>

                      <RemoveBtn
                        type="button"
                        onClick={() => handleRemove(row)}
                        aria-label={Language.remove || "Remove item"}
                      >
                        <TrashIcon />
                      </RemoveBtn>
                    </Controls>
                  </Row>
                );
              })}
            </AnimatePresence>
          </div>

          {/* ---------- Comment ---------- */}
          <SectionLabel>{Language.comment || "Comment"}</SectionLabel>
          <CommentCard>
            <CommentIcon>
              <MessageSquareIcon tw="w-4 h-4" />
              <span>
                {Language.addYourComment || "Add a note for the kitchen"}
              </span>
            </CommentIcon>
            <Textarea
              id="orderComment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                Language.addYourComment ||
                "Any allergies, special requests, etc."
              }
              rows={3}
            />
          </CommentCard>
        </Content>

        {/* ---------- Sticky bottom bar ---------- */}
        <BottomBar>
          <TotalBlock>
            <TotalLabel>{Language.totalPrice || "Total"}</TotalLabel>
            <TotalValue $brandColor={brandColor}>
              {totalPrice.toFixed(2)} TND
            </TotalValue>
          </TotalBlock>

          <PrimaryButton
            type="button"
            $brandColor={brandColor}
            onClick={handlePlaceOrder}
          >
            {orderId
              ? Language.updateOrder || "Update order"
              : Language.placeOrder || "Place order"}
            <ArrowRightIcon />
          </PrimaryButton>
        </BottomBar>
      </Page>
    </AnimationRevealPage>
  );
}
