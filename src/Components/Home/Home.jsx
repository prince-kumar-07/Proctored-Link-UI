import { useNavigate } from "react-router-dom";
import { motion as Motion, useReducedMotion } from "framer-motion";
import s from "./Home.module.css";
import { Reveal, Stagger, StaggerItem, AnimatedCounter, Magnetic } from "../Motion";
import { EASE, fadeUp } from "../Motion/variants";

const FEATURES = [
  { title: "AI Proctoring", body: "Detect multiple faces, background noise, tab switching and suspicious activities in real time." },
  { title: "Question Bank", body: "Create reusable question banks and generate randomised exams for every candidate." },
  { title: "Live Monitoring", body: "Watch candidates live during exams through a powerful invigilator dashboard." },
  { title: "Exam Analytics", body: "Detailed candidate performance insights and AI violation reports instantly." },
  { title: "Exam Sessions", body: "Assign exams with secure unique tokens and track status of every candidate." },
  { title: "Secure Environment", body: "Browser lockdown, screen monitoring, copy paste protection and tab detection." },
];

const STEPS = [
  { n: 1, title: "Create Organisation", body: "Register your organisation and get access to the exam dashboard." },
  { n: 2, title: "Create Question Bank", body: "Add questions, options and answers to build reusable exams." },
  { n: 3, title: "Assign Exam", body: "Assign exams to candidates via secure email tokens." },
  { n: 4, title: "AI Monitoring", body: "Our AI monitors candidate behaviour during the exam session." },
];

const STATS = [
  { value: 2, suffix: "M+", label: "Exams Conducted" },
  { value: 840, suffix: "+", label: "Organisations" },
  { value: 140, suffix: "+", label: "Countries" },
  { value: 99.4, suffix: "%", label: "Fraud Detection", decimals: 1 },
];

export default function Home() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  const goAuth = () => navigate("/auth");

  return (
    <div className={s.page}>
      {/* Ambient depth. Purely decorative, so it is hidden from AT. */}
      <div className={s.aurora} aria-hidden="true">
        <span className={s.orb1} />
        <span className={s.orb2} />
        <span className={s.orb3} />
      </div>

      {/* ---------------- HERO ---------------- */}
      <section className={s.hero}>
        <Motion.div
          className={s.heroLeft}
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09 } } }}
        >
          <Motion.span className={s.badge} variants={fadeUp}>
            <span className={s.badgeDot} aria-hidden="true" />
            AI Powered Online Examination Platform
          </Motion.span>

          <Motion.h1 className={s.title} variants={fadeUp}>
            Conduct Secure <br />
            <span className={s.titleAccent}>Online Exams</span> <br />
            Anywhere
          </Motion.h1>

          <Motion.p className={s.subtitle} variants={fadeUp}>
            ProctoredLink helps organisations conduct AI-monitored online exams
            with advanced cheating detection, live invigilation and automated results.
          </Motion.p>

          <Motion.div className={s.cta} variants={fadeUp}>
            <Magnetic>
              <button className={s.primary} onClick={goAuth}>
                Create Organisation
                <svg className={s.arrow} viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M3 8h9M8.5 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </Magnetic>

            <Magnetic>
              <button className={s.secondary} onClick={() => navigate("/Features")}>
                Watch Demo
              </button>
            </Magnetic>
          </Motion.div>

          <Motion.div className={s.trustRow} variants={fadeUp}>
            <div className={s.trustAvatars} aria-hidden="true">
              {["A", "M", "K", "S"].map((c) => (
                <span key={c} className={s.trustAvatar}>{c}</span>
              ))}
            </div>
            <p className={s.trustText}>
              Trusted by <strong>840+</strong> organisations worldwide
            </p>
          </Motion.div>
        </Motion.div>

        <Motion.div
          className={s.heroRight}
          initial={reduce ? false : { opacity: 0, y: 30 }}
          animate={reduce ? false : { opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
        >
          <div className={s.dashboard}>
            <div className={s.windowBar}>
              <span />
              <span />
              <span />
              <div className={s.windowTitle}>Invigilator Console</div>
              <div className={s.liveTag}>
                <span className={s.liveDot} aria-hidden="true" />
                LIVE
              </div>
            </div>

            <div className={s.stats}>
              <div>
                <h3><AnimatedCounter value={1247} /></h3>
                <p>Active Candidates</p>
              </div>
              <div>
                <h3 className={s.alertStat}><AnimatedCounter value={3} /></h3>
                <p>AI Alerts</p>
              </div>
              <div>
                <h3><AnimatedCounter value={99.2} decimals={1} suffix="%" /></h3>
                <p>Integrity</p>
              </div>
            </div>

            <div className={s.grid}>
              {Array.from({ length: 9 }).map((_, i) => (
                <Motion.div
                  key={i}
                  className={`${s.card} ${i === 4 ? s.cardFlagged : ""}`}
                  initial={reduce ? false : { opacity: 0, scale: 0.9 }}
                  animate={reduce ? false : { opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 + i * 0.045, ease: EASE }}
                >
                  <div className={s.avatar} />
                  <p>Candidate {i + 1}</p>
                  {i === 4 && <span className={s.flagBadge}>FLAGGED</span>}
                </Motion.div>
              ))}
            </div>
          </div>
        </Motion.div>
      </section>

      {/* ---------------- STATS ---------------- */}
      <Stagger className={s.statsSection} staggerChildren={0.08}>
        {STATS.map((st) => (
          <StaggerItem key={st.label} className={s.statBox}>
            <h2>
              <AnimatedCounter value={st.value} suffix={st.suffix} decimals={st.decimals || 0} />
            </h2>
            <p>{st.label}</p>
          </StaggerItem>
        ))}
      </Stagger>

      {/* ---------------- FEATURES ---------------- */}
      <section className={s.features}>
        <Reveal>
          <h2 className={s.sectionTitle}>Powerful Exam Infrastructure</h2>
        </Reveal>

        <Stagger className={s.featureGrid} staggerChildren={0.07}>
          {FEATURES.map((f) => (
            <StaggerItem key={f.title} className={s.feature}>
              <span className={s.featureGlow} aria-hidden="true" />
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ---------------- WORKFLOW ---------------- */}
      <section className={s.workflow}>
        <Reveal>
          <h2 className={s.sectionTitle}>How It Works</h2>
        </Reveal>

        <Stagger className={s.steps} staggerChildren={0.09}>
          {STEPS.map((st) => (
            <StaggerItem key={st.n} className={s.step}>
              <span>{st.n}</span>
              <h4>{st.title}</h4>
              <p>{st.body}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className={s.ctaSection}>
        <Reveal>
          <h2>Start Conducting Secure Exams Today</h2>
          <p>
            Join organisations worldwide using ProctoredLink to conduct
            trusted online assessments.
          </p>
          <Magnetic>
            <button className={s.primaryLarge} onClick={goAuth}>
              Get Started
            </button>
          </Magnetic>
        </Reveal>
      </section>
    </div>
  );
}
