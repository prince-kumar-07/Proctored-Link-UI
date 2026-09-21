import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  VscAccount,
  VscSettingsGear,
  VscGraph,
  VscBook,
  VscShield,
  VscEye,
  VscGlobe
} from "react-icons/vsc";
import { PiStudentFill, PiExamFill } from "react-icons/pi";
import { CgDatabase } from "react-icons/cg";
import { AiTwotoneDatabase } from "react-icons/ai";



import { MdManageAccounts, MdOutlineRemoveRedEye } from "react-icons/md";
import styles from "./Sidebar.module.css";

function Sidebar({ isOpen }) {

  const { user } = useSelector((state)=>state.user);

  const role = user?.role;

  const roleMenus = {

    organisation: [
      {
        name:"Manage Que. Bank",
        path:"/dashboard/questionbank",
        icon:<CgDatabase/>
      },
      {
        name:"Manage Questions",
        path:"/dashboard/questions",
        icon:<AiTwotoneDatabase/>
      },
      {
        name:"Student Dashboard",
        path:"/dashboard/students",
        icon:<PiStudentFill/>
      },
       {
        name:"Exam Dashboard",
        path:"/dashboard/exams",
        icon:<PiExamFill/>
      }
      // "Proctoring Dashboard" removed: it pointed at /dashboard/Proctoring,
      // which has no matching route or page and 404'd. The misconduct
      // report it was meant to lead to already lives inside the Exam
      // Dashboard's exam-detail modal (Overview/Proctoring/Misconduct tabs).
    ],

    admin: [
      {
        name:"Manage Organisations",
        path:"/dashboard/organisations",
        icon:<MdManageAccounts/>
      },
      {
        name:"Manage Proctors",
        path:"/dashboard/proctors",
        icon:<MdOutlineRemoveRedEye/>
      },
      {
        name:"Platform Analytics",
        path:"/dashboard/platform-analytics",
        icon:<VscGraph/>
      },
      {
        name:"Security",
        path:"/dashboard/security",
        icon:<VscShield/>
      },
      {
        name:"Platform Settings",
        path:"/dashboard/platform-settings",
        icon:<VscGlobe/>
      }
    ],

    proctor: [
      {
        name:"Live Monitor",
        path:"/dashboard/live-monitor",
        icon:<VscEye/>
      }
    ]

  };

  return (

    <div className={`${styles.sidebar} ${isOpen ? styles.show : ""}`}>

      <div className={styles.heading}>
        Dashboard
      </div>

      <div className={styles.links}>

        {/* Common */}

        <NavLink
          to="/dashboard/profile"
          className={({isActive}) =>
            isActive ? styles.activeLink : styles.link
          }
        >
          <VscAccount className={styles.icon}/>
          Profile
        </NavLink>


        {roleMenus[role]?.map((item,index)=>(
          <NavLink
            key={index}
            to={item.path}
            className={({isActive}) =>
              isActive ? styles.activeLink : styles.link
            }
          >
            <span className={styles.icon}>
              {item.icon}
            </span>
            {item.name}
          </NavLink>
        ))}


        {/* Common */}

        <NavLink
          to="/dashboard/settings"
          className={({isActive}) =>
            isActive ? styles.activeLink : styles.link
          }
        >
          <VscSettingsGear className={styles.icon}/>
          Settings
        </NavLink>

      </div>

    </div>
  );
}

export default Sidebar;