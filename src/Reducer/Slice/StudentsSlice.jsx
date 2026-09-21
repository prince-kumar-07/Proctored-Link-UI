import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  students: [],
  allStudentsData: [],
  examStudentData: null,
  redirectMessage: "expir"
  

};

const StudentSlice = createSlice({
  name: "question",
  initialState,
  reducers: {
    setStudentsData(state, action) {
      state.students = action.payload;
    },
    
    setExamStudentData(state, action) {
      state.examStudentData = action.payload;
    },
    
    setRedirectMessage(state, action) {
      state.redirectMessage = action.payload;
    } 
  },
});

export const { setStudentsData, setExamStudentData, setRedirectMessage} = StudentSlice.actions;

export default StudentSlice.reducer;