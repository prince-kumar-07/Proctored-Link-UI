import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./Slice/AuthSlice"
import userReducer from "./Slice/UserSlice"
import spinnerReducer from "./Slice/SpinnerSlice"
import QuestionBankReducer from "./Slice/QBSlice"
import QuestionsSlice from "./Slice/QuestionsSlice"
import StudentSlice from "./Slice/StudentsSlice"
import ExamSlice from "./Slice/ExamSlice";
import AdminSlice from "./Slice/AdminSlice";
import ProctorSlice from "./Slice/ProctorSlice";


const rootReducer  = combineReducers({
    auth: authReducer,
    user: userReducer,
    spinner: spinnerReducer,
    QB: QuestionBankReducer,
    Question: QuestionsSlice,
    Students: StudentSlice,
    Exams: ExamSlice,
    Admin: AdminSlice,
    Proctor: ProctorSlice
})

export default rootReducer