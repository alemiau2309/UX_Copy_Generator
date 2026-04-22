import React, { useState, useEffect } from "react";
/* ─── Design tokens ─── */
const C = {
  bg: "#fafafa",
  surface: "#ffffff",
  surfaceHover: "#f0f0f0",
  surface2: "#f0f0f0",
  border: "rgba(0,0,0,0.08)",
  borderMid: "rgba(0,0,0,0.13)",
  accent: "#1a1a1a",
  accentDim: "rgba(26,26,26,0.06)",
  accentGlow: "rgba(26,26,26,0.04)",
  error: "#c0392b",
  errorDim: "rgba(192,57,43,0.08)",
  success: "#2d6a4f",
  successDim: "rgba(45,106,79,0.09)",
  warning: "#92400e",
  warningDim: "rgba(146,64,14,0.08)",
  heading: "#111111",
  body: "#3d3d3d",
  secondary: "#6b6b6b",
  tertiary: "#8a8a8a",
  subtle: "#aaaaaa",
  indigo: "#3730a3",
  indigoDim: "rgba(55,48,163,0.07)",
};

const DISPLAY = "'Hanken Grotesk', 'DM Sans', sans-serif";
const SPLASH = "'Schibsted Grotesk', 'Hanken Grotesk', sans-serif";
const SANS = "'DM Sans', 'Inter', system-ui, sans-serif";
const MONO = "'IBM Plex Mono', 'JetBrains Mono', monospace";

/* ─── Industry presets ─── */
const PRESETS = {
  fintech: {
    label: "Fintech",
    text: `Voice: Confident, clear, warm. Knowledgeable friend — never robotic, never condescending.

Tone shifts:
- Success: Celebratory but not over the top.
- Neutral: Calm and informative.
- Errors: Honest and reassuring — lead with safety, never blame the user.

Rules:
- Use contractions. Use second person ("you/your").
- No jargon. No exclamation marks in errors.
- Never use "Oops," "Uh oh," or "Whoops" when money is involved.
- Always include a next step.
- Currency: symbol + 2 decimal places ($50.00).
- Dates written out (February 20, 2026).

Error framework: Severity (is money safe?) + Cause (why?) + Action (what now?)

Confirmation must include: amount, recipient, timestamp, reference number, next step.

Preferred terms:
- "Send money" not "remit"
- "Balance" not "available funds"
- "Account" not "wallet"`,
  },
  healthcare: {
    label: "Healthcare",
    text: `Voice: Empathetic, professional, reassuring. Treat users as partners in their health.

Tone shifts:
- Positive: Warm, not patronizing.
- Neutral: Clear and informative.
- Sensitive: Compassionate and private — never minimize or dramatize.

Rules:
- Plain language always.
- Specific actions ("Call your doctor" > "Seek medical attention").
- Never diagnose or suggest diagnoses.
- Clarify urgent vs. can-wait situations.
- Privacy is paramount — never reference conditions in notifications.
- Include timezone for appointments.
- Inclusive of all bodies, abilities, and identities.

Preferred terms:
- "Healthcare provider" not "doctor"
- "Appointment" not "visit"
- "Your care team" not "our staff"`,
  },
  b2b: {
    label: "B2B SaaS",
    text: `Voice: Smart, direct, human. Respect users' time — every word earns its place.

Tone shifts:
- Positive: Brief and encouraging.
- Neutral: Functional.
- Negative: Honest and solution-oriented.

Rules:
- Lead with the action.
- Sentence case for all UI text.
- Button labels: 1–3 words.
- Errors: what happened + what to do. Skip the apology.
- Empty states: show value + how to start.
- Avoid "please" in repeated UI patterns.
- No marketing language in product UI.
- Consistent terminology across all surfaces.

Preferred terms:
- "Workspace" not "account"
- "Team members" not "users"`,
  },
  ecommerce: {
    label: "E-commerce",
    text: `Voice: Friendly, trustworthy, action-oriented. Shopping feels easy and safe.

Tone shifts:
- Browsing: Inviting.
- Checkout: Clear and reassuring.
- Post-purchase: Celebratory but informative.
- Problems: Empathetic and solution-focused.

Rules:
- Show total cost before the final action.
- Specific shipping estimates ("Arrives Feb 18–20" not "3–5 business days").
- Checkout errors must reassure about payment security.
- Lead with benefits, then specs.
- Action verb CTAs.
- Empty cart: show value, not guilt.
- Returns language: easy, not punitive.

Preferred terms:
- "Bag" or "Cart" — pick one and be consistent
- "Free shipping" not "complimentary shipping"
- "Arrives" not "estimated delivery"`,
  },
};

const SYSTEM_STATES = [
  "Error Message", "Empty State", "Loading State", "Success/Confirmation",
  "Permission Request", "Push Notification", "Onboarding Step", "CTA/Button",
  "Modal/Dialog", "Tooltip/Helper",
];

const COPY_TYPES = [
  ...SYSTEM_STATES,
  "Disclosure/Legal", "Verification Step", "Upgrade/Paywall", "Feedback Request",
];

const PLATFORM_TYPES = ["Push Notification", "Permission Request"];

const PLATFORM_SPECS = {
  ios: {
    label: "iOS",
    notification: { title: 50, body: 100 },
    permission: { title: 50, body: 100 },
    note: "Follows Apple HIG. Title truncates at ~50 chars, body at ~100 chars (2 lines). No inline CTA.",
  },
  android: {
    label: "Android",
    notification: { title: 65, body: 240 },
    permission: { title: 60, body: 200 },
    note: "Follows Material Design. Title up to 65 chars, expanded body up to 240 chars. Action buttons optional.",
  },
};

/* ─── API helpers ─── */
const AUDIT_SYSTEM = (guidelines) => `You are a UX copy auditor. You evaluate interface copy against UX writing best practices and, when provided, the user's content guidelines.

EVALUATION CRITERIA BY STATE TYPE:
- Error Message: Uses Severity + Cause + Action framework. Tells user what happened, why, and what to do. No blame language. No "Oops/Uh oh/Whoops" for serious contexts.
- Empty State: Communicates value, not absence. Includes clear action to get started. Not guilt-tripping.
- Loading State: Sets expectations. Specific when possible ("Loading your transactions" > "Loading...").
- Success/Confirmation: Passes the "screenshot test" — could a user take a screenshot and know exactly what happened? Includes relevant details.
- Permission Request: Explains why the permission is needed and what happens if denied. Specific benefit.
- Push Notification: Title is bold and scannable (max 6 words). Body adds context (max 15 words). No inline CTA. Respects platform character limits.
- Onboarding Step: Progressive disclosure. One concept per step. Clear progress.
- CTA/Button: Action verb. 1-3 words ideal. Clear outcome.
- Modal/Dialog: Clear title. Explains consequence. Primary/secondary actions obvious.
- Tooltip/Helper: Brief. Answers one question. Doesn't repeat label.

${guidelines ? `USER'S CONTENT GUIDELINES:\n${guidelines}\n\nEvaluate the copy against these guidelines in addition to general UX best practices.` : "No custom guidelines provided. Evaluate against general UX writing best practices only."}

ACCESSIBILITY EVALUATION (always include):
Evaluate the copy against these content accessibility criteria:
- Reading level: Is it plain language? Aim for 6th-8th grade reading level. Flag complex sentences, jargon, or unnecessary technical terms.
- Screen reader context: Would this copy make sense read aloud without any visual context? Are button labels, links, and actions self-descriptive?
- Cognitive load: Short sentences (under 25 words ideal). One idea per sentence. No double negatives. Clear structure.
- Inclusive language: Avoids ableist terms ("see below," "click here"), gendered assumptions, or culturally specific idioms that don't translate.
- Visual independence: Does the message rely on color, icons, or spatial layout to convey meaning? ("The red fields are required" fails this.)
- Action clarity: Can a user with a cognitive disability understand what to do next? Is the action specific and unambiguous?

