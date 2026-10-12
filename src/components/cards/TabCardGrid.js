import React, { useState, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addItem } from "../../features/basketSlice";
import { motion, AnimatePresence } from "framer-motion";
import tw from "twin.macro";
import styled, { css, keyframes } from "styled-components";
//import { Container } from "components/misc/Layouts.js";
import { ReactComponent as StarIcon } from "images/star-icon.svg";
import { ReactComponent as PlusIcon } from "feather-icons/dist/icons/plus.svg";
import { ReactComponent as CheckIcon } from "feather-icons/dist/icons/check.svg";
import { ReactComponent as ChevronLeftIcon } from "feather-icons/dist/icons/chevron-left.svg";
import { ReactComponent as ShoppingBagIcon } from "feather-icons/dist/icons/shopping-bag.svg";
import AnimationRevealPage from "helpers/AnimationRevealPage";
import axios from "axios";
import { baseUrl } from "helpers/BaseUrl";
import { GetToken } from "helpers/GetToken";
import ErrorModal from "../../helpers/modals/ErrorModal";
import Loading from "helpers/Loading";
import translations from "app/language";
import { io } from "socket.io-client";
import NotifSupport from "components/features/NotificationSupport";
import { useNavigate, useParams } from "react-router-dom";

/* ---------- layout ---------- */
const Page = tw.div`min-h-screen bg-gray-100 pb-24`;
const StickyHeader = tw.div`sticky top-0 z-30 bg-white border-b border-gray-200`;
const HeaderInner = tw.div`max-w-screen-xl mx-auto px-4 py-3 flex items-center gap-3`;
const BackButton = tw.button`flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors text-gray-700 flex-shrink-0`;
const HeaderText = tw.div`min-w-0 flex-1`;
const HeaderTitle = tw.h1`text-base sm:text-lg font-black text-gray-900 truncate`;
const HeaderSub = tw.div`text-xs text-gray-500 truncate`;

const TabsWrap = tw.div`relative border-b border-gray-200 bg-white`;
const TabsScroll = tw.div`max-w-screen-xl mx-auto px-4 overflow-x-auto`;
const TabsRow = tw.div`flex gap-2 py-3`;

const Tab = styled.button`
  ${tw`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors`}
  background: ${({ $active, $brandColor }) =>
    $active ? $brandColor : "#f1f3f5"};
  color: ${({ $active }) => ($active ? "#fff" : "#4a5568")};
  border: none;
  cursor: pointer;

  &:active {
    transform: scale(0.97);
  }
`;

const FadeEdge = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 40px;
  pointer-events: none;
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0),
    rgba(255, 255, 255, 1)
  );
`;

const Content = tw.div`max-w-screen-xl mx-auto px-4 pt-4`;
const Grid = tw.div`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4`;

/* ---------- product card ---------- */
const Card = styled(motion.div)`
  ${tw`bg-white rounded-2xl overflow-hidden flex flex-col relative`}
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.2s ease;
  ${({ $available }) =>
    $available
      ? css`
          &:hover {
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
          }
        `
      : css`
          opacity: 0.55;
          filter: saturate(0.6);
        `}
`;

const CardImageWrap = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  background: #eef0f3;
  overflow: hidden;
`;

const CardImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const CardImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 900;
  color: #fff;
  background: ${({ $color }) => $color || "#cbd5e0"};
`;

const RatingPill = styled.div`
  position: absolute;
  left: 8px;
  bottom: 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  font-size: 0.72rem;
  font-weight: 700;
  backdrop-filter: blur(4px);

  svg {
    width: 12px;
    height: 12px;
    fill: #f6ad55;
  }
`;

const DiscountBadge = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 3px 8px;
  border-radius: 999px;
  background: #dc3545;
  color: #fff;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.02em;
`;

const UnavailableOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.65);
  color: #4a5568;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

const CardBody = tw.div`p-3 flex flex-col gap-1 flex-1`;

const CardTitle = styled.div`
  ${tw`text-sm font-bold text-gray-900 leading-tight`}
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CardDesc = styled.div`
  ${tw`text-xs text-gray-500 leading-snug`}
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PriceRow = tw.div`flex items-center gap-2 mt-auto pt-2 flex-wrap`;

const FinalPrice = styled.span`
  ${tw`text-sm font-black`}
  color: ${({ $brandColor }) => $brandColor};
`;

const OriginalPrice = tw.span`text-xs text-gray-400 line-through`;

const AddButton = styled.button`
  ${tw`flex items-center justify-center rounded-full text-white font-bold`}
  width: 36px;
  height: 36px;
  background: ${({ $brandColor, disabled }) =>
    disabled ? "#cbd5e0" : $brandColor || "#8B5A2B"};
  border: none;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  transition: transform 0.12s ease;
  flex-shrink: 0;

  &:active {
    transform: ${({ disabled }) => (disabled ? "none" : "scale(0.9)")};
  }

  svg {
    width: 16px;
    height: 16px;
    color: #fff;
  }
`;

const PriceActionsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: auto;
  padding-top: 8px;
`;

/* checkmark pulse animation on add */
const pulse = keyframes`
  0% { transform: scale(0.9); }
  50% { transform: scale(1.08); }
  100% { transform: scale(1); }
`;

const AddedPulse = styled.div`
  animation: ${pulse} 0.35s ease;
`;

/* ---------- empty ---------- */
const EmptyState = tw.div`py-16 text-center text-gray-500`;
const EmptyTitle = tw.div`font-bold text-gray-800 mb-1`;
const EmptyBody = tw.div`text-sm`;

/* ---------- sticky basket bar ---------- */
const BasketBar = styled.button`
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: 12px;
  z-index: 40;
  background: ${({ $brandColor }) => $brandColor || "#8B5A2B"};
  color: #fff;
  border: none;
  border-radius: 14px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-weight: 700;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.18);
  cursor: pointer;
  transition: transform 0.12s ease;

  &:active {
    transform: scale(0.99);
  }

  @media (min-width: 1024px) {
    max-width: 420px;
    left: 50%;
    right: auto;
    transform: translateX(-50%);
  }
`;

const BasketBarLeft = tw.div`flex items-center gap-2 min-w-0`;
const BasketBarCount = styled.span`
  ${tw`text-xs font-black rounded-full`}
  background: rgba(255, 255, 255, 0.22);
  padding: 2px 8px;
