import React from "react";
import LegalLayout from "./LegalLayout";

const RefundPolicy = () => (
  <LegalLayout title="Refund Policy" lastUpdated="April 25, 2026">
    <p>
      We want every creator on Enrollify to feel good about what they&apos;re paying for. This
      policy covers refunds for Enrollify subscription plans and platform fees only. Refunds
      for individual webinars are handled by the creator who hosted them.
    </p>

    <h2>1. Subscription Plans</h2>
    <ul>
      <li>
        <strong>14-day money-back guarantee</strong> on your first paid subscription. Email
        <a href="mailto:billing@enrollify.xyz"> billing@enrollify.xyz</a> within 14 days of
        your first charge for a full refund.
      </li>
      <li>
        <strong>Monthly plans</strong> are non-refundable after the 14-day window. You may
        cancel anytime; access continues until the end of the billing period.
      </li>
      <li>
        <strong>Annual plans</strong> can be refunded pro-rata for unused full months within
        30 days of payment, less the platform fee.
      </li>
    </ul>

    <h2>2. Platform Transaction Fees</h2>
    <p>
      Platform fees on enrollment transactions are non-refundable once the enrollment is
      completed and the webinar has started. If a webinar is canceled by the creator before it
      begins, both the creator&apos;s payout and the platform fee are reversed.
    </p>

    <h2>3. Enrollee (Student) Refunds</h2>
    <p>
      If you purchased a webinar from a creator on Enrollify and want a refund:
    </p>
    <ol>
      <li>Contact the creator directly through the email shown on their webinar page.</li>
      <li>Each creator sets their own refund terms; check those before purchasing.</li>
      <li>If the creator does not respond within 7 days, email <a href="mailto:disputes@enrollify.xyz">disputes@enrollify.xyz</a> and we&apos;ll mediate.</li>
    </ol>

    <h2>4. Failed Payments</h2>
    <p>
      If a payment was charged but the enrollment wasn&apos;t recorded, email <a href="mailto:billing@enrollify.xyz">billing@enrollify.xyz</a> with your transaction ID.
      We reconcile and refund within 5 business days.
    </p>

    <h2>5. How Refunds Are Processed</h2>
    <p>
      Approved refunds return to the original payment method via Razorpay or Stripe. UPI and
      net banking refunds typically settle in 3-5 business days; cards may take 7-10 business
      days depending on the issuing bank.
    </p>

    <h2>6. Chargebacks</h2>
    <p>
      Please contact us before filing a chargeback. Resolving disputes directly is faster and
      keeps your payment method in good standing.
    </p>

    <h2>7. Contact</h2>
    <div className="info-card">
      <p className="contact-label">Billing & Refunds</p>
      <p>billing@enrollify.xyz</p>
    </div>
  </LegalLayout>
);

export default RefundPolicy;
