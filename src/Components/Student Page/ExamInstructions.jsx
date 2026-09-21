import { useRef, useState } from 'react';
import styles from './ExamInstructions.module.css';
import {
  FiShield, FiArrowRight, FiAlertTriangle,
  FiMonitor, FiEye, FiUsers, FiVideo,
  FiCheckCircle, FiBookOpen, FiClock, FiLock,
} from 'react-icons/fi';
import { useParams, useNavigate } from 'react-router-dom';
import {
  motion as Motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useAnimationControls,
} from 'framer-motion';
import { Reveal, Stagger, StaggerItem, AnimatedCounter } from '../Motion';
import { EASE } from '../Motion/variants';

const SECTIONS = [
  {
    id: 'before',
    Icon: FiClock,
    title: 'Before You Begin',
    color: '#60a5fa',
    colorBg: 'rgba(96,165,250,0.08)',
    colorBdr: 'rgba(96,165,250,0.18)',
    items: [
      { Icon: FiUsers,   text: 'Use a quiet, private room with no other people present.' },
      { Icon: FiEye,     text: 'Ensure good lighting — your face must be clearly visible.' },
      { Icon: FiMonitor, text: 'Close all other applications and browser tabs.' },
      { Icon: FiShield,  text: 'Disable any screen-recording or virtual machine software.' },
      { Icon: FiBookOpen,text: 'Keep your ID (Aadhaar, PAN, Passport, etc.) ready for verification if required.' },
    ],
  },
  {
    id: 'during',
    Icon: FiVideo,
    title: 'During the Exam',
    color: '#f59e0b',
    colorBg: 'rgba(245,158,11,0.08)',
    colorBdr: 'rgba(245,158,11,0.18)',
    items: [
      { Icon: FiBookOpen,  text: 'Do not use any unauthorized materials, notes, books, or devices.' },
      { Icon: FiUsers,     text: 'Do not communicate with anyone during the exam (voice, chat, gestures).' },
      { Icon: FiEye,       text: 'Keep your eyes on the screen — looking away for long periods may trigger flags.' },
      { Icon: FiMonitor,   text: 'Do not switch tabs, open new windows, or use keyboard shortcuts to exit full-screen.' },
      { Icon: FiShield,    text: 'Any detected suspicious behavior (multiple faces, noise, tab switching) will be flagged.' },
      { Icon: FiVideo,     text: 'The entire session is recorded (video, screen, audio) for review.' },
    ],
  },
];

const TOTAL_RULES = SECTIONS.reduce((sum, s) => sum + s.items.length, 0);

const TRUST_CHIPS = [
  { Icon: FiVideo,  label: 'Live Monitoring' },
  { Icon: FiLock,   label: 'Encrypted Transfer' },
  { Icon: FiShield, label: 'Session Recorded' },
];

