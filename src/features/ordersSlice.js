import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  activeCount: 0,
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setActiveCount(state, action) {
      state.activeCount = Number(action.payload) || 0;
    },
    clearOrders(state) {
      state.activeCount = 0;
    },
  },
});

export const { setActiveCount, clearOrders } = ordersSlice.actions;
export default ordersSlice.reducer;