Respond ONLY with valid JSON (no markdown, no backticks) in this exact format:
{
  "score": <number 0-10>,
  "summary": "<1-2 sentence overall assessment>",
  "checks": [
    { "label": "<what was checked>", "pass": <true/false>, "score": <number 0-10>, "detail": "<specific feedback>" }
  ],
  "violations": ["<guideline violated>"],
  "rewrite": "<suggested improved version>",
  "accessibility": {
    "score": <number 0-10>,
    "checks": [
      { "label": "<accessibility criterion>", "pass": <true/false>, "detail": "<specific feedback>" }
    ],
    "suggestion": "<how to make the copy more accessible, if needed>"
  }
}`;

const GEN_SYSTEM = (guidelines) => `You are a UX copy generator. You write interface copy that follows UX writing best practices and, when provided, the user's content guidelines.

UX WRITING RULES BY COPY TYPE:
- Error Message: Severity + Cause + Action. What happened, why, what to do next. No blame. No "Oops" for serious contexts. Include recovery path.
- Empty State: Lead with value, not absence. Include clear first action. Be encouraging, not guilty.
- Loading State: Set expectations. Be specific when possible. Keep it brief.
- Success/Confirmation: Pass the screenshot test — include all relevant details. What happened, any reference numbers, next step.
- Permission Request: Explain the benefit. Say what happens if declined. Be specific.
- Notification: Scannable. Actionable. Appropriate urgency. Context-aware.
- Onboarding Step: One concept. Clear progress indication. Action-oriented.
- CTA/Button: Action verb. 1-3 words ideal. Clear outcome. Sentence case.
- Modal/Dialog: Clear title. Explain consequence. Obvious primary/secondary actions.
- Tooltip/Helper: One question answered. Brief. Don't repeat the label.
- Disclosure/Legal: Plain language. Required information. Accessible.
- Verification Step: Clear what's needed. Why it's needed. What happens next.
- Upgrade/Paywall: Value first. No guilt. Clear comparison. Easy to dismiss.
- Feedback Request: Specific ask. Low friction. Show impact.

${guidelines ? `USER'S CONTENT GUIDELINES:\n${guidelines}\n\nAll generated copy MUST follow these guidelines. Tag which guidelines you applied.` : "No custom guidelines provided. Follow general UX writing best practices."}

Generate 3 variations with different approaches. Every variation MUST be written to score 10/10 on accessibility from the start — not evaluated after. Apply these rules while writing, not after:

ACCESSIBILITY REQUIREMENTS (apply while generating, not after):
- Plain language: 6th-8th grade reading level. Short words. No jargon. No technical terms.
- Screen reader ready: Every piece of copy must make sense read aloud with zero visual context. No "click here", no "see above", no directional language.
- Cognitive load: Max 1 idea per sentence. Sentences under 20 words. No double negatives. No passive voice.
- Inclusive language: No ableist terms. No gendered assumptions. No culturally-specific idioms.
- Visual independence: Copy communicates meaning without relying on color, icons, or spatial position.
- Action clarity: The next step must be unambiguous. Any user, regardless of ability, should know exactly what to do.

After generating all variations, evaluate each one against these criteria and report the score honestly.

COPY LENGTH RULES (strict):
- headline: max 6 words. The first thing the user reads. Direct, specific.
- body: max 25 words. One idea. Plain language. No jargon.
- cta: max 3 words. Action verb. Sentence case.
- For copy types without a headline (Tooltip/Helper, CTA/Button, Notification): leave headline as empty string, put all copy in body, cta optional.
- For Disclosure/Legal: body can go up to 40 words.

