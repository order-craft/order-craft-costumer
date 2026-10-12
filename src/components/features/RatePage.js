import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import tw from "twin.macro";
import styled, { keyframes } from "styled-components";
import axios from "axios";
import { baseUrl } from "helpers/BaseUrl";
import Loading from "helpers/Loading";
import { GetToken } from "helpers/GetToken";
import translations from "app/language";

import { ReactComponent as ChevronLeftIcon } from "feather-icons/dist/icons/chevron-left.svg";
import { ReactComponent as StarIcon } from "feather-icons/dist/icons/star.svg";
import { ReactComponent as CheckCircleIcon } from "feather-icons/dist/icons/check-circle.svg";

/* ---------- layout ---------- */
const Page = tw.div`min-h-screen bg-gray-100 pb-32`;
const StickyHeader = tw.div`sticky top-0 z-30 bg-white border-b border-gray-200`;
const HeaderInner = tw.div`max-w-2xl mx-auto px-4 py-3 flex items-center gap-3`;
const BackButton = tw.button`flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors text-gray-700 flex-shrink-0`;
const HeaderText = tw.div`min-w-0 flex-1`;
const HeaderTitle = tw.h1`text-base sm:text-lg font-black text-gray-900 truncate`;
const HeaderSub = tw.div`text-xs text-gray-500 truncate`;

const Content = tw.div`max-w-2xl mx-auto px-4 pt-4 flex flex-col gap-3`;

/* ---------- product card ---------- */
const Card = styled.div`
  ${tw`bg-white rounded-2xl p-4`}
  border: 1px solid #eef0f3;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.06),
    0 1px 2px rgba(0, 0, 0, 0.04);
`;

const RowTop = tw.div`flex items-center gap-3`;

const Thumb = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  overflow: hidden;
  background: ${({ $color }) => $color || "#eef0f3"};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  color: #fff;
  font-size: 1.1rem;
  flex-shrink: 0;
`;

const ThumbImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const Name = styled.div`
  ${tw`text-sm font-bold text-gray-900 leading-tight`}
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const StarRow = tw.div`flex items-center justify-between mt-4`;

const Stars = tw.div`flex items-center gap-1`;

const StarButton = styled.button`
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.12s ease;

  &:active {
    transform: scale(0.9);
  }

  svg {
    width: 26px;
    height: 26px;
    transition:
      fill 0.15s ease,
      color 0.15s ease;
    color: ${({ $active }) => ($active ? "#f6ad55" : "#cbd5e0")};
    fill: ${({ $active }) => ($active ? "#f6ad55" : "transparent")};
    stroke: ${({ $active }) => ($active ? "#f6ad55" : "#cbd5e0")};
  }
`;

const ScoreLabel = styled.div`
  ${tw`text-xs font-black`}
  color: ${({ $tone }) => {
    switch ($tone) {
      case "excellent":
        return "#16a34a";
      case "good":
        return "#0d9488";
      case "okay":
        return "#d97706";
      case "poor":
        return "#ea580c";
      case "bad":
        return "#dc2626";
      default:
        return "#a0aec0";
    }
  }};
  min-width: 72px;
  text-align: right;
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

const ProgressLabel = tw.div`flex flex-col min-w-0`;
const ProgressTitle = tw.div`text-[11px] font-black uppercase tracking-wider text-gray-500`;
const ProgressValue = tw.div`text-sm font-black text-gray-900`;

const SubmitButton = styled.button`
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
`;

/* ---------- thank-you screen ---------- */
const ThanksWrap = tw.div`max-w-2xl mx-auto px-4 py-16 text-center`;

const popIn = keyframes`
  0% { transform: scale(0.6); opacity: 0; }
  60% { transform: scale(1.08); opacity: 1; }
  100% { transform: scale(1); }
`;

const ThanksIcon = styled.div`
  width: 84px;
  height: 84px;
  border-radius: 999px;
  background: #dcfce7;
  color: #16a34a;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  animation: ${popIn} 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);

  svg {
    width: 44px;
    height: 44px;
  }
`;

const ThanksTitle = tw.div`font-black text-gray-900 text-xl mb-2`;
const ThanksBody = tw.div`text-sm text-gray-500 mb-8`;

const ThanksCta = styled(Link)`
  ${tw`inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold`}
  background: ${({ $brandColor }) => $brandColor || "#8B5A2B"};
  color: #fff;
  text-decoration: none;

  &:active {
    transform: scale(0.98);
  }
