import { useEffect, useState } from "react";
import s from "./AssessmentNavbar.module.css";
import { useNavigate } from "react-router-dom";

export default function AssessmentNavbar() {

  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`${s.nav} ${scrolled ? s.navScrolled : ""}`}>

      {/* ambient top line */}
      <span className={s.topLine} />

      <div className={s.container}>

        {/* LOGO */}
        <div className={s.logo} onClick={() => navigate("/")}>
          <span className={s.logoMark}>
            <span className={s.logoMarkDot} />
          </span>
          Proctored<span className={s.logoAccent}>Link</span>
        </div>

        {/* SECURE BADGE */}
        <div className={s.badge}>
          <span className={s.badgeDot} />
          <span className={s.badgeText}>Secure Session</span>
        </div>

      </div>
    </nav>
  );
}