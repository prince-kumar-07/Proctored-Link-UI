import { Navigate } from "react-router-dom";

export default function OpenRoute({ children }) {
  const token = localStorage.getItem("token");

  return token ? <Navigate to="/dashboard" /> : children;
}