import React from 'react';
import styles from './Docs.module.css';
import { Reveal, Stagger, StaggerItem } from '../Motion';

export default function Docs() {
  const docCategories = [
    {
      icon: '🚀',
      title: 'Getting Started',
      description:
        'Set up your organization, create your first exam, invite candidates, and launch in under 10 minutes.',
      linkText: 'Quick Start Guide →',
    },
    {
      icon: '🛠️',
      title: 'Platform Overview',
      description:
        'Understand the dashboard, roles (admin, proctor, candidate), key workflows, and core concepts.',
      linkText: 'Core Concepts →',
    },
    {
      icon: '🔍',
      title: 'AI Proctoring & Cheating Detection',
      description:
        'Deep dive into how our AI works, what behaviors are flagged, accuracy metrics, and false-positive handling.',
      linkText: 'AI & Detection Docs →',
    },
    {
      icon: '🔒',
      title: 'Security & Compliance',
      description:
        'Encryption details, lockdown mechanisms, data privacy, SOC 2 / GDPR compliance, audit logs, and certifications.',
      linkText: 'Security Reference →',
    },
    {
      icon: '📚',
      title: 'Question Bank & Exam Creation',
      description:
        'Best practices for building banks, question types, randomization rules, difficulty scaling, and anti-cheating design.',
      linkText: 'Exam Builder Guide →',
    },
    {
      icon: '📊',
      title: 'Analytics, Reports & Monitoring',
      description:
        'How to read violation reports, credibility scores, performance analytics, export formats, and live monitoring tools.',
      linkText: 'Analytics Docs →',
    },
    {
      icon: '🔗',
      title: 'Integrations & API',
      description:
        'LMS connectors (Moodle, Canvas, etc.), SSO setup (Okta, Azure AD), webhooks, REST API reference, and custom integrations.',
      linkText: 'Integrations & API →',
    },
    {
      icon: '🆘',
      title: 'Troubleshooting & FAQs',
      description:
        'Common issues, error codes, candidate support flows, proctor troubleshooting, and frequently asked questions.',
      linkText: 'Help Center →',
    },
  ];

  return (
    <section className={styles.docs}>
      <div className={styles.container}>
        <Reveal className={styles.header}>
          <h1 className={styles.title}>Documentation</h1>
          <p className={styles.subtitle}>
            Everything you need to set up, manage, and scale secure online exams with ProctoredLink.
          </p>

          <div className={styles.searchHint}>
            <span className={styles.searchIcon}>⌘</span>
            <span>Search documentation… (coming soon)</span>
          </div>
        </Reveal>

        <Stagger className={styles.grid} staggerChildren={0.06}>
          {docCategories.map((category, index) => (
            <StaggerItem key={index} className={styles.card}>
              <div className={styles.iconWrapper}>
                <span className={styles.icon}>{category.icon}</span>
              </div>
              <h3 className={styles.cardTitle}>{category.title}</h3>
              <p className={styles.cardDescription}>{category.description}</p>
              <a href="#" className={styles.cardLink}>
                {category.linkText}
              </a>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal className={styles.footerCta}>
          <h3 className={styles.ctaTitle}>Need help getting started?</h3>
          <p className={styles.ctaText}>
            Our support team is ready to guide you through setup, best practices, or custom configurations.
          </p>
          <div className={styles.ctaButtons}>
            <button className={styles.btnPrimary}>Contact Support</button>
            <button className={styles.btnOutline}>Book a Demo</button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}