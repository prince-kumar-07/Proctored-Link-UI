import { showSpinner, hideSpinner } from "../../Reducer/Slice/SpinnerSlice";
import { QuestionBankEndPoint } from "../api";
import { apiConnector } from "../apiConnector";
import toast from "react-hot-toast";
import { setQuestionBanks, setQuestionBanksList } from "../../Reducer/Slice/QBSlice";

const {
  CREATE_QUESTIONBANK_API,
  UPDATE_QUESTIONBANK_API,
  DELETE_QUESTIONBANK_API,
  GET_QUESTIONBANK_BY_ID_API,
  GET_ALL_QUESTIONBANK_API,
  GET_ALL_QUESTIONBANK_NAMES_API,
} = QuestionBankEndPoint;

export async function createQuestionBank(dispatch, formData) {
  dispatch(showSpinner("Creating QuestionBank..."));
  const token = JSON.parse(localStorage.getItem("token"));

  try {
    const res = await apiConnector(
      "POST",
      CREATE_QUESTIONBANK_API,
      {
        ...formData,
      },
      {
        Authorization: `Bearer ${token}`,
      },
    );

    toast.success("Question Bank Created Successfully");
    fetchAllQuestionBank(dispatch);
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong";
    toast.error(message);
  }

  dispatch(hideSpinner());
}

export async function fetchAllQuestionBank(dispatch) {
  dispatch(showSpinner("Fetching All QuestionBanks..."));
  const token = JSON.parse(localStorage.getItem("token"));

  try {
    const res = await apiConnector("GET", GET_ALL_QUESTIONBANK_API, null, {
      Authorization: `Bearer ${token}`,
    });

    dispatch(setQuestionBanks(res.data.data));
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong";
    toast.error(message);
  }

  dispatch(hideSpinner());
}


export async function updateQuestionBank(dispatch, formData) {
  console.log(formData);

  dispatch(showSpinner("Updating QuestionBank..."));
  const token = JSON.parse(localStorage.getItem("token"));

  try {
    const res = await apiConnector(
      "PUT",
      UPDATE_QUESTIONBANK_API,
      {
        ...formData,
      },
      {
        Authorization: `Bearer ${token}`,
      },
    );

    toast.success("Question Bank Updated Successfully");
    fetchAllQuestionBank(dispatch);
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong";
    toast.error(message);
  }

  dispatch(hideSpinner());
}


export async function deleteQuestionBank(dispatch, id) {
  console.log(id);

  dispatch(showSpinner("Deleting QuestionBank..."));
  const token = JSON.parse(localStorage.getItem("token"));

  try {
    const res = await apiConnector(
      "DELETE",
      DELETE_QUESTIONBANK_API,
      { id },
      {
        Authorization: `Bearer ${token}`,
      },
    );

    toast.success("Question Bank Deleted Successfully");
    fetchAllQuestionBank(dispatch);
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong";
    toast.error(message);
  }

  dispatch(hideSpinner());
}


export async function fetchQuestionBankList(dispatch) {
  dispatch(showSpinner("Fetching QuestionBanksList..."));
  const token = JSON.parse(localStorage.getItem("token"));

  try {
    const res = await apiConnector("GET", GET_ALL_QUESTIONBANK_NAMES_API, null, {
      Authorization: `Bearer ${token}`,
    });

    dispatch(setQuestionBanksList(res.data.data));
    // console.log(res.data.data)
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong";
    toast.error(message);
  }

  dispatch(hideSpinner());
}