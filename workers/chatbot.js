/**
 * Shared site chatbot handler — chat + lead endpoints.
 *
 * Deploy standalone:  npm run deploy:chatbot  (workers/site-chatbot/)
 * Site-local route:    POST /api/chat          (via workers/site-handler.js)
 *
 * Secret:  wrangler secret put ANTHROPIC_API_KEY
 */

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";
const CLAUDE_MODEL = "claude-sonnet-4-6";

const ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/veteranloanservicing\.com$/,
  /^https:\/\/www\.veteranloanservicing\.com$/,
  /^https:\/\/aegisglobalholdings\.com$/,
  /^https:\/\/www\.aegisglobalholdings\.com$/,
  /^https:\/\/(www\.)?newarkfirm\.com$/,
  /^https:\/\/(www\.)?modmediations\.com$/,
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
  /\.pages\.dev$/,
  /\.workers\.dev$/,
];

const SITE_CONFIGS = {
  vls: {
    name: "Veteran Loan Servicing",
    systemPrompt: `You are the website intake assistant for Veteran Loan Servicing, an institutional B2B commercial loan servicing platform headquartered in Edmond, Oklahoma.

CRITICAL FACTS — always follow these:
- Veteran Loan Servicing services INSTITUTIONAL clients: banks, credit funds, and alternative capital platforms.
- Asset classes: commercial real estate loans and business/commercial loans ONLY.
- We do NOT service consumer residential mortgages, retail family banking products, or public consumer lending systems.
- Services include: sub-servicing, default and workout management, corporate insurance compliance monitoring, UCC Article 9 contract enforcement, and ACH payment collection/disbursement aligned to NACHA operating guidelines.
- Headquarters: 1019 Waterwood Pkwy, Ste C, Edmond, OK 73034. We serve institutional clients across the United States.
- Contact email: info@veteranloanservicing.com
- Demo requests: direct visitors to the Request Platform Demo page at /request-demo
- Solution pages: /institutional-services, /enterprise-risk-compliance, /global-asset-technology, /case-studies

Your role: help visitors understand our institutional servicing platform and point them to the right next step. Be professional, concise, and accurate. Never claim we service residential mortgages or consumer home loans.`,
    fallback: vlsFallback,
  },
  aegis: {
    name: "Aegis Global Holdings",
    systemPrompt: `You are the website intake assistant for Aegis Global Holdings, a veteran-owned enterprise technology services company based in Edmond, Oklahoma.

Services include: application management, data integration, web design, AI visibility consulting, and enterprise IT solutions for C-suite, IT directors, and procurement teams.

Be professional and concise. Direct visitors to book a demo or contact the team when appropriate.`,
  },
  newarkfirm: {
    name: "Newark Law Offices",
    systemPrompt: `You are an intake assistant for Newark Law Offices, a law firm serving Oklahoma and Texas.

Your job is to gather initial information to see how the firm might help and connect visitors with the legal team.

IMPORTANT: This chat does not create an attorney-client relationship. Nothing shared here is confidential or privileged until the firm is formally engaged.

Be professional, empathetic, and concise.`,
  },
  mod: {
    name: "Mediators on Demand",
    systemPrompt: `You are the intake assistant for Mediators on Demand (MOD).

Your role is to gather initial information about a dispute to help connect visitors with a suitable mediator. You do not provide legal advice or evaluate the merits of any case.

Be neutral, professional, and concise.`,
  },
};

export async function handleChatbotRequest(request, env, pathname = "/") {
  const origin = request.headers.get("Origin") || "";

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  const isLead = pathname.endsWith("/lead");

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405, origin);
  }

  if (isLead) {
    let leadBody;
    try {
      leadBody = await request.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400, origin);
    }
    return handleLead(leadBody, origin, env);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400, origin);
  }

  if (!isOriginAllowed(origin) && origin) {
    return json({ error: "Origin not allowed" }, 403, origin);
  }

  const site = body.site;
  const messages = body.messages;
  if (!site || !Array.isArray(messages) || messages.length === 0) {
    return json({ error: "site and messages are required" }, 400, origin);
  }

  const config = SITE_CONFIGS[site];
  if (!config) {
    return json({ error: "Unknown site" }, 400, origin);
  }

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const question = lastUser?.content || "";

  if (env.ANTHROPIC_API_KEY) {
    try {
      const reply = await callAnthropic(env.ANTHROPIC_API_KEY, config.systemPrompt, messages);
      return json({ reply }, 200, origin);
    } catch (err) {
      console.error("[chatbot] Anthropic error:", err.message);
    }
  }

  const reply = config.fallback
    ? config.fallback(question)
    : `${config.name} assistant is temporarily unavailable. Please use the contact form on this page or email info@veteranloanservicing.com.`;

  return json({ reply }, 200, origin);
}

async function handleLead(data, origin, env = {}) {
  if (!data?.name || !data?.email) {
    return json({ error: "name and email are required" }, 400, origin);
  }

  const id = crypto.randomUUID();
  console.log("[lead]", JSON.stringify({ id, ...data }));

  if (env.RESEND_API_KEY) {
    try {
      await notifyLeadEmail(env, data, id);
    } catch (err) {
      console.error("[lead] notify failed:", err.message);
    }
  }

  return json({ ok: true, id }, 200, origin);
}

async function notifyLeadEmail(env, data, id) {
  const to = env.TO_EMAIL || "info@veteranloanservicing.com";
  const from = env.FROM_EMAIL || "leads@veteranloanservicing.com";
  const subject = `New VLS lead — ${data.company || data.name} (${data.source || "website"})`;
  const text = [
    `Lead ID: ${id}`,
    `Name: ${data.name}`,
    `Company: ${data.company || "—"}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone || "—"}`,
    `Portfolio: ${data.portfolio_type || "—"} / ${data.portfolio_size || "—"}`,
    `Page: ${data.page || "—"}`,
    `Source: ${data.source || "—"}`,
    "",
    data.message || "",
  ].join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, text }),
  });
  if (!res.ok) {
    throw new Error(`Resend ${res.status}: ${await res.text()}`);
  }
}

async function callAnthropic(apiKey, systemPrompt, messages) {
  const res = await fetch(ANTHROPIC_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 512,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Anthropic ${res.status}: ${text}`);
  }

  const data = await res.json();
  const block = data.content?.find((b) => b.type === "text");
  return block?.text?.trim() || "I'm sorry, I couldn't generate a response. Please try again or contact us directly.";
}

function vlsFallback(question) {
  const q = question.toLowerCase();

  if (/residential|mortgage|home loan|consumer/.test(q)) {
    return "No — Veteran Loan Servicing does not service consumer residential mortgages or retail banking products. We operate exclusively as a B2B institutional platform for commercial real estate and business/commercial loan portfolios.";
  }
  if (/commercial|cre|business loan|institutional|service/.test(q)) {
    return "Veteran Loan Servicing provides institutional-grade commercial loan servicing for banks, credit funds, and capital platforms — including sub-servicing, default and workout management, insurance compliance monitoring, and UCC Article 9 enforcement. Visit /request-demo to schedule a platform walkthrough.";
  }
  if (/where|location|geographic|oklahoma|edmond/.test(q)) {
    return "We're headquartered in Edmond, Oklahoma (1019 Waterwood Pkwy, Ste C, Edmond, OK 73034) and service institutional clients across the United States.";
  }
  if (/payment|ach|nacha|disburse/.test(q)) {
    return "Borrower payments are collected via ACH and disbursed to lenders on a scheduled monthly cycle, structured around NACHA operating guidelines with a full audit trail for every transaction.";
  }
  if (/demo|schedule|walkthrough/.test(q)) {
    return "You can request a guided platform demo at /request-demo — we'll tailor the walkthrough to your fund's asset composition.";
  }
  if (/contact|email|reach/.test(q)) {
    return "Reach our institutional sales team at info@veteranloanservicing.com or use the contact form at /contact.";
  }

  return "Hi — I can help point you to the right person on our team. Veteran Loan Servicing is an institutional B2B platform for commercial real estate and business/commercial loan servicing. What would you like to know?";
}

function isOriginAllowed(origin) {
  if (!origin) return true;
  return ALLOWED_ORIGIN_PATTERNS.some((re) => re.test(origin));
}

function corsHeaders(origin) {
  const allowed = isOriginAllowed(origin) ? origin : "https://veteranloanservicing.com";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}
