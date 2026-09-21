import { createSlice } from "@reduxjs/toolkit";

const storedUser = localStorage.getItem("user");

let parsedUser = null;

try {
  parsedUser = storedUser ? JSON.parse(storedUser) : null;
} catch {
  parsedUser = null;
}

const initialState = {
  user: parsedUser,
  token: localStorage.getItem("token") || null,
};

const profileSlice = createSlice({
  name: "user",
  initialState,

  reducers: {
    setUser(state, action) {
      state.user = action.payload;

      if (action.payload) {
        localStorage.setItem("user", JSON.stringify(action.payload));
      } else {
        localStorage.removeItem("user");
      }
    },

    setToken(state, action) {
      state.token = action.payload;

      if (action.payload) {
        localStorage.setItem("token", action.payload);
      } else {
        localStorage.removeItem("token");
      }
    },
  },
});

export const { setUser, setToken } = profileSlice.actions;

export default profileSlice.reducer;