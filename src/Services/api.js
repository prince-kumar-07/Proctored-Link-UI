const BASE_URL = import.meta.env.VITE_BASE_URL

export const AuthEndPoint = {
  SEND_OTP_API: BASE_URL + "/auth/request-otp",
  LOGIN_API: BASE_URL + "/auth/login",
  SIGNUP_API: BASE_URL + "/auth/signup",
  SET_PASSWORD_API: BASE_URL + "/auth/setPassword",
  FORGOT_PASSWORD_API: BASE_URL + "/auth/forgot-password",
};


export const QuestionBankEndPoint = {
  CREATE_QUESTIONBANK_API: BASE_URL + "/questionbank/createQuestionBank",
  UPDATE_QUESTIONBANK_API: BASE_URL + "/questionbank/updateQuestionBank",
  DELETE_QUESTIONBANK_API: BASE_URL + "/questionbank/deleteQuestionBank",
  GET_QUESTIONBANK_BY_ID_API: BASE_URL + "/questionbank/getQuestionBankById",
  GET_ALL_QUESTIONBANK_API: BASE_URL + "/questionbank/getAllQuestionBanks",
  GET_ALL_QUESTIONBANK_NAMES_API: BASE_URL + "/questionbank/getAllQuestionBankNames",
};

export const QuestionEndPoint = {
  CREATE_QUESTION_API: BASE_URL + "/question/createQuestion",
  UPDATE_QUESTION_API: BASE_URL + "/question/updateQuestion",
  DELETE_QUESTION_API: BASE_URL + "/question/deleteQuestion",
  GET_ALL_QUESTION_BY_QUESTIONBANK_ID_API: BASE_URL + "/question/getAllQuestionsByQuestionBankId",
};


export const StudentEndPoint = {
  CREATE_STUDENT_API: BASE_URL + "/student/createStudent",
  UPDATE_STUDENT_API: BASE_URL + "/student/updateStudent",
  DELETE_STUDENT_API: BASE_URL + "/student/deleteStudent",
  GET_ALL_STUDENTS_API: BASE_URL + "/student/getAllStudents",
};


export const AssessmentEndPoint = {
  ASSIGN_EXAM_API: BASE_URL + "/assessment/assignExam",
  GET_ALL_ASSIGNED_EXAM_API: BASE_URL + "/assessment/getAllAssignedExams",
  VALIDATE_EXAM_TOKEN_API: BASE_URL + "/assessment/validateExamTokenAuth",
  VALIDATE_ACCESS_KEY_API: BASE_URL + "/assessment/validateAccessKey",
  FETCH_EXAM_QUESTIONS_API: BASE_URL + "/assessment/fetchExamQuestions",
  AUTO_SAVE_EXAM_RESPONSE_API: BASE_URL + "/assessment/autoSaveExamResponse",
  SUBMIT_EXAM_API: BASE_URL + "/assessment/submitExam",
  GET_EXAM_LIVEKIT_TOKEN_API: BASE_URL + "/assessment/getExamLivekitToken",
  REPORT_PROCTORING_UNAVAILABLE_API: BASE_URL + "/assessment/reportProctoringUnavailable",
};


export const ProctorEndPoint = {
  AUTO_UPDATE_MISCONDUCT_API: BASE_URL + "/proctor/autoUpdateMisconduct",
  TERMINATE_CANDIDATURE_API: BASE_URL + "/proctor/terminateCandidature",
  SEND_WARNING_API: BASE_URL + "/proctor/sendWarning",
  GET_LIVE_SESSIONS_API: BASE_URL + "/proctor/getLiveExamSessions",
  GET_PROCTOR_LIVEKIT_TOKEN_API: BASE_URL + "/proctor/getProctorLivekitToken",
};


export const AdminEndPoint = {
  GET_ALL_ORGANISATIONS_API: BASE_URL + "/admin/getAllOrganisations",
  GET_ORGANISATION_BY_ID_API: BASE_URL + "/admin/getOrganisationById",
  APPROVE_ORGANISATION_API: BASE_URL + "/admin/approveOrganisation",
  REJECT_ORGANISATION_API: BASE_URL + "/admin/rejectOrganisation",
  SUSPEND_ORGANISATION_API: BASE_URL + "/admin/suspendOrganisation",
  REACTIVATE_ORGANISATION_API: BASE_URL + "/admin/reactivateOrganisation",
  DELETE_ORGANISATION_API: BASE_URL + "/admin/deleteOrganisation",
  GET_PLATFORM_ANALYTICS_API: BASE_URL + "/admin/getPlatformAnalytics",
  GET_SECURITY_OVERVIEW_API: BASE_URL + "/admin/getSecurityOverview",
  UNLOCK_EXAM_SESSION_API: BASE_URL + "/admin/unlockExamSession",
  CREATE_PROCTOR_API: BASE_URL + "/admin/createProctor",
  GET_ALL_PROCTORS_API: BASE_URL + "/admin/getAllProctors",
  UPDATE_PROCTOR_ASSIGNMENTS_API: BASE_URL + "/admin/updateProctorAssignments",
  SUSPEND_PROCTOR_API: BASE_URL + "/admin/suspendProctor",
  REACTIVATE_PROCTOR_API: BASE_URL + "/admin/reactivateProctor",
  DELETE_PROCTOR_API: BASE_URL + "/admin/deleteProctor",
  GET_PLATFORM_SETTINGS_API: BASE_URL + "/admin/getPlatformSettings",
  UPDATE_PLATFORM_SETTINGS_API: BASE_URL + "/admin/updatePlatformSettings",
};


export const AccountEndPoint = {
  CHANGE_PASSWORD_API: BASE_URL + "/account/changePassword",
  GET_TWO_FACTOR_STATUS_API: BASE_URL + "/account/twoFactorStatus",
  UPDATE_TWO_FACTOR_PREFERENCE_API: BASE_URL + "/account/twoFactorPreference",
};

