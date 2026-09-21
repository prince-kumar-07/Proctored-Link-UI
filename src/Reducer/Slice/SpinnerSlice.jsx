import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoading: false,
  loadingMessage: "Processing Request...",
};

const spinnerSlice = createSlice({
  name: "spinner",
  initialState,
  reducers: {
    showSpinner: (state, action) => {
      state.isLoading = true;
      state.loadingMessage =
        action.payload || "Processing Request...";
    },

    hideSpinner: (state) => {
      state.isLoading = false;
      state.loadingMessage = "Processing Request...";
    },
  },
});

export const { showSpinner, hideSpinner } = spinnerSlice.actions;
export default spinnerSlice.reducer;
