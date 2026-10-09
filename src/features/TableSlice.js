import { createSlice } from "@reduxjs/toolkit";
import logo from "../images/SmallLogo.png";

const initialState = {
  tableNumber: localStorage.getItem("tableNumber") || "0",
  placeName: localStorage.getItem("placeName") || "Order Craft",
  placeLogo: logo,
  statusFlowEnabled: localStorage.getItem("statusFlowEnabled") !== "false",
};

const tableSlice = createSlice({
  name: "table",
  initialState,
  reducers: {
    setTableInfo(state, action) {
      const { tableNumber, placeName, placeLogo, statusFlowEnabled } =
        action.payload;
      state.tableNumber = tableNumber;
      state.placeName = placeName;
      state.placeLogo = placeLogo;
      if (typeof statusFlowEnabled === "boolean") {
        state.statusFlowEnabled = statusFlowEnabled;
      }

      localStorage.setItem("tableNumber", tableNumber);
      localStorage.setItem("placeName", placeName);
      localStorage.setItem("placeLogo", placeLogo);
      if (typeof statusFlowEnabled === "boolean") {
        localStorage.setItem("statusFlowEnabled", String(statusFlowEnabled));
      }
    },
    setStatusFlowEnabled(state, action) {
      state.statusFlowEnabled = action.payload;
      localStorage.setItem("statusFlowEnabled", String(action.payload));
    },
    clearTableInfo(state) {
      state.tableNumber = null;
      state.placeName = null;
      state.placeLogo = null;

      localStorage.removeItem("tableNumber");
      localStorage.removeItem("placeName");
      localStorage.removeItem("placeLogo");
      localStorage.removeItem("statusFlowEnabled");
    },
  },
});

export const { setTableInfo, setStatusFlowEnabled, clearTableInfo } =
  tableSlice.actions;

export default tableSlice.reducer;
