import { lazy } from "react";

const TemplateClassic = lazy(() => import("./TemplateClassic"));
const TemplateModern = lazy(() => import("./TemplateModern"));
const TemplateBold = lazy(() => import("./TemplateBold"));

// ============================================
// DEVELOPER: Jab nayi template banao, yahan add karo
// 1. Import karo (lazy)
// 2. TEMPLATE_REGISTRY mein key + component add karo
// 3. AVAILABLE_TEMPLATES mein metadata add karo
// 4. Code deploy karo
// 5. Admin Dashboard mein auto-dikhega!
// ============================================

const TEMPLATE_REGISTRY = {
  classic: TemplateClassic,
  modern: TemplateModern,
  bold: TemplateBold,
};

// This list tells admin which templates exist in code
// Admin panel reads this to show "Register Template" options
export const AVAILABLE_TEMPLATES = [
  { key: "classic", name: "Classic", description: "Clean, professional layout with hero section and speaker showcase" },
  { key: "modern", name: "Modern Dark", description: "Dark luxury theme with split-screen hero and glassmorphism cards" },
  { key: "bold", name: "Bold", description: "Bold editorial style with warm gradients and large typography" },
  
];

export const getTemplateComponent = (key) => {
  return TEMPLATE_REGISTRY[key] || TEMPLATE_REGISTRY.classic;
};

// Returns all template keys available in code
export const getAvailableKeys = () => Object.keys(TEMPLATE_REGISTRY);

export default TEMPLATE_REGISTRY;