Respond ONLY with valid JSON (no markdown, no backticks):
{
  "variations": [
    {
      "label": "<short approach label e.g. Direct and minimal>",
      "headline": "<per type rules above, or empty string>",
      "body": "<per type rules above>",
      "cta": "<primary action, max 3-4 words, or empty string>",
      "cta2": "<secondary action or supporting text, or empty string>",
      "notes": "<1 sentence on the approach>",
      "fieldLabels": {
        "headline": "<always include. Use: 'Heading', 'Title', 'Step title', 'Subject'. For Push Notification use 'Title'. NEVER prefix with copy type name — NOT 'Confirmation heading', NOT 'Error title'>",
        "body": "<always include. Use: 'Body', 'Message', 'Description', 'Helper text'. For Push Notification use 'Message'. NEVER prefix with copy type name — NOT 'Confirmation message'>",
        "cta": "<always include — use the specific action name: 'Allow', 'Upgrade', 'Try again', 'Submit', 'Primary CTA'. Never just 'Button'>",
        "cta2": "<always include when present — use the specific action name: 'Deny', 'Dismiss', 'Cancel', 'Learn more', 'Not now'. Never just 'Secondary'>"
      }
    }
  ],
  "guidelinesApplied": ["<guideline that was applied>"],
  "tip": "<one practical UX writing tip relevant to this copy type>",
  "accessibility": {
    "score": <number 0-10>,
    "checks": [
      { "label": "<accessibility criterion>", "pass": <true/false>, "detail": "<specific feedback>" }
    ],
    "suggestion": "<how to make the copy more accessible, if needed>"
  }
}`;

async function callAPI(systemPrompt, userMessage, { imageBase64, imageType, prd } = {}) {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ systemPrompt, userMessage, imageBase64, imageType, prd }),
  });
  if (!res.ok) throw new Error("Something went wrong. Try again in a moment.");
  return res.json();
}

/* ─── File reader helpers ─── */
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(new Error("Could not read file."));
    r.readAsText(file);
  });
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result.split(",")[1]);
    r.onerror = () => reject(new Error("Could not read file."));
    r.readAsDataURL(file);
  });
}

async function extractTextFromFile(file) {
  const ext = file.name.split(".").pop().toLowerCase();
  if (["txt", "md"].includes(ext)) return readFileAsText(file);
  if (ext === "pdf") {
    const base64 = await readFileAsBase64(file);
    const res = await fetch("/api/extract-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base64 }),
    });
    const data = await res.json();
    return data.text || "";
  }
  if (ext === "docx") {
    const base64 = await readFileAsBase64(file);
    const res = await fetch("/api/extract-docx", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base64 }),
    });
    const data = await res.json();
    if (data.error) throw new Error("Could not parse DOCX. Try exporting as PDF or MD.");
    return data.text || "";
  }
  throw new Error("Unsupported file type.");
}

/* ─── UploadZone ─── */
function UploadZone({ label, accept, hint, onFile, fileName, onClear }) {
  const [drag, setDrag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const inputRef = React.useRef();

  const handle = async (file) => {
    if (!file) return;
    setLoading(true); setErr(null);
    try {
      await onFile(file);
    } catch (e) { setErr(e.message); }
    setLoading(false);
  };

  if (fileName) return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "10px 14px", background: C.successDim, borderRadius: 8,
      border: `1px solid rgba(45,106,79,0.2)`,
    }}>
      <span style={{ fontFamily: MONO, fontSize: 19, color: C.success }}>
        ✓ {fileName}
      </span>
      <button onClick={onClear} style={{
        background: "none", border: "none", cursor: "pointer",
        fontFamily: SANS, fontSize: 19, color: C.tertiary, padding: "2px 6px",
      }}>Remove</button>
    </div>
  );

  return (
    <div>
      <div
        onClick={() => inputRef.current.click()}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files[0]); }}
        style={{
          border: `1.5px dashed ${drag ? C.accent : C.borderMid}`,
          borderRadius: 10, padding: "16px 20px", cursor: "pointer",
          background: drag ? C.accentDim : C.surface,
          transition: "all 0.15s", textAlign: "center",
        }}
      >
        {loading ? (
          <p style={{ fontFamily: SANS, fontSize: 19, color: C.secondary, margin: 0 }}>Reading file...</p>
        ) : (
          <>
            <p style={{ fontFamily: SANS, fontSize: 16, color: C.body, margin: "0 0 3px", fontWeight: 500 }}>
              {label}
            </p>
            <p style={{ fontFamily: SANS, fontSize: 19, color: C.secondary, margin: 0 }}>{hint}</p>
          </>
        )}
      </div>
      {err && <p style={{ fontFamily: SANS, fontSize: 19, color: C.error, margin: "6px 0 0" }}>{err}</p>}
      <input ref={inputRef} type="file" accept={accept} style={{ display: "none" }}
        onChange={e => handle(e.target.files[0])} />
    </div>
  );
}

/* ─── ImageUpload ─── */
function ImageUpload({ imageFile, setImageFile, imageBase64, setImageBase64 }) {
  const [drag, setDrag] = useState(false);
  const inputRef = React.useRef();

  const handle = async (file) => {
    if (!file) return;
    const b64 = await readFileAsBase64(file);
    setImageFile(file);
    setImageBase64(b64);
  };

  if (imageFile) return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "10px 14px", background: C.accentDim, borderRadius: 8,
      border: `1px solid ${C.borderMid}`, marginBottom: 14,
    }}>
      <span style={{ fontFamily: MONO, fontSize: 19, color: C.body }}>
        ✓ {imageFile.name}
      </span>
      <button onClick={() => { setImageFile(null); setImageBase64(null); }} style={{
        background: "none", border: "none", cursor: "pointer",
        fontFamily: SANS, fontSize: 19, color: C.tertiary, padding: "2px 6px",
      }}>Remove</button>
    </div>
  );

  return (
    <div
      onClick={() => inputRef.current.click()}
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files[0]); }}
      style={{
        border: `1.5px dashed ${drag ? C.accent : C.borderMid}`,
        borderRadius: 10, padding: "12px 16px", cursor: "pointer",
        background: drag ? C.accentDim : C.surface,
        transition: "all 0.15s", marginBottom: 14, textAlign: "center",
      }}
    >
      <p style={{ fontFamily: SANS, fontSize: 16, color: C.body, margin: "0 0 2px", fontWeight: 500 }}>
        Add a screenshot for visual context
      </p>
      <p style={{ fontFamily: SANS, fontSize: 19, color: C.secondary, margin: 0 }}>
        PNG or JPG — drag & drop or click to upload
      </p>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/jpg" style={{ display: "none" }}
        onChange={e => handle(e.target.files[0])} />
    </div>
  );
}

/* ─── Score Ring ─── */
function ScoreRing({ score, size = 88 }) {
  const [anim, setAnim] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const dur = 900;
    const ease = t => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;
    const run = now => {
      const t = Math.min((now - start) / dur, 1);
      setAnim(ease(t) * score);
      if (t < 1) raf = requestAnimationFrame(run);
    };
    raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (anim / 10) * circ;
  const color = anim < 5 ? C.error : anim < 8 ? C.warning : C.success;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth={3} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={3.5}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          transform={`rotate(-90 ${size/2} ${size/2})`} style={{ transition: "stroke 0.3s" }} />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: DISPLAY, fontSize: size * 0.28, fontWeight: 700, color, letterSpacing: "-0.02em",
      }}>
        {anim.toFixed(1)}
      </div>
    </div>
  );
}

/* ─── Pill ─── */
function Pill({ active, children, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        padding: "5px 14px", borderRadius: 999,
        border: `1px solid ${active ? C.accent : hover ? C.borderMid : C.border}`,
        background: active ? C.accent : hover ? C.surfaceHover : "transparent",
        color: active ? C.bg : hover ? C.body : C.secondary,
        fontFamily: SANS, fontSize: 19, fontWeight: active ? 500 : 400,
        cursor: "pointer", transition: "all 0.15s", lineHeight: 1.4, whiteSpace: "nowrap",
      }}>
      {children}
    </button>
  );
}

/* ─── Btn ─── */
function Btn({ children, onClick, disabled, variant = "primary", style: extra }) {
  const [hover, setHover] = useState(false);
  const isPrimary = variant === "primary";
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        padding: "11px 24px", borderRadius: 8,
        border: isPrimary ? "none" : `1px solid ${C.borderMid}`,
        background: disabled ? "#e8e8e8" : isPrimary ? (hover ? "#333" : C.accent) : (hover ? C.surfaceHover : "transparent"),
        color: disabled ? "#888888" : isPrimary ? C.bg : C.body,
        fontFamily: SANS, fontSize: 19, fontWeight: 500, cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.15s", opacity: 1, letterSpacing: "0.01em", ...extra,
      }}>
      {children}
    </button>
  );
}

/* ─── FadeIn ─── */
function FadeIn({ children, delay = 0 }) {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div style={{
      opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(10px)",
      transition: "opacity 0.4s ease, transform 0.4s ease",
    }}>
      {children}
    </div>
  );
}

/* ─── Section label ─── */
function SectionLabel({ children }) {
  return (
    <p style={{ fontFamily: SANS, fontSize: 16, color: C.tertiary, margin: "0 0 8px",
      textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
      {children}
    </p>
  );
}

/* ─── Section title (block-level heading, below h2) ─── */
function SectionTitle({ children }) {
  return (
    <h3 style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 700, color: C.heading,
      margin: "0 0 6px", letterSpacing: "-0.01em", lineHeight: 1.3 }}>
      {children}
    </h3>
  );
}

/* ─── About Tab ─── */
function AboutTab({ onNavigate }) {
  return (
    <div style={{
maxWidth: 900, margin: "0 auto"
, padding: "80px 24px 60px",
      display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
    }}>
      <FadeIn delay={0}>
        <h1 style={{
          fontFamily: DISPLAY, fontSize: 56, fontWeight: 700, color: C.heading,
          lineHeight: 1.08, margin: "0 0 12px", letterSpacing: "-0.03em",
        }}>
          UX Copy<br /><span style={{ fontWeight: 400, opacity: 0.5 }}>Generator</span>
        </h1>
        <p style={{ fontFamily: SANS, fontSize: 16, color: C.secondary, lineHeight: 1.75,
          margin: "0 0 40px", maxWidth: 400 }}>
          Add your guidelines once. Audit existing copy or generate new copy that actually sounds like your product.
        </p>
        <Btn onClick={() => onNavigate("context")} style={{ fontSize: 16, padding: "13px 36px" }}>
          Upload your guidelines →
        </Btn>
      </FadeIn>
    </div>
  );
}

/* ─── Guidelines Tab ─── */
function GuidelinesTab({ guidelines, setGuidelines, saved, setSaved, prd, setPrd, prdFileName, setPrdFileName, onDone }) {
  const [activePreset, setActivePreset] = useState(null);
  const [focused, setFocused] = useState(false);
  const [guideFileName, setGuideFileName] = useState(null);
  const [showPasteGuidelines, setShowPasteGuidelines] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [showPrd, setShowPrd] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

  const handlePreset = (key) => {
    if (key === "scratch") { setGuidelines(""); setActivePreset("scratch"); setGuideFileName(null); setShowPasteGuidelines(true); }
    else { setGuidelines(PRESETS[key].text); setActivePreset(key); setGuideFileName(null); setShowPasteGuidelines(true); }
    setSaved(false);
  };

  const handleGuideFile = async (file) => {
    const text = await extractTextFromFile(file);
    setGuidelines(text);
    setGuideFileName(file.name);
    setActivePreset(null);
    setSaved(false);
    setShowPasteGuidelines(false);
  };

  const handlePrdFile = async (file) => {
    const text = await extractTextFromFile(file);
    setPrd(text);
    setPrdFileName(file.name);
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px 24px 60px" }}>
      <h2 style={{ fontFamily: DISPLAY, fontSize: 28, fontWeight: 700, color: C.heading, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
        Your guidelines
      </h2>
      <p style={{ fontFamily: SANS, fontSize: 19, color: C.secondary, margin: "0 0 28px", lineHeight: 1.6 }}>
        Add your content guidelines and product context. Everything you audit and generate will be grounded in this.
      </p>

      <UploadZone
        label="Upload your guidelines"
        accept=".txt,.md,.pdf,.docx"
        hint="TXT, MD, PDF, or DOCX — drag & drop or click"
        onFile={handleGuideFile}
        fileName={guideFileName}
        onClear={() => { setGuideFileName(null); setGuidelines(""); setSaved(false); setShowPasteGuidelines(false); }}
      />

      {!guideFileName && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={() => setShowPasteGuidelines(v => !v)} style={{
            background: "none", border: "none", padding: 0, cursor: "pointer",
            fontFamily: SANS, fontSize: 16, color: C.secondary, textDecoration: "underline",
            textDecorationColor: C.borderMid, textUnderlineOffset: 3, textAlign: "left",
          }}>
            {showPasteGuidelines ? "− Paste manually" : "+ Paste manually"}
          </button>
          {showPasteGuidelines && (
            <textarea value={guidelines}
              onChange={e => { setGuidelines(e.target.value); setSaved(false); }}
              onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
              placeholder="Paste your voice & tone doc, style guide, or content principles..."
              style={{
                width: "100%", minHeight: 180, padding: 18,
                background: C.surface, border: `1.5px solid ${focused ? C.accent : C.border}`,
                borderRadius: 10, color: C.body, fontFamily: MONO, fontSize: 16,
                lineHeight: 1.75, resize: "vertical", outline: "none", boxSizing: "border-box",
                transition: "border-color 0.15s",
              }}
            />
          )}
          <button onClick={() => { setShowPresets(v => !v); }} style={{
            background: "none", border: "none", padding: 0, cursor: "pointer",
            fontFamily: SANS, fontSize: 16, color: C.secondary, textDecoration: "underline",
            textDecorationColor: C.borderMid, textUnderlineOffset: 3, textAlign: "left",
          }}>
            {showPresets ? "− Hide presets" : "+ Start from an industry preset"}
          </button>
          {showPresets && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {Object.entries(PRESETS).map(([k, { label }]) => (
                <Pill key={k} active={activePreset === k} onClick={() => handlePreset(k)}>{label}</Pill>
              ))}
              <Pill active={activePreset === "scratch"} onClick={() => handlePreset("scratch")}>Start from scratch</Pill>
            </div>
          )}
        </div>
      )}

      <div style={{ height: 1, background: C.border, margin: "24px 0" }} />

      {!prdFileName ? (
        <button onClick={() => setShowPrd(v => !v)} style={{
          background: "none", border: "none", padding: 0, cursor: "pointer",
          fontFamily: SANS, fontSize: 16, color: C.secondary, textDecoration: "underline",
          textDecorationColor: C.borderMid, textUnderlineOffset: 3, textAlign: "left",
        }}>
          {showPrd ? "− Hide product brief" : (
            <>+ Add a product brief (PRD) <span style={{ color: C.tertiary, fontWeight: 400, textDecoration: "none" }}>— optional, makes the copy more precise</span></>
          )}
        </button>
      ) : null}
      {(showPrd || prdFileName) && (
        <div style={{ marginTop: prdFileName ? 0 : 12 }}>
          <UploadZone
            label="Upload PRD or product spec"
            accept=".txt,.md,.pdf,.docx"
            hint="TXT, MD, PDF, or DOCX — drag & drop or click"
            onFile={handlePrdFile}
            fileName={prdFileName}
            onClear={() => { setPrd(""); setPrdFileName(null); }}
          />
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 24, alignItems: "center", flexWrap: "wrap" }}>
        <Btn onClick={() => onDone(false)} disabled={!guidelines.trim()}>Save and continue →</Btn>
        {(guidelines || prd) && (
          <Btn variant="ghost" onClick={() => {
            setGuidelines(""); setSaved(false); setActivePreset(null);
            setGuideFileName(null); setPrd(""); setPrdFileName(null);
            setShowPasteGuidelines(false); setShowPresets(false); setShowPrd(false);
          }}>
            Clear all
          </Btn>
        )}
      </div>
      <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
        {!showSkipConfirm ? (
          <button onClick={() => setShowSkipConfirm(true)} style={{
            background: "none", border: "none", padding: 0, cursor: "pointer",
            fontFamily: SANS, fontSize: 16, color: C.secondary, textDecoration: "underline",
            textDecorationColor: C.borderMid, textUnderlineOffset: 3,
          }}>
            Skip — use UX writing best practices only
          </button>
        ) : (
          <div style={{ padding: 20, background: C.surface, borderRadius: 12, border: `1px solid ${C.borderMid}` }}>
            <p style={{ fontFamily: SANS, fontSize: 16, color: C.heading, fontWeight: 600, margin: "0 0 8px" }}>
              Are you sure?
            </p>
            <p style={{ fontFamily: SANS, fontSize: 15, color: C.secondary, margin: "0 0 20px", lineHeight: 1.6, maxWidth: 400 }}>
              Without guidelines, generated copy may be generic and won't reflect your brand voice, terminology, or tone.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <Btn onClick={() => onDone(true)}>
                It's ok. Continue →
              </Btn>
              <Btn variant="ghost" onClick={() => setShowSkipConfirm(false)}>
                Add guidelines
              </Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Audit Tab ─── */
function AuditTab({ guidelines, saved, prd }) {
  const [copy, setCopy] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [focused, setFocused] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [showScreenshot, setShowScreenshot] = useState(false);

  const run = async () => {
    setLoading(true); setResult(null); setError(null);
    try {
      const data = await callAPI(
        AUDIT_SYSTEM(saved ? guidelines : null),
        `Audit this UI copy. Infer the copy type from the content itself.\n\nCopy to audit:\n\n"${copy}"${imageBase64 ? "\n\nA screenshot of the UI context has been provided as an image." : ""}`,
        { imageBase64, imageType: imageFile?.type, prd: saved && prd ? prd : null }
      );
      setResult(data);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const scoreColor = s => s < 5 ? C.error : s < 8 ? C.warning : C.success;
  const scoreBg = s => s < 5 ? C.errorDim : s < 8 ? C.warningDim : C.successDim;

  if (result) return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px 24px 60px" }}>
      <FadeIn>
        <button onClick={() => setResult(null)} style={{
          background: "none", border: `1px solid ${C.border}`, borderRadius: 8,
          padding: "7px 14px", fontFamily: SANS, fontSize: 19, color: C.secondary,
          cursor: "pointer", marginBottom: 28,
        }}>
          ← New audit
        </button>

        <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 32,
          padding: 20, background: C.surface, borderRadius: 12, border: `1px solid ${C.border}` }}>
          <ScoreRing score={result.score} />
          <p style={{ fontFamily: SANS, fontSize: 19, color: C.body, lineHeight: 1.75, margin: 0 }}>{result.summary}</p>
        </div>

        {result.rewrite && (
          <div style={{ padding: 20, background: C.successDim, borderRadius: 12,
            border: `1px solid rgba(45,106,79,0.15)`, marginBottom: 24 }}>
            <p style={{ fontFamily: SANS, fontSize: 16, fontWeight: 600, color: C.success,
              textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>Suggested rewrite</p>
            <p style={{ fontFamily: MONO, fontSize: 19, color: C.heading, margin: 0, lineHeight: 1.7 }}>{result.rewrite}</p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 1, marginBottom: 24, borderRadius: 12, overflow: "hidden", border: `1px solid ${C.border}` }}>
          {result.checks?.map((c, i) => (
            <div key={i} style={{ padding: "12px 16px", background: C.surface,
              borderBottom: i < result.checks.length - 1 ? `1px solid ${C.border}` : "none",
              display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontFamily: SANS, fontSize: 16, color: c.pass ? C.success : C.heading, fontWeight: 500, display: "block", marginBottom: 2 }}>
                  {c.pass ? "✓" : "✗"} {c.label}
                </span>
                {!c.pass && <p style={{ fontFamily: SANS, fontSize: 19, color: C.tertiary, margin: 0, lineHeight: 1.55 }}>{c.detail}</p>}
              </div>
              <span style={{ fontFamily: DISPLAY, fontSize: 19, fontWeight: 700, flexShrink: 0,
                color: scoreColor(c.score) }}>{c.score}/10</span>
            </div>
          ))}
        </div>

        {result.violations?.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontFamily: SANS, fontSize: 16, fontWeight: 600, color: C.error,
              textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>Guideline violations</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {result.violations.map((v, i) => (
                <span key={i} style={{ padding: "4px 12px", borderRadius: 999, background: C.errorDim,
                  border: `1px solid rgba(192,57,43,0.15)`, fontFamily: SANS, fontSize: 19, color: C.error }}>{v}</span>
              ))}
            </div>
          </div>
        )}

        {result.accessibility && (
          <div style={{ padding: 18, borderRadius: 12, background: C.indigoDim, border: "1px solid rgba(55,48,163,0.12)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <p style={{ fontFamily: SANS, fontSize: 16, fontWeight: 600, color: C.indigo,
                textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>Accessibility</p>
              <span style={{ fontFamily: DISPLAY, fontSize: 16, fontWeight: 700,
                color: result.accessibility.score < 5 ? C.error : result.accessibility.score < 8 ? C.warning : C.indigo }}>
                {result.accessibility.score}/10
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {result.accessibility.checks?.map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontFamily: SANS, fontSize: 19, lineHeight: 1.55 }}>
                  <span style={{ color: c.pass ? C.success : C.error, flexShrink: 0, fontWeight: 600 }}>{c.pass ? "✓" : "✗"}</span>
                  <div>
                    <span style={{ color: C.heading, fontWeight: 500 }}>{c.label}: </span>
                    <span style={{ color: C.secondary }}>{c.detail}</span>
                  </div>
                </div>
              ))}
            </div>
            {result.accessibility.suggestion && (
              <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 8, background: "rgba(55,48,163,0.06)",
                fontFamily: SANS, fontSize: 19, color: C.indigo, lineHeight: 1.6 }}>
                <strong style={{ color: C.indigo }}>How to improve: </strong>{result.accessibility.suggestion}
              </div>
            )}
          </div>
        )}
      </FadeIn>
    </div>
  );

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px 24px 60px" }}>
      <h2 style={{ fontFamily: DISPLAY, fontSize: 28, fontWeight: 700, color: C.heading, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
        Audit copy
      </h2>
      <p style={{ fontFamily: SANS, fontSize: 19, color: C.secondary, margin: "0 0 24px", lineHeight: 1.6 }}>
        Paste any UI copy. Get a scored breakdown, a suggested rewrite, and a WCAG accessibility check.
      </p>

      <textarea value={copy} onChange={e => setCopy(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        placeholder="Paste the UI copy you want to audit..."
        style={{
          width: "100%", minHeight: 110, padding: 18,
          background: C.surface, border: `1.5px solid ${focused ? C.accent : C.border}`,
          borderRadius: 10, color: C.body, fontFamily: MONO, fontSize: 16,
          lineHeight: 1.75, resize: "vertical", outline: "none", boxSizing: "border-box",
          transition: "border-color 0.15s", marginBottom: 12,
        }}
      />

      <div style={{ marginBottom: 16 }}>
        {!showScreenshot && !imageFile ? (
          <button onClick={() => setShowScreenshot(true)} style={{
            background: "none", border: "none", padding: 0, cursor: "pointer",
            fontFamily: SANS, fontSize: 16, color: C.secondary, textDecoration: "underline",
            textDecorationColor: C.borderMid, textUnderlineOffset: 3,
          }}>
            + Add screenshot for visual context
          </button>
        ) : (
          <ImageUpload imageFile={imageFile} setImageFile={setImageFile} imageBase64={imageBase64} setImageBase64={setImageBase64} />
        )}
      </div>

      <Btn onClick={run} disabled={!copy.trim() || loading}>
        {loading ? "Auditing..." : "Run audit"}
      </Btn>

      {error && (
        <div style={{ marginTop: 16, padding: 14, background: C.errorDim, borderRadius: 8,
          fontFamily: SANS, fontSize: 16, color: C.error, border: `1px solid rgba(192,57,43,0.15)` }}>
          {error}
        </div>
      )}
    </div>
  );
}

/* ─── Generate Tab ─── */
function GenerateTab({ guidelines, saved, prd, onResult, generateResult }) {
  const [copyType, setCopyType] = useState(null);
  const [context, setContext] = useState("");
  const [showContext, setShowContext] = useState(false);
  const [showScreenshot, setShowScreenshot] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(null);
  const [contextFocused, setContextFocused] = useState(false);

  const [platform, setPlatform] = useState("ios");
  const [typeaheadQuery, setTypeaheadQuery] = useState("");
  const [typeaheadOpen, setTypeaheadOpen] = useState(false);
  const showPlatformToggle = PLATFORM_TYPES.includes(copyType);
  const effectiveCopyType = copyType;
  const canRun = !!effectiveCopyType;

  const run = async () => {
    setLoading(true); setResult(null); setError(null);
    try {
      const platformNote = showPlatformToggle
        ? `\n\nPLATFORM: ${PLATFORM_SPECS[platform].label}. ${PLATFORM_SPECS[platform].note} Title max: ${PLATFORM_SPECS[platform].notification.title} chars. Body max: ${PLATFORM_SPECS[platform].notification.body} chars. Strictly respect these limits.`
        : "";
      const data = await callAPI(
        GEN_SYSTEM(saved ? guidelines : null),
        `Generate ${effectiveCopyType} copy${context.trim() ? ` for this scenario:\n\n${context}` : "."}${platformNote}${imageBase64 ? "\n\nA screenshot of the UI context has been provided as an image." : ""}`,
        { imageBase64, imageType: imageFile?.type, prd: saved && prd ? prd : null }
      );
      setResult(data);
      onResult(data);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const handleCopy = (v, i) => {
    const parts = [v.headline, v.body, v.cta, v.cta2].filter(Boolean).join("\n");
    navigator.clipboard?.writeText(parts);
    setCopied(i);
    setTimeout(() => setCopied(null), 2000);
  };

  if (generateResult) return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px 24px 60px" }}>
      <FadeIn>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <button onClick={() => onResult(null)} style={{
            background: "none", border: `1px solid ${C.border}`, borderRadius: 8,
            padding: "7px 14px", fontFamily: SANS, fontSize: 19, color: C.secondary,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
          }}>
            ← New generation
          </button>
        </div>
        <GenerateResults result={generateResult} copyType={effectiveCopyType} />
      </FadeIn>
    </div>
  );

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px 24px 60px" }}>
      <h2 style={{ fontFamily: DISPLAY, fontSize: 28, fontWeight: 700, color: C.heading, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
        Generate copy
      </h2>
      <p style={{ fontFamily: SANS, fontSize: 19, color: C.secondary, margin: "0 0 24px", lineHeight: 1.6 }}>
        Pick a copy type and get three on-brand variations.
      </p>

      {saved && (
        <span style={{
          display: "inline-block", marginBottom: 20, fontFamily: SANS, fontSize: 16, fontWeight: 500,
          color: C.success, background: C.successDim, padding: "5px 14px", borderRadius: 999,
          border: `1px solid rgba(45,106,79,0.15)`,
        }}>✓ Context applied</span>
      )}

      <SectionTitle>What do you need?</SectionTitle>
      <div style={{ position: "relative", marginBottom: 20 }}>
        <input
          value={typeaheadQuery}
          onChange={e => {
            setTypeaheadQuery(e.target.value);
            setCopyType(null);
            setResult(null);
            setPlatform("ios");
          }}
          onFocus={() => setTypeaheadOpen(true)}
          onBlur={() => setTimeout(() => setTypeaheadOpen(false), 150)}
          placeholder="Search copy type, e.g. error, notification, modal..."
          style={{
            width: "100%", padding: "13px 16px",
            background: C.surface, border: `1.5px solid ${copyType ? C.accent : typeaheadOpen ? C.accent : C.border}`,
            borderRadius: 10, color: C.body, fontFamily: SANS, fontSize: 16,
            outline: "none", boxSizing: "border-box", transition: "border-color 0.15s",
          }}
        />
        {copyType ? (
          <span style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            fontFamily: SANS, fontSize: 16, color: C.success, fontWeight: 500,
          }}>✓ {copyType}</span>
        ) : (
          <span style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            fontFamily: SANS, fontSize: 16, color: C.subtle, pointerEvents: "none",
          }}>Select to continue</span>
        )}
        {typeaheadOpen && (
          <div style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)", zIndex: 50, overflow: "hidden",
          }}>
            {[...COPY_TYPES].filter(t =>
              !typeaheadQuery || t.toLowerCase().includes(typeaheadQuery.toLowerCase())
            ).map(t => (
              <button key={t} onMouseDown={() => {
                setCopyType(t);
                setTypeaheadQuery(t);
                setTypeaheadOpen(false);
                setPlatform("ios");
              }} style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "10px 16px", background: copyType === t ? C.accentDim : "transparent",
                border: "none", borderBottom: `1px solid ${C.border}`,
                fontFamily: SANS, fontSize: 16, color: copyType === t ? C.accent : C.body,
                cursor: "pointer", transition: "background 0.1s",
              }}>{t}</button>
            ))}
            {typeaheadQuery && ![...COPY_TYPES].some(t =>
              t.toLowerCase() === typeaheadQuery.toLowerCase()
            ) && (
              <button onMouseDown={() => {
                setCopyType(typeaheadQuery);
                setTypeaheadOpen(false);
              }} style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "10px 16px", background: "transparent", border: "none",
                fontFamily: SANS, fontSize: 16, color: C.secondary, cursor: "pointer",
              }}>
                Use "<span style={{ color: C.accent, fontWeight: 500 }}>{typeaheadQuery}</span>"
              </button>
            )}
          </div>
        )}
      </div>

      {showPlatformToggle && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontFamily: SANS, fontSize: 19, color: C.secondary, marginRight: 4 }}>Platform</span>
            {Object.entries(PLATFORM_SPECS).map(([key, spec]) => (
              <button key={key} onClick={() => setPlatform(key)} style={{
                padding: "5px 16px", borderRadius: 999,
                border: `1px solid ${platform === key ? C.accent : C.border}`,
                background: platform === key ? C.accent : "transparent",
                color: platform === key ? C.bg : C.secondary,
                fontFamily: SANS, fontSize: 19, fontWeight: platform === key ? 500 : 400,
                cursor: "pointer", transition: "all 0.15s",
              }}>{spec.label}</button>
            ))}
          </div>
          <p style={{ fontFamily: SANS, fontSize: 16, color: C.tertiary, margin: 0, lineHeight: 1.5 }}>
            {PLATFORM_SPECS[platform].note}
          </p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {!showContext ? (
          <button onClick={() => setShowContext(true)} style={{
            background: "none", border: "none", padding: 0, cursor: "pointer",
            fontFamily: SANS, fontSize: 16, color: C.secondary, textDecoration: "underline",
            textDecorationColor: C.borderMid, textUnderlineOffset: 3, textAlign: "left",
          }}>
            + Add scenario context <span style={{ color: C.tertiary, textDecoration: "none" }}>— makes the copy more specific</span>
          </button>
        ) : (
          <div>
            <textarea value={context} onChange={e => setContext(e.target.value)}
              onFocus={() => setContextFocused(true)} onBlur={() => setContextFocused(false)}
              placeholder="Describe the scenario: what's happening, who the user is, what they need to know..."
              style={{
                width: "100%", minHeight: 90, padding: 16,
                background: C.surface, border: `1.5px solid ${contextFocused ? C.accent : C.border}`,
                borderRadius: 10, color: C.body, fontFamily: MONO, fontSize: 16,
                lineHeight: 1.75, resize: "vertical", outline: "none", boxSizing: "border-box",
                transition: "border-color 0.15s",
              }}
            />
          </div>
        )}

        {!showScreenshot && !imageFile ? (
          <button onClick={() => setShowScreenshot(true)} style={{
            background: "none", border: "none", padding: 0, cursor: "pointer",
            fontFamily: SANS, fontSize: 16, color: C.secondary, textDecoration: "underline",
            textDecorationColor: C.borderMid, textUnderlineOffset: 3, textAlign: "left",
          }}>
            + Add a screenshot for visual context
          </button>
        ) : (
          <ImageUpload imageFile={imageFile} setImageFile={setImageFile} imageBase64={imageBase64} setImageBase64={setImageBase64} />
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <Btn onClick={run} disabled={!canRun || loading}>
          {loading ? "Generating..." : "Generate copy"}
        </Btn>
        {!saved && !loading && (
          <span style={{ fontFamily: SANS, fontSize: 19, color: C.subtle }}>
            No guidelines — using UX best practices
          </span>
        )}
      </div>

      {error && (
        <div style={{ marginTop: 16, padding: 14, background: C.errorDim, borderRadius: 8,
          fontFamily: SANS, fontSize: 16, color: C.error, border: `1px solid rgba(192,57,43,0.15)` }}>
          {error}
        </div>
      )}

    </div>
  );
}

/* ─── Generate Results (drawer content) ─── */
function GenerateResults({ result, copyType }) {
  const [copied, setCopied] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopy = (v, i) => {
    const parts = [v.headline, v.body, v.cta, v.cta2].filter(Boolean).join("\n");
    navigator.clipboard?.writeText(parts);
    setCopied(i);
    setTimeout(() => setCopied(null), 2000);
  };

  const buildMD = () => {
    const lines = [`# ${copyType || "UX Copy"} — Generated variations`, ""];
    result.variations?.forEach((v, i) => {
      lines.push(`## Variation ${i + 1}: ${v.label}`);
      if (v.headline) lines.push(`**${v.fieldLabels?.headline || "Headline"}:** ${v.headline}`);
      if (v.body) lines.push(`**${v.fieldLabels?.body || "Body"}:** ${v.body}`);
      if (v.cta) lines.push(`**${v.fieldLabels?.cta || "Primary CTA"}:** ${v.cta}`);
      if (v.cta2) lines.push(`**${v.fieldLabels?.cta2 || "Secondary CTA"}:** ${v.cta2}`);
      lines.push(`> ${v.notes}`, "");
    });
    if (result.guidelinesApplied?.length > 0) {
      lines.push("## Guidelines applied");
      result.guidelinesApplied.forEach(g => lines.push(`- ${g}`));
      lines.push("");
    }
    if (result.tip) {
      lines.push("## Writing tip", result.tip, "");
    }
    return lines.join("\n");
  };

  const handleCopyAll = () => {
    const md = buildMD();
    navigator.clipboard?.writeText(md);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleExportMD = () => {
    const md = buildMD();
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(copyType || "ux-copy").toLowerCase().replace(/\s+/g, "-")}-variations.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!result) return null;

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        <button onClick={handleCopyAll} style={{
          background: copiedAll ? C.successDim : C.surface2,
          border: `1px solid ${copiedAll ? "rgba(45,106,79,0.2)" : C.borderMid}`,
          borderRadius: 8, padding: "9px 18px", fontFamily: SANS, fontSize: 15, fontWeight: 500,
          color: copiedAll ? C.success : C.secondary, cursor: "pointer", transition: "all 0.15s",
        }}>
          {copiedAll ? "Copied!" : "Copy all variations"}
        </button>
        <button onClick={handleExportMD} style={{
          background: C.accent, border: "none",
          borderRadius: 8, padding: "9px 18px", fontFamily: SANS, fontSize: 15, fontWeight: 500,
          color: C.bg, cursor: "pointer", transition: "all 0.15s",
        }}>
          Export .md
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24, marginBottom: 32 }}>
        {result.variations?.map((v, i) => (
          <div key={i} style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: "20px 20px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <span style={{ fontFamily: SANS, fontSize: 19, fontWeight: 600, color: C.secondary }}>{v.label}</span>
              <button onClick={() => handleCopy(v, i)} style={{
                background: copied === i ? C.successDim : C.surface2,
                border: `1px solid ${copied === i ? "rgba(45,106,79,0.2)" : C.border}`,
                borderRadius: 6, padding: "4px 12px", fontFamily: SANS, fontSize: 19,
                color: copied === i ? C.success : C.secondary, cursor: "pointer", transition: "all 0.15s",
              }}>
                {copied === i ? "Copied!" : "Copy"}
              </button>
            </div>
            {v.headline && (
              <div style={{ marginBottom: 10 }}>
                <span style={{ fontFamily: MONO, fontSize: 16, fontWeight: 600, color: C.tertiary,
                  textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 3 }}>
                  {v.fieldLabels?.headline || "Heading"}
                </span>
                <p style={{ fontFamily: DISPLAY, fontSize: 19, fontWeight: 700, color: C.heading,
                  margin: 0, lineHeight: 1.25 }}>{v.headline}</p>
              </div>
            )}
            {v.body && (
              <div style={{ marginBottom: (v.cta || v.cta2) ? 14 : 12 }}>
                <span style={{ fontFamily: MONO, fontSize: 16, fontWeight: 600, color: C.tertiary,
                  textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 3 }}>
                  {v.fieldLabels?.body || "Body"}
                </span>
                <p style={{ fontFamily: SANS, fontSize: 19, color: C.body, margin: 0, lineHeight: 1.6 }}>{v.body}</p>
              </div>
            )}
            {(v.cta || v.cta2) && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
                  {v.cta && (
                    <div>
                      <span style={{ fontFamily: MONO, fontSize: 16, fontWeight: 600, color: C.tertiary,
                        textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 4 }}>
                        {v.fieldLabels?.cta || "Primary CTA"}
                      </span>
                      <span style={{ display: "inline-block", fontFamily: SANS, fontSize: 16, fontWeight: 500,
                        color: C.bg, background: C.accent, padding: "8px 18px", borderRadius: 8, lineHeight: 1 }}>
                        {v.cta}
                      </span>
                    </div>
                  )}
                  {v.cta2 && (
                    <div>
                      <span style={{ fontFamily: MONO, fontSize: 16, fontWeight: 600, color: C.tertiary,
                        textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 4 }}>
                        {v.fieldLabels?.cta2 || "Secondary CTA"}
                      </span>
                      <span style={{ display: "inline-block", fontFamily: SANS, fontSize: 16, fontWeight: 400,
                        color: C.secondary, border: `1px solid ${C.borderMid}`, padding: "7px 18px", borderRadius: 8, lineHeight: 1 }}>
                        {v.cta2}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            <p style={{ fontFamily: SANS, fontSize: 19, color: C.tertiary, margin: 0, lineHeight: 1.55,
              borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>{v.notes}</p>
          </div>
        ))}
      </div>

      {result.guidelinesApplied?.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontFamily: SANS, fontSize: 19, fontWeight: 600, color: C.success, margin: "0 0 8px" }}>Context applied</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {result.guidelinesApplied.map((g, i) => (
              <span key={i} style={{ padding: "5px 13px", borderRadius: 999, background: C.successDim,
                border: `1px solid rgba(45,106,79,0.15)`, fontFamily: SANS, fontSize: 19, color: C.success }}>
                {g}
              </span>
            ))}
          </div>
        </div>
      )}

      {result.tip && (
        <div style={{ padding: 18, background: C.surface2, borderRadius: 10, border: `1px solid ${C.border}`, marginBottom: 20 }}>
          <p style={{ fontFamily: SANS, fontSize: 19, fontWeight: 600, color: C.secondary, margin: "0 0 8px" }}>Writing tip</p>
          <p style={{ fontFamily: SANS, fontSize: 19, color: C.body, margin: 0, lineHeight: 1.65 }}>{result.tip}</p>
        </div>
      )}

      {result.accessibility && (
        <div style={{ padding: 18, borderRadius: 10, background: C.indigoDim, border: "1px solid rgba(55,48,163,0.12)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <p style={{ fontFamily: SANS, fontSize: 19, fontWeight: 600, color: C.indigo, margin: 0 }}>Accessibility</p>
            <span style={{ fontFamily: DISPLAY, fontSize: 19, fontWeight: 700,
              color: result.accessibility.score < 5 ? C.error : result.accessibility.score < 8 ? C.warning : C.indigo }}>
              {result.accessibility.score}/10
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7,
            marginBottom: result.accessibility.suggestion ? 14 : 0 }}>
            {result.accessibility.checks?.map((c, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start",
                fontFamily: SANS, fontSize: 16, lineHeight: 1.55 }}>
                <span style={{ color: c.pass ? C.success : C.error, flexShrink: 0, fontWeight: 600 }}>
                  {c.pass ? "✓" : "✗"}
                </span>
                <div>
                  <span style={{ color: C.heading, fontWeight: 500 }}>{c.label}: </span>
                  <span style={{ color: C.secondary }}>{c.detail}</span>
                </div>
              </div>
            ))}
          </div>
          {result.accessibility.suggestion && (
            <div style={{ padding: "10px 14px", borderRadius: 6, background: "rgba(55,48,163,0.06)",
              fontFamily: SANS, fontSize: 19, color: C.indigo, lineHeight: 1.6 }}>
              <strong style={{ color: C.indigo }}>How to improve: </strong>
              {result.accessibility.suggestion}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Choose screen ─── */
function ChooseScreen({ onChoose, saved }) {
  const [hoverAudit, setHoverAudit] = useState(false);
  const [hoverGen, setHoverGen] = useState(false);

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "60px 24px 60px" }}>
      <FadeIn>
        <h2 style={{ fontFamily: DISPLAY, fontSize: 28, fontWeight: 700, color: C.heading,
          margin: "0 0 6px", letterSpacing: "-0.02em" }}>
          What do you want to do?
        </h2>
        <p style={{ fontFamily: SANS, fontSize: 19, color: C.secondary, margin: "0 0 32px", lineHeight: 1.6 }}>
          {saved ? "Your context is saved. Pick a mode to get started." : "No guidelines loaded — results will follow general UX best practices."}
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <button
            onClick={() => onChoose("audit")}
            onMouseEnter={() => setHoverAudit(true)}
            onMouseLeave={() => setHoverAudit(false)}
            style={{
              background: hoverAudit ? C.accent : C.surface,
              border: `1.5px solid ${hoverAudit ? C.accent : C.border}`,
              borderRadius: 12, padding: "24px 20px", cursor: "pointer",
              textAlign: "left", transition: "all 0.2s",
            }}>
            <p style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 700,
              color: hoverAudit ? C.bg : C.heading, margin: "0 0 8px" }}>
              Audit copy
            </p>
            <p style={{ fontFamily: SANS, fontSize: 16, lineHeight: 1.6, margin: 0,
              color: hoverAudit ? "rgba(247,244,239,0.75)" : C.secondary }}>
              Score existing UI copy, catch guideline violations, and get a suggested rewrite.
            </p>
          </button>
          <button
            onClick={() => onChoose("generate")}
            onMouseEnter={() => setHoverGen(true)}
            onMouseLeave={() => setHoverGen(false)}
            style={{
              background: hoverGen ? C.accent : C.surface,
              border: `1.5px solid ${hoverGen ? C.accent : C.border}`,
              borderRadius: 12, padding: "24px 20px", cursor: "pointer",
              textAlign: "left", transition: "all 0.2s",
            }}>
            <p style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 700,
              color: hoverGen ? C.bg : C.heading, margin: "0 0 8px" }}>
              Generate copy
            </p>
            <p style={{ fontFamily: SANS, fontSize: 16, lineHeight: 1.6, margin: 0,
              color: hoverGen ? "rgba(247,244,239,0.75)" : C.secondary }}>
              Create new on-brand copy for any UI state — structured by headline, body, and CTA.
            </p>
          </button>
        </div>
        <div style={{ marginTop: 32, paddingTop: 24, borderTop: `1px solid ${C.border}` }}>
          <button onClick={() => onChoose("context")} style={{
            background: "none", border: "none", padding: 0, cursor: "pointer",
            fontFamily: SANS, fontSize: 16, color: C.secondary,
            textDecoration: "underline", textDecorationColor: C.borderMid, textUnderlineOffset: 3,
          }}>
            ← Edit or change your guidelines
          </button>
        </div>
      </FadeIn>
    </div>
  );
}

/* ─── Main ─── */
export default function UXCopyGenerator() {
  const [splash, setSplash] = useState(true);
  const [splashOut, setSplashOut] = useState(false);
  const [tab, setTab] = useState("context");
  const [contextDone, setContextDone] = useState(false);
  const [guidelines, setGuidelines] = useState("");
  const [saved, setSaved] = useState(false);
  const [hoverTab, setHoverTab] = useState(null);
  const [prd, setPrd] = useState("");
  const [prdFileName, setPrdFileName] = useState(null);
  const [generateResult, setGenerateResult] = useState(null);

  const handleSplashDismiss = () => {
    setSplashOut(true);
    setTimeout(() => setSplash(false), 500);
  };

  const handleContextDone = (skipGuidelines = false) => {
    if (skipGuidelines) {
      setSaved(false);
    } else {
      setSaved(true);
    }
    setContextDone(true);
    setTab("choose");
  };

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:ital,wght@0,700;0,900;1,700&family=Hanken+Grotesk:wght@400;500;700;800&family=DM+Sans:wght@300;400;500&family=IBM+Plex+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  const tabs = contextDone && tab !== "choose"
    ? [
        { id: "audit", label: "Audit" },
        { id: "generate", label: "Generate" },
      ]
    : [];

  if (splash) return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      display: "flex", flexDirection: "column",
      opacity: splashOut ? 0 : 1, transition: "opacity 0.5s ease",
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes splashUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
        @keyframes tagIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        * { box-sizing: border-box; }
      `}</style>

      <div style={{ padding: "28px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <img src="/logo.png" alt="UX Copy Generator" style={{ height: 36, marginBottom: 16 }} />
        <p style={{ fontFamily: SANS, fontSize: 14, color: C.tertiary, margin: 0 }}>
          Built by{" "}
          <a href="https://www.linkedin.com/in/alejaalvear/" target="_blank" rel="noopener noreferrer"
            style={{ color: C.secondary, textDecoration: "none", fontWeight: 500 }}>
            María Alvear
          </a>
        </p>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "0 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 60, alignItems: "center", width: "100%", maxWidth: 900, margin: "0 auto" }}>

          <div style={{ animation: "splashUp 0.5s ease 0.1s forwards", opacity: 0 }}>
            <h1 style={{
              fontFamily: SPLASH, fontSize: 58, fontWeight: 900, color: C.heading,
              lineHeight: 1.05, margin: "0 0 48px", letterSpacing: "-0.04em",
            }}>
              UX copy that sounds like your product.
            </h1>
            <Btn onClick={handleSplashDismiss} style={{ fontSize: 17, padding: "15px 36px" }}>
              Upload your guidelines →
            </Btn>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, animation: "splashUp 0.5s ease 0.2s forwards", opacity: 0 }}>
            {[
              { label: "Error message", color: "#fde8e8", text: "#9b1c1c" },
              { label: "Empty state", color: "#e8f4fd", text: "#1c4a9b" },
              { label: "Push notification", color: "#fef3e8", text: "#9b5a1c" },
              { label: "Onboarding", color: "#e8fdf0", text: "#1c6b3a" },
              { label: "CTA / Button", color: "#f0e8fd", text: "#5a1c9b" },
              { label: "Modal / Dialog", color: "#fdf6e8", text: "#7a5a1c" },
            ].map(({ label, color, text }) => (
              <span key={label} style={{
                display: "block", background: color, color: text,
                fontFamily: SANS, fontSize: 14, fontWeight: 700,
                padding: "10px 14px", borderRadius: 10,
                letterSpacing: "0.01em", textAlign: "center",
              }}>{label}</span>
            ))}
          </div>

        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        * { box-sizing: border-box; }
        ::selection { background: #1a1a1a; color: #f7f4ef; }
        textarea { font-family: 'IBM Plex Mono', monospace !important; }
        textarea::placeholder { color: #888888; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 3px; }
      `}</style>

      <header style={{
        padding: "20px 24px 0",
        borderBottom: `1px solid ${C.border}`,
        background: C.bg,
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
            <img src="/logo.png" alt="UX Copy Generator" style={{ height: 24 }} />

          </div>
          <div style={{ display: "flex", gap: 0 }}>
            {tabs.map(({ id, label }) => (
              <button key={id} onClick={() => setTab(id)}
                onMouseEnter={() => setHoverTab(id)} onMouseLeave={() => setHoverTab(null)}
                style={{
                  padding: "10px 16px", background: "transparent", border: "none",
                  borderBottom: `2px solid ${tab === id ? C.accent : "transparent"}`,
                  color: tab === id ? C.heading : hoverTab === id ? C.secondary : C.subtle,
                  fontFamily: SANS, fontSize: 16, fontWeight: tab === id ? 500 : 400,
                  cursor: "pointer", transition: "all 0.15s",
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        <div style={{ display: tab === "context" ? "block" : "none" }}>
          <GuidelinesTab guidelines={guidelines} setGuidelines={setGuidelines} saved={saved} setSaved={setSaved} prd={prd} setPrd={setPrd} prdFileName={prdFileName} setPrdFileName={setPrdFileName} onDone={handleContextDone} />
        </div>
        <div style={{ display: tab === "choose" ? "block" : "none" }}>
          <ChooseScreen onChoose={(t) => { if (t === "context") { setContextDone(false); setTab("context"); setSaved(false); } else { setTab(t); } }} saved={saved} />
        </div>
        <div style={{ display: tab === "audit" ? "block" : "none" }}>
          <AuditTab guidelines={guidelines} saved={saved} prd={prd} />
        </div>
        <div style={{ display: tab === "generate" ? "block" : "none" }}>
          <GenerateTab guidelines={guidelines} saved={saved} prd={prd} onResult={setGenerateResult} generateResult={generateResult} />
        </div>
      </main>


      <footer style={{ padding: "24px", textAlign: "center", borderTop: `1px solid ${C.border}` }}>
        <p style={{ fontFamily: SANS, fontSize: 19, color: C.secondary, margin: "0 0 3px" }}>
          Built by{" "}
          <a href="https://www.linkedin.com/in/alejaalvear/" target="_blank" rel="noopener noreferrer"
            style={{ color: C.accent, textDecoration: "none", fontWeight: 500 }}>
            María Alvear
          </a>
        </p>
        <p style={{ fontFamily: SANS, fontSize: 16, color: C.tertiary, margin: 0 }}>
          Built with care for designers, product managers, and anyone writing UI copy.
        </p>
      </footer>
    </div>
  );
}
