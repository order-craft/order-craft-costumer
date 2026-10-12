import React from "react";
import tw from "twin.macro";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import translations from "app/language.js";
import LanguageSelector from "helpers/LanguageSelector.js";

/* ---------- icons ---------- */
import { ReactComponent as FileTextIcon } from "feather-icons/dist/icons/file-text.svg";

/* ---------- layout ---------- */
const Wrap = tw.div`sticky top-0 z-30 bg-white border-b border-gray-200`;
const Inner = tw.div`max-w-screen-xl mx-auto px-3 sm:px-4 h-12 flex items-center gap-2 sm:gap-3`;
const Left = tw.div`flex items-center gap-2 sm:gap-3 min-w-0 flex-1`;
const Logo = tw.img`w-8 h-8 rounded object-cover flex-shrink-0`;
const PlaceName = tw.div`font-black text-sm sm:text-base text-gray-900 truncate`;

const Right = tw.div`flex items-center gap-1.5 sm:gap-2 flex-shrink-0`;

const TablePill = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 30px;
  height: 30px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.02em;
  background: ${({ $brandColor }) => `${$brandColor || "#8B5A2B"}18`};
  color: ${({ $brandColor }) => $brandColor || "#8B5A2B"};

  @media (min-width: 640px) {
    height: 32px;
    padding: 0 12px;
    font-size: 0.78rem;
  }
`;

const TableShort = styled.span`
  display: inline;

  @media (min-width: 640px) {
    display: none;
  }
`;

const TableFull = styled.span`
  display: none;

  @media (min-width: 640px) {
    display: inline;
  }
`;

const OrdersBtn = styled(Link)`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: #f1f3f5;
  color: #4a5568;
  text-decoration: none;
  transition: background-color 0.15s ease;

  &:hover {
    background: #e9ecef;
  }

  &:active {
    transform: scale(0.94);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const OrdersBadge = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 999px;
  background: #dc3545;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 900;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
`;

/* ---------- component ---------- */
const Nav = () => {
  const t = useSelector((state) => state.language.language);
  const Language = translations[t];
  const placeName = useSelector((state) => state.table.placeName);
  const placeLogo = useSelector((state) => state.table.placeLogo);
  const tableNumber = useSelector((state) => state.table.tableNumber);
  const brandColor = useSelector((state) => state.table.brandColor);
  const activeOrderCount = useSelector(
    (state) => state.orders?.activeCount || 0,
  );

  const showTable = tableNumber && tableNumber !== "0";
  const name = placeName && placeName.trim() !== "" ? placeName : "Order Craft";

  return (
    <Wrap>
      <Inner>
        <Left>
          {placeLogo && <Logo src={placeLogo} alt="" />}
          <PlaceName>{name}</PlaceName>
        </Left>

        <Right>
          {showTable && (
            <TablePill $brandColor={brandColor}>
              <TableShort>T{tableNumber}</TableShort>
              <TableFull>
                {Language.table || "Table"} {tableNumber}
              </TableFull>
            </TablePill>
          )}

          <LanguageSelector />

          <OrdersBtn to="/orders" aria-label={Language.myOrders || "My orders"}>
            <FileTextIcon />
            {activeOrderCount > 0 && (
              <OrdersBadge>{activeOrderCount}</OrdersBadge>
            )}
          </OrdersBtn>
        </Right>
      </Inner>
    </Wrap>
  );
};

export default Nav;
