import { showSpinner, hideSpinner } from "../../Reducer/Slice/SpinnerSlice";
import { StudentEndPoint } from "../api";
import { apiConnector } from "../apiConnector";
import toast from "react-hot-toast";
import { setStudentsData } from "../../Reducer/Slice/StudentsSlice";

const {
  CREATE_STUDENT_API,
  UPDATE_STUDENT_API,
  DELETE_STUDENT_API,
  GET_ALL_STUDENTS_API,
} = StudentEndPoint;

export async function createStudent(dispatch, formData) {
//   console.log(formData);
  dispatch(showSpinner("Creating Student..."));
  const token = JSON.parse(localStorage.getItem("token"));

  try {
    const res = await apiConnector(
      "POST",
      CREATE_STUDENT_API,
      {
        ...formData,
      },
      {
        Authorization: `Bearer ${token}`,
      },
    );

    toast.success("Student Created Successfully");
    fetchAllStudents(dispatch);
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong";
    toast.error(message);
  }

  dispatch(hideSpinner());
}

export async function fetchAllStudents(dispatch) {
  dispatch(showSpinner("Fetching QuestionsList..."));
  const token = JSON.parse(localStorage.getItem("token"));

  try {
    const res = await apiConnector("GET", GET_ALL_STUDENTS_API, null, {
      Authorization: `Bearer ${token}`,
    });

    // console.log(res.data.data)

    dispatch(setStudentsData(res.data.data));
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong";
    toast.error(message);
  }

  dispatch(hideSpinner());
}

export async function updateStudent(dispatch, formData) {
    console.log(formData)
  dispatch(showSpinner("Updating Student..."));
  const token = JSON.parse(localStorage.getItem("token"));

  try {
    const res = await apiConnector(
      "PUT",
      UPDATE_STUDENT_API,
      {
        ...formData,
      },
      {
        Authorization: `Bearer ${token}`,
      },
    );

    toast.success("Student Updated Successfully");
    fetchAllStudents(dispatch);
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong";
    toast.error(message);
  }

  dispatch(hideSpinner());
}

export async function deleteStudent(dispatch, id) {
  dispatch(showSpinner("Deleting Student..."));
  const token = JSON.parse(localStorage.getItem("token"));

  try {
    const res = await apiConnector("DELETE",  `${DELETE_STUDENT_API}/${id}`, null, {
      Authorization: `Bearer ${token}`,
    });

    toast.success("Student Deleted Successfully");
    fetchAllStudents(dispatch);
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong";
    toast.error(message);
  }

  dispatch(hideSpinner());
}