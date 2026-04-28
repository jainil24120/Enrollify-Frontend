import React from "react";

// Custom illustrations for the "Launch in 4 Simple Steps" section.
// These replace the generic stock PNGs (webinar/card/social/graph) with
// SVG mockups that match the brand palette and the synthetic-mock style
// used in CreatorJourney. Each one tells the step's story in a single glance.

// ------- Shared gradient defs (rendered once) -------
export const IllustrationDefs = () => (
  <svg width="0" height="0" style={{ position: "absolute" }}>
    <defs>
      <linearGradient id="wfGradPrimary" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#6366F1" />
        <stop offset="100%" stopColor="#8B5CF6" />
      </linearGradient>
      <linearGradient id="wfGradAccent" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#F97365" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
      <linearGradient id="wfGradInk" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1F2452" />
        <stop offset="100%" stopColor="#0F1535" />
      </linearGradient>
    </defs>
  </svg>
);

/* ================= STEP 1: Create your webinar ================= */
export const CreateIllustration = () => (
  <svg viewBox="0 0 320 200" className="wf-illu" role="img" aria-label="Create your webinar">
    {/* Card background */}
    <rect x="20" y="20" width="280" height="160" rx="16" fill="#fff" stroke="#EEF0F6" strokeWidth="1.5" />
    {/* Top window dots */}
    <circle cx="38" cy="38" r="3.5" fill="#F97365" />
    <circle cx="50" cy="38" r="3.5" fill="#F59E0B" />
    <circle cx="62" cy="38" r="3.5" fill="#22C55E" />

    {/* Mic / live badge */}
    <g transform="translate(36, 60)">
      <rect width="44" height="44" rx="12" fill="url(#wfGradPrimary)" opacity="0.12" />
      <path
        d="M22 12c-3 0-5.5 2.5-5.5 5.5v5C16.5 25.5 19 28 22 28s5.5-2.5 5.5-5.5v-5C27.5 14.5 25 12 22 12zm0 18c-4.4 0-8-3.6-8-8h2c0 3.3 2.7 6 6 6s6-2.7 6-6h2c0 4.4-3.6 8-8 8zm-1 4h2v3h-2z"
        fill="#4F46E5"
      />
    </g>

    {/* Title placeholder */}
    <rect x="92" y="66" width="170" height="10" rx="4" fill="#1F2452" />
    <rect x="92" y="84" width="120" height="6" rx="3" fill="#E5E7EB" />

    {/* Field rows */}
    <rect x="36" y="120" width="248" height="14" rx="6" fill="#FAFAFE" stroke="#EEF0F6" />
    <rect x="44" y="125" width="60" height="4" rx="2" fill="#9CA3AF" />
    <rect x="44" y="124" width="0" height="0" />

    <rect x="36" y="142" width="160" height="14" rx="6" fill="#FAFAFE" stroke="#EEF0F6" />
    <rect x="44" y="147" width="80" height="4" rx="2" fill="#9CA3AF" />

    {/* Publish button */}
    <rect x="206" y="142" width="78" height="14" rx="7" fill="url(#wfGradPrimary)" />
    <text x="245" y="152" fontSize="7" fontWeight="700" fill="#fff" textAnchor="middle">PUBLISH</text>
  </svg>
);

/* ================= STEP 2: Set pricing & plans ================= */
export const PricingIllustration = () => (
  <svg viewBox="0 0 320 200" className="wf-illu" role="img" aria-label="Set pricing and plans">
    {/* Three pricing cards, middle one elevated */}
    {/* Card 1 */}
    <g>
      <rect x="20" y="44" width="86" height="120" rx="14" fill="#fff" stroke="#EEF0F6" strokeWidth="1.5" />
      <rect x="32" y="58" width="34" height="6" rx="3" fill="#9CA3AF" />
      <text x="63" y="92" fontSize="20" fontWeight="800" fill="#0F1535" textAnchor="middle">₹699</text>
      <rect x="32" y="106" width="62" height="3" rx="1.5" fill="#E5E7EB" />
      <rect x="32" y="116" width="48" height="3" rx="1.5" fill="#E5E7EB" />
      <rect x="32" y="126" width="56" height="3" rx="1.5" fill="#E5E7EB" />
      <rect x="32" y="142" width="62" height="14" rx="7" fill="#FAFAFE" stroke="#E5E7EB" />
    </g>

    {/* Card 2 (featured) */}
    <g>
      <rect x="116" y="28" width="88" height="148" rx="16" fill="url(#wfGradPrimary)" />
      <rect x="138" y="38" width="44" height="14" rx="7" fill="rgba(255,255,255,0.22)" />
      <text x="160" y="48" fontSize="6.5" fontWeight="700" fill="#fff" textAnchor="middle">POPULAR</text>
      <rect x="130" y="62" width="36" height="6" rx="3" fill="rgba(255,255,255,0.65)" />
      <text x="160" y="98" fontSize="22" fontWeight="800" fill="#fff" textAnchor="middle">₹1,499</text>
      <rect x="130" y="114" width="64" height="3" rx="1.5" fill="rgba(255,255,255,0.5)" />
      <rect x="130" y="124" width="52" height="3" rx="1.5" fill="rgba(255,255,255,0.5)" />
      <rect x="130" y="134" width="58" height="3" rx="1.5" fill="rgba(255,255,255,0.5)" />
      <rect x="130" y="150" width="60" height="14" rx="7" fill="#fff" />
      <text x="160" y="160" fontSize="6.5" fontWeight="700" fill="#4F46E5" textAnchor="middle">CHOOSE</text>
    </g>

    {/* Card 3 */}
    <g>
      <rect x="214" y="44" width="86" height="120" rx="14" fill="#fff" stroke="#EEF0F6" strokeWidth="1.5" />
      <rect x="226" y="58" width="34" height="6" rx="3" fill="#9CA3AF" />
      <text x="257" y="92" fontSize="20" fontWeight="800" fill="#0F1535" textAnchor="middle">₹1,999</text>
      <rect x="226" y="106" width="62" height="3" rx="1.5" fill="#E5E7EB" />
      <rect x="226" y="116" width="48" height="3" rx="1.5" fill="#E5E7EB" />
      <rect x="226" y="126" width="56" height="3" rx="1.5" fill="#E5E7EB" />
      <rect x="226" y="142" width="62" height="14" rx="7" fill="#FAFAFE" stroke="#E5E7EB" />
    </g>
  </svg>
);

/* ================= STEP 3: Promote smartly ================= */
// Self-contained on a single white card so the connecting lines and channel
// pills stay visible regardless of the parent step's background color
// (this card sits inside the indigo "accent" step). Pills use icon-only
// circles so labels never overflow.
export const PromoteIllustration = () => (
  <svg viewBox="0 0 320 200" className="wf-illu" role="img" aria-label="Share and promote">
    {/* Outer white card — keeps everything on a neutral surface */}
    <rect x="12" y="14" width="296" height="172" rx="18" fill="#fff" stroke="#EEF0F6" strokeWidth="1.5" />

    {/* Central share-link plate */}
    <rect x="78" y="78" width="164" height="44" rx="11" fill="#FAFAFE" stroke="#E5E7EB" strokeWidth="1.2" />
    <circle cx="98" cy="100" r="11" fill="url(#wfGradPrimary)" opacity="0.18" />
    <path d="M95 96.5 L102 100 L95 103.5 Z" fill="#4F46E5" />
    <rect x="116" y="92" width="108" height="7" rx="3" fill="#1F2452" />
    <rect x="116" y="105" width="68" height="4" rx="2" fill="#9CA3AF" />

    {/* Connecting curves — soft indigo with low opacity reads on any bg */}
    <g stroke="#A5B4FC" strokeWidth="1.6" strokeDasharray="4 5" fill="none" strokeLinecap="round" opacity="0.85">
      {/* to top-left WhatsApp */}
      <path d="M82 90 C 68 80, 60 60, 60 56" />
      {/* to bottom-left Instagram */}
      <path d="M82 110 C 66 122, 60 138, 60 144" />
      {/* to top-right Email */}
      <path d="M238 90 C 252 80, 260 60, 260 56" />
      {/* to bottom-right SMS */}
      <path d="M238 110 C 254 122, 260 138, 260 144" />
    </g>

    {/* Channel circles — icon only, no text, so they never overflow */}
    {/* WhatsApp */}
    <g>
      <circle cx="60" cy="50" r="20" fill="#fff" stroke="#22C55E" strokeWidth="1.6" />
      <path
        d="M60 40c-5.5 0-10 4.5-10 10 0 1.6.4 3.1 1 4.4l-1.1 4 4.1-1.1c1.3.7 2.7 1 4 1 5.5 0 10-4.5 10-10S65.5 40 60 40zm5.7 13.4c-.2.5-1.2 1-1.7 1-.4 0-1 .1-1.6-.1-1.5-.5-3-1.7-4.1-3.2-.5-.7-.9-1.4-1.1-2.1-.2-.6-.1-1.1.1-1.5.1-.3.6-.6.9-.6h.4c.3 0 .4.1.6.4.2.4.7 1.5.8 1.6.1.1.1.2 0 .4-.1.1-.1.2-.2.3l-.4.5c-.1.1-.2.2-.1.4.1.2.5.9 1.2 1.5.8.7 1.5 1 1.7 1.1.2.1.4.1.5-.1.1-.1.6-.7.7-.9.1-.2.3-.2.5-.1.2.1 1.4.7 1.6.8.2.1.4.2.4.3 0 .1 0 .5-.2.9z"
        fill="#22C55E"
      />
    </g>
    {/* Instagram */}
    <g>
      <circle cx="60" cy="150" r="20" fill="#fff" stroke="#BE185D" strokeWidth="1.6" />
      <rect x="52" y="142" width="16" height="16" rx="4.5" fill="none" stroke="#BE185D" strokeWidth="1.6" />
      <circle cx="60" cy="150" r="3.6" fill="none" stroke="#BE185D" strokeWidth="1.6" />
      <circle cx="65.2" cy="144.5" r="1" fill="#BE185D" />
    </g>
    {/* Email */}
    <g>
      <circle cx="260" cy="50" r="20" fill="#fff" stroke="#F97365" strokeWidth="1.6" />
      <rect x="251" y="44" width="18" height="12" rx="2" fill="none" stroke="#F97365" strokeWidth="1.6" />
      <path d="M251 45.5 L260 51.5 L269 45.5" fill="none" stroke="#F97365" strokeWidth="1.6" strokeLinejoin="round" />
    </g>
    {/* SMS */}
    <g>
      <circle cx="260" cy="150" r="20" fill="#fff" stroke="#6366F1" strokeWidth="1.6" />
      <path
        d="M251 145 h14 a3 3 0 0 1 3 3 v6 a3 3 0 0 1 -3 3 h-9 l-5 4 z"
        fill="none"
        stroke="#6366F1"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="256" cy="151" r="1" fill="#6366F1" />
      <circle cx="260" cy="151" r="1" fill="#6366F1" />
      <circle cx="264" cy="151" r="1" fill="#6366F1" />
    </g>

    {/* Tiny labels under each circle — small enough to never overflow */}
    <text x="60" y="79" fontSize="6.5" fontWeight="700" fill="#15803D" textAnchor="middle" letterSpacing="0.5">WHATSAPP</text>
    <text x="60" y="179" fontSize="6.5" fontWeight="700" fill="#BE185D" textAnchor="middle" letterSpacing="0.5">INSTAGRAM</text>
    <text x="260" y="79" fontSize="6.5" fontWeight="700" fill="#C2410C" textAnchor="middle" letterSpacing="0.5">EMAIL</text>
    <text x="260" y="179" fontSize="6.5" fontWeight="700" fill="#4F46E5" textAnchor="middle" letterSpacing="0.5">SMS</text>
  </svg>
);

/* ================= STEP 4: Track & scale revenue ================= */
export const TrackIllustration = () => (
  <svg viewBox="0 0 320 200" className="wf-illu" role="img" aria-label="Track and scale revenue">
    {/* Dashboard card */}
    <rect x="20" y="22" width="280" height="156" rx="16" fill="#fff" stroke="#EEF0F6" strokeWidth="1.5" />

    {/* Header rows */}
    <rect x="36" y="38" width="100" height="8" rx="4" fill="#1F2452" />
    <rect x="36" y="52" width="50" height="5" rx="2.5" fill="#9CA3AF" />

    {/* Up-trend pill */}
    <rect x="234" y="34" width="50" height="20" rx="10" fill="#DCFCE7" />
    <path d="M242 47 L246 42 L250 45 L256 39" fill="none" stroke="#15803D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <text x="268" y="48" fontSize="8" fontWeight="700" fill="#15803D" textAnchor="middle">UP</text>

    {/* KPI badges */}
    <g>
      <rect x="36" y="74" width="76" height="34" rx="10" fill="#FAFAFE" stroke="#EEF0F6" />
      <rect x="44" y="80" width="32" height="4" rx="2" fill="#9CA3AF" />
      <rect x="44" y="92" width="44" height="8" rx="3" fill="url(#wfGradPrimary)" />
    </g>
    <g>
      <rect x="122" y="74" width="76" height="34" rx="10" fill="#FAFAFE" stroke="#EEF0F6" />
      <rect x="130" y="80" width="32" height="4" rx="2" fill="#9CA3AF" />
      <rect x="130" y="92" width="38" height="8" rx="3" fill="url(#wfGradAccent)" />
    </g>
    <g>
      <rect x="208" y="74" width="76" height="34" rx="10" fill="#FAFAFE" stroke="#EEF0F6" />
      <rect x="216" y="80" width="32" height="4" rx="2" fill="#9CA3AF" />
      <rect x="216" y="92" width="42" height="8" rx="3" fill="#1F2452" />
    </g>

    {/* Chart area fill */}
    <path
      d="M36 158 L36 144 L72 130 L108 134 L144 116 L180 110 L216 96 L252 88 L284 70 L284 158 Z"
      fill="url(#wfGradPrimary)"
      opacity="0.18"
    />
    {/* Chart line */}
    <path
      d="M36 144 L72 130 L108 134 L144 116 L180 110 L216 96 L252 88 L284 70"
      fill="none"
      stroke="url(#wfGradPrimary)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Latest dot */}
    <circle cx="284" cy="70" r="4" fill="#F97365" />
    <circle cx="284" cy="70" r="8" fill="#F97365" opacity="0.18" />
  </svg>
);

// Export an indexed array for the workflow section to consume by step index.
export const STEP_ILLUSTRATIONS = [
  CreateIllustration,
  PricingIllustration,
  PromoteIllustration,
  TrackIllustration,
];
