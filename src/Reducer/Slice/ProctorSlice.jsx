import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  liveSessions: [],
};

const ProctorSlice = createSlice({
  name: "proctor",
  initialState,
  reducers: {
    setLiveSessions(state, action) {
      state.liveSessions = action.payload;
    },
  },
});

export const { setLiveSessions } = ProctorSlice.actions;

export default ProctorSlice.reducer;
