import React from "react";
import LegalLayout from "./LegalLayout";

const TermsOfService = () => (
  <LegalLayout title="Terms of Service" lastUpdated="April 25, 2026">
    <p>
      These Terms of Service (&quot;Terms&quot;) govern your access to and use of Enrollify, a
      platform for creators to host paid webinars and manage enrollments. By using Enrollify,
      you agree to these Terms.
    </p>

    <h2>1. Eligibility</h2>
    <p>
      You must be at least 18 years old and able to form a binding contract under applicable
      law. By creating an account, you confirm that the information you provide is accurate.
    </p>

    <h2>2. Your Account</h2>
    <ul>
      <li>You are responsible for activity under your account and for keeping your password secure.</li>
      <li>One person or entity per account.</li>
      <li>Notify us immediately of any unauthorized access.</li>
    </ul>

    <h2>3. The Service</h2>
    <p>
      Enrollify provides webinar hosting infrastructure, enrollment pages, payment processing
      via Razorpay/Stripe, real-time analytics, and email/WhatsApp communication tools. The
      service is provided &quot;as is&quot; with reasonable effort to maintain uptime.
    </p>

    <h2>4. Acceptable Use</h2>
    <p>You agree NOT to:</p>
    <ul>
      <li>Sell illegal, harmful, deceptive, or infringing content.</li>
      <li>Spam, harass, or impersonate others.</li>
      <li>Reverse engineer, scrape, or abuse our APIs beyond fair use.</li>
      <li>Upload malware or attempt to compromise platform security.</li>
      <li>Resell Enrollify access without written permission.</li>
    </ul>
    <p>We may suspend or terminate accounts that violate these rules.</p>

    <h2>5. Content Ownership</h2>
    <p>
      You retain ownership of webinar content you upload. You grant Enrollify a worldwide,
      royalty-free license to host, display, and deliver that content to your enrollees solely
      to operate the service.
    </p>

    <h2>6. Payments and Fees</h2>
    <ul>
      <li>Enrollify takes a platform fee on transactions, disclosed in your dashboard before checkout.</li>
      <li>Payment processor fees (Razorpay, Stripe) apply separately as charged by those providers.</li>
      <li>You are responsible for taxes (GST, income tax) on revenue you earn through Enrollify.</li>
      <li>Payouts to your linked bank account follow the schedule shown in the dashboard.</li>
    </ul>

    <h2>7. Subscriptions</h2>
    <p>
      Paid plans renew automatically until canceled. Cancel anytime from the dashboard;
      cancellation takes effect at the end of the current billing period.
    </p>

    <h2>8. Refunds</h2>
    <p>
      Refunds are governed by our <a href="/refund-policy">Refund Policy</a>.
    </p>

    <h2>9. Termination</h2>
    <p>
      You may close your account anytime. We may suspend or terminate accounts for violations,
      non-payment, prolonged inactivity, or to comply with the law. On termination, you may
      lose access to content; we&apos;ll provide a reasonable export window where feasible.
    </p>

    <h2>10. Disclaimers</h2>
    <p>
      Enrollify is provided without warranties of any kind. We do not guarantee uninterrupted
      service, error-free operation, or specific revenue results.
    </p>

    <h2>11. Limitation of Liability</h2>
    <p>
      To the maximum extent permitted by law, Enrollify&apos;s aggregate liability for any
      claim arising out of or relating to the service is limited to the amount you paid
      Enrollify in the 12 months preceding the claim.
    </p>

    <h2>12. Indemnity</h2>
    <p>
      You agree to indemnify Enrollify against claims arising from your content, your use of
      the service, or your violation of these Terms.
    </p>

    <h2>13. Governing Law</h2>
    <p>
      These Terms are governed by the laws of India. Disputes will be resolved in the courts
      of Surat, Gujarat, unless required otherwise by applicable consumer law.
    </p>

    <h2>14. Changes</h2>
    <p>
      We may update these Terms. Material changes will be notified by email or in-app banner
      at least 14 days before they take effect.
    </p>

    <h2>15. Contact</h2>
    <div className="info-card">
      <p className="contact-label">Legal</p>
      <p>legal@enrollify.xyz</p>
    </div>
  </LegalLayout>
);

export default TermsOfService;
