import { createSlice } from "@reduxjs/toolkit";
import logo from "../images/SmallLogo.png";

const readEditWindow = () => {
  try {
    const raw = localStorage.getItem("customerEditWindow");
    if (!raw) return { enabled: true, minutes: 3, from: "placed" };
    const parsed = JSON.parse(raw);
    return {
      enabled: parsed.enabled !== false,
      minutes: Number(parsed.minutes) || 3,
      from: parsed.from === "preparing" ? "preparing" : "placed",
    };
  } catch {
    return { enabled: true, minutes: 3, from: "placed" };
  }
};

const initialState = {
  tableNumber: localStorage.getItem("tableNumber") || "0",
  placeName: localStorage.getItem("placeName") || "Order Craft",
  placeLogo: logo,
  statusFlowEnabled: localStorage.getItem("statusFlowEnabled") !== "false",
  brandColor: localStorage.getItem("brandColor") || "#8B5A2B",
  customerEditWindow: readEditWindow(),
};

const tableSlice = createSlice({
  name: "table",
  initialState,
  reducers: {
    setTableInfo(state, action) {
      const {
        tableNumber,
        placeName,
        placeLogo,
        statusFlowEnabled,
        brandColor,
        customerEditWindow,
      } = action.payload;
      state.tableNumber = tableNumber;
      state.placeName = placeName;
      state.placeLogo = placeLogo;
      if (typeof statusFlowEnabled === "boolean") {
        state.statusFlowEnabled = statusFlowEnabled;
      }
      if (typeof brandColor === "string") {
        state.brandColor = brandColor;
      }
      if (customerEditWindow && typeof customerEditWindow === "object") {
        state.customerEditWindow = {
          enabled: customerEditWindow.enabled !== false,
          minutes: Number(customerEditWindow.minutes) || 3,
          from:
            customerEditWindow.from === "preparing" ? "preparing" : "placed",
        };
        localStorage.setItem(
          "customerEditWindow",
          JSON.stringify(state.customerEditWindow),
        );
      }

      localStorage.setItem("tableNumber", tableNumber);
      localStorage.setItem("placeName", placeName);
      localStorage.setItem("placeLogo", placeLogo);
      if (typeof statusFlowEnabled === "boolean") {
        localStorage.setItem("statusFlowEnabled", String(statusFlowEnabled));
      }
      if (typeof brandColor === "string") {
        localStorage.setItem("brandColor", brandColor);
      }
    },
    setStatusFlowEnabled(state, action) {
      state.statusFlowEnabled = action.payload;
      localStorage.setItem("statusFlowEnabled", String(action.payload));
    },
    setBrandColor(state, action) {
      state.brandColor = action.payload;
      localStorage.setItem("brandColor", action.payload);
    },
    setCustomerEditWindow(state, action) {
      const win = action.payload || {};
      state.customerEditWindow = {
        enabled: win.enabled !== false,
        minutes: Number(win.minutes) || 3,
        from: win.from === "preparing" ? "preparing" : "placed",
      };
      localStorage.setItem(
        "customerEditWindow",
        JSON.stringify(state.customerEditWindow),
      );
    },
    clearTableInfo(state) {
      state.tableNumber = null;
      state.placeName = null;
      state.placeLogo = null;

      localStorage.removeItem("tableNumber");
      localStorage.removeItem("placeName");
      localStorage.removeItem("placeLogo");
      localStorage.removeItem("statusFlowEnabled");
      localStorage.removeItem("brandColor");
      localStorage.removeItem("customerEditWindow");
    },
  },
});

export const {
  setTableInfo,
  setStatusFlowEnabled,
  setBrandColor,
  setCustomerEditWindow,
  clearTableInfo,
} = tableSlice.actions;

export default tableSlice.reducer;
