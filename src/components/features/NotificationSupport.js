import React, { useEffect, useState, useRef } from "react";
import tw from "twin.macro";
import styled, { keyframes, css } from "styled-components";
import { ReactComponent as SupportIconSvg } from "../../images/bill.svg";
import socket from "helpers/soket/socket";
import { GetToken } from "helpers/GetToken";
import { jwtDecode } from "jwt-decode";
import { io } from "socket.io-client";
import { baseUrl } from "helpers/BaseUrl";
import axios from "axios";
import feather from "feather-icons";
// Animation keyframes
const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const expand = keyframes`
  0% { transform: scale(0); opacity: 0; }
  80% { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const ripple = keyframes`
  0% { transform: scale(0.5); opacity: 1; }
  100% { transform: scale(3); opacity: 0; }
`;

// Styled components
const BubbleContainer = styled.div.attrs(({ $isDragging }) => ({
  style: {
    cursor: $isDragging ? "grabbing" : "pointer",
  },
}))`
  ${tw`fixed z-50`}
  width: 60px;
  height: 60px;
  transition: all 0.3s ease;
  user-select: none;
  touch-action: none;

  ${({ $isDragging }) => $isDragging && tw`shadow-xl`}
`;

const MainBubble = styled.div`
  ${tw`absolute rounded-full bg-primary-500 text-white flex items-center justify-center shadow-lg`}
  width: 100%;
  height: 100%;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  z-index: 10;

  ${({ $isActive }) =>
    $isActive &&
    css`
      transform: scale(1.2);
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
    `}

  ${({ $isPulsing }) =>
    $isPulsing &&
    css`
      animation: ${pulse} 2s infinite;
    `}

  ${({ $isFloating }) =>
    $isFloating &&
    css`
      animation: ${float} 3s ease-in-out infinite;
    `}
`;

const StyledSupportIcon = styled(SupportIconSvg)`
  width: 30px;
  height: 30px;
  transition: transform 0.3s ease;

  ${({ $isActive }) =>
    $isActive &&
    css`
      transform: rotate(45deg);
    `}
`;

const RippleEffect = styled.div`
  ${tw`absolute rounded-full bg-primary-300`}
  width: 100%;
  height: 100%;
  animation: ${ripple} 1.5s ease-out infinite;
  z-index: 5;
`;

const OptionBubble = styled.div`
  ${tw`absolute rounded-full bg-white text-primary-500 flex items-center justify-center shadow-md`}
  width: 50px;
  height: 50px;
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform: scale(0);
  opacity: 0;
  z-index: 1;

  ${({ $isOpen, $position }) =>
    $isOpen &&
    css`
      transform: translate(${$position.x}px, ${$position.y}px) scale(1);
      opacity: 1;
    `}

  &:hover {
    transform: ${({ $isOpen, $position }) =>
      $isOpen
        ? `translate(${$position.x}px, ${$position.y}px) scale(1.1)`
        : "scale(0)"};
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  }
`;

const OptionLabel = styled.span`
  ${tw`absolute text-xs font-bold whitespace-nowrap`}
  color: white;
  background: rgba(0, 0, 0, 0.7);
  padding: 2px 6px;
  border-radius: 10px;
  bottom: -20px;
  opacity: 1; /* Toujours visible */
`;

const MessageContainer = styled.div`
  ${tw`fixed bg-green-500 text-white py-2 px-4 rounded-md shadow-lg`}
  left: 50%;
  transform: translateX(-50%);
  top: 20%;
  z-index: 100;
  animation: ${expand} 0.3s ease-out;
`;

// Dummy data for support request types
// const supportOptions = [
//   { id: 1, label: "Order Help", icon: "📝" },
//   { id: 2, label: "Bill Request", icon: "💳" },
//   { id: 3, label: "Clean Table", icon: "🧹" },
//   { id: 4, label: "Other Issue", icon: "❓" },
// ];

const NotifSupport = () => {
  const [isActive, setIsActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [supportOptions, setSupportOptions] = useState([]);
  const [optionsError, setOptionsError] = useState(null);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const bubbleRef = useRef(null);
  const token = GetToken();

  // Decode token for table number and user ID
  let tableNumber = null;
  let superClientId = null;
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      tableNumber = decodedToken.table?.number;
      superClientId = decodedToken.user?.id;
    } catch (error) {
      console.error("Failed to decode token:", error);
    }
  }
  //
  // Default icons fallback
  const getDefaultIcon = (index) => {
    const defaultIcons = ["📝", "💳", "🧹", "❓"];
    return defaultIcons[index % defaultIcons.length];
  };

  // Default options fallback
  const getDefaultOptions = () => {
    return [
      { id: 1, label: "Order Help", icon: "📝" },
      { id: 2, label: "Bill Request", icon: "💳" },
      { id: 3, label: "Clean Table", icon: "🧹" },
      { id: 4, label: "Other Issue", icon: "❓" },
    ];
  };

  useEffect(() => {
    const fetchSupportOptions = async () => {
      try {
        setLoadingOptions(true);
        const response = await axios.get(`${baseUrl}/sup/request-types`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // Transform API data to match our expected format
        const formattedOptions = response.data.data.map((option, index) => ({
          id: option._id,
          label: option.name,
          icon: option.icon || getDefaultIcon(index), // Fallback to default icons
        }));

        setSupportOptions(formattedOptions);
      } catch (error) {
        console.error("Failed to fetch support options:", error);
        setOptionsError(
          "Failed to load support options. Using default options."
        );
        // Fallback to default options if API fails
        setSupportOptions(getDefaultOptions());
      } finally {
        setLoadingOptions(false);
      }
    };

    if (token) {
      fetchSupportOptions();
    }
  }, [token]);
  // Calculate positions for option bubbles
  const calculateOptionPositions = () => {
    const radius = 100;
    const angleStep = (2 * Math.PI) / supportOptions.length;
    return supportOptions.map((option, index) => {
      const angle = index * angleStep;
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      };
    });
  };

  const optionPositions = calculateOptionPositions();

  // Handle drag start
  const handleDragStart = (e) => {
    // Check if this is a touch event
    const clientX = e.clientX ?? e.touches[0].clientX;
    const clientY = e.clientY ?? e.touches[0].clientY;

    setIsDragging(true);
    setDragStart({
      x: clientX - position.x,
      y: clientY - position.y,
    });

    // Only prevent default for mouse events
    if (e.clientX !== undefined) {
      e.preventDefault();
    }
  };

  // Handle dragging
  const handleDrag = (e) => {
    if (!isDragging) return;

    // Check if this is a touch event
    const clientX = e.clientX ?? e.touches[0].clientX;
    const clientY = e.clientY ?? e.touches[0].clientY;

    setPosition({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y,
    });

    // Only prevent default for mouse events
    if (e.clientX !== undefined) {
      e.preventDefault();
    }
  };

  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false);
    // Snap to edges if near screen boundaries
    const bubble = bubbleRef.current;
    if (bubble) {
      const rect = bubble.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      let newX = position.x;
      let newY = position.y;

      if (rect.left < 0) newX = 10;
      if (rect.top < 0) newY = 10;
      if (rect.right > windowWidth) newX = windowWidth - rect.width - 10;
      if (rect.bottom > windowHeight) newY = windowHeight - rect.height - 10;

      setPosition({ x: newX, y: newY });
    }
  };

  // Handle bubble click
  const handleBubbleClick = () => {
    if (isDragging) return;
    setIsActive(!isActive);
  };

  // Handle option selection
  const handleOptionClick = (optionId, optionName) => {
    setIsActive(false);
    setIsProcessing(true);
    setMessage("");
    if (tableNumber && superClientId) {
      console.log(
        `Requesting ${
          supportOptions.find((o) => o.id === optionId).label
        } for table ${tableNumber}`
      );
      socket.emit("supportRequest", {
        tableNumber,
        requestType: optionId,
        requestTypeName: optionName,
      });

      setTimeout(() => {
        setIsProcessing(false);
      }, 60000);
    }
  };
  useEffect(() => {
    feather.replace(); // replaces all data-feather attributes with actual SVGs
  }, [supportOptions]);
  // Socket effects
  useEffect(() => {
    const socket = io(baseUrl, { auth: { token } });

    socket.on("callAnswered", (data) => {
      if (data.tableNumber === tableNumber) {
        setMessage("Help is on the way!");
        setIsProcessing(false);
        setTimeout(() => setMessage(""), 5000);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [token, tableNumber]);

  return (
    <>
      {message && <MessageContainer>{message}</MessageContainer>}
      {optionsError && (
        <MessageContainer style={{ backgroundColor: "#ff9800" }}>
          {optionsError}
        </MessageContainer>
      )}
      <BubbleContainer
        ref={bubbleRef}
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
        $isDragging={isDragging}
        onMouseDown={handleDragStart}
        onMouseMove={handleDrag}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDrag}
        onTouchEnd={handleDragEnd}
      >
        {isProcessing && <RippleEffect />}

        <MainBubble
          onClick={handleBubbleClick}
          $isActive={isActive}
          $isPulsing={isProcessing}
          $isFloating={!isActive && !isProcessing && !isDragging}
        >
          {loadingOptions ? (
            <span style={{ fontSize: "24px" }}>...</span>
          ) : (
            <StyledSupportIcon $isActive={isActive} />
          )}
        </MainBubble>

        {supportOptions.map((option, index) => (
          <OptionBubble
            key={option.id}
            $isOpen={isActive}
            $position={optionPositions[index]}
            onClick={() => handleOptionClick(option.id, option.label)}
          >
            <i data-feather={option.icon} className="w-6 h-6 text-blue-500" />
            {/* <i height={50} width={50} data-feather="alert-octagon"></i> */}

            <OptionLabel>{option.label}</OptionLabel>
          </OptionBubble>
        ))}
      </BubbleContainer>
    </>
  );
};

export default NotifSupport;
