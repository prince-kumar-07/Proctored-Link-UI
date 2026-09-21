import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    token: localStorage.getItem("token") || null,
    OTPModal: false,
    signupStatus: "",
    OTPtype: "",
}

const authSlice = createSlice({
    name:"auth",
    initialState: initialState,
    reducers: {
        setToken(state, value){
            state.token = value.payload
        },

        setShowOTP(state){
            state.OTPModal = true
        },

        removeShowOTP(state){
            state.OTPModal = false
        },

        setSignupStatusSuccess(state){
            state.signupStatus = "success"
        },

        setSignupStatusFalse(state){
            state.signupStatus = "failed"
        },

        setSignupStatusNull(state){
            state.signupStatus = ""
        },

        setOTPtype(state, value){
            state.OTPtype =  value.payload
        }
    }
})

export const {
  setToken,
  setShowOTP,
  removeShowOTP,
  setSignupStatusSuccess,
  setSignupStatusFalse,
  setSignupStatusNull,
  setOTPtype
} = authSlice.actions;
export default authSlice.reducer