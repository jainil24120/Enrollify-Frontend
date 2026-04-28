import React from "react";
import LegalLayout from "./LegalLayout";

const Contact = () => (
  <LegalLayout title="Contact Us">
    <p>
      We read every message. Pick the inbox that matches your question and you&apos;ll get a
      faster reply.
    </p>

    <div className="contact-grid">
      <div className="info-card">
        <p className="contact-label">General</p>
        <p><a href="mailto:hello@enrollify.xyz">hello@enrollify.xyz</a></p>
        <p>Response time: within 24 hours on business days.</p>
      </div>

      <div className="info-card">
        <p className="contact-label">Support</p>
        <p><a href="mailto:support@enrollify.xyz">support@enrollify.xyz</a></p>
        <p>Account, login, webinar setup, payouts.</p>
      </div>

      <div className="info-card">
        <p className="contact-label">Billing</p>
        <p><a href="mailto:billing@enrollify.xyz">billing@enrollify.xyz</a></p>
        <p>Invoices, refunds, subscription changes.</p>
      </div>

      <div className="info-card">
        <p className="contact-label">Security</p>
        <p><a href="mailto:security@enrollify.xyz">security@enrollify.xyz</a></p>
        <p>Vulnerability disclosure and security questions.</p>
      </div>

      <div className="info-card">
        <p className="contact-label">Press & Partnerships</p>
        <p><a href="mailto:partnerships@enrollify.xyz">partnerships@enrollify.xyz</a></p>
      </div>

      <div className="info-card">
        <p className="contact-label">Office</p>
        <p>Surat, Gujarat, India</p>
        <p>Mon-Fri, 10:00-18:00 IST</p>
      </div>
    </div>

    <h2>Business correspondence</h2>
    <p>
      For legal notices and physical mail, please email <a href="mailto:legal@enrollify.xyz">legal@enrollify.xyz</a> first
      so we can confirm the postal address currently on file.
    </p>
  </LegalLayout>
);

export default Contact;
