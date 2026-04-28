import React from "react";
import LegalLayout from "./LegalLayout";

const PrivacyPolicy = () => (
  <LegalLayout title="Privacy Policy" lastUpdated="April 25, 2026">
    <p>
      Enrollify (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting
      your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard
      your information when you use our platform at enrollify.xyz and related services.
    </p>

    <h2>1. Information We Collect</h2>
    <h3>Information You Provide</h3>
    <ul>
      <li><strong>Account information:</strong> name, email, phone number, password (hashed).</li>
      <li><strong>Profile information:</strong> profile photo, bio, business details, social links.</li>
      <li><strong>Payment information:</strong> processed securely by Razorpay and Stripe. We do not store your full card numbers.</li>
      <li><strong>Webinar and enrollment data:</strong> webinar titles, descriptions, schedules, enrollee details.</li>
      <li><strong>Support communications:</strong> any messages you send to our support team.</li>
    </ul>

    <h3>Information Collected Automatically</h3>
    <ul>
      <li>Device, browser, and operating system data.</li>
      <li>IP address and approximate location.</li>
      <li>Usage data: pages viewed, features used, session duration.</li>
      <li>Cookies and similar technologies (see Cookies below).</li>
    </ul>

    <h2>2. How We Use Your Information</h2>
    <ul>
      <li>Provide, operate, and maintain the Enrollify service.</li>
      <li>Process payments and payouts.</li>
      <li>Send transactional emails (account, payment, security).</li>
      <li>Send product updates and marketing emails (you can opt out anytime).</li>
      <li>Detect and prevent fraud, abuse, and security issues.</li>
      <li>Comply with legal and regulatory obligations.</li>
    </ul>

    <h2>3. How We Share Your Information</h2>
    <p>We do not sell your personal data. We share it only with:</p>
    <ul>
      <li><strong>Payment processors</strong> (Razorpay, Stripe) to process transactions.</li>
      <li><strong>Infrastructure providers</strong> (hosting, email, analytics) bound by data-processing agreements.</li>
      <li><strong>Legal authorities</strong> when required by law, subpoena, or to protect rights and safety.</li>
      <li><strong>Business transfers:</strong> if Enrollify is acquired or merged, your data may transfer to the successor.</li>
    </ul>

    <h2>4. Cookies</h2>
    <p>
      We use cookies and local storage to keep you signed in, remember your preferences, and
      measure usage. You can disable cookies in your browser, but parts of Enrollify may stop
      working.
    </p>

    <h2>5. Data Security</h2>
    <p>
      We use HTTPS, encrypted password storage (bcrypt), and access controls. No system is
      perfectly secure. Report suspected vulnerabilities to <a href="mailto:security@enrollify.xyz">security@enrollify.xyz</a>.
    </p>

    <h2>6. Your Rights</h2>
    <p>You can:</p>
    <ul>
      <li>Access, correct, or delete your account data from the dashboard.</li>
      <li>Export your enrollment data on request.</li>
      <li>Withdraw consent for marketing emails.</li>
      <li>Lodge a complaint with your local data protection authority.</li>
    </ul>

    <h2>7. Data Retention</h2>
    <p>
      We retain account data while your account is active and for up to 7 years after closure
      to meet tax and accounting obligations. Aggregated, anonymized data may be retained
      indefinitely.
    </p>

    <h2>8. Children&apos;s Privacy</h2>
    <p>
      Enrollify is not directed to anyone under 18. We do not knowingly collect data from
      minors. Contact us if you believe we have.
    </p>

    <h2>9. International Transfers</h2>
    <p>
      Enrollify is operated from India. Using our service means your data may be processed
      outside your country.
    </p>

    <h2>10. Changes to This Policy</h2>
    <p>
      We may update this policy. Material changes will be notified by email or in-app banner.
      The &quot;Last updated&quot; date above reflects the latest revision.
    </p>

    <h2>11. Contact</h2>
    <div className="info-card">
      <p className="contact-label">Data Protection</p>
      <p>privacy@enrollify.xyz</p>
    </div>
  </LegalLayout>
);

export default PrivacyPolicy;
