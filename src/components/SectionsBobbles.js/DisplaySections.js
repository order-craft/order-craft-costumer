import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";
import tw from "twin.macro";
import { useSelector } from "react-redux";
import { baseUrl } from "helpers/BaseUrl";
import Loading from "helpers/Loading";
import ErrorModal from "helpers/modals/ErrorModal";
import { GetToken } from "helpers/GetToken";
import AnimationRevealPage from "helpers/AnimationRevealPage";
import Nav from "components/hero/Nav";
import NotifSupport from "components/features/NotificationSupport";
import translations from "app/language";

/* ---------- palette derivation from a single brandColor ---------- */
const hexToHsl = (hex) => {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
};

const hslToHex = ({ h, s, l }) => {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x) =>
    Math.round(255 * x)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
};

// Given a base hex, produce N accents that vary in hue slightly and in lightness
const deriveAccentPalette = (baseHex, count) => {
  const base = hexToHsl(baseHex);
  const accents = [];
  for (let i = 0; i < count; i++) {
    const hueShift = ((i % 2 === 0 ? 1 : -1) * ((i + 1) * 8)) % 30;
    const lightStep = 45 + ((i * 10) % 25); // 45–70
    accents.push(
      hslToHex({
        h: (base.h + hueShift + 360) % 360,
        s: Math.min(85, Math.max(35, base.s * 0.9)),
        l: lightStep,
      }),
    );
  }
  return accents;
};

/* ---------- layout ---------- */
const Page = tw.div`min-h-screen bg-gray-100`;
const Wrap = tw.div`max-w-screen-xl mx-auto px-4 pt-6 pb-24`;

const Heading = tw.h1`text-2xl sm:text-3xl font-black text-gray-900 text-center mt-4 mb-1`;
const Subheading = tw.p`text-center text-gray-500 text-sm mb-8`;

const Grid = tw.div`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4`;

const Card = styled.button`
  ${tw`relative w-full text-left bg-white rounded-2xl shadow-sm transition-transform duration-150 overflow-hidden`}
  ${tw`hover:shadow-md`}
  ${tw`focus:outline-none`}
  transform: translateY(0);
  &:hover {
    transform: translateY(-2px);
  }
  &:active {
    transform: translateY(0);
  }

  border: 1px solid #eef0f3;
  padding: 18px 16px 20px 16px;
  min-height: 130px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &:focus {
    --tw-ring-color: ${({ $accent }) => $accent};
  }
`;

const AccentBar = styled.div`
  ${tw`absolute top-0 left-0 h-full`}
  width: 5px;
  background: ${({ $accent }) => $accent};
`;

const GhostInitial = styled.span`
  ${tw`absolute pointer-events-none select-none font-black`}
  color: ${({ $accent }) => $accent};
  opacity: 0.08;
  font-size: 6rem;
  line-height: 1;
  right: -8px;
  bottom: -22px;
`;
const HighlightedText = styled.span`
  ${tw`text-gray-100 px-4 inline-block`}
  background-color: ${({ $brandColor }) => $brandColor || "#8B5A2B"};
  transform: skewX(-12deg);
`;

const Title = tw.div`relative text-base sm:text-lg font-bold text-gray-900 leading-tight`;
const Meta = tw.div`relative text-xs sm:text-sm text-gray-500 mt-2 font-medium`;

const Empty = tw.div`text-center text-gray-500 mt-16`;
const EmptyTitle = tw.div`text-lg font-bold text-gray-800 mb-1`;

/* ---------- component ---------- */
const SectionSelector = () => {
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const token = GetToken();

  const t = useSelector((state) => state.language.language);
  const Language = translations[t];
  const brandColor = useSelector((state) => state.table.brandColor);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await axios.get(`${baseUrl}/sections`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSections(response.data);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to fetch sections. Please try again.");
        setIsLoading(false);
      }
    };
    fetchSections();
  }, [token]);

  const handleSectionClick = (sectionId) => {
    navigate(`/categories/${sectionId}`);
  };

  if (isLoading) return <Loading />;

  if (error)
    return <ErrorModal error={error} closeModal={() => setError(null)} />;

  const palette = deriveAccentPalette(
    brandColor || "#8B5A2B",
    Math.max(sections.length, 1),
  );

  return (
    <AnimationRevealPage disabled>
      <Page>
        <Nav />
        <NotifSupport />
        <Wrap>
          <Heading>
            {Language.menuCheck || "Check out our"}{" "}
            <HighlightedText $brandColor={brandColor}>
              {Language.menu || "Menu"}
            </HighlightedText>
          </Heading>

          <Subheading>
            {Language.tapASectionToBrowse || "Tap a section to browse"}
          </Subheading>

          {sections.length === 0 ? (
            <Empty>
              <EmptyTitle>
                {Language.noSectionsYet || "No sections yet"}
              </EmptyTitle>
              <div>{Language.comingSoon || "Coming soon."}</div>
            </Empty>
          ) : (
            <Grid>
              {sections.map((section, index) => {
                const accent = palette[index % palette.length];
                const initial = (section.name || "?").charAt(0).toUpperCase();
                const categoryCount = section.categories?.length ?? 0;
                const itemCount =
                  section.categories?.reduce(
                    (sum, c) => sum + (c.products?.length || 0),
                    0,
                  ) ?? 0;

                return (
                  <Card
                    key={section._id}
                    onClick={() => handleSectionClick(section._id)}
                    $accent={accent}
                    type="button"
                  >
                    <AccentBar $accent={accent} />
                    <GhostInitial $accent={accent}>{initial}</GhostInitial>
                    <Title>{section.name}</Title>
                    <Meta>
                      {categoryCount}{" "}
                      {categoryCount === 1
                        ? Language.category || "category"
                        : Language.categories || "categories"}
                      {itemCount > 0 && (
                        <>
                          {" "}
                          · {itemCount} {Language.items || "items"}
                        </>
                      )}
                    </Meta>
                  </Card>
                );
              })}
            </Grid>
          )}
        </Wrap>
      </Page>
    </AnimationRevealPage>
  );
};

export default SectionSelector;
