import React, { Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTemplateComponent } from "./templates/templateRegistry";

// Dummy webinar data for preview
const DUMMY_DATA = {
  _id: "preview",
  title: "Master AI: Build Real-World Apps with ChatGPT & Python",
  subtitle: "From Zero to Deploying AI-Powered Products in 90 Minutes",
  description: "Learn how to build production-ready AI applications using ChatGPT API, LangChain, and Python. This hands-on masterclass covers prompt engineering, RAG (Retrieval Augmented Generation), building AI chatbots, and deploying them live.\n\nPerfect for developers, entrepreneurs, and tech enthusiasts who want to stay ahead in the AI revolution. Whether you're a complete beginner or an experienced developer, this session will give you practical, actionable skills you can use immediately.",
  categories: ["Technology", "Business"],
  webinarDateTime: new Date(Date.now() + 7 * 86400000).toISOString(),
  durationMinutes: 90,
  language: "English",
  maxSeats: 500,
  price: 199,
  originalPrice: 999,
  registrationDeadline: new Date(Date.now() + 6 * 86400000).toISOString(),
  bannerImage: "",
  meetingLink: "https://meet.google.com/abc-defg-hij",
  speakerName: "Arjun Verma",
  speakerBio: "Senior AI Engineer at Google with 8+ years in Machine Learning. TEDx Speaker. Built AI products used by 2M+ users. Mentor at Y Combinator & Google for Startups. Previously led AI teams at Microsoft and Amazon.",
  speakerImage: "https://i.pravatar.cc/400?img=12",
  speakerSocials: {
    instagram: "https://instagram.com/arjunverma.ai",
    youtube: "https://youtube.com/@arjunvermaAI",
    linkedin: "https://linkedin.com/in/arjunverma",
    twitter: "https://twitter.com/arjunverma_ai",
    website: "https://arjunverma.dev",
  },
  learningOutcomes: [
    "Master ChatGPT API integration with Python",
    "Build a RAG-powered AI chatbot from scratch",
    "Understand prompt engineering techniques used by top companies",
    "Deploy an AI app live on Vercel in under 10 minutes",
    "Learn to monetize AI skills as a freelancer or startup founder",
  ],
  targetAudience: [
    "Software developers wanting to add AI to their stack",
    "Entrepreneurs looking to build AI-powered products",
    "Students exploring career opportunities in AI/ML",
    "Freelancers wanting to offer AI development services",
  ],
  agenda: [
    { time: "7:00 PM", topic: "Welcome & AI Landscape 2026" },
    { time: "7:15 PM", topic: "ChatGPT API Deep Dive + Live Coding" },
    { time: "7:35 PM", topic: "Building a RAG Chatbot with LangChain" },
    { time: "7:55 PM", topic: "Prompt Engineering Secrets" },
    { time: "8:10 PM", topic: "Live Deployment on Vercel" },
    { time: "8:20 PM", topic: "Monetization Strategies + Q&A" },
  ],
  faqs: [
    { question: "Do I need coding experience?", answer: "Basic Python knowledge is helpful but not required. We explain everything step by step with live examples." },
    { question: "Will I get a recording?", answer: "Yes! All registered participants get lifetime access to the full recording and code samples." },
    { question: "What tools do I need?", answer: "Just a laptop with internet. We use free-tier APIs and tools for everything in this session." },
    { question: "Is there a certificate?", answer: "Yes, all participants who attend the full session receive a verified completion certificate." },
  ],
  testimonials: [
    { name: "Neha Kapoor", role: "Software Engineer", text: "Arjun's masterclass changed my career. I built my first AI product within a week and landed a 3x salary AI role at a top startup.", image: "https://i.pravatar.cc/100?img=45" },
    { name: "Rohit Sharma", role: "Startup Founder", text: "Best ₹199 I ever spent. The RAG chatbot tutorial alone saved me ₹50K in development costs. Highly recommended!", image: "https://i.pravatar.cc/100?img=33" },
    { name: "Priya Menon", role: "Freelancer", text: "I now charge ₹25K per AI integration project. This masterclass paid for itself 100x over. The practical approach is what makes it special.", image: "https://i.pravatar.cc/100?img=30" },
  ],
  trustLogos: ["Google", "Microsoft", "Amazon", "Flipkart", "Razorpay"],
  ctaText: "Reserve My Spot Now",
  bonusText: "FREE: AI Prompt Engineering Cheat Sheet (50+ Templates) included!",
  registrationCount: 347,
};

function TemplatePreview() {
  const { templateKey } = useParams();
  const navigate = useNavigate();

  const TemplateComponent = getTemplateComponent(templateKey || "classic");

  const handleRegister = () => {
    alert("This is a preview. Registration is disabled.");
  };

  return (
    <div>
      {/* Preview Banner */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999,
        background: "#6574e9", color: "white", padding: "10px 20px",
        display: "flex", justifyContent: "center", alignItems: "center", gap: "20px",
        fontSize: "0.88rem", fontWeight: "600",
        boxShadow: "0 4px 12px rgba(101,116,233,0.3)",
      }}>
        <span>Preview Mode — Template: <strong>{templateKey || "classic"}</strong></span>
        <div style={{ display: "flex", gap: "8px" }}>
          {["classic", "modern", "bold"].map((key) => (
            <button
              key={key}
              onClick={() => navigate(`/preview/${key}`)}
              style={{
                padding: "5px 14px", borderRadius: "6px", border: "none", cursor: "pointer",
                fontWeight: "600", fontSize: "0.78rem", textTransform: "capitalize",
                background: templateKey === key ? "white" : "rgba(255,255,255,0.2)",
                color: templateKey === key ? "#6574e9" : "white",
              }}
            >
              {key}
            </button>
          ))}
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          style={{ padding: "5px 14px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.4)", background: "none", color: "white", cursor: "pointer", fontWeight: "500", fontSize: "0.78rem" }}
        >
          Exit Preview
        </button>
      </div>

      {/* Add top padding to account for fixed banner */}
      <div style={{ paddingTop: "44px" }}>
        <Suspense fallback={<div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>Loading template...</div>}>
          <TemplateComponent data={DUMMY_DATA} onRegister={handleRegister} />
        </Suspense>
      </div>
    </div>
  );
}

export default TemplatePreview;
