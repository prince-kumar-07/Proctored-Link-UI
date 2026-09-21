import { showSpinner, hideSpinner } from "../../Reducer/Slice/SpinnerSlice";
import { QuestionEndPoint } from "../api"
import { apiConnector } from "../apiConnector";
import toast from "react-hot-toast";
import { setQuestions } from "../../Reducer/Slice/QuestionsSlice";


const {
  CREATE_QUESTION_API,
  UPDATE_QUESTION_API,
  DELETE_QUESTION_API,
  GET_ALL_QUESTION_BY_QUESTIONBANK_ID_API,
} = QuestionEndPoint;


export async function createQuestion(dispatch, formData) {


  console.log(formData)
  dispatch(showSpinner("Creating Question..."));
  const token = JSON.parse(localStorage.getItem("token"));

  try {
    const res = await apiConnector(
      "POST",
      CREATE_QUESTION_API,
      {
        ...formData,
      },
      {
        Authorization: `Bearer ${token}`,
      },
    );

  
    toast.success("Question Created Successfully");
    // fetchAllQuestionBank(dispatch);
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong";
    toast.error(message);
  }

  dispatch(hideSpinner());
}

export async function fetchQuestionsList(dispatch, questionBankId) {

  dispatch(showSpinner("Fetching QuestionsList..."));
  const token = JSON.parse(localStorage.getItem("token"));

  try {
    const res = await apiConnector(
      "GET", 
       `${GET_ALL_QUESTION_BY_QUESTIONBANK_ID_API}/${questionBankId}`,
       null, 
      { Authorization: `Bearer ${token}` });

    dispatch(setQuestions(res.data.data));
    // console.log(res.data.data)
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong";
    toast.error(message);
  }

  dispatch(hideSpinner());
}


export async function deleteQuestion(dispatch, id, questionBankId) {

  dispatch(showSpinner("Deleting Question..."));
  const token = JSON.parse(localStorage.getItem("token"));

  try {
    const res = await apiConnector(
      "DELETE",
       `${DELETE_QUESTION_API}/${id}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      },
    );

    toast.success("Question Deleted Successfully");
    fetchQuestionsList(dispatch, questionBankId);
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong";
    toast.error(message);
  }

  dispatch(hideSpinner());
}


export async function updateQuestion(dispatch, formData, questionBankId) {
  // console.log(formData);

  dispatch(showSpinner("Updating Question..."));
  const token = JSON.parse(localStorage.getItem("token"));

  try {
    const res = await apiConnector(
      "PUT",
      UPDATE_QUESTION_API,
      {
        ...formData,
      },
      {
        Authorization: `Bearer ${token}`,
      },
    );

    toast.success("Question Updated Successfully");

    if(questionBankId)
    fetchQuestionsList(dispatch, questionBankId)

  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong";
    toast.error(message);
  }

  dispatch(hideSpinner());
}