`;
const BasketBarLabel = tw.span`text-sm truncate`;
const BasketBarTotal = tw.span`text-sm font-black whitespace-nowrap`;

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

/* ---------- main component ---------- */
export default function MenuSection({ heading }) {
  const [sections, setSections] = useState([]); // categories of this section
  const [isLoading, setIsLoading] = useState(true);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [justAdded, setJustAdded] = useState({});
  const tabsRef = useRef(null);
  const [showFade, setShowFade] = useState(false);

  const token = GetToken();
  const { categoryId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const t = useSelector((state) => state.language.language);
  const Language = translations[t];
  const brandColor = useSelector((state) => state.table.brandColor);
  const basketItems = useSelector((state) => state.basket.items);

  /* ---------- basket totals ---------- */
  const basketCount = basketItems.reduce((a, b) => a + b.quantity, 0);
  const basketTotal = useMemo(() => {
    return basketItems.reduce((sum, item) => {
      const p = item.product || {};
      const raw = Number(p.price) || 0;
      const disc = Number(p.discountPercentage) || 0;
      const unit = disc > 0 ? raw * (1 - disc / 100) : raw;
      return sum + unit * (item.quantity || 0);
    }, 0);
  }, [basketItems]);

  /* ---------- fetch ---------- */
  const fetchMenu = async () => {
    try {
      const response = await axios.get(`${baseUrl}/sections/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const menu = response.data;
      const categories = menu.categories || [];
      setSections(categories);
      setActiveCategory((prev) => {
        if (prev && categories.some((c) => c.name === prev)) return prev;
        return categories[0]?.name || "";
      });
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching menu:", error);
      setErrorMessage("Error fetching menu. Please try again.");
      setShowErrorModal(true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
    const socket = io(baseUrl, { auth: { token } });
    socket.on("productUpdated", () => fetchMenu());
    return () => socket.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, categoryId]);

  /* ---------- tab fade indicator ---------- */
  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;
    const update = () => {
      const overflow = el.scrollWidth > el.clientWidth + 2;
      const notAtEnd = el.scrollLeft + el.clientWidth < el.scrollWidth - 4;
      setShowFade(overflow && notAtEnd);
    };
    update();
    el.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [sections]);

  /* ---------- add to basket ---------- */
  const handleAdd = (product) => {
    if (!product.available) {
      setErrorMessage("This product is currently unavailable.");
      setShowErrorModal(true);
      return;
    }
    dispatch(addItem(product));
    setJustAdded((prev) => ({ ...prev, [product._id]: true }));
    setTimeout(() => {
      setJustAdded((prev) => {
        const next = { ...prev };
        delete next[product._id];
        return next;
      });
    }, 800);
  };

  const handleBasketClick = () => navigate("/order");

  /* ---------- derived ---------- */
  const currentCategory = sections.find((c) => c.name === activeCategory);
  const products = currentCategory?.products || [];
  const sectionTitle =
    heading || sections[0]?.name || Language.welcomeTo || "Our menu";

  if (isLoading) return <Loading />;

  return (
    <AnimationRevealPage disabled>
      <Page>
        <NotifSupport />

        {/* ---------- Sticky header ---------- */}
        <StickyHeader>
          <HeaderInner>
            <BackButton
              type="button"
              onClick={() => navigate(-1)}
              aria-label={Language.backToMenu || "Back"}
            >
              <ChevronLeftIcon tw="w-5 h-5" />
            </BackButton>
            <HeaderText>
              <HeaderTitle>{sectionTitle}</HeaderTitle>
              <HeaderSub>
                {sections.length}{" "}
                {sections.length === 1
                  ? Language.category || "category"
                  : Language.categories || "categories"}
              </HeaderSub>
            </HeaderText>
          </HeaderInner>

          {/* ---------- Tabs ---------- */}
          {sections.length > 0 && (
            <TabsWrap>
              <TabsScroll ref={tabsRef}>
                <TabsRow>
                  {sections.map((cat) => (
                    <Tab
                      key={cat._id || cat.name}
                      type="button"
                      $active={activeCategory === cat.name}
                      $brandColor={brandColor}
                      onClick={() => setActiveCategory(cat.name)}
                    >
                      {cat.name}
                    </Tab>
                  ))}
                </TabsRow>
              </TabsScroll>
              {showFade && <FadeEdge />}
            </TabsWrap>
          )}
        </StickyHeader>

        {/* ---------- Content ---------- */}
        <Content>
          {sections.length === 0 ? (
            <EmptyState>
              <EmptyTitle>
                {Language.noProducts || "No items available"}
              </EmptyTitle>
              <EmptyBody>
                {Language.comingSoon || "Please check back soon."}
              </EmptyBody>
            </EmptyState>
          ) : products.length === 0 ? (
            <EmptyState>
              <EmptyTitle>
                {Language.noItemsInCategory || "No items in this category"}
              </EmptyTitle>
              <EmptyBody>
                {Language.tryAnotherCategory || "Try another category."}
              </EmptyBody>
            </EmptyState>
          ) : (
            <Grid>
              <AnimatePresence>
                {products.map((card) => {
                  const hasDiscount = Number(card.discountPercentage) > 0;
                  const rawPrice = Number(card.price) || 0;
                  const finalPrice = hasDiscount
                    ? rawPrice * (1 - Number(card.discountPercentage) / 100)
                    : rawPrice;
                  const rating = Number(card.rate) || 0;
                  const raters = Number(card.raters) || 0;
                  const isAdded = !!justAdded[card._id];
                  const placeholder = placeholderColorFor(card._id);

                  return (
                    <Card
                      key={card._id}
                      $available={card.available !== false}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CardImageWrap>
                        {card.img ? (
                          <CardImage
                            src={card.img}
                            alt={card.name}
                            loading="lazy"
                          />
                        ) : (
                          <CardImagePlaceholder $color={placeholder}>
                            {(card.name || "?").charAt(0).toUpperCase()}
                          </CardImagePlaceholder>
                        )}

                        {raters > 0 && (
                          <RatingPill>
                            <StarIcon />
                            {rating.toFixed(1)}
                            <span style={{ opacity: 0.75 }}>· {raters}</span>
                          </RatingPill>
                        )}

                        {hasDiscount && card.available !== false && (
                          <DiscountBadge>
                            -{Number(card.discountPercentage)}%
                          </DiscountBadge>
                        )}

                        {card.available === false && (
                          <UnavailableOverlay>
                            {Language.unavailable || "Unavailable"}
                          </UnavailableOverlay>
                        )}
                      </CardImageWrap>

                      <CardBody>
                        <CardTitle>{card.name}</CardTitle>
                        {card.description && (
                          <CardDesc>{card.description}</CardDesc>
                        )}

                        <PriceActionsRow>
                          <PriceRow>
                            <FinalPrice $brandColor={brandColor}>
                              {finalPrice.toFixed(2)} TND
                            </FinalPrice>
                            {hasDiscount && (
                              <OriginalPrice>
                                {rawPrice.toFixed(2)}
                              </OriginalPrice>
                            )}
                          </PriceRow>

                          <AddButton
                            type="button"
                            $brandColor={brandColor}
                            disabled={card.available === false}
                            onClick={() => handleAdd(card)}
                            aria-label={Language.addToBasket || "Add to basket"}
                          >
                            {isAdded ? (
                              <AddedPulse>
                                <CheckIcon />
                              </AddedPulse>
                            ) : (
                              <PlusIcon />
                            )}
                          </AddButton>
                        </PriceActionsRow>
                      </CardBody>
                    </Card>
                  );
                })}
              </AnimatePresence>
            </Grid>
          )}
        </Content>

        {/* ---------- Sticky basket bar ---------- */}
        {basketCount > 0 && (
          <BasketBar
            type="button"
            $brandColor={brandColor}
            onClick={handleBasketClick}
          >
            <BasketBarLeft>
              <ShoppingBagIcon tw="w-5 h-5" />
              <BasketBarLabel>
                {Language.viewBasket || "View basket"}
              </BasketBarLabel>
              <BasketBarCount>{basketCount}</BasketBarCount>
            </BasketBarLeft>
            <BasketBarTotal>{basketTotal.toFixed(2)} TND</BasketBarTotal>
          </BasketBar>
        )}
      </Page>

      {showErrorModal && (
        <ErrorModal
          error={errorMessage}
          closeModal={() => setShowErrorModal(false)}
        />
      )}
    </AnimationRevealPage>
  );
}
