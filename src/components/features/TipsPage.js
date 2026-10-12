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
import { ReactComponent as CheckIcon } from "feather-icons/dist/icons/check.svg";
import { ReactComponent as CheckCircleIcon } from "feather-icons/dist/icons/check-circle.svg";
import { ReactComponent as DollarSignIcon } from "feather-icons/dist/icons/dollar-sign.svg";

/* ---------- layout ---------- */
const Page = tw.div`min-h-screen bg-gray-100 pb-32`;
const StickyHeader = tw.div`sticky top-0 z-30 bg-white border-b border-gray-200`;
const HeaderInner = tw.div`max-w-2xl mx-auto px-4 py-3 flex items-center gap-3`;
const BackButton = tw.button`flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors text-gray-700 flex-shrink-0`;
const HeaderText = tw.div`min-w-0 flex-1`;
const HeaderTitle = tw.h1`text-base sm:text-lg font-black text-gray-900 truncate`;
const HeaderSub = tw.div`text-xs text-gray-500 truncate`;

const Content = tw.div`max-w-2xl mx-auto px-4 pt-4`;

const Card = styled.div`
  ${tw`bg-white rounded-2xl p-5`}
  border: 1px solid #eef0f3;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.06),
    0 1px 2px rgba(0, 0, 0, 0.04);
`;

const Prompt = tw.div`text-center text-sm font-bold text-gray-800 mb-5`;

const PresetRow = tw.div`grid grid-cols-2 gap-2 mb-4`;

const PresetButton = styled.button`
  ${tw`flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-base`}
  background: ${({ $active, $brandColor }) =>
    $active ? $brandColor || "#8B5A2B" : "#fff"};
  color: ${({ $active }) => ($active ? "#fff" : "#1a202c")};
  border: 2px solid
    ${({ $active, $brandColor }) =>
      $active ? $brandColor || "#8B5A2B" : "#e2e8f0"};
  cursor: pointer;
  transition:
    transform 0.12s ease,
    background-color 0.15s ease,
    border-color 0.15s ease;

  &:active {
    transform: scale(0.98);
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 18px 0 14px 0;
  color: #a0aec0;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: #e2e8f0;
  }
`;

const CustomField = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  border-radius: 14px;
  border: 2px solid
    ${({ $active, $brandColor }) =>
      $active ? $brandColor || "#8B5A2B" : "#e2e8f0"};
  background: #fff;
  height: 52px;
  transition: border-color 0.15s ease;

  svg {
    width: 18px;
    height: 18px;
    color: ${({ $active, $brandColor }) =>
      $active ? $brandColor || "#8B5A2B" : "#a0aec0"};
    flex-shrink: 0;
  }
`;

const CustomInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 1rem;
  font-weight: 700;
  color: #1a202c;

  &::placeholder {
    color: #a0aec0;
    font-weight: 500;
  }
`;

const Suffix = tw.span`text-sm font-black text-gray-500`;

const Summary = styled.div`
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px dashed #e2e8f0;
`;

const SummaryRow = tw.div`flex justify-between py-1 text-sm`;
const SummaryLabel = tw.div`text-gray-500`;
const SummaryValue = styled.div`
  ${tw`font-black`}
  color: ${({ $highlight, $brandColor }) =>
    $highlight ? $brandColor || "#8B5A2B" : "#1a202c"};
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
const TotalLabel = tw.div`text-[11px] font-black uppercase tracking-wider text-gray-500`;
const TotalValue = styled.div`
  ${tw`text-lg font-black leading-tight`}
  color: ${({ $brandColor }) => $brandColor || "#8B5A2B"};
`;

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

/* ---------- thank-you ---------- */
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

const TIP_PRESETS = [5, 10, 15, 20];

/* ---------- main ---------- */
const TipsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTip, setSelectedTip] = useState(null);
  const [customTip, setCustomTip] = useState("");
  const [tipped, setTipped] = useState(false);

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
        if (response.data?.tips && Number(response.data.tips) > 0) {
          setTipped(true);
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, token]);

  const handlePresetSelect = (amount) => {
    setSelectedTip(amount);
    setCustomTip("");
  };

  const handleCustomChange = (e) => {
    setSelectedTip(null);
    setCustomTip(e.target.value);
  };

  const tipValue = customTip ? Number(customTip) || 0 : selectedTip || 0;

  const orderTotal = Number(order?.totalPrice) || 0;
  const grandTotal = orderTotal + tipValue;

  const canSubmit = tipValue > 0 && !submitting && !isLoading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await axios.post(
        `${baseUrl}/order/${orderId}/tips`,
        { selectedTip: tipValue },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setTipped(true);
    } catch (error) {
      console.error("Error submitting tip:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading && !order) return <Loading />;

  /* ---------- thank-you ---------- */
  if (tipped) {
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
              <HeaderTitle>{Language.tip || "Add a tip"}</HeaderTitle>
            </HeaderText>
          </HeaderInner>
        </StickyHeader>

        <ThanksWrap>
          <ThanksIcon>
            <CheckCircleIcon />
          </ThanksIcon>
          <ThanksTitle>
            {Language.thankYouForYourTip || "Thank you for your tip"}
          </ThanksTitle>
          <ThanksBody>
            {Language.thankYouForYourTipHint ||
              "Your generosity is appreciated."}
          </ThanksBody>
          <ThanksCta to="/orders" $brandColor={brandColor}>
            {Language.goToMyOrders || "Back to my orders"}
          </ThanksCta>
        </ThanksWrap>
      </Page>
    );
  }

  /* ---------- main ---------- */
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
            <HeaderTitle>{Language.chooseYourTip || "Add a tip"}</HeaderTitle>
            <HeaderSub>
              {order?.orderNumber
                ? `Order #${order.orderNumber}`
                : `Order ${String(orderId || "").slice(-6)}`}
            </HeaderSub>
          </HeaderText>
        </HeaderInner>
      </StickyHeader>

      <Content>
        <Card>
          <Prompt>
            {Language.chooseYourTip || "How much would you like to tip?"}
          </Prompt>

          <PresetRow>
            {TIP_PRESETS.map((amount) => {
              const active = selectedTip === amount;
              return (
                <PresetButton
                  key={amount}
                  type="button"
                  $active={active}
                  $brandColor={brandColor}
                  onClick={() => handlePresetSelect(amount)}
                >
                  {active && <CheckIcon />}
                  {amount} TND
                </PresetButton>
              );
            })}
          </PresetRow>

          <Divider>or</Divider>

          <CustomField $active={!!customTip} $brandColor={brandColor}>
            <DollarSignIcon />
            <CustomInput
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              placeholder={Language.enterCustomTipAmount || "Custom amount"}
              value={customTip}
              onChange={handleCustomChange}
            />
            <Suffix>TND</Suffix>
          </CustomField>

          <Summary>
            <SummaryRow>
              <SummaryLabel>
                {Language.totalWithoutTips || "Order total"}
              </SummaryLabel>
              <SummaryValue>{orderTotal.toFixed(2)} TND</SummaryValue>
            </SummaryRow>
            <SummaryRow>
              <SummaryLabel>{Language.tip || "Tip"}</SummaryLabel>
              <SummaryValue $highlight={tipValue > 0} $brandColor={brandColor}>
                {tipValue.toFixed(2)} TND
              </SummaryValue>
            </SummaryRow>
            <SummaryRow>
              <SummaryLabel>{Language.total || "Total"}</SummaryLabel>
              <SummaryValue $highlight $brandColor={brandColor}>
                {grandTotal.toFixed(2)} TND
              </SummaryValue>
            </SummaryRow>
          </Summary>
        </Card>
      </Content>

      <BottomBar>
        <TotalBlock>
          <TotalLabel>{Language.tip || "Tip"}</TotalLabel>
          <TotalValue $brandColor={brandColor}>
            {tipValue.toFixed(2)} TND
          </TotalValue>
        </TotalBlock>
        <SubmitButton
          type="button"
          $brandColor={brandColor}
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          {submitting ? "…" : Language.submitTip || "Add tip"}
        </SubmitButton>
      </BottomBar>
    </Page>
  );
};

export default TipsPage;