`;

/* ---------- helpers ---------- */
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

const scoreLabelFor = (n) => {
  switch (n) {
    case 1:
      return { text: "Bad", tone: "bad" };
    case 2:
      return { text: "Poor", tone: "poor" };
    case 3:
      return { text: "Okay", tone: "okay" };
    case 4:
      return { text: "Good", tone: "good" };
    case 5:
      return { text: "Excellent", tone: "excellent" };
    default:
      return { text: "Tap to rate", tone: "empty" };
  }
};

/* ---------- main ---------- */
const RatePage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [ratings, setRatings] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const token = GetToken();
  const t = useSelector((state) => state.language.language);
  const Language = translations[t];
  const brandColor = useSelector((state) => state.table.brandColor);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(`${baseUrl}/order/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrder(response.data);
        if (response.data?.rated) setSubmitted(true);
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, token]);

  const handleRating = (productId, value) => {
    setRatings((prev) => ({ ...prev, [productId]: value }));
  };

  const ratedCount = Object.keys(ratings).length;
  const totalProducts = order?.products?.length || 0;

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await axios.post(
        `${baseUrl}/order/${orderId}/rate`,
        { ratings },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting ratings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loading />;

  /* ---------- thank you screen ---------- */
  if (submitted || order?.rated) {
    return (
      <Page>
        <StickyHeader>
          <HeaderInner>
            <BackButton
              type="button"
              onClick={() => navigate("/orders")}
              aria-label="Back"
            >
              <ChevronLeftIcon tw="w-5 h-5" />
            </BackButton>
            <HeaderText>
              <HeaderTitle>
                {Language.rateYourProducts || "Rate your order"}
              </HeaderTitle>
            </HeaderText>
          </HeaderInner>
        </StickyHeader>

        <ThanksWrap>
          <ThanksIcon>
            <CheckCircleIcon />
          </ThanksIcon>
          <ThanksTitle>
            {Language.thankYouForRating || "Thanks for your feedback"}
          </ThanksTitle>
          <ThanksBody>
            {Language.thankYouForRatingHint || "Your ratings help us improve."}
          </ThanksBody>
          <ThanksCta to="/orders" $brandColor={brandColor}>
            {Language.goToMyOrders || "Back to my orders"}
          </ThanksCta>
        </ThanksWrap>
      </Page>
    );
  }

  /* ---------- product list ---------- */
  return (
    <Page>
      <StickyHeader>
        <HeaderInner>
          <BackButton
            type="button"
            onClick={() => navigate("/orders")}
            aria-label="Back"
          >
            <ChevronLeftIcon tw="w-5 h-5" />
          </BackButton>
          <HeaderText>
            <HeaderTitle>
              {Language.rateYourProducts || "Rate your order"}
            </HeaderTitle>
            <HeaderSub>
              {totalProducts}{" "}
              {totalProducts === 1
                ? Language.item || "item"
                : Language.items || "items"}
            </HeaderSub>
          </HeaderText>
        </HeaderInner>
      </StickyHeader>

      <Content>
        {order?.products?.map(({ product }) => {
          const rating = ratings[product._id] || 0;
          const score = scoreLabelFor(rating);
          const placeholder = placeholderColorFor(product._id);

          return (
            <Card key={product._id}>
              <RowTop>
                <Thumb $color={placeholder}>
                  {product.img ? (
                    <ThumbImg src={product.img} alt={product.name} />
                  ) : (
                    (product.name || "?").charAt(0).toUpperCase()
                  )}
                </Thumb>
                <Name>{product.name}</Name>
              </RowTop>

              <StarRow>
                <Stars>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarButton
                      key={star}
                      type="button"
                      $active={rating >= star}
                      onClick={() => handleRating(product._id, star)}
                      aria-label={`Rate ${star} out of 5`}
                    >
                      <StarIcon />
                    </StarButton>
                  ))}
                </Stars>
                <ScoreLabel $tone={score.tone}>{score.text}</ScoreLabel>
              </StarRow>
            </Card>
          );
        })}
      </Content>

      <BottomBar>
        <ProgressLabel>
          <ProgressTitle>
            {Language.rateYourProducts || "Progress"}
          </ProgressTitle>
          <ProgressValue>
            {ratedCount} / {totalProducts}
          </ProgressValue>
        </ProgressLabel>
        <SubmitButton
          type="button"
          $brandColor={brandColor}
          disabled={ratedCount === 0 || isLoading}
          onClick={handleSubmit}
        >
          {isLoading ? "…" : Language.rateSubmit || "Submit ratings"}
        </SubmitButton>
      </BottomBar>
    </Page>
  );
};

export default RatePage;
