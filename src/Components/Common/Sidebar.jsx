import { useState } from "react";
import s from "./Sidebar.module.css";
import { useSelector, useDispatch } from "react-redux";
import { setUser, setToken } from "../../redux/profileSlice";

export default function Sidebar({ open, setOpen }) {

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);

  const [activeTab,setActiveTab] = useState("dashboard");

  const logoutHandler = () => {
    dispatch(setUser(null));
    dispatch(setToken(null));
  };

  const role = user?.role;

  return (

    <>

      {open && <div className={s.overlay} onClick={()=>setOpen(false)} />}

      <div className={`${s.sidebar} ${open ? s.show : ""}`}>

        <div className={s.profile}>

          <div className={s.avatar}>
            {user?.name?.charAt(0)}
          </div>

          <div>
            <p className={s.name}>{user?.name}</p>
            <p className={s.email}>{user?.email}</p>
          </div>

        </div>


        <div className={s.menu}>

          <button
          className={activeTab==="dashboard"?s.active:""}
          onClick={()=>setActiveTab("dashboard")}
          >
          Dashboard
          </button>


          {role === "organisation" && (
            <>
              <button
              className={activeTab==="exams"?s.active:""}
              onClick={()=>setActiveTab("exams")}
              >
              Exams
              </button>

              <button
              className={activeTab==="students"?s.active:""}
              onClick={()=>setActiveTab("students")}
              >
              Students
              </button>
            </>
          )}


          {role === "admin" && (
            <>
              <button
              className={activeTab==="users"?s.active:""}
              onClick={()=>setActiveTab("users")}
              >
              Users
              </button>

              <button
              className={activeTab==="reports"?s.active:""}
              onClick={()=>setActiveTab("reports")}
              >
              Reports
              </button>
            </>
          )}


          <button
          onClick={logoutHandler}
          className={s.logout}
          >
          Logout
          </button>

        </div>

      </div>


      {/* CONTENT AREA */}

      <div className={s.content}>

        {activeTab === "dashboard" && <h2>Dashboard</h2>}
        {activeTab === "exams" && <h2>Exam Manager</h2>}
        {activeTab === "students" && <h2>Student Manager</h2>}
        {activeTab === "users" && <h2>User Manager</h2>}
        {activeTab === "reports" && <h2>Reports</h2>}

      </div>

    </>

  );

}