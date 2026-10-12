import React from "react";
import { useSelector } from "react-redux";
import tw from "twin.macro";
import styled, { keyframes } from "styled-components";

/* ---------- animations ---------- */
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(2px); }
  to { opacity: 1; transform: translateY(0); }
`;

/* ---------- layout ---------- */
const Page = tw.div`min-h-screen w-full bg-gray-100 flex flex-col items-center justify-center`;
const Stack = tw.div`flex flex-col items-center gap-4`;

const Ring = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 3px solid #e2e8f0;
  border-top-color: ${({ $brandColor }) => $brandColor || "#8B5A2B"};
  animation: ${spin} 0.9s linear infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    border-color: ${({ $brandColor }) => $brandColor || "#8B5A2B"};
    opacity: 0.9;
  }
`;

const Text = styled.div`
  font-size: 0.85rem;
  font-weight: 700;
  color: #4a5568;
  letter-spacing: 0.02em;
  animation: ${fadeIn} 0.4s ease-out;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Brand = styled.span`
  color: ${({ $brandColor }) => $brandColor || "#8B5A2B"};
`;

/* ---------- component ---------- */
const Loading = () => {
  const brandColor = useSelector((state) => state.table?.brandColor);
  const placeName = useSelector((state) => state.table?.placeName);

  const hasPlace =
    placeName && placeName !== "Order Craft" && placeName.trim() !== "";

  return (
    <Page>
      <Stack>
        <Ring $brandColor={brandColor} aria-hidden="true" />
        <Text>
          {hasPlace ? (
            <>
              Loading <Brand $brandColor={brandColor}>{placeName}</Brand>
            </>
          ) : (
            "Loading…"
          )}
        </Text>
      </Stack>
    </Page>
  );
};

export default Loading;
