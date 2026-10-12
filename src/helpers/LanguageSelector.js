import React from "react";
import { useDispatch, useSelector } from "react-redux";
import tw from "twin.macro";
import styled from "styled-components";
import { changeLanguage } from "features/languageSlice";

import { ReactComponent as GlobeIcon } from "feather-icons/dist/icons/globe.svg";
import { ReactComponent as ChevronDownIcon } from "feather-icons/dist/icons/chevron-down.svg";

const LANGUAGES = [
  { value: "English", short: "EN", label: "English" },
  { value: "French", short: "FR", label: "Français" },
  { value: "Italian", short: "IT", label: "Italiano" },
];

const Wrap = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 10px 0 12px;
  border-radius: 999px;
  background: #f1f3f5;
  color: #1a202c;
  border: 1px solid transparent;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;

  &:hover {
    background: #e9ecef;
  }

  &:focus-within {
    border-color: #cbd5e0;
    background: #fff;
  }

  svg {
    flex-shrink: 0;
  }
`;

const GlobeWrap = styled.span`
  display: inline-flex;
  color: #4a5568;
  svg {
    width: 14px;
    height: 14px;
  }
`;

const ChevronWrap = styled.span`
  display: inline-flex;
  color: #4a5568;
  pointer-events: none;
  svg {
    width: 14px;
    height: 14px;
  }
`;

const ShortLabel = tw.span`text-xs font-black tracking-wide`;

const Select = styled.select`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  appearance: none;
  border: none;
  background: transparent;
`;

const LanguageSelector = () => {
  const dispatch = useDispatch();
  const currentLanguage = useSelector((state) => state.language.language);

  const active =
    LANGUAGES.find((l) => l.value === currentLanguage) || LANGUAGES[0];

  const handleChange = (e) => {
    dispatch(changeLanguage(e.target.value));
  };

  return (
    <Wrap aria-label="Language">
      <GlobeWrap>
        <GlobeIcon />
      </GlobeWrap>
      <ShortLabel>{active.short}</ShortLabel>
      <ChevronWrap>
        <ChevronDownIcon />
      </ChevronWrap>

      <Select
        value={currentLanguage}
        onChange={handleChange}
        aria-label="Change language"
      >
        {LANGUAGES.map((l) => (
          <option key={l.value} value={l.value}>
            {l.label}
          </option>
        ))}
      </Select>
    </Wrap>
  );
};

export default LanguageSelector;
