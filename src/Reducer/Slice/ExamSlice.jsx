import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  assignedExams: [],
};

const ExamSlice = createSlice({
  name: "exams",
  initialState,
  reducers: {
    setAssignedExams: (state, action) => {
      state.assignedExams = action.payload;
    },
  },
});

export const { setAssignedExams } = ExamSlice.actions;

export default ExamSlice.reducer;