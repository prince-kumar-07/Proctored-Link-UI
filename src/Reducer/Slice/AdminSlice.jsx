import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  organisations: [],
  analytics: null,
  security: null,
  proctors: [],
};

const AdminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setOrganisations(state, action) {
      state.organisations = action.payload;
    },

    setAnalytics(state, action) {
      state.analytics = action.payload;
    },

    setSecurity(state, action) {
      state.security = action.payload;
    },

    setProctors(state, action) {
      state.proctors = action.payload;
    },
  },
});

export const { setOrganisations, setAnalytics, setSecurity, setProctors } = AdminSlice.actions;

export default AdminSlice.reducer;
