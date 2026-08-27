/**
 * Demo calendar — Pulse CPR–style slot picker, adapted for institutional demos.
 *
 * Weekly availability is defined below (America/Chicago).
 * Booked slots are stored in KV binding DEMO_BOOKINGS when present;
 * otherwise an in-memory set (dev-friendly, resets on isolate recycle).
 */

const SCHEDULE = {
  timezone: "America/Chicago",
  // 0=Sun … 6=Sat — weekdays only
  daysOfWeek: [1, 2, 3, 4, 5],
  times: ["10:00", "14:00"],
  durationMinutes: 30,
  weeksAhead: 6,
  // Block holidays / travel: "YYYY-MM-DD"
  blockedDates: [],
};

const memoryBooked = new Set();

export async function handleDemoCalendar(request, env, pathname) {
  const origin = request.headers.get("Origin") || "";

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors(origin) });
  }

  if (pathname.endsWith("/slots") && request.method === "GET") {
    const booked = await loadBooked(env);
    const slots = generateSlots(booked);
    return json({ timezone: SCHEDULE.timezone, durationMinutes: SCHEDULE.durationMinutes, slots }, 200, origin);
  }

  if (pathname.endsWith("/book") && request.method === "POST") {
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400, origin);
    }
    return bookSlot(body, env, origin);
  }

  return json({ error: "Not found" }, 404, origin);
}

function generateSlots(booked) {
  const out = [];
  const now = new Date();
  const start = startOfLocalDay(now);
  const end = new Date(start);
  end.setDate(end.getDate() + SCHEDULE.weeksAhead * 7);

  for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
    const dow = d.getDay();
    if (!SCHEDULE.daysOfWeek.includes(dow)) continue;
    const dateKey = formatDateKey(d);
    if (SCHEDULE.blockedDates.includes(dateKey)) continue;

    for (const time of SCHEDULE.times) {
      const id = `${dateKey}T${time}`;
      const startsAt = parseLocalDateTime(dateKey, time);
      if (startsAt <= now) continue;
      out.push({
        id,
        date: dateKey,
        time,
        label: formatSlotLabel(dateKey, time),
        available: !booked.has(id),
      });
    }
  }
  return out;
}

async function bookSlot(data, env, origin) {
  const name = (data.name || "").trim();
  const email = (data.email || "").trim();
  const slotId = (data.slotId || "").trim();
  if (!name || !email || !slotId) {
    return json({ error: "name, email, and slotId are required" }, 400, origin);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: "Valid email required" }, 400, origin);
  }

  const booked = await loadBooked(env);
  const slots = generateSlots(new Set()); // all theoretical future slots
  const slot = slots.find((s) => s.id === slotId);
  if (!slot) {
    return json({ error: "That time is no longer offered. Pick another slot." }, 409, origin);
  }
  if (booked.has(slotId)) {
    return json({ error: "That slot was just taken. Please choose another." }, 409, origin);
  }

  const booking = {
    id: crypto.randomUUID(),
    slotId,
    date: slot.date,
    time: slot.time,
    label: slot.label,
    name,
    email,
    phone: (data.phone || "").trim(),
    company: (data.company || "").trim(),
    portfolio_type: (data.portfolio_type || "").trim(),
    message: (data.message || "").trim(),
    created_at: new Date().toISOString(),
  };

  await saveBooking(env, booking);
  console.log("[demo-book]", JSON.stringify(booking));

  if (env.RESEND_API_KEY) {
    try {
      await notifyBooking(env, booking);
    } catch (err) {
      console.error("[demo-book] notify failed:", err.message);
    }
  }

  return json({ ok: true, booking: { id: booking.id, label: booking.label } }, 200, origin);
}

async function loadBooked(env) {
  const set = new Set(memoryBooked);
  if (env.DEMO_BOOKINGS) {
    try {
      const list = await env.DEMO_BOOKINGS.list({ prefix: "slot:" });
      for (const key of list.keys) {
        set.add(key.name.replace(/^slot:/, ""));
      }
    } catch (err) {
      console.error("[demo] KV list failed:", err.message);
    }
  }
  return set;
}

async function saveBooking(env, booking) {
  memoryBooked.add(booking.slotId);
  if (env.DEMO_BOOKINGS) {
    await env.DEMO_BOOKINGS.put(`slot:${booking.slotId}`, booking.id, {
      metadata: { email: booking.email, at: booking.created_at },
    });
    await env.DEMO_BOOKINGS.put(`booking:${booking.id}`, JSON.stringify(booking));
  }
}

async function notifyBooking(env, booking) {
  const to = env.TO_EMAIL || "info@veteranloanservicing.com";
  const from = env.FROM_EMAIL || "leads@veteranloanservicing.com";
  const text = [
    `Demo booked: ${booking.label}`,
    `Booking ID: ${booking.id}`,
    `Name: ${booking.name}`,
    `Company: ${booking.company || "—"}`,
    `Email: ${booking.email}`,
    `Phone: ${booking.phone || "—"}`,
    `Portfolio: ${booking.portfolio_type || "—"}`,
    "",
    booking.message || "",
  ].join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `Demo booked — ${booking.label} — ${booking.company || booking.name}`,
      text,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

function startOfLocalDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function formatDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseLocalDateTime(dateKey, time) {
  const [y, mo, da] = dateKey.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  return new Date(y, mo - 1, da, h, mi, 0, 0);
}

function formatSlotLabel(dateKey, time) {
  const d = parseLocalDateTime(dateKey, time);
  const datePart = d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = ((h + 11) % 12) + 1;
  return `${datePart} · ${h12}:${String(m).padStart(2, "0")} ${ampm} CT`;
}

function cors(origin) {
  const allowed =
    !origin ||
    /^https:\/\/(www\.)?veteranloanservicing\.com$/.test(origin) ||
    /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
    /\.pages\.dev$/.test(origin) ||
    /\.workers\.dev$/.test(origin)
      ? origin || "*"
      : "https://veteranloanservicing.com";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...cors(origin) },
  });
}
