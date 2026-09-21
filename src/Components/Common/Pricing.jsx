import { useState } from "react";
import { motion as Motion, AnimatePresence, useReducedMotion } from "framer-motion";
import s from "./Pricing.module.css";
import { Reveal, Stagger, StaggerItem } from "../Motion";

const EASE = [0.16, 1, 0.3, 1];

/** Annual billing takes 20% off, matching the badge on the toggle. */
const ANNUAL_DISCOUNT = 0.2;
const annual = (n) => Math.round(n * (1 - ANNUAL_DISCOUNT) * 100) / 100;

const PLANS = [
  {
    id: "starter",
    title: "Starter",
    subtitle: "Small teams & occasional use",
    perExam: 4,
    monthly: 99,
    cap: "up to 50 exams",
    cta: "Get Started",
    primary: false,
    features: [
      "Basic AI proctoring & alerts",
      "Question bank (max 500 questions)",
      "Automated results & reports",
      "Email support",
      "Single organization",
    ],
  },
  {
    id: "pro",
    title: "Professional",
    subtitle: "Growing departments & institutions",
    perExam: 2.9,
    monthly: 499,
    cap: "up to 500 exams",
    cta: "Start 14-day Free Trial",
    primary: true,
    popular: true,
    features: [
      "Advanced AI (multi-face, noise, tab switch)",
      "Live invigilation dashboard",
      "Unlimited question banks",
      "Detailed analytics & violation reports",
      "Priority support + onboarding",
      "Up to 5 organizations",
    ],
  },
  {
    id: "enterprise",
    title: "Enterprise",
    subtitle: "Large-scale & high-stakes exams",
    custom: true,
    note: "Tailored for volume & special needs",
    cta: "Contact Sales",
    primary: false,
    features: [
      "Everything in Professional",
      "Dedicated success manager",
      "Custom LMS/SSO integrations",
      "SOC 2, GDPR, advanced compliance",
      "White-label option available",
      "Unlimited organizations & users",
      "24/7 premium support",
    ],
  },
];

const FAQS = [
  {
    q: "Can I try before I buy?",
    a: "Yes — 14-day free trial on Professional plan with full access to advanced features. No credit card required.",
  },
  {
    q: "How secure is the platform?",
    a: "End-to-end encryption, browser lockdown, SOC 2 & GDPR compliant. Full audit logs, anonymized data where possible, and no content sharing.",
  },
  {
    q: "Does it integrate with our existing systems?",
    a: "Yes — Moodle, Canvas, Blackboard, Google Classroom, Okta, Azure AD. Enterprise includes custom API & webhook support.",
  },
  {
    q: "How accurate is the cheating detection?",
    a: "99.4% fraud detection rate with real-time multi-face, gaze, noise, tab-switch, and device detection. Low false positives via continuous training.",
  },
  {
    q: "What kind of support do you provide?",
    a: "Starter: email • Professional: priority chat + onboarding • Enterprise: 24/7 phone/chat + dedicated manager.",
  },
  {
    q: "Are there any hidden fees?",
    a: "No hidden fees. Clear per-exam or unlimited monthly pricing. Annual saves 20%. Enterprise is custom quoted.",
  },
];

const COMPARISON = [
  ["AI Proctoring Level", "Basic", "Advanced", "Advanced + Custom Rules"],
  ["Live Monitoring Dashboard", "—", "✓", "✓"],
  ["Question Bank Limit", "500", "Unlimited", "Unlimited"],
  ["Organizations", "1", "5", "Unlimited"],
  ["Support Level", "Email", "Priority", "24/7 Dedicated"],
  ["Custom Integrations", "—", "Basic", "Full (API, Webhooks)"],
  ["Compliance & Security", "Standard", "SOC 2 / GDPR", "Custom + Audits"],
];

