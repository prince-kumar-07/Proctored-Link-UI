import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  questionBanks: [],
  questionBanksList: []
};

const qbSlice = createSlice({
  name: "questionBank",
  initialState,
  reducers: {
    setQuestionBanks(state, action) {
      state.questionBanks = action.payload;
    },

     setQuestionBanksList(state, action) {
      state.questionBanksList = action.payload;
    },
  },
});

export const { setQuestionBanks, setQuestionBanksList } = qbSlice.actions;

export default qbSlice.reducer;