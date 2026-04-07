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

const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  /* Nav scroll tracking */
  useEffect(() => {
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".nav-links a");
    const handleScroll = () => {
      let current = "";
      sections.forEach((s) => { if (window.scrollY >= s.offsetTop - 120) current = s.getAttribute("id"); });
      navLinks.forEach((l) => { l.classList.remove("active"); if (l.getAttribute("href") === `#${current}`) l.classList.add("active"); });
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* GSAP animations */
  useEffect(() => {
    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        // Hero
        gsap.fromTo(".hero-title", { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power4.out" });
        gsap.fromTo(".hero-sub", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, delay: 0.25, ease: "power3.out" });
        gsap.fromTo(".hero-ctas", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, delay: 0.45, ease: "power3.out" });
        gsap.fromTo(".hero-visual", { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.2, delay: 0.2, ease: "elastic.out(1,0.6)" });

        // Decorative shapes
        gsap.utils.toArray(".deco-shape").forEach((shape) => {
          gsap.to(shape, {
            y: -30, rotation: "+=15",
            scrollTrigger: { trigger: shape, start: "top bottom", end: "bottom top", scrub: 1.5 },
          });
        });

        // Scroll reveals
        const reveal = (sel, stag = 0.1) => {
          gsap.utils.toArray(sel).forEach((el, i) => {
            gsap.fromTo(el, { y: 40, opacity: 0 }, {
              y: 0, opacity: 1, duration: 0.65, delay: i * stag, ease: "power3.out",
              scrollTrigger: { trigger: el, start: "top 93%", toggleActions: "play none none none" },
            });
          });
        };

        reveal(".sec-head");
        reveal(".brand-logo", 0.06);
        reveal(".about-row", 0.12);
        reveal(".wf-step", 0.1);
        reveal(".feature-card", 0.07);
        reveal(".stat-item", 0.08);
        reveal(".testimonial-card", 0.1);
        reveal(".faq-item", 0.06);
        reveal(".pricing-card", 0.1);
      });
      ctxRef.current = ctx;
    }, 150);
    const ctxRef = { current: null };
    return () => { clearTimeout(timer); if (ctxRef.current) ctxRef.current.revert(); };
  }, []);

  return (
    <div className="landing-v3">

      {/* ===== NAVBAR ===== */}
      <nav className="nav3">
        <div className="logo3">
          <div className="logo-mark3">E</div>
          <span>Enrollify</span>
        </div>
        <ul className={`nav-links3 ${mobileMenu ? "open" : ""}`}>
          {["Home", "About", "How It Works", "Features", "Pricing"].map((item) => (
            <li key={item}><a href={`#${item.toLowerCase().replace(/ /g, "")}`} onClick={() => setMobileMenu(false)}>{item}</a></li>
          ))}
          <li className="mob-cta"><button className="btn-primary3" onClick={() => { setMobileMenu(false); navigate("/signup"); }}>Get Started &rarr;</button></li>
        </ul>
        <div className="nav-right3">
          <button className="btn-ghost3" onClick={() => navigate("/signup")}>Log in</button>
          <button className="btn-primary3 desk-only" onClick={() => navigate("/signup")}>Try for free</button>
          <button className="hamburger3" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Menu">
            <span className={`hl ${mobileMenu ? "x" : ""}`} /><span className={`hl ${mobileMenu ? "x" : ""}`} /><span className={`hl ${mobileMenu ? "x" : ""}`} />
          </button>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="hero3" id="home">
        {/* Decorative shapes */}
        <div className="deco-shape ds-1"></div>
        <div className="deco-shape ds-2"></div>
        <div className="deco-shape ds-3"></div>

        <div className="hero-inner3">
          <div className="hero-text3">
            <div className="hero-chip">
              <span className="chip-dot"></span>
              Platform for 10,000+ creators
            </div>
            <h1 className="hero-title">
              Turn your expertise<br />into a <span className="gradient-text">revenue engine</span>
            </h1>
            <p className="hero-sub">
              Create stunning webinars, set flexible pricing, and grow your audience with real-time analytics — all from one premium platform.
            </p>
            <div className="hero-ctas">
              <button className="btn-primary3 btn-lg" onClick={() => navigate("/signup")}>Start Free Trial &rarr;</button>
              <button className="btn-outline3 btn-lg" onClick={() => document.getElementById("howitworks")?.scrollIntoView({ behavior: "smooth" })}>See How It Works</button>
            </div>
            <div className="hero-proof">
              <div className="avatar-stack">
                {[11, 14, 18, 22, 26].map((n) => (
                  <img key={n} src={`https://i.pravatar.cc/80?img=${n}`} alt="" />
                ))}
              </div>
              <div>
                <strong>4.9/5</strong> from 2,400+ creators
              </div>
            </div>
          </div>

          <div className="hero-visual">
            {/* 3D blob + floating UI cards */}
            <div className="blob-wrap">
              <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} intensity={1} color="#a2aef7" />
                <pointLight position={[-5, -5, -5]} intensity={0.5} color="#6574e9" />
                <Suspense fallback={null}><FloatingBlob /></Suspense>
              </Canvas>
            </div>

            <div className="hero-mockup">
              <video
                className="hero-video"
                src={demoVideo}
                autoPlay
                loop
                muted
                playsInline
              />
            </div>

            <div className="float-card3 fc3-1">
              <div className="fc3-dot fc3-green"></div>
              <span>+127% Revenue</span>
            </div>
            <div className="float-card3 fc3-2">
              <div className="fc3-dot fc3-blue"></div>
              <span>1,240 Enrollments</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BRAND LOGOS ===== */}
      <section className="brands3">
        <p className="brands-label">Trusted by creators from</p>
        <div className="brands-row">
          {["Google", "Microsoft", "Meta", "Amazon", "Flipkart", "Razorpay"].map((brand) => (
            <div className="brand-logo" key={brand}>
              {/* PROMPT: "Logo of {brand} in grayscale, minimal, on transparent background" */}
              <span>{brand}</span>
            </div>
          ))}
        </div>
      </section>

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
            { icon: "💸", problem: "Monetization Is Complicated", solution: "Flexible pricing — subscriptions, one-time, tiers. Zero hidden fees." },
            { icon: "🔒", problem: "Content Gets Pirated", solution: "OTP-based authentication ensures only verified users access your content." },
            { icon: "😩", problem: "Poor User Experience", solution: "Modern, conversion-optimized UI that makes your brand look premium." },
          ].map((r, i) => (
            <div className="about-row" key={i}>
              <div className="about-icon">{r.icon}</div>
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

      {/* ===== FEATURES ===== */}
      <section className="features3" id="features">
        <div className="deco-shape ds-6"></div>
        <div className="sec-head">
          <span className="sec-chip">Features</span>
          <h2>Everything You Need to <span className="gradient-text">Succeed</span></h2>
          <p>Powerful tools built for modern creators</p>
        </div>

        <div className="feat-grid3">
          {[
            { emoji: "🎯", title: "Smart Targeting", desc: "AI-driven audience targeting connects your webinar with the right learners at the right time.", big: true },
            { emoji: "📊", title: "Real-Time Analytics", desc: "Monitor revenue, conversions, and engagement as they happen." },
            { emoji: "🔐", title: "Secure Access", desc: "OTP-verified enrollment keeps your premium content protected." },
            { emoji: "💰", title: "Flexible Pricing", desc: "Subscriptions, bundles, one-time — set any pricing model you want.", big: true },
            { emoji: "🤝", title: "Affiliate System", desc: "Let others promote your webinars and boost your reach." },
            { emoji: "✨", title: "Stunning Pages", desc: "Auto-generated, conversion-optimized landing pages for every webinar." },
          ].map((f, i) => (
            <div className={`feature-card ${f.big ? "feat-wide" : ""}`} key={i}>
              <div className="feat-emoji">{f.emoji}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== BIG STATS ===== */}
      <section className="stats3">
        <div className="deco-shape ds-7"></div>
        <div className="stats-inner">
          {[
            { val: "10,000+", label: "Active Creators" },
            { val: "50,000+", label: "Webinars Hosted" },
            { val: "₹2.5 Cr+", label: "Creator Earnings" },
            { val: "98%", label: "Satisfaction Rate" },
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
          <h2>Loved by <span className="gradient-text">Top Creators</span></h2>
          <p>See what real creators are saying</p>
        </div>

        <div className="test-grid3">
          {[
            { img: "https://i.pravatar.cc/100?img=30", name: "Billie Alice", role: "Course Creator", quote: "Enrollify completely changed how I monetize. Revenue doubled in 3 months. The analytics alone are worth every penny." },
            { img: "https://i.pravatar.cc/100?img=45", name: "Ananya Mehta", role: "Tech Educator", quote: "The dashboard is insanely powerful and easy to use. My students love the clean enrollment flow. Premium experience." },
            { img: "https://i.pravatar.cc/100?img=12", name: "Vikram Patel", role: "Business Coach", quote: "I've tried 5+ platforms — Enrollify is the one I'm sticking with. Secure access, beautiful UI, incredible support." },
            { img: "https://i.pravatar.cc/100?img=33", name: "Priya Sharma", role: "Fitness Instructor", quote: "Setting up my first paid webinar took 10 minutes. The Razorpay integration is seamless. Already earned ₹80K in month one!" },
          ].map((t, i) => (
            <div className="testimonial-card" key={i}>
              <div className="tc-stars">★★★★★</div>
              <p>&ldquo;{t.quote}&rdquo;</p>
              <div className="tc-author">
                <img src={t.img} alt={t.name} />
                <div><strong>{t.name}</strong><span>{t.role}</span></div>
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
            { q: "Is there a free trial?", a: "Yes! Start with a 14-day free trial on any plan. No credit card required." },
            { q: "What payment methods do you support?", a: "We support Razorpay (UPI, cards, net banking) and Stripe for international payments." },
            { q: "Can I use my own domain?", a: "Yes — on the Elite plan, you can connect your custom domain for a fully branded experience." },
            { q: "How do payouts work?", a: "Payouts are processed directly to your bank account or UPI. Settlement happens within 2-3 business days." },
            { q: "Is my content secure?", a: "Absolutely. We use OTP-based verification, encrypted access, and session management to protect your premium content." },
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
              <div className="pc-price"><span className="pc-curr">₹</span><span className="pc-amt">{plan.price}</span><span className="pc-per">/mo</span></div>
              <div className="pc-divider"></div>
              <ul>
                {plan.features.map((f, j) => (
                  <li key={j}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>{f}</li>
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
          <p>Join 10,000+ creators who trust Enrollify to grow their business.</p>
          <div className="cta-btns3">
            <button className="btn-primary3 btn-lg" onClick={() => navigate("/signup")}>Start Free Trial &rarr;</button>
            <button className="btn-outline3 btn-lg" onClick={() => navigate("/signup")}>Book a Demo</button>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="footer3">
        <div className="footer-inner3">
          <div className="f-col3">
            <div className="f-logo"><div className="logo-mark3">E</div><span>Enrollify</span></div>
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
            <div className="f-subscribe"><input type="email" placeholder="your@email.com" /><button>Join</button></div>
          </div>
        </div>
        <div className="f-bottom3"><p>&copy; 2026 Enrollify. All rights reserved.</p></div>
      </footer>
    </div>
  );
};

export default LandingPage;
