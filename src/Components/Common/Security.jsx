import React from 'react';
import styles from './Security.module.css';
import { Reveal, Stagger, StaggerItem } from '../Motion';

export default function Security() {
  const securityPoints = [
    {
      icon: '🔐',
      title: 'End-to-End Encryption',
      description:
        'All exam data, video streams, screen recordings, and candidate information are encrypted in transit (TLS 1.3) and at rest (AES-256).',
    },
    {
      icon: '🛡️',
      title: 'Browser & Device Lockdown',
      description:
        'Full-screen mode enforcement, tab switching prevention, copy-paste disable, right-click block, keyboard shortcut restrictions, and external application detection.',
    },
    {
      icon: '👁️',
      title: 'Multi-Layer AI Threat Detection',
      description:
        'Real-time monitoring for multiple faces, gaze tracking anomalies, voice irregularities, background noise spikes, mobile device usage, virtual machines, and screen mirroring attempts.',
    },
    {
      icon: '📜',
      title: 'Compliance & Certifications',
      description:
        'SOC 2 Type II, ISO 27001, GDPR, CCPA, and FERPA compliant infrastructure. Full audit trails and data residency options available for regulated industries.',
    },
    {
      icon: '🔍',
      title: 'Tamper-Proof Session Recording',
      description:
        'Continuous video + screen + audio capture with cryptographic timestamps and integrity checks to prevent post-exam manipulation.',
    },
    {
      icon: '⚡',
      title: 'High Availability & DDoS Protection',
      description:
        '99.99% uptime SLA, global edge network, automatic failover, rate limiting, WAF, and advanced DDoS mitigation — built to handle large-scale high-stakes exams.',
    },
  ];

  return (
    <section className={styles.security}>
      <div className={styles.container}>
        <Reveal className={styles.header}>
          <h2 className={styles.title}>Uncompromising Security & Trust</h2>
          <p className={styles.subtitle}>
            Designed for high-stakes assessments where integrity is non-negotiable. Enterprise-grade protection trusted by universities, certification bodies, and large organizations worldwide.
          </p>
        </Reveal>

        <Stagger className={styles.grid} staggerChildren={0.07}>
          {securityPoints.map((point, index) => (
            <StaggerItem key={index} className={styles.card}>
              <div className={styles.iconWrapper}>
                <span className={styles.icon}>{point.icon}</span>
              </div>
              <h3 className={styles.cardTitle}>{point.title}</h3>
              <p className={styles.cardDescription}>{point.description}</p>
            </StaggerItem>
          ))}
        </Stagger>

        <Stagger className={styles.trustBar} staggerChildren={0.09}>
          <StaggerItem className={styles.trustItem}>
            <span className={styles.trustNumber}>SOC 2</span>
            <span className={styles.trustLabel}>Type II</span>
          </StaggerItem>
          <StaggerItem className={styles.trustItem}>
            <span className={styles.trustNumber}>ISO 27001</span>
            <span className={styles.trustLabel}>Certified</span>
          </StaggerItem>
          <StaggerItem className={styles.trustItem}>
            <span className={styles.trustNumber}>GDPR</span>
            <span className={styles.trustLabel}>Compliant</span>
          </StaggerItem>
          <StaggerItem className={styles.trustItem}>
            <span className={styles.trustNumber}>99.99%</span>
            <span className={styles.trustLabel}>Uptime SLA</span>
          </StaggerItem>
        </Stagger>
      </div>
    </section>
  );
}