import { useEffect, useRef, useState } from "react";
import s from "./Navbar.module.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion as Motion, AnimatePresence, useScroll, useSpring, useReducedMotion } from "framer-motion";
import { FiUser, FiSettings, FiLogOut, FiChevronRight, FiMail } from "react-icons/fi";
import { setUser, setToken } from "../../Reducer/Slice/UserSlice";

const LINKS = [
  { label: "Features", path: "/Features" },
  { label: "Security", path: "/Security" },
  { label: "Pricing", path: "/Pricing" },
  { label: "Docs", path: "/Docs" },
];

const ROLE_LABELS = {
  organisation: "Organisation",
  admin: "Administrator",
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const reduce = useReducedMotion();
  const profileRef = useRef(null);

  const { token, user } = useSelector((state) => state.user);

  // Reading progress bar across the top of the page.
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Dismiss the profile menu on outside click or Escape — previously it
  // could only be closed by clicking the avatar again.
  useEffect(() => {
    if (!openProfile) return;

    const onPointerDown = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setOpenProfile(false);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpenProfile(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openProfile]);

  const logoutHandler = () => {
    setOpenProfile(false);
    dispatch(setUser(null));
    dispatch(setToken(null));
    navigate("/");
  };

  const initial = user?.name?.charAt(0).toUpperCase() || "?";
  const roleLabel =
    ROLE_LABELS[user?.role] ||
    (user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : null);

  return (
    <nav className={`${s.nav} ${scrolled ? s.navScroll : ""}`}>
      <Motion.div className={s.progress} style={{ scaleX: progress }} aria-hidden="true" />

      <div className={s.container}>
        <div onClick={() => navigate("/")} className={s.logo} role="button" tabIndex={0}
             onKeyDown={(e) => e.key === "Enter" && navigate("/")}>
          <span className={s.logoMark} aria-hidden="true" />
          Proctored<span>Link</span>
        </div>

        <div className={s.links}>
          {LINKS.map((l) => {
            const active = location.pathname.toLowerCase() === l.path.toLowerCase();
            return (
              <a
                key={l.path}
                onClick={() => navigate(l.path)}
                className={active ? s.linkActive : undefined}
                aria-current={active ? "page" : undefined}
              >
                {l.label}
              </a>
            );
          })}
        </div>

        <div className={s.actions}>
          {!token && (
            <>
              <button onClick={() => navigate("/auth")} className={s.login}>
                Login
              </button>
              <button onClick={() => navigate("/auth")} className={s.primary}>
                Get Started
              </button>
            </>
          )}

          {token && (
            <div className={s.profileWrapper} ref={profileRef}>
              <button
                onClick={() => setOpenProfile((v) => !v)}
                className={s.profileIcon}
                aria-haspopup="menu"
                aria-expanded={openProfile}
                aria-label="Account menu"
              >
                {initial}
              </button>

              <AnimatePresence>
                {openProfile && (
                  <Motion.div
                    className={s.profileModal}
                    role="menu"
                    initial={reduce ? false : { opacity: 0, y: -10, scale: 0.95 }}
                    animate={reduce ? false : { opacity: 1, y: 0, scale: 1 }}
                    exit={reduce ? undefined : { opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <span className={s.profileModalGlow} aria-hidden="true" />

                    <div className={s.profileHeader}>
                      <div className={s.avatarRing}>
                        <div className={s.avatar}>{initial}</div>
                        <span className={s.onlineDot} aria-hidden="true" />
                      </div>

                      <div className={s.profileMeta}>
                        <p className={s.name}>{user?.name}</p>
                        <p className={s.email}>
                          <FiMail className={s.emailIcon} aria-hidden="true" />
                          <span>{user?.email}</span>
                        </p>
                      </div>

                      {roleLabel && <span className={s.roleBadge}>{roleLabel}</span>}
                    </div>

                    <div className={s.profileDivider} />

                    <div className={s.menuList}>
                      <button
                        onClick={() => { setOpenProfile(false); navigate("/dashboard/profile"); }}
                        className={s.menuItem}
                        role="menuitem"
                      >
                        <span className={s.menuIcon}><FiUser /></span>
                        <span className={s.menuLabel}>My Profile</span>
                        <FiChevronRight className={s.menuChevron} aria-hidden="true" />
                      </button>

                      <button
                        onClick={() => { setOpenProfile(false); navigate("/dashboard/settings"); }}
                        className={s.menuItem}
                        role="menuitem"
                      >
                        <span className={s.menuIcon}><FiSettings /></span>
                        <span className={s.menuLabel}>Settings</span>
                        <FiChevronRight className={s.menuChevron} aria-hidden="true" />
                      </button>
                    </div>

                    <div className={s.profileDivider} />

                    <button onClick={logoutHandler} className={s.logoutItem} role="menuitem">
                      <span className={s.menuIcon}><FiLogOut /></span>
                      <span className={s.menuLabel}>Sign out</span>
                    </button>
                  </Motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
