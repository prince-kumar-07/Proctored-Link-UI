import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  questions: [],
  // Set alongside `questions` by fetchExamQuestions: testName, examDuration
  // (minutes), examStartTime, testExpiryTime, warningCount. ExamPage derives
  // its countdown from examStartTime + examDuration rather than always
  // starting a fresh timer, so a reload resumes at the correct time left.
  meta: null,
};

const QuestionsSlice = createSlice({
  name: "question",
  initialState,
  reducers: {
    setQuestions(state, action) {
      state.questions = action.payload;
    },
    setExamMeta(state, action) {
      state.meta = action.payload;
    },
    resetExamQuestions(state) {
      state.questions = [];
      state.meta = null;
    },
  },
});

export const { setQuestions, setExamMeta, resetExamQuestions } = QuestionsSlice.actions;

export default QuestionsSlice.reducer;