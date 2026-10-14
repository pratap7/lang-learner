# PRIVACY POLICY (DRAFT FOR LEGAL COUNSEL REVIEW)

**Effective Date:** October 14, 2026  
**Last Updated:** October 14, 2026  
**Platform:** Deutsch Pfad (https://deutschpfad.com)  
**Operator / Data Controller:** Deutsch Pfad Inc. / GmbH (in formation)  
**Data Protection Contact:** privacy@deutschpfad.com  

---

> **LEGAL NOTICE TO COUNSEL:**  
> This draft Privacy Policy is structured for compliance with the European Union General Data Protection Regulation (EU GDPR / UK GDPR), California Consumer Privacy Act as amended by the CPRA (CCPA/CPRA), and international privacy frameworks. Please review and tailor corporate entity details, jurisdictional dispute provisions, and Data Protection Officer (DPO) designations prior to formal publication.

---

## 1. Introduction & Overview

Deutsch Pfad ("we", "us", or "our") operates the Deutsch Pfad German learning platform, mobile applications, and web services. We believe that learning a language requires trust. We practice strict **data minimization** (Article 5(1)(c) GDPR): we collect only the minimum personal data required to deliver personalized CEFR German education, save learning progress, evaluate speaking and writing submissions, and process subscription transactions.

We do **not** sell student data, we do **not** participate in cross-context behavioral ad networks, and we never train public artificial intelligence models on student writing or audio recordings.

---

## 2. Legal Bases for Processing (GDPR Article 6)

We process personal data only when an applicable legal ground under GDPR Article 6 exists:

1. **Contractual Performance (Art. 6(1)(b) GDPR):** Processing required to create and manage your learner profile, evaluate exercises, track CEFR level advancement, synchronize spaced repetition flashcards, and administer subscription access.
2. **Explicit Consent (Art. 6(1)(a) & Art. 9(2)(a) GDPR):** Required for optional audio recording retention (beyond immediate ephemeral evaluation) and non-essential analytical cookies.
3. **Legitimate Interests (Art. 6(1)(f) GDPR):** Maintaining platform security, defending against automated denial-of-service or prompt injection attacks, preventing payment fraud, and ensuring service reliability.
4. **Legal Compliance (Art. 6(1)(c) GDPR):** Retaining accounting, VAT/GST, and payment audit logs to comply with statutory fiscal obligations.

---

## 3. Categories of Personal Data Collected

| Category | Specific Data Elements | Purpose | Lawful Basis |
| :--- | :--- | :--- | :--- |
| **Identity & Account** | Email address, name, authentication credentials, avatar URL | User account creation, authentication, profile display | Contractual necessity |
| **Curriculum & Progress** | CEFR target (A1–C2), daily study minutes, lesson completion, quiz answers, spaced repetition flashcard history, streak counts, XP | Personalizing course roadmaps, calculating optimal spaced intervals | Contractual necessity |
| **Writing Submissions** | German essay texts, CEFR exam simulation letters, correction diffs, grammar mistake tags | AI and algorithmic writing feedback, Goethe/telc grading rubric evaluation | Contractual necessity |
| **Voice & Speech Data** | Audio recordings of pronunciation attempts and AI conversation sessions | Real-time speech-to-text transcription, phoneme scoring, conversational German dialogue | Ephemeral processing: Contractual necessity; Optional 30-day retention: Explicit consent |
| **Billing & Payments** | Transaction timestamps, currency, plan tier (Free/Pro/Pro Plus), obfuscated payment reference IDs, VAT region *(Full credit card numbers are handled exclusively by PCI-DSS Level 1 processors)* | Subscription management, trial enforcement, statutory tax compliance | Contractual necessity & Legal obligation |
| **Technical & Security** | Obfuscated IP address, browser user-agent, rate-limiting counters, security audit logs | Preventing brute force attacks, CSRF defense, rate-limiting API endpoints | Legitimate interests |

---

## 4. Voice Recording Retention & Privacy Rules

Pronunciation practice and interactive dialogue sessions are subject to strict privacy rules:

- **Strict Privacy Default (Ephemeral RAM Processing):** When you speak during an exercise, the audio buffer is processed in volatile memory for real-time transcription and pronunciation scoring. Once feedback is rendered, the audio data is **immediately purged** from server memory and never committed to persistent storage.
- **Optional Opt-In Retention (30-Day History):** If and only if you explicitly enable "Retain Pronunciation Recordings" in your Privacy Settings or Consent Banner, audio files are stored in an encrypted private bucket for **30 calendar days** so you can review your speaking progress. Recordings are automatically deleted upon expiration.
- **Right to Instant Revocation:** You may revoke voice retention consent at any time from your Account Settings. All stored voice recordings will be queued for immediate permanent deletion.

---

## 5. Artificial Intelligence & Subprocessors

Deutsch Pfad integrates select third-party artificial intelligence inference APIs (e.g., OpenAI API, Google Gemini API) to evaluate writing submissions and generate conversational dialogue responses.

- **Zero-Data Retention & Anti-Training Commitments:** We execute Data Processing Agreements (DPAs) with enterprise API providers ensuring that student inputs and prompt contexts sent via our server-side API keys are **never used to train or fine-tune public foundation models**.
- **Server-Side API Key Isolation:** Third-party AI API keys reside exclusively on our hardened server environments and are never exposed to client browsers.
- **Prompt Sandboxing:** Student inputs are enclosed within rigid XML verification boundaries to protect against prompt injection, jailbreaks, and unauthorized data leakage.

### List of Authorized Subprocessors

- **Supabase Inc.** (Database, Authentication, Storage - Frankfurt/EU or AWS region)
- **OpenAI, LLC** (Inference API for Goethe rubric grading - zero-training agreement)
- **Google Cloud / Gemini** (Dialogue inference - enterprise zero-training agreement)
- **Stripe, Inc. / Razorpay Payments** (PCI-DSS compliant payment processing and merchant-of-record services)

---

## 6. Cookies and Consent Mechanism

We utilize a granular, GDPR-compliant consent manager:

- **Essential Cookies (Always Active):** Encrypted session tokens, security nonces, CSRF protection, and load balancing state.
- **Optional Analytics:** Aggregated latency, error tracking, and feature utilization. Disabled by default until you click "Accept All" or toggle in "Customize Preferences".
- You can review or adjust your cookie preferences at any time via the Privacy tab in Account Settings.

---

## 7. Your Rights Under GDPR (Articles 15–22)

Regardless of your geographic location, Deutsch Pfad extends full European GDPR rights to all registered learners:

1. **Right of Access (Article 15):** Request confirmation of whether your personal data is processed and receive a full copy.
2. **Right to Rectification (Article 16):** Update inaccurate or incomplete personal information directly in your profile settings.
3. **Right to Erasure / "Right to be Forgotten" (Article 17):** Request permanent erasure of your account and all associated progress data via the "Delete Account & Purge All Data" tool in Settings or by contacting privacy@deutschpfad.com.
4. **Right to Data Portability (Article 20):** Export your entire curriculum history, vocabulary flashcards, test answers, and writing feedback in machine-readable JSON format via the "Export JSON Archive" tool in Settings.
5. **Right to Restriction of Processing (Article 18):** Restrict processing under specified legal conditions.
6. **Right to Object (Article 21):** Object at any time to processing predicated upon legitimate interests.
7. **Right to Lodge a Complaint:** You possess the statutory right to lodge a complaint with a competent supervisory authority in your EU Member State of habitual residence, place of work, or place of the alleged infringement.

---

## 8. International Data Transfers

When personal data is transferred outside the European Economic Area (EEA), we ensure adequate safeguards are implemented pursuant to Chapter V of the GDPR, including executing the European Commission's Standard Contractual Clauses (SCCs) and verifying adequacy decisions.

---

## 9. Children's Privacy

Deutsch Pfad is not directed to individuals under the age of 16 (or the applicable digital consent age in your jurisdiction). We do not knowingly collect personal data from minors without verified parental consent. If we become aware of unauthorized data collection from a minor, we will immediately purge the record.

---

## 10. Contact Information

For inquiries, data access requests, or to exercise your GDPR rights:

**Data Protection Officer / Privacy Officer**  
Deutsch Pfad  
Email: privacy@deutschpfad.com  
Postal: Deutsch Pfad Legal Department, Friedrichstraße 100, 10117 Berlin, Germany
