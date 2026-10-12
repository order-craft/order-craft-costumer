import React, { useState, useEffect, useCallback } from "react";
import AnimationRevealPage from "helpers/AnimationRevealPage.js";
import { Container as ContainerBase } from "components/misc/Layouts";
import tw from "twin.macro";
import styled from "styled-components";
// import qrIllustration from "images/qr-scan-illustration.png";
import logo from "images/logo-.png";
import axios from "axios";
import { baseUrl } from "helpers/BaseUrl";
import Loading from "helpers/Loading";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
// import translations from "app/language";
import { setTableInfo } from "features/TableSlice";
import { TokenManager } from "../utils/TokenManager";

/* ---------- feather icons ---------- */
import { ReactComponent as MapPinIcon } from "feather-icons/dist/icons/map-pin.svg";
import { ReactComponent as AlertTriangleIcon } from "feather-icons/dist/icons/alert-triangle.svg";
import { ReactComponent as RefreshIcon } from "feather-icons/dist/icons/refresh-cw.svg";
import { ReactComponent as SmartphoneIcon } from "feather-icons/dist/icons/smartphone.svg";
import { ReactComponent as ChevronDownIcon } from "feather-icons/dist/icons/chevron-down.svg";
import { ReactComponent as ChevronUpIcon } from "feather-icons/dist/icons/chevron-up.svg";
import { ReactComponent as CameraIcon } from "feather-icons/dist/icons/camera.svg";

/* ---------- layout ---------- */
const Container = tw(
  ContainerBase,
)`min-h-screen bg-gray-100 flex justify-center`;
const Content = tw.div`max-w-screen-md w-full my-8 sm:my-12 bg-white shadow-lg rounded-2xl flex flex-col`;
const MainContainer = tw.div`w-full p-6 sm:p-10 flex flex-col items-center`;
const LogoImage = tw.img`h-12 mx-auto`;
const MainContent = tw.div`mt-8 flex flex-col items-center w-full`;

// const Heading = tw.h1`text-xl sm:text-2xl font-black text-gray-900 text-center`;
// const Subheading = tw.p`text-gray-500 text-sm text-center mt-2 max-w-md`;

const Card = styled.div`
  width: 100%;
  max-width: 480px;
  margin-top: 24px;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #eef0f3;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
`;

// const Illustration = tw.img`w-40 h-40 mb-6 opacity-75`;
const Title = styled.div`
  ${tw`text-base font-black text-center mb-2`}
  color: #1a202c;
`;

const Body = tw.div`text-sm text-gray-500 text-center leading-relaxed`;

const PrimaryButton = styled.button`
  ${tw`w-full mt-5 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold`}
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

// const SecondaryButton = styled.button`
//   ${tw`w-full mt-3 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold`}
//   background: transparent;
//   color: #4a5568;
//   border: 1px solid #e2e8f0;
//   cursor: pointer;
//   transition: background-color 0.15s ease;

//   &:hover {
//     background: #f8f9fa;
//   }

//   svg {
//     width: 16px;
//     height: 16px;
//   }
// `;

const ErrorIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 999px;
  background: #fee2e2;
  color: #dc2626;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 14px auto;

  svg {
    width: 26px;
    height: 26px;
  }
`;

const WarnIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 999px;
  background: #fef3c7;
  color: #d97706;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 14px auto;

  svg {
    width: 26px;
    height: 26px;
  }
`;

const LocIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 999px;
  background: ${({ $brandColor }) => `${$brandColor || "#8B5A2B"}18`};
  color: ${({ $brandColor }) => $brandColor || "#8B5A2B"};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 14px auto;

  svg {
    width: 26px;
    height: 26px;
  }
`;

/* ---------- collapsible steps ---------- */
const StepsWrap = styled.div`
  margin-top: 14px;
  border: 1px solid #eef0f3;
  border-radius: 12px;
  overflow: hidden;
  background: #fafbfc;
`;

const StepsToggle = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 700;
  color: #1a202c;
  text-align: left;

  svg {
    width: 16px;
    height: 16px;
    color: #6c757d;
  }
`;

const StepsBody = styled.div`
  padding: 0 14px 14px 14px;
  font-size: 0.85rem;
  color: #4a5568;
`;

const StepList = styled.ol`
  margin: 0;
  padding-left: 20px;

  li {
    margin-bottom: 8px;
    line-height: 1.55;
  }

  strong {
    color: #1a202c;
  }
`;

const Hint = tw.div`text-xs text-gray-400 text-center mt-3`;

/* ---------- OS detection ---------- */
const detectOS = () => {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent || "";
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "other";
};

/* ---------- main ---------- */
const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorState, setErrorState] = useState(null);
  // errorState: null | "permission_denied" | "unavailable" | "timeout" | "too_far" | "generic"
  const [stepsOpen, setStepsOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  // const t = useSelector((state) => state.language.language);
  // const Language = translations[t];
  const brandColor = useSelector((state) => state.table.brandColor);

  const os = detectOS();

  /* ---------- geolocation ---------- */
  const getSimpleLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const e = new Error("Geolocation not supported");
        e.code = "unsupported";
        reject(e);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          const e = new Error("Geolocation failed");
          if (error.code === 1) e.code = "permission_denied";
          else if (error.code === 2) e.code = "unavailable";
          else if (error.code === 3) e.code = "timeout";
          else e.code = "generic";
          reject(e);
        },
        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 0,
        },
      );
    });
  };

  const calculateDistance = (loc1, loc2) => {
    if (
      !loc1 ||
      !loc2 ||
      loc1.lat == null ||
      loc1.lon == null ||
      loc2.lat == null ||
      loc2.long == null
    ) {
      return null;
    }
    const R = 6371e3;
    const φ1 = (loc1.lat * Math.PI) / 180;
    const φ2 = (loc2.lat * Math.PI) / 180;
    const Δφ = ((loc2.lat - loc1.lat) * Math.PI) / 180;
    const Δλ = ((loc2.long - loc1.lon) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  /* ---------- QR login ---------- */
  const handleQRLogin = useCallback(
    async (token) => {
      setErrorState(null);
      setIsLoading(true);
      try {
        const currentLocation = await getSimpleLocation();

        const response = await axios.post(`${baseUrl}/auth/login-qr`, {
          token,
          lat: currentLocation.lat,
          lon: currentLocation.lon,
        });

        if (response.status === 200) {
          const distance = calculateDistance(
            currentLocation,
            response.data.placeLocation,
          );

          if (distance === null) {
            const e = new Error("Missing distance data");
            e.code = "generic";
            throw e;
          }

          if (distance > response.data.distance) {
            setErrorState("too_far");
            setIsLoading(false);
            return;
          }

          const {
            token: newToken,
            tableNumber,
            placeName,
            placeLogo,
            statusFlowEnabled,
            brandColor: serverBrand,
          } = response.data;
          dispatch(
            setTableInfo({
              tableNumber,
              placeName,
              placeLogo,
              statusFlowEnabled:
                statusFlowEnabled === undefined ? true : statusFlowEnabled,
              brandColor: serverBrand || "#8B5A2B",
            }),
          );
          TokenManager.setToken(newToken);
          navigate("/menu");
          return;
        }

        setErrorState("generic");
      } catch (err) {
        // Server-side error (e.g. 403 "too far")
        if (err?.response) {
          const msg = err.response.data?.msg || "";
          if (/too far/i.test(msg)) {
            setErrorState("too_far");
          } else {
            setErrorState("generic");
          }
        } else if (err?.code) {
          // Geolocation error
          setErrorState(err.code);
        } else {
          setErrorState("generic");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch, navigate],
  );

  /* ---------- run on mount ---------- */
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get("token");
    if (token) handleQRLogin(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  /* ---------- retry ---------- */
  const retryLogin = async () => {
    setErrorState(null);
    const query = new URLSearchParams(location.search);
    const token = query.get("token");
    if (token) await handleQRLogin(token);
  };

  /* ---------- render loading ---------- */
  if (isLoading) return <Loading />;

  const hasToken = !!new URLSearchParams(location.search).get("token");

  /* ---------- helpers for OS-specific help ---------- */
  const renderSteps = () => {
    if (os === "ios") {
      return (
        <StepList>
          <li>
            Open <strong>Settings</strong>
          </li>
          <li>
            Tap <strong>Privacy &amp; Security</strong> →{" "}
            <strong>Location Services</strong>
          </li>
          <li>
            Make sure <strong>Location Services</strong> is turned on
          </li>
          <li>
            Tap <strong>Safari Websites</strong> and choose{" "}
            <strong>While Using the App</strong>
          </li>
          <li>
            Come back to this page and tap <strong>Try again</strong>
          </li>
        </StepList>
      );
    }
    if (os === "android") {
      return (
        <StepList>
          <li>
            Tap the <strong>lock icon</strong> next to the URL
          </li>
          <li>
            Tap <strong>Permissions</strong> → <strong>Location</strong>
          </li>
          <li>
            Choose <strong>Allow</strong>
          </li>
          <li>
            Reload this page and tap <strong>Try again</strong>
          </li>
        </StepList>
      );
    }
    return (
      <StepList>
        <li>
          Open your browser's <strong>Site settings</strong> for this page
        </li>
        <li>
          Find <strong>Location</strong> and set it to <strong>Allow</strong>
        </li>
        <li>
          Reload this page and tap <strong>Try again</strong>
        </li>
      </StepList>
    );
  };

  /* ---------- error state UIs ---------- */
  const renderError = () => {
    if (errorState === "permission_denied") {
      return (
        <Card>
          <ErrorIcon>
            <MapPinIcon />
          </ErrorIcon>
          <Title>Location access is blocked</Title>
          <Body>
            Order Craft needs your location once, when you scan the QR, to
            confirm you're at the café. Location permission was denied for this
            site, so the browser won't ask again. Please enable it manually.
          </Body>

          <StepsWrap>
            <StepsToggle type="button" onClick={() => setStepsOpen((v) => !v)}>
              How to enable location
              {stepsOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </StepsToggle>
            {stepsOpen && <StepsBody>{renderSteps()}</StepsBody>}
          </StepsWrap>

          <PrimaryButton
            type="button"
            $brandColor={brandColor}
            onClick={retryLogin}
          >
            <RefreshIcon />
            Try again
          </PrimaryButton>

          <Hint>
            To order at another table, open the Camera app and scan the table's
            QR code again.
          </Hint>
        </Card>
      );
    }

    if (errorState === "unavailable" || errorState === "timeout") {
      return (
        <Card>
          <WarnIcon>
            <AlertTriangleIcon />
          </WarnIcon>
          <Title>Couldn't get your location</Title>
          <Body>
            Your phone couldn't determine where you are. This usually happens
            indoors or with a weak signal. Move closer to a window, wait a few
            seconds, and try again.
          </Body>

          <PrimaryButton
            type="button"
            $brandColor={brandColor}
            onClick={retryLogin}
          >
            <RefreshIcon />
            Try again
          </PrimaryButton>

          <Hint>
            If it keeps failing, scan the QR code again from the Camera app.
          </Hint>
        </Card>
      );
    }

    if (errorState === "too_far") {
      return (
        <Card>
          <WarnIcon>
            <MapPinIcon />
          </WarnIcon>
          <Title>You're outside the café</Title>
          <Body>
            We detected you're not at the table. Please scan the QR code at your
            table again — it's printed on the table or on a small stand next to
            it.
          </Body>

          <PrimaryButton
            type="button"
            $brandColor={brandColor}
            onClick={retryLogin}
          >
            <RefreshIcon />
            Try again
          </PrimaryButton>
        </Card>
      );
    }

    if (errorState === "generic" || errorState === "unsupported") {
      return (
        <Card>
          <ErrorIcon>
            <AlertTriangleIcon />
          </ErrorIcon>
          <Title>We couldn't log you in</Title>
          <Body>
            Something went wrong while verifying the QR code. Please scan the
            table's QR code again from your phone's Camera app.
          </Body>

          <PrimaryButton
            type="button"
            $brandColor={brandColor}
            onClick={retryLogin}
          >
            <RefreshIcon />
            Try again
          </PrimaryButton>
        </Card>
      );
    }
    return null;
  };

  /* ---------- default landing (no token or after clear) ---------- */
  const renderLanding = () => (
    <Card>
      <LocIcon $brandColor={brandColor}>
        <CameraIcon />
      </LocIcon>
      <Title>Scan your table's QR code</Title>
      <Body>
        Point your phone's <strong>Camera</strong> at the QR code on your table.
        It will open this page automatically and take you straight to the menu.
      </Body>

      <StepsWrap>
        <StepsToggle type="button" onClick={() => setStepsOpen((v) => !v)}>
          How does it work?
          {stepsOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </StepsToggle>
        {stepsOpen && (
          <StepsBody>
            <StepList>
              <li>
                Open your phone's <strong>Camera</strong> app
              </li>
              <li>Point it at the QR code on your table</li>
              <li>Tap the notification that appears to open Order Craft</li>
              <li>
                Allow location access once — we only use it to confirm you're at
                the café
              </li>
            </StepList>
          </StepsBody>
        )}
      </StepsWrap>

      {hasToken && (
        <PrimaryButton
          type="button"
          $brandColor={brandColor}
          onClick={retryLogin}
        >
          <SmartphoneIcon />
          Retry verification
        </PrimaryButton>
      )}
    </Card>
  );

  /* ---------- main render ---------- */
  return (
    <AnimationRevealPage disabled>
      <Container>
        <Content>
          <MainContainer>
            <LogoImage src={logo} alt="logo" />
            <MainContent>
              {errorState ? renderError() : renderLanding()}

              {/* <Illustration src={qrIllustration} alt="QR illustration" /> */}
            </MainContent>
          </MainContainer>
        </Content>
      </Container>
    </AnimationRevealPage>
  );
};

export default Login;