export default function Pricing() {
  // The toggle used to be a decorative checkbox that changed nothing.
  const [isAnnual, setIsAnnual] = useState(true);
  const reduce = useReducedMotion();

  return (
    <div className={s.page}>
      {/* Hero / Header */}
      <section className={s.hero}>
        <Reveal className={s.container}>
          <h1 className={s.title}>Simple, Transparent Pricing</h1>
          <p className={s.subtitle}>
            Protect exam integrity at scale with powerful AI proctoring. Choose the
            plan that matches your volume and requirements.
          </p>

          {/* Billing Toggle */}
          <div className={s.toggleWrapper}>
            <span className={`${s.toggleText} ${!isAnnual ? s.toggleActive : ""}`}>
              Monthly
            </span>

            <label className={s.toggleSwitch}>
              <input
                type="checkbox"
                checked={isAnnual}
                onChange={(e) => setIsAnnual(e.target.checked)}
                aria-label="Bill annually and save 20 percent"
              />
              <span className={s.slider}></span>
            </label>

            <span className={`${s.toggleText} ${isAnnual ? s.toggleActive : ""}`}>
              Annual <span className={s.discount}>-20%</span>
            </span>
          </div>
        </Reveal>
      </section>

      {/* Pricing Cards */}
      <section className={s.plansSection}>
        <Stagger className={s.plansGrid} staggerChildren={0.1}>
          {PLANS.map((plan) => {
            const perExam = plan.custom
              ? null
              : isAnnual
              ? annual(plan.perExam)
              : plan.perExam;
            const monthly = plan.custom
              ? null
              : isAnnual
              ? annual(plan.monthly)
              : plan.monthly;

            return (
              <StaggerItem
                key={plan.id}
                className={`${s.planCard} ${plan.popular ? s.popular : ""}`}
              >
                {plan.popular && <div className={s.popularBadge}>Most Popular</div>}

                <h3 className={s.planTitle}>{plan.title}</h3>
                <p className={s.planSubtitle}>{plan.subtitle}</p>

                <div className={s.priceBlock}>
                  {plan.custom ? (
                    <span className={s.customPrice}>Custom Pricing</span>
                  ) : (
                    <>
                      <span className={s.currency}>$</span>
                      {/* Re-keying on the value swaps the number rather than
                          mutating it in place, so the change is legible. */}
                      <AnimatePresence mode="popLayout" initial={false}>
                        <Motion.span
                          key={perExam}
                          className={s.price}
                          initial={reduce ? false : { opacity: 0, y: 12 }}
                          animate={reduce ? false : { opacity: 1, y: 0 }}
                          exit={reduce ? undefined : { opacity: 0, y: -12, position: "absolute" }}
                          transition={{ duration: 0.28, ease: EASE }}
                        >
                          {perExam}
                        </Motion.span>
                      </AnimatePresence>
                      <span className={s.period}>/exam</span>
                    </>
                  )}
                </div>

                <p className={s.billingNote}>
                  {plan.custom
                    ? plan.note
                    : `or $${monthly}/mo unlimited (${plan.cap})`}
                </p>

                <ul className={s.featureList}>
                  {plan.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>

                <button className={plan.primary ? s.btnPrimary : s.btnOutline}>
                  {plan.cta}
                </button>
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>

      {/* Comparison Table */}
      <section className={s.comparisonSection}>
        <div className={s.container}>
          <Reveal>
            <h2 className={s.sectionTitle}>Compare All Features</h2>
          </Reveal>

          <Reveal delay={0.08}>
            <div className={s.tableContainer}>
              <table className={s.comparisonTable}>
                <thead>
                  <tr>
                    <th></th>
                    <th>Starter</th>
                    <th className={s.highlightColumn}>Professional</th>
                    <th>Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row) => (
                    <tr key={row[0]}>
                      {row.map((cell, i) => (
                        <td key={i}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className={s.faqSection}>
        <div className={s.container}>
          <Reveal>
            <h2 className={s.sectionTitle}>Frequently Asked Questions</h2>
          </Reveal>

          <Stagger className={s.faqGrid} staggerChildren={0.06}>
            {FAQS.map((f) => (
              <StaggerItem key={f.q} className={s.faqItem}>
                <h4 className={s.faqQuestion}>{f.q}</h4>
                <p className={s.faqAnswer}>{f.a}</p>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal className={s.faqCta}>
            <p>Still have questions?</p>
            <div className={s.faqButtons}>
              <button className={s.btnOutline}>Contact Support</button>
              <button className={s.btnPrimary}>Book a Demo</button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Final CTA */}
      <section className={s.finalCta}>
        <Reveal className={s.container}>
          <h2 className={s.ctaTitle}>Ready to Secure Your Exams?</h2>
          <p className={s.ctaText}>
            Join 840+ organizations worldwide that trust ProctoredLink for fair and
            reliable assessments.
          </p>
          <button className={s.btnLarge}>Get Started Today</button>
          <p className={s.ctaSmall}>
            Or{" "}
            <a href="#" className={s.link}>
              book a personalized demo
            </a>{" "}
            for Enterprise needs.
          </p>
        </Reveal>
      </section>
    </div>
  );
}
