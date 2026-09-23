import "./App.css";
import AppRoutes from "./Route/AppRoutes";
import Navbar from "./Components/Common/Navbar";
import Spinner from "./Components/Common/Spinner";
import { useLocation } from "react-router-dom";
import AssessmentNavbar from "./Components/Common/AssessmentNavbar";
import useServerWakeup from "./hooks/useServerWakeup";

function App() {

  useServerWakeup();

  const location = useLocation();
  const isAssessment = location.pathname.startsWith("/assessment");

  return (
    <>
      {isAssessment ? <AssessmentNavbar /> : <Navbar />}

      <AppRoutes />

      <Spinner />
    </>
  );
}

export default App;