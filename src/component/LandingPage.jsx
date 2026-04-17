import "./LandingPage.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, Suspense } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import demoVideo from "../assets/enrollify-demo.mp4";
import webinarImg from "../assets/webinar.png";
import cardImg from "../assets/card.png";
import socialImg from "../assets/social.png";
import graphImg from "../assets/graph.png";
import logoImg from "../assets/Logo.jpeg";

gsap.registerPlugin(ScrollTrigger);

/* ===== 3D Blob ===== */
const FloatingBlob = () => {
  const meshRef = useRef();
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.3) * 0.2;
      meshRef.current.rotation.y = clock.elapsedTime * 0.15;
    }
  });
  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={1.5}>
      <mesh ref={meshRef} scale={2.2}>
        <icosahedronGeometry args={[1, 8]} />
        <MeshDistortMaterial color="#6574e9" emissive="#a2aef7" emissiveIntensity={0.3} roughness={0.3} metalness={0.7} distort={0.4} speed={2} transparent opacity={0.9} />
      </mesh>
    </Float>
  );
};

/* ===== Inline icons ===== */
const Icon = ({ name }) => {
  const common = { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "wallet":
      return <svg {...common}><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>;
    case "shield":
      return <svg {...common}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg>;
    case "sparkle":
      return <svg {...common}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></svg>;
    case "target":
      return <svg {...common}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>;
    case "chart":
      return <svg {...common}><path d="M3 3v18h18"/><path d="m7 15 4-4 4 4 5-6"/></svg>;
    case "lock":
      return <svg {...common}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>;
    case "tag":
      return <svg {...common}><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z"/><circle cx="8" cy="8" r="1.5"/></svg>;
    case "users":
      return <svg {...common}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    case "layout":
      return <svg {...common}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>;
    case "play":
      return <svg {...common} fill="currentColor" stroke="none"><path d="M8 5v14l11-7z"/></svg>;
    default:
      return null;
  }
};

/* ===== Honest testimonial initials ===== */
const initialsFor = (name) => name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
const bgFor = (seed) => {
  const palette = ["#6574e9", "#7c8ff0", "#4ade80", "#f59e0b", "#ec4899", "#14b8a6"];
  return palette[seed % palette.length];
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const rootRef = useRef(null);

  /* Nav scroll tracking */
  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-links3 a");
    const handleScroll = () => {
      let current = "";
      sections.forEach((s) => {
        if (window.scrollY >= s.offsetTop - 120) current = s.getAttribute("id");
      });
      navLinks.forEach((l) => {
        l.classList.remove("active");
        if (l.getAttribute("href") === `#${current}`) l.classList.add("active");
      });
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* GSAP animations — scoped to rootRef, proper cleanup */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".hero-title", { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power4.out" });
      gsap.fromTo(".hero-sub", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: "power3.out" });
      gsap.fromTo(".hero-ctas", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, delay: 0.4, ease: "power3.out" });
      gsap.fromTo(".hero-visual", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 0.3, ease: "power3.out" });

      gsap.utils.toArray(".deco-shape").forEach((shape) => {
        gsap.to(shape, {
          y: -30,
          rotation: "+=10",
          scrollTrigger: { trigger: shape, start: "top bottom", end: "bottom top", scrub: 1.5 },
        });
      });

      const reveal = (sel, stag = 0.08) => {
        gsap.utils.toArray(sel).forEach((el, i) => {
          gsap.fromTo(
            el,
            { y: 40, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.65,
              delay: i * stag,
              ease: "power3.out",
              scrollTrigger: { trigger: el, start: "top 93%", toggleActions: "play none none none" },
            }
          );
        });
      };

      reveal(".sec-head");
      reveal(".stack-chip", 0.05);
      reveal(".about-row", 0.1);
      reveal(".wf-step", 0.1);
      reveal(".feature-card", 0.07);
      reveal(".stat-item", 0.08);
      reveal(".testimonial-card", 0.1);
      reveal(".faq-item", 0.05);
      reveal(".pricing-card", 0.1);
    }, rootRef);

    return () => ctx.revert();
  }, []);

  const testimonials = [
    { name: "Billie Alice", role: "Course Creator", quote: "Enrollify changed how I monetize. Setup is fast and the analytics are sharp." },
    { name: "Ananya Mehta", role: "Tech Educator", quote: "The dashboard is powerful and easy to use. My students love the clean enrollment flow." },
    { name: "Vikram Patel", role: "Business Coach", quote: "I've tried a few platforms — Enrollify is the one I'm sticking with. Secure and beautiful." },
    { name: "Priya Sharma", role: "Fitness Instructor", quote: "Setting up my first paid webinar took 10 minutes. The Razorpay integration is seamless." },
  ];

  return (
    <div className="landing-v3" ref={rootRef}>

      {/* ===== NAVBAR ===== */}
      <nav className="nav3">
        <div className="logo3">
          <img src={logoImg} alt="Enrollify" className="logo-img3" />
          <span>Enrollify</span>
        </div>
        <ul className={`nav-links3 ${mobileMenu ? "open" : ""}`}>
          {["Home", "About", "How It Works", "Features", "Pricing"].map((item) => (
            <li key={item}>
              <a href={`#${item.toLowerCase().replace(/ /g, "")}`} onClick={() => setMobileMenu(false)}>{item}</a>
            </li>
          ))}
          <li className="mob-cta">
            <button className="btn-primary3" onClick={() => { setMobileMenu(false); navigate("/signin"); }}>
              Get Started &rarr;
            </button>
          </li>
        </ul>
        <div className="nav-right3">
          <button className="btn-ghost3" onClick={() => navigate("/signin")}>Log in</button>
          <button className="btn-primary3 desk-only" onClick={() => navigate("/signin")}>Try for free</button>
          <button className="hamburger3" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Menu">
            <span className={`hl ${mobileMenu ? "x" : ""}`} />
            <span className={`hl ${mobileMenu ? "x" : ""}`} />
            <span className={`hl ${mobileMenu ? "x" : ""}`} />
          </button>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="hero3" id="home">
        <div className="deco-shape ds-1"></div>
        <div className="deco-shape ds-2"></div>

        <div className="hero-inner3">
          <div className="hero-text3">
            <div className="hero-chip">
              <span className="chip-dot"></span>
              Built for independent creators & educators
            </div>
            <h1 className="hero-title">
              Turn your expertise<br />into a <span className="gradient-text">revenue engine</span>
            </h1>
            <p className="hero-sub">
              Create paid webinars, collect payments, and manage enrollments from a single dashboard.
              Razorpay and Stripe built in. No code, no hassle.
            </p>
            <div className="hero-ctas">
              <button className="btn-primary3 btn-lg" onClick={() => navigate("/signin")}>Start Free Trial &rarr;</button>
              <button className="btn-outline3 btn-lg" onClick={() => document.getElementById("howitworks")?.scrollIntoView({ behavior: "smooth" })}>
                <Icon name="play" /> See How It Works
              </button>
            </div>
            <div className="hero-proof">
              <div className="proof-bullets">
                <span><Icon name="shield" /> OTP-verified access</span>
                <span><Icon name="wallet" /> Razorpay & Stripe</span>
                <span><Icon name="chart" /> Real-time analytics</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="blob-wrap">
              <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} intensity={1} color="#a2aef7" />
                <pointLight position={[-5, -5, -5]} intensity={0.5} color="#6574e9" />
                <Suspense fallback={null}><FloatingBlob /></Suspense>
              </Canvas>
            </div>

            <div className="hero-mockup">
              <div className="mockup-bar">
                <span></span><span></span><span></span>
                <div className="mockup-url">enrollify.app/dashboard</div>
              </div>
              <video className="hero-video" src={demoVideo} autoPlay loop muted playsInline />
            </div>

            <div className="float-card3 fc3-1">
              <div className="fc3-icon"><Icon name="chart" /></div>
              <div>
                <strong>Live revenue</strong>
                <span>Tracked per webinar</span>
              </div>
            </div>
            <div className="float-card3 fc3-2">
              <div className="fc3-icon"><Icon name="users" /></div>
              <div>
                <strong>Enrollments</strong>
                <span>Verified via OTP</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* tech stack section removed */}

      {/* ===== ABOUT ===== */}
      <section className="about3" id="about">
        <div className="deco-shape ds-4"></div>
        <div className="sec-head">
          <span className="sec-chip">Why Enrollify</span>
          <h2>Real Problems. <span className="gradient-text">Real Solutions.</span></h2>
          <p>What holds creators back — and how we fix it</p>
        </div>

        <div className="about-grid3">
          {[
            { icon: "tag", problem: "Monetization Is Complicated", solution: "Flexible pricing — subscriptions, one-time, tiers. Zero hidden fees." },
            { icon: "lock", problem: "Content Gets Pirated", solution: "OTP-based authentication ensures only verified users access your content." },
            { icon: "sparkle", problem: "Poor User Experience", solution: "Modern, conversion-optimized UI that makes your brand look premium." },
          ].map((r, i) => (
            <div className="about-row" key={i}>
              <div className="about-icon"><Icon name={r.icon} /></div>
              <div className="about-body">
                <h3>{r.problem}</h3>
                <p>{r.solution}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="workflow3" id="howitworks">
        <div className="deco-shape ds-5"></div>
        <div className="sec-head">
          <span className="sec-chip">How It Works</span>
          <h2>Launch in <span className="gradient-text">4 Simple Steps</span></h2>
          <p>From idea to income in minutes, not months</p>
        </div>

        <div className="wf-grid3">
          {[
            { num: "01", title: "Create Your Webinar", desc: "Set up content, upload a banner, add speaker details and design your premium learning experience.", img: webinarImg },
            { num: "02", title: "Set Pricing & Plans", desc: "Choose free, paid, subscriptions or tier models — complete pricing freedom with Razorpay & Stripe.", img: cardImg },
            { num: "03", title: "Promote Smartly", desc: "Share your branded link, embed on your site, or use smart targeting to reach the right audience.", img: socialImg },
            { num: "04", title: "Track & Scale Revenue", desc: "Real-time analytics dashboard with revenue, conversions, and audience insights to scale confidently.", img: graphImg },
          ].map((step, i) => (
            <div className={`wf-step wf-${i % 2 === 0 ? "light" : "accent"}`} key={step.num}>
              <div className="wf-num-badge">{step.num}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
              <div className="wf-img-wrap">
                <img src={step.img} alt={step.title} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FEATURES (bento) ===== */}
      <section className="features3" id="features">
        <div className="deco-shape ds-6"></div>
        <div className="sec-head">
          <span className="sec-chip">Features</span>
          <h2>Everything You Need to <span className="gradient-text">Succeed</span></h2>
          <p>Powerful tools built for modern creators</p>
        </div>

        <div className="feat-grid3">
          {[
            { icon: "target", title: "Smart Targeting", desc: "AI-driven audience targeting connects your webinar with the right learners at the right time.", big: true },
            { icon: "chart", title: "Real-Time Analytics", desc: "Monitor revenue, conversions, and engagement as they happen." },
            { icon: "shield", title: "Secure Access", desc: "OTP-verified enrollment keeps your premium content protected." },
            { icon: "tag", title: "Flexible Pricing", desc: "Subscriptions, bundles, one-time — set any pricing model you want.", big: true },
            { icon: "users", title: "Affiliate System", desc: "Let others promote your webinars and boost your reach." },
            { icon: "layout", title: "Stunning Pages", desc: "Auto-generated, conversion-optimized landing pages for every webinar." },
          ].map((f, i) => (
            <div className={`feature-card ${f.big ? "feat-wide" : ""}`} key={i}>
              <div className="feat-icon"><Icon name={f.icon} /></div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== VALUE STRIP (replaces fake stats) ===== */}
      <section className="stats3">
        <div className="deco-shape ds-7"></div>
        <div className="stats-inner">
          {[
            { val: "2 min", label: "Time to launch your first webinar" },
            { val: "0%", label: "Hidden fees or lock-in" },
            { val: "2–3 day", label: "Payouts to your bank" },
            { val: "24/7", label: "Creator support" },
          ].map((s, i) => (
            <div className="stat-item" key={i}>
              <strong>{s.val}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="test3">
        <div className="sec-head">
          <span className="sec-chip">Testimonials</span>
          <h2>Loved by <span className="gradient-text">Early Creators</span></h2>
          <p>Direct feedback from our first wave of users</p>
        </div>

        <div className="test-grid3">
          {testimonials.map((t, i) => (
            <div className="testimonial-card" key={i}>
              <div className="tc-stars">★★★★★</div>
              <p>&ldquo;{t.quote}&rdquo;</p>
              <div className="tc-author">
                <div className="tc-avatar" style={{ background: bgFor(i) }}>{initialsFor(t.name)}</div>
                <div>
                  <strong>{t.name}</strong>
                  <span>{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="faq3" id="faq">
        <div className="sec-head">
          <span className="sec-chip">FAQ</span>
          <h2>Got Questions? <span className="gradient-text">We&apos;ve Got Answers</span></h2>
        </div>
        <div className="faq-list">
          {[
            { q: "Is there a free trial?", a: "Yes. Start with a 14-day free trial on any plan. No credit card required." },
            { q: "What payment methods do you support?", a: "Razorpay (UPI, cards, net banking) and Stripe for international payments." },
            { q: "Can I use my own domain?", a: "Yes — on the Elite plan, connect a custom domain for a fully branded experience." },
            { q: "How do payouts work?", a: "Payouts go directly to your bank or UPI. Settlement in 2–3 business days." },
            { q: "Is my content secure?", a: "OTP-based verification, encrypted access, and session management protect your premium content." },
            { q: "Can I cancel anytime?", a: "Yes, cancel anytime from your dashboard. No lock-in contracts, no cancellation fees." },
          ].map((faq, i) => (
            <div className={`faq-item ${openFaq === i ? "faq-open" : ""}`} key={i} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <div className="faq-q">
                <span>{faq.q}</span>
                <div className="faq-toggle">{openFaq === i ? "−" : "+"}</div>
              </div>
              {openFaq === i && <p className="faq-a">{faq.a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section className="pricing3" id="pricing">
        <div className="deco-shape ds-8"></div>
        <div className="sec-head">
          <span className="sec-chip">Pricing</span>
          <h2>Simple Pricing. <span className="gradient-text">Real Value.</span></h2>
          <p>No hidden fees. Cancel anytime. Start free.</p>
        </div>

        <div className="price-grid3">
          {[
            { name: "Basic", price: "699", desc: "For creators getting started", features: ["1 Active Webinar", "Enrollify Subdomain", "Basic Landing Page", "Email Reminders", "Razorpay Integration", "8% Transaction Fee", "Standard Support"] },
            { name: "Growth", price: "1,499", desc: "Most popular for growing creators", featured: true, features: ["5 Active Webinars", "Advanced Page Builder", "Email + WhatsApp Automation", "Razorpay & Stripe", "Analytics Dashboard", "Meta Pixel Tracking", "5% Transaction Fee", "Priority Support"] },
            { name: "Elite", price: "1,999", desc: "For serious creator businesses", features: ["Unlimited Webinars", "Custom Domain", "Advanced Revenue Analytics", "Conversion Tracking", "Affiliate System", "API Access", "2% Transaction Fee", "Dedicated Support"] },
          ].map((plan, i) => (
            <div className={`pricing-card ${plan.featured ? "pc-featured" : ""}`} key={i}>
              {plan.featured && <div className="pc-badge">Most Popular</div>}
              <h3>{plan.name}</h3>
              <p className="pc-desc">{plan.desc}</p>
              <div className="pc-price">
                <span className="pc-curr">₹</span>
                <span className="pc-amt">{plan.price}</span>
                <span className="pc-per">/mo</span>
              </div>
              <div className="pc-divider"></div>
              <ul>
                {plan.features.map((f, j) => (
                  <li key={j}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button className={plan.featured ? "btn-primary3 btn-full" : "btn-outline3 btn-full"}>
                {plan.featured ? "Get Started" : `Choose ${plan.name}`} &rarr;
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="cta3">
        <div className="deco-shape ds-9"></div>
        <div className="deco-shape ds-10"></div>
        <div className="cta-inner3">
          <h2>Ready to turn your knowledge into revenue?</h2>
          <p>Launch your first paid webinar today — free for 14 days, no card required.</p>
          <div className="cta-btns3">
            <button className="btn-primary3 btn-lg" onClick={() => navigate("/signin")}>Start Free Trial &rarr;</button>
            <button className="btn-outline3 btn-lg" onClick={() => navigate("/signin")}>Book a Demo</button>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="footer3">
        <div className="footer-inner3">
          <div className="f-col3">
            <div className="f-logo">
              <img src={logoImg} alt="Enrollify" className="logo-img3" />
              <span>Enrollify</span>
            </div>
            <p>The premium platform for creators who are serious about growing their webinar business.</p>
          </div>
          <div className="f-col3">
            <h4>Product</h4>
            <ul><li><a href="#home">Home</a></li><li><a href="#features">Features</a></li><li><a href="#pricing">Pricing</a></li><li><a href="#faq">FAQ</a></li></ul>
          </div>
          <div className="f-col3">
            <h4>Company</h4>
            <ul><li><a href="#">About Us</a></li><li><a href="#">Contact</a></li><li><a href="#">Careers</a></li></ul>
          </div>
          <div className="f-col3">
            <h4>Legal</h4>
            <ul><li><a href="#">Privacy Policy</a></li><li><a href="#">Terms of Service</a></li><li><a href="#">Refund Policy</a></li></ul>
          </div>
          <div className="f-col3">
            <h4>Stay Updated</h4>
            <div className="f-subscribe">
              <input type="email" placeholder="your@email.com" />
              <button>Join</button>
            </div>
          </div>
        </div>
        <div className="f-bottom3"><p>&copy; 2026 Enrollify. All rights reserved.</p></div>
      </footer>
    </div>
  );
};

export default LandingPage;