export default function ExamInstructions() {
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();
  const { uniqueAccessToken } = useParams();
  const reduce = useReducedMotion();

  const cardRef = useRef(null);
  const shakeControls = useAnimationControls();

  // Reading-progress rail: tracks how far the candidate has scrolled
  // through the rules card, not the page as a whole.
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start 0.8', 'end 0.35'],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 });

  const handleProceed = () => {
    if (!agreed) {
      // The button stays reachable even while "disabled" (aria-disabled,
      // not the native attribute) specifically so this feedback can run —
      // a dead button gives no signal about what to do next.
      if (!reduce) {
        shakeControls.start({
          x: [0, -8, 8, -6, 6, -3, 0],
          transition: { duration: 0.45, ease: 'easeInOut' },
        });
      }
      return;
    }
    navigate(`/assessment/WaitingLobby/${uniqueAccessToken}`);
  };

  return (
    <div className={styles.page}>
      {/* Atmosphere */}
      <div className={styles.blob1} />
      <div className={styles.blob2} />
      <div className={styles.blob3} />
      <div className={styles.grain} />
      <div className={styles.gridLines} aria-hidden="true">
        {[...Array(6)].map((_, i) => <div key={i} className={styles.gridLine} />)}
      </div>

      {/* Sticky reading-progress rail, sits just under the assessment navbar. */}
      <div className={styles.progressRail} aria-hidden="true">
        <Motion.div className={styles.progressFillBar} style={{ scaleX: progress }} />
      </div>

      <div className={styles.container}>

        {/* ── HEADER ── */}
        <Motion.div
          className={styles.header}
          initial={reduce ? false : 'hidden'}
          animate={reduce ? false : 'show'}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
        >
          <Motion.div
            className={styles.topBadge}
            variants={{ hidden: { opacity: 0, y: -10 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } }}
          >
            <span className={styles.topBadgeDot} />
            <FiShield className={styles.topBadgeIcon} />
            Proctored Exam Rules
          </Motion.div>

          <Motion.h1
            className={styles.title}
            variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }}
          >
            Exam<br />
            <span className={styles.titleAccent}>Instructions</span>
          </Motion.h1>

          <Motion.p
            className={styles.subtitle}
            variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } }}
          >
            Read every rule carefully before starting. Violations are automatically detected and logged.
          </Motion.p>

          {/* Stat row — sets expectations before the candidate commits to reading. */}
          <Motion.div
            className={styles.statRow}
            variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } }}
          >
            <div className={styles.statPill}>
              <span className={styles.statNum}>
                <AnimatedCounter value={TOTAL_RULES} duration={1.1} />
              </span>
              <span className={styles.statLabel}>Rules</span>
            </div>
            <span className={styles.statDivider} />
            <div className={styles.statPill}>
              <span className={styles.statNum}>
                <AnimatedCounter value={SECTIONS.length} duration={0.8} />
              </span>
              <span className={styles.statLabel}>Sections</span>
            </div>
            <span className={styles.statDivider} />
            <div className={`${styles.statPill} ${styles.statPillLive}`}>
              <span className={styles.statLiveDot} />
              <span className={styles.statLabel}>Fully Monitored</span>
            </div>
          </Motion.div>
        </Motion.div>

        {/* ── MAIN CARD ── */}
        <div className={styles.card} ref={cardRef}>
          <div className={styles.cardGlow} />
          <div className={styles.cardTopSheen} />

          {/* ── INSTRUCTION SECTIONS ── */}
          <div className={styles.sections}>
            {SECTIONS.map(({ id, Icon, title, color, colorBg, colorBdr, items }, sIdx) => (
              <Reveal key={id} className={styles.section} y={26} amount={0.15}>
                {/* Section header */}
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionNum} style={{ color }}>
                    {String(sIdx + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={styles.sectionIconWrap}
                    style={{ background: colorBg, borderColor: colorBdr, color }}
                  >
                    <Icon />
                  </span>
                  <span className={styles.sectionTitle} style={{ color }}>{title}</span>
                  <span className={styles.sectionCount} style={{ background: colorBg, borderColor: colorBdr, color }}>
                    {items.length} rules
                  </span>
                </div>

                {/* Items */}
                <Stagger className={styles.itemList} staggerChildren={0.05} amount={0.1}>
                  {items.map(({ Icon: ItemIcon, text }, i) => (
                    <StaggerItem key={i} className={styles.item}>
                      <span className={styles.itemIcon} style={{ color }}>
                        <ItemIcon />
                      </span>
                      <span className={styles.itemText}>{text}</span>
                    </StaggerItem>
                  ))}
                </Stagger>
              </Reveal>
            ))}

            {/* ── WARNING BLOCK ── */}
            <Reveal className={styles.warningBlock} y={20} amount={0.3}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIconWrap}>
                  <FiAlertTriangle className={styles.warningIcon} />
                </span>
                <span className={styles.warningTitle}>Consequences of Violation</span>
              </div>
              <p className={styles.warningText}>
                Any attempt to cheat or violate rules will result in automatic disqualification,
                score invalidation, and potential reporting to your organization/institution.
              </p>
            </Reveal>
          </div>

          {/* ── DIVIDER ── */}
          <div className={styles.divider}>
            <span className={styles.dividerLine} />
            <span className={styles.dividerText}>
              <FiCheckCircle className={styles.dividerIcon} />
              Acknowledgement
            </span>
            <span className={styles.dividerLine} />
          </div>

          {/* ── AGREEMENT ── */}
          <div className={styles.agreement}>
            <label className={styles.checkboxLabel}>
              <span
                className={`${styles.customCheckbox} ${agreed ? styles.checkboxChecked : ''}`}
                onClick={() => setAgreed((v) => !v)}
              >
                {agreed && <FiCheckCircle className={styles.checkmark} />}
              </span>
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className={styles.hiddenCheckbox}
              />
              <span className={styles.checkboxText}>
                I have read and understood the instructions above. I agree to follow all rules
                and allow full proctoring (camera, microphone, screen recording).
              </span>
            </label>

            <Motion.button
              type="button"
              className={`${styles.btnProceed} ${agreed ? styles.btnEnabled : styles.btnDisabled}`}
              aria-disabled={!agreed}
              onClick={handleProceed}
              animate={shakeControls}
              whileTap={agreed && !reduce ? { scale: 0.985 } : undefined}
            >
              <span className={styles.btnInner}>
                {agreed ? (
                  <>
                    I Agree – Start Exam
                    <FiArrowRight className={styles.btnArrow} />
                  </>
                ) : (
                  <>
                    <FiShield className={styles.btnShieldIcon} />
                    Read & agree to proceed
                  </>
                )}
                {agreed && <span className={styles.btnShine} />}
              </span>
            </Motion.button>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <Reveal className={styles.footerWrap} y={10} amount={0.6}>
          <p className={styles.footer}>
            <FiShield className={styles.footerIcon} />
            All sessions are monitored and recorded for integrity purposes.
          </p>
          <div className={styles.trustRow}>
            {TRUST_CHIPS.map(({ Icon, label }) => (
              <span key={label} className={styles.trustChip}>
                <Icon className={styles.trustChipIcon} />
                {label}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </div>
  );
}
