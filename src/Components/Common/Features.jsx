import React from 'react';
import styles from './Features.module.css';
import { Reveal, Stagger, StaggerItem } from '../Motion';

export default function Features() {
  const features = [
    {
      icon: '🛡️',
      title: 'Advanced AI Proctoring',
      description:
        'Real-time detection of multiple faces, gaze deviation, unusual background noise, unauthorized devices, voice anomalies, and suspicious behavior patterns.',
    },
    {
      icon: '🔒',
      title: 'Secure Browser Lockdown',
      description:
        'Full-screen enforcement, tab switching prevention, copy-paste blocking, keyboard shortcut restrictions, right-click disable, and application monitoring.',
    },
    {
      icon: '👀',
      title: 'Live Invigilation Dashboard',
      description:
        'Powerful real-time monitoring interface allowing proctors to watch multiple candidates simultaneously, issue warnings, chat, or terminate suspicious sessions.',
    },
    {
      icon: '📊',
      title: 'Intelligent Analytics & Reports',
      description:
        'Detailed violation timelines, candidate credibility scores, AI-flagged incidents, performance analytics, and exportable audit-ready reports.',
    },
    {
      icon: '🧠',
      title: 'Smart Question Bank & Randomization',
      description:
        'Unlimited reusable question banks with automatic randomization, difficulty balancing, topic coverage, and anti-pattern question selection per candidate.',
    },
    {
      icon: '⚡',
      title: 'Enterprise-Grade Scalability & Integrations',
      description:
        'Handles thousands of concurrent sessions, native LMS/SSO integrations (Moodle, Canvas, Blackboard, Okta, Azure AD), custom APIs, and 99.99% uptime SLA.',
    },
  ];

  return (
    <section className={styles.features}>
      <div className={styles.container}>
        <Reveal className={styles.header}>
          <h2 className={styles.title}>Powerful Features for Trusted Assessments</h2>
          <p className={styles.subtitle}>
            Built for universities, certification bodies, corporations, and high-stakes testing organizations — delivering fairness, security, and efficiency at scale.
          </p>
        </Reveal>

        <Stagger className={styles.grid} staggerChildren={0.07}>
          {features.map((feature, index) => (
            <StaggerItem key={index} className={styles.card}>
              <div className={styles.iconWrapper}>
                <span className={styles.icon}>{feature.icon}</span>
              </div>
              <h3 className={styles.cardTitle}>{feature.title}</h3>
              <p className={styles.cardDescription}>{feature.description}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}