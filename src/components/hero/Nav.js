import React from "react";
import tw from "twin.macro";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { ReactComponent as ShoppingBagIcon } from "feather-icons/dist/icons/shopping-bag.svg";
import translations from "app/language.js";
import LanguageSelector from "helpers/LanguageSelector.js";

// const Container = tw.div`relative`;
const Wrap = tw.div`sticky top-0 z-30 bg-white border-b border-gray-200`;
const Inner = tw.div`max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between gap-3`;

const Left = tw.div`flex items-center gap-3 min-w-0`;
const Logo = tw.img`w-10 h-10 rounded object-cover flex-shrink-0`;
const PlaceName = tw.div`font-bold text-gray-900 text-base sm:text-lg truncate`;

const Right = tw.div`flex items-center gap-2 sm:gap-3 flex-shrink-0`;

const TablePill = styled.div`
  ${tw`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold`}
  background: rgba(139, 90, 43, 0.1);
  color: #8b5a2b;
`;

const OrdersButton = styled(Link)`
  ${tw`relative flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700`}
`;

const OrdersBadge = styled.span`
  ${tw`absolute h-5 px-1 rounded-full text-white text-xs font-bold flex items-center justify-center`}
  top: -4px;
  right: -4px;
  min-width: 20px;
  background: #dc3545;
`;

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

  return (
    <Wrap>
      <Inner>
        <Left>
          {placeLogo && <Logo src={placeLogo} alt="logo" />}
          <PlaceName>
            {placeName === undefined || placeName === null
              ? "Order Craft"
              : placeName}
          </PlaceName>
        </Left>

        <Right>
          {tableNumber && tableNumber !== "0" && (
            <TablePill
              style={{
                background: `${brandColor}1A`, // 10% opacity
                color: brandColor,
              }}
            >
              {Language.table || "Table"} {tableNumber}
            </TablePill>
          )}

          <LanguageSelector />

          <OrdersButton
            to="/orders"
            aria-label={Language.myOrders || "My orders"}
          >
            <ShoppingBagIcon tw="w-5 h-5" />
            {activeOrderCount > 0 && (
              <OrdersBadge>{activeOrderCount}</OrdersBadge>
            )}
          </OrdersButton>
        </Right>
      </Inner>
    </Wrap>
  );
};

export default Nav;
