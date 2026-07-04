// ===== styles =====
// Design tokens — pulled directly from the Criterion Partners brand screenshot:
// deep navy hero, warm gold accent, cream header band, serif display type with
// a tracked small-caps wordmark and an italic gold accent line.
export const tokens = {
  color: {
    navy: "#16305E",
    navyDeep: "#0F2347",
    cream: "#F5F7F9",
    surface: "#FFFFFF",
    gold: "#C9A455",
    goldDark: "#A9843A",
    ink: "#1F3864",          // headings on light backgrounds
    inkBody: "#33455E",
    muted: "#6B7A94",
    mutedOnNavy: "#B7C3DA",
    border: "#E2E7EE",
    success: "#4E7A5D",
    danger: "#A6503B",
  },
  font: {
    display: `'Playfair Display', Georgia, serif`,
    wordmark: `'EB Garamond', Georgia, serif`,
    body: `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`,
  },
};

export const baseStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;1,500;1,600&family=EB+Garamond:wght@500;600&family=Inter:wght@400;500;600&display=swap');

  :root {
    --navy: ${tokens.color.navy};
    --navy-deep: ${tokens.color.navyDeep};
    --cream: ${tokens.color.cream};
    --surface: ${tokens.color.surface};
    --gold: ${tokens.color.gold};
    --gold-dark: ${tokens.color.goldDark};
    --ink: ${tokens.color.ink};
    --ink-body: ${tokens.color.inkBody};
    --muted: ${tokens.color.muted};
    --muted-on-navy: ${tokens.color.mutedOnNavy};
    --border: ${tokens.color.border};
    --success: ${tokens.color.success};
    --danger: ${tokens.color.danger};
  }

  * { box-sizing: border-box; }
  html { -webkit-text-size-adjust: 100%; }
  body {
    margin: 0;
    background: var(--surface);
    color: var(--ink-body);
    font-family: ${tokens.font.body};
    line-height: 1.55;
    -webkit-font-smoothing: antialiased;
  }
  h1, h2, h3 { font-family: ${tokens.font.display}; color: var(--ink); margin: 0 0 0.4em; font-weight: 600; letter-spacing: -0.01em; }
  h1 { font-size: clamp(2.1rem, 4vw, 3rem); }
  h2 { font-size: clamp(1.3rem, 2.5vw, 1.7rem); }
  p { margin: 0 0 1em; }
  a { color: var(--gold-dark); }
  .muted { color: var(--muted); }
  .italic-accent { font-family: ${tokens.font.display}; font-style: italic; color: var(--gold); }

  a.button, button.button {
    display: inline-flex; align-items: center; justify-content: center;
    background: var(--navy); color: #fff; border: none;
    padding: 0.85rem 1.6rem; border-radius: 2px;
    font-family: ${tokens.font.body}; font-weight: 600; font-size: 0.9rem;
    letter-spacing: 0.02em;
    text-decoration: none; cursor: pointer;
    transition: background 0.15s ease;
  }
  a.button:hover, button.button:hover { background: var(--navy-deep); }
  a.button:focus-visible, button.button:focus-visible,
  a:focus-visible, button:focus-visible, input:focus-visible, select:focus-visible {
    outline: 2px solid var(--gold-dark); outline-offset: 2px;
  }
  button.button.secondary {
    background: transparent; color: var(--navy); border: 1px solid var(--border);
  }
  button.button.secondary:hover { background: var(--cream); }
  button.button:disabled { opacity: 0.5; cursor: not-allowed; }

  .shell { max-width: 1040px; margin: 0 auto; padding: 0 1.5rem; }
  .nav { border-bottom: 1px solid var(--border); background: var(--cream); }
  .nav .shell { display: flex; align-items: center; justify-content: space-between; padding: 1.15rem 1.5rem; }
  .wordmark {
    font-family: ${tokens.font.wordmark}; font-size: 1.15rem; font-weight: 600;
    text-decoration: none; color: var(--ink); text-transform: uppercase; letter-spacing: 0.14em;
  }
  .wordmark span { color: var(--gold); }

  .hero { background: var(--navy); padding: 4.5rem 0 4rem; }
  .hero .eyebrow { text-transform: uppercase; letter-spacing: 0.14em; font-size: 0.75rem; color: var(--gold); font-weight: 600; margin-bottom: 1.1rem; }
  .hero h1 { color: #fff; }
  .hero p.lead { font-size: 1.1rem; color: var(--muted-on-navy); max-width: 38em; }
  .hero p.signature { font-family: ${tokens.font.display}; font-style: italic; color: var(--gold); font-size: 1.3rem; margin-top: 0.5rem; }

  .card {
    background: var(--surface); border: 1px solid var(--border); border-radius: 4px;
    padding: 1.75rem;
  }
  .package-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin: 2rem 0; }
  @media (max-width: 720px) { .package-grid { grid-template-columns: 1fr; } }
  .package-card { display: flex; flex-direction: column; gap: 0.75rem; }
  .package-card .price { font-family: ${tokens.font.display}; font-size: 1.9rem; color: var(--ink); }
  .package-card .price small { font-family: ${tokens.font.body}; font-size: 0.92rem; color: var(--muted); font-weight: 400; }
  .package-card .tagline { font-size: 0.78rem; color: var(--gold-dark); font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; }

  /* Session timeline — real structure for the mentorship's monthly cadence */
  .timeline { display: flex; gap: 0.6rem; margin: 0.5rem 0 0.25rem; }
  .timeline .dot { flex: 1; height: 3px; border-radius: 2px; background: var(--border); }
  .timeline .dot.filled { background: var(--gold); }

  form .field { margin-bottom: 1.1rem; }
  form label { display: block; font-size: 0.82rem; font-weight: 600; color: var(--ink); margin-bottom: 0.35rem; }
  form input, form select, form textarea {
    width: 100%; padding: 0.7rem 0.85rem; border: 1px solid var(--border); border-radius: 3px;
    font-family: ${tokens.font.body}; font-size: 0.95rem; background: var(--surface); color: var(--ink-body);
  }
  form textarea { resize: vertical; min-height: 5rem; }

  .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.4rem; margin: 1rem 0; }
  .calendar-grid .day-head { text-align: center; font-size: 0.72rem; color: var(--muted); font-weight: 600; padding-bottom: 0.3rem; }
  .calendar-grid button.day {
    aspect-ratio: 1; border: 1px solid var(--border); background: var(--surface); border-radius: 3px;
    cursor: pointer; font-family: ${tokens.font.body}; font-size: 0.85rem; color: var(--ink-body);
  }
  .calendar-grid button.day:hover:not(:disabled) { border-color: var(--gold); }
  .calendar-grid button.day.selected { background: var(--navy); color: #fff; border-color: var(--navy); }
  .calendar-grid button.day:disabled { opacity: 0.3; cursor: default; }
  .calendar-grid button.day.empty { border: none; background: none; cursor: default; }

  .slot-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin: 1rem 0; }
  .slot-grid button.slot {
    padding: 0.6rem; border: 1px solid var(--border); background: var(--surface); border-radius: 3px;
    cursor: pointer; font-size: 0.85rem;
  }
  .slot-grid button.slot.selected { background: var(--navy); color: #fff; border-color: var(--navy); }

  table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
  th, td { text-align: left; padding: 0.7rem 0.6rem; border-bottom: 1px solid var(--border); }
  th { color: var(--muted); font-weight: 600; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.04em; }

  .badge { display: inline-block; padding: 0.2rem 0.55rem; border-radius: 2px; font-size: 0.72rem; font-weight: 600; }
  .badge.confirmed { background: #E5EEE8; color: var(--success); }
  .badge.pending { background: #F3ECD9; color: var(--gold-dark); }
  .badge.canceled { background: #F1DFDA; color: var(--danger); }

  footer { padding: 3rem 0; text-align: center; color: var(--muted); font-size: 0.85rem; }

  .banner { background: var(--cream); border: 1px solid var(--border); border-radius: 4px; padding: 1rem 1.25rem; margin-bottom: 1.5rem; font-size: 0.9rem; }
  .banner.error { background: #F6E7E2; border-color: #E3C3B7; color: var(--danger); }
`;

export function layout(opts) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${opts.title}</title>
  <style>${baseStyles}</style>
</head>
<body>
  <nav class="nav">
    <div class="shell">
      <a href="/" class="wordmark">Criterion <span>Partners</span></a>
      <a href="/#packages" class="muted" style="text-decoration:none;font-size:0.85rem;">Mentorship</a>
    </div>
  </nav>
  ${opts.body}
  <footer>© ${new Date().getFullYear()} ${opts.siteName}</footer>
</body>
</html>`;
}


// ===== db =====
function id(prefix) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`;
}
function today() {
  return new Date().toISOString().slice(0, 10);
}
function addMonths(dateStr, months) {
  const d = new Date(dateStr + "T00:00:00");
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

// ---- Packages & tiers -------------------------------------------------

export async function listActivePackages(env) {
  const { results } = await env.DB.prepare("SELECT * FROM packages WHERE active = 1 ORDER BY sort_order ASC").all();
  return results ?? [];
}
export async function getPackage(env, packageId) {
  return env.DB.prepare("SELECT * FROM packages WHERE id = ?").bind(packageId).first();
}
export async function getPackageTiers(env, packageId) {
  const { results } = await env.DB.prepare("SELECT * FROM package_tiers WHERE package_id = ? ORDER BY sort_order ASC")
    .bind(packageId).all();
  return results ?? [];
}
export async function getTier(env, tierId) {
  return env.DB.prepare("SELECT * FROM package_tiers WHERE id = ?").bind(tierId).first();
}
export async function updatePackage(env, pkg) {
  await env.DB.prepare(
    `UPDATE packages SET name=?, tagline=?, description=?, price_cents=?, payment_link_url=?, session_length_min=?, sessions_included=?, active=? WHERE id=?`
  ).bind(pkg.name, pkg.tagline, pkg.description, pkg.price_cents, pkg.payment_link_url, pkg.session_length_min, pkg.sessions_included, pkg.active, pkg.id).run();
}
export async function updateTier(env, tier) {
  await env.DB.prepare(`UPDATE package_tiers SET price_cents=?, payment_link_url=? WHERE id=?`)
    .bind(tier.price_cents, tier.payment_link_url, tier.id).run();
}

// ---- Availability -------------------------------------------------------

export async function addAvailability(env, slot) {
  const slotId = id("avail");
  await env.DB.prepare("INSERT INTO availability (id, date, start_time, end_time, package_id) VALUES (?, ?, ?, ?, ?)")
    .bind(slotId, slot.date, slot.start_time, slot.end_time, slot.package_id).run();
  return slotId;
}
export async function deleteAvailability(env, slotId) {
  await env.DB.prepare("DELETE FROM availability WHERE id = ?").bind(slotId).run();
}
export async function listAvailability(env, opts) {
  const { results } = await env.DB.prepare(
    `SELECT * FROM availability WHERE date >= ? AND (package_id IS NULL OR package_id = ?) ORDER BY date, start_time`
  ).bind(opts.from, opts.packageId ?? null).all();
  return results ?? [];
}
export async function openSlotsForDate(env, date, packageId, durationMin) {
  const { results: windows } = await env.DB.prepare(
    "SELECT * FROM availability WHERE date = ? AND (package_id IS NULL OR package_id = ?)"
  ).bind(date, packageId).all();
  const { results: taken } = await env.DB.prepare(
    "SELECT scheduled_time FROM bookings WHERE scheduled_date = ? AND status != 'canceled'"
  ).bind(date).all();
  const takenSet = new Set((taken ?? []).map((t) => t.scheduled_time));
  const slots = new Set();
  for (const w of windows ?? []) {
    let [h, m] = w.start_time.split(":").map(Number);
    const [endH, endM] = w.end_time.split(":").map(Number);
    while (h * 60 + m + durationMin <= endH * 60 + endM) {
      const label = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      if (!takenSet.has(label)) slots.add(label);
      m += 30;
      if (m >= 60) { m -= 60; h += 1; }
    }
  }
  return Array.from(slots).sort();
}

// ---- Clients --------------------------------------------------------------

export async function findOrCreateClient(env, data) {
  const existing = await env.DB.prepare("SELECT * FROM clients WHERE email = ?").bind(data.email.toLowerCase()).first();
  if (existing) return existing;
  const clientId = id("client");
  await env.DB.prepare("INSERT INTO clients (id, name, email, phone) VALUES (?, ?, ?, ?)")
    .bind(clientId, data.name, data.email.toLowerCase(), data.phone ?? null).run();
  return await env.DB.prepare("SELECT * FROM clients WHERE id = ?").bind(clientId).first();
}
export async function getClientByEmail(env, email) {
  return env.DB.prepare("SELECT * FROM clients WHERE email = ?").bind(email.toLowerCase()).first();
}
export async function getClient(env, clientId) {
  return env.DB.prepare("SELECT * FROM clients WHERE id = ?").bind(clientId).first();
}
export async function listClients(env) {
  const { results } = await env.DB.prepare("SELECT * FROM clients ORDER BY created_at DESC").all();
  return results ?? [];
}

// ---- Enrollments -----------------------------------------------------------

export async function createEnrollment(env, e) {
  const enrollmentId = id("enr");
  await env.DB.prepare(
    `INSERT INTO enrollments (id, client_id, package_id, tier_id, term_months, sessions_total, status, payment_type, sponsorship_code_id)
     VALUES (?, ?, ?, ?, ?, ?, 'pending_payment', ?, ?)`
  ).bind(enrollmentId, e.client_id, e.package_id, e.tier_id, e.term_months, e.sessions_total, e.payment_type, e.sponsorship_code_id ?? null).run();
  return enrollmentId;
}
export async function getEnrollment(env, enrollmentId) {
  return env.DB.prepare("SELECT * FROM enrollments WHERE id = ?").bind(enrollmentId).first();
}
export async function activateEnrollment(env, enrollmentId, firstSessionDate) {
  await env.DB.prepare("UPDATE enrollments SET status='active', sessions_used=1, next_session_due_date=? WHERE id=?")
    .bind(addMonths(firstSessionDate, 1), enrollmentId).run();
}
export async function listEnrollmentsForClient(env, clientId) {
  const { results } = await env.DB.prepare("SELECT * FROM enrollments WHERE client_id = ? ORDER BY created_at DESC")
    .bind(clientId).all();
  return results ?? [];
}
export async function listAllEnrollments(env) {
  const { results } = await env.DB.prepare(
    `SELECT e.*, c.name as client_name, c.email as client_email, p.name as package_name
     FROM enrollments e JOIN clients c ON c.id = e.client_id JOIN packages p ON p.id = e.package_id
     ORDER BY e.created_at DESC`
  ).all();
  return results ?? [];
}
export async function listDueEnrollments(env) {
  const t = today();
  const { results } = await env.DB.prepare(
    `SELECT * FROM enrollments WHERE status = 'active' AND sessions_used < sessions_total
     AND next_session_due_date <= ? AND (last_prompt_sent_date IS NULL OR last_prompt_sent_date < next_session_due_date)`
  ).bind(t).all();
  return results ?? [];
}
export async function markPromptSent(env, enrollmentId) {
  await env.DB.prepare("UPDATE enrollments SET last_prompt_sent_date = ? WHERE id = ?").bind(today(), enrollmentId).run();
}
export async function advanceEnrollmentAfterScheduling(env, enrollmentId, scheduledDate) {
  const enr = await getEnrollment(env, enrollmentId);
  if (!enr) return;
  const sessionsUsed = enr.sessions_used + 1;
  const status = sessionsUsed >= enr.sessions_total ? "completed" : "active";
  await env.DB.prepare("UPDATE enrollments SET sessions_used = ?, next_session_due_date = ?, status = ? WHERE id = ?")
    .bind(sessionsUsed, addMonths(scheduledDate, 1), status, enrollmentId).run();
}
export async function skipThisMonth(env, enrollmentId) {
  const enr = await getEnrollment(env, enrollmentId);
  if (!enr) return { ok: false, reason: "Enrollment not found" };
  if (enr.skip_used) return { ok: false, reason: "You've already used your one skip for this term." };
  if (!enr.next_session_due_date) return { ok: false, reason: "Nothing to skip right now." };
  await env.DB.prepare("UPDATE enrollments SET skip_used = 1, next_session_due_date = ?, last_prompt_sent_date = NULL WHERE id = ?")
    .bind(addMonths(enr.next_session_due_date, 1), enrollmentId).run();
  return { ok: true };
}

// ---- Intake ------------------------------------------------------------

export async function saveIntakeResponse(env, opts) {
  await env.DB.prepare("INSERT INTO intake_responses (id, booking_id, client_id, responses_json) VALUES (?, ?, ?, ?)")
    .bind(id("intake"), opts.booking_id, opts.client_id, JSON.stringify(opts.responses)).run();
}
export async function getIntakeForBooking(env, bookingId) {
  return env.DB.prepare("SELECT * FROM intake_responses WHERE booking_id = ?").bind(bookingId).first();
}

// ---- Bookings ---------------------------------------------------------------

export async function createBooking(env, b) {
  const bookingId = id("bk");
  await env.DB.prepare(
    `INSERT INTO bookings (id, enrollment_id, client_id, package_id, session_number, scheduled_date, scheduled_time, duration_min, status, stripe_checkout_session_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`
  ).bind(bookingId, b.enrollment_id ?? null, b.client_id, b.package_id, b.session_number, b.scheduled_date ?? "", b.scheduled_time ?? "", b.duration_min, b.stripe_checkout_session_id ?? null).run();
  return bookingId;
}
export async function getBooking(env, bookingId) {
  return env.DB.prepare("SELECT * FROM bookings WHERE id = ?").bind(bookingId).first();
}
export async function getBookingByCheckoutRef(env, ref) {
  return env.DB.prepare("SELECT * FROM bookings WHERE stripe_checkout_session_id = ?").bind(ref).first();
}
export async function confirmBooking(env, bookingId, meetingLink) {
  await env.DB.prepare("UPDATE bookings SET status='confirmed', meeting_link=? WHERE id=?").bind(meetingLink, bookingId).run();
}
export async function scheduleBooking(env, bookingId, date, time) {
  await env.DB.prepare("UPDATE bookings SET scheduled_date=?, scheduled_time=? WHERE id=?").bind(date, time, bookingId).run();
}
export async function rescheduleBooking(env, bookingId, date, time) {
  await env.DB.prepare("UPDATE bookings SET scheduled_date=?, scheduled_time=?, reschedule_count = reschedule_count + 1 WHERE id=?")
    .bind(date, time, bookingId).run();
}
export async function listUpcomingBookings(env) {
  const { results } = await env.DB.prepare(
    `SELECT b.*, c.name as client_name, c.email as client_email, p.name as package_name
     FROM bookings b JOIN clients c ON c.id = b.client_id JOIN packages p ON p.id = b.package_id
     WHERE b.status != 'canceled' ORDER BY b.scheduled_date, b.scheduled_time`
  ).all();
  return results ?? [];
}
export async function listBookingsForEnrollment(env, enrollmentId) {
  const { results } = await env.DB.prepare("SELECT * FROM bookings WHERE enrollment_id = ? ORDER BY session_number ASC")
    .bind(enrollmentId).all();
  return results ?? [];
}
export async function countReschedulesForEnrollment(env, enrollmentId) {
  const row = await env.DB.prepare("SELECT COALESCE(SUM(reschedule_count), 0) as n FROM bookings WHERE enrollment_id = ?")
    .bind(enrollmentId).first();
  return row?.n ?? 0;
}
export async function getFirstBookingForEnrollment(env, enrollmentId) {
  return env.DB.prepare("SELECT * FROM bookings WHERE enrollment_id = ? AND session_number = 1").bind(enrollmentId).first();
}
export async function listBookingsForClient(env, clientId) {
  const { results } = await env.DB.prepare("SELECT * FROM bookings WHERE client_id = ? ORDER BY created_at DESC")
    .bind(clientId).all();
  return results ?? [];
}

// ---- Homework -----------------------------------------------------------

export async function addHomework(env, h) {
  await env.DB.prepare("INSERT INTO homework (id, booking_id, assignment, rationale, benefits) VALUES (?, ?, ?, ?, ?)")
    .bind(id("hw"), h.booking_id, h.assignment, h.rationale, h.benefits).run();
}
export async function listHomeworkForBooking(env, bookingId) {
  const { results } = await env.DB.prepare("SELECT * FROM homework WHERE booking_id = ? ORDER BY created_at DESC")
    .bind(bookingId).all();
  return results ?? [];
}
export async function listHomeworkForClient(env, clientId) {
  const { results } = await env.DB.prepare(
    `SELECT h.*, b.session_number, b.scheduled_date FROM homework h
     JOIN bookings b ON b.id = h.booking_id WHERE b.client_id = ? ORDER BY h.created_at DESC`
  ).bind(clientId).all();
  return results ?? [];
}

// ---- Sponsorship codes -----------------------------------------------------

export async function createSponsorshipCode(env, sc) {
  const scId = id("spon");
  await env.DB.prepare(
    `INSERT INTO sponsorship_codes (id, code, package_id, tier_id, client_email, max_uses, expires_at, note)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(scId, sc.code.toUpperCase(), sc.package_id, sc.tier_id ?? null, sc.client_email ? sc.client_email.toLowerCase() : null, sc.max_uses ?? 1, sc.expires_at ?? null, sc.note ?? null).run();
  return scId;
}
export async function getSponsorshipCode(env, code) {
  return env.DB.prepare("SELECT * FROM sponsorship_codes WHERE code = ?").bind(code.toUpperCase()).first();
}
export async function redeemSponsorshipCode(env, id_) {
  await env.DB.prepare("UPDATE sponsorship_codes SET uses_count = uses_count + 1 WHERE id = ?").bind(id_).run();
}
export async function listSponsorshipCodes(env) {
  const { results } = await env.DB.prepare("SELECT * FROM sponsorship_codes ORDER BY created_at DESC").all();
  return results ?? [];
}

// ---- Mentor profile ------------------------------------------------------

export async function getMentorProfile(env) {
  const row = await env.DB.prepare("SELECT * FROM mentor_profile WHERE id = 1").first();
  return row;
}
export async function updateMentorProfile(env, p) {
  await env.DB.prepare("UPDATE mentor_profile SET name=?, title=?, photo_url=?, badge_url=?, badge_label=?, bio=? WHERE id=1")
    .bind(p.name, p.title, p.photo_url, p.badge_url, p.badge_label, p.bio).run();
}


// ===== auth (admin) =====
const COOKIE_NAME = "cp_admin";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 14; // 14 days

async function hmac(secret, message) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function makeSessionCookie(env) {
  const expires = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = `admin.${expires}`;
  const sig = await hmac(env.SESSION_SECRET, payload);
  const value = `${payload}.${sig}`;
  return `${COOKIE_NAME}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE_SECONDS}`;
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export async function isAuthed(env, cookieHeader) {
  if (!cookieHeader) return false;
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return false;
  const [prefix, expiresStr, sig] = match[1].split(".");
  if (!prefix || !expiresStr || !sig) return false;
  const payload = `${prefix}.${expiresStr}`;
  const expected = await hmac(env.SESSION_SECRET, payload);
  if (expected !== sig) return false;
  if (Date.now() > Number(expiresStr)) return false;
  return true;
}


// ===== auth (client portal) =====
const PORTAL_COOKIE_NAME = "cp_portal";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days
const LOGIN_LINK_MAX_AGE_SECONDS = 60 * 15; // 15 minutes

export async function makeLoginToken(env, clientId) {
  const expires = Date.now() + LOGIN_LINK_MAX_AGE_SECONDS * 1000;
  const payload = `${clientId}.${expires}`;
  const sig = await hmac(env.SESSION_SECRET, `login.${payload}`);
  return `${payload}.${sig}`;
}

export async function verifyLoginToken(env, token) {
  const [clientId, expiresStr, sig] = token.split(".");
  if (!clientId || !expiresStr || !sig) return null;
  const payload = `${clientId}.${expiresStr}`;
  const expected = await hmac(env.SESSION_SECRET, `login.${payload}`);
  if (expected !== sig) return null;
  if (Date.now() > Number(expiresStr)) return null;
  return clientId;
}

export async function makePortalSessionCookie(env, clientId) {
  const expires = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = `${clientId}.${expires}`;
  const sig = await hmac(env.SESSION_SECRET, `session.${payload}`);
  return `${PORTAL_COOKIE_NAME}=${payload}.${sig}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_MAX_AGE_SECONDS}`;
}
export function clearPortalSessionCookie() {
  return `${PORTAL_COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}
export async function getPortalClientId(env, cookieHeader) {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${PORTAL_COOKIE_NAME}=([^;]+)`));
  if (!match) return null;
  const [clientId, expiresStr, sig] = match[1].split(".");
  if (!clientId || !expiresStr || !sig) return null;
  const payload = `${clientId}.${expiresStr}`;
  const expected = await hmac(env.SESSION_SECRET, `session.${payload}`);
  if (expected !== sig) return null;
  if (Date.now() > Number(expiresStr)) return null;
  return clientId;
}


// ===== stripe (webhook signature only) =====
// Checkout happens entirely on Bluevine's (Stripe-backed) hosted payment link
// pages — this file only verifies the webhook signature from that account.

export async function verifyStripeSignature(payload, signatureHeader, secret) {
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => p.split("="))
  );
  const timestamp = parts["t"];
  const sig = parts["v1"];
  if (!timestamp || !sig) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signedPayload));
  const expected = Array.from(new Uint8Array(sigBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return expected === sig;
}


// ===== meeting links =====
// A Jitsi room is created the moment someone opens its URL — there's no API
// call to make. A cryptographically random slug is enough to make the link
// effectively unique and unguessable per booking.
export function generateMeetingLink(bookingId) {
  const slug = `criterion-${bookingId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 24)}-${crypto
    .randomUUID()
    .slice(0, 8)}`;
  return `https://meet.jit.si/${slug}`;
}


// ===== email =====
export async function sendEmail(env, opts) {
  if (!env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — skipping email send:", opts.subject);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: `${env.SITE_NAME} <${env.FROM_EMAIL}>`, to: [opts.to], subject: opts.subject, html: opts.html }),
  });
  if (!res.ok) console.error("Resend error:", await res.text());
}

const wrap = (inner) => `<div style="font-family:Georgia,serif;color:#1F3864;max-width:520px;">${inner}</div>`;

export function bookingConfirmedEmail(opts) {
  return wrap(`
    <h2 style="color:#1F3864;">You're confirmed, ${opts.clientName}</h2>
    <p>Your ${opts.packageName} session${
    opts.sessionsIncluded > 1 ? ` (${opts.sessionNumber} of ${opts.sessionsIncluded})` : ""
  } is booked:</p>
    <p style="font-size:1.1rem;"><strong>${opts.date} at ${opts.time}</strong></p>
    <p><a href="${opts.meetingLink}" style="color:#C9A455;">Join the meeting</a></p>
    <p><a href="${opts.portalUrl}" style="color:#C9A455;">View your portal</a> — your intake answers, homework, and mentor info live there.</p>
  `);
}

export function scheduleNextSessionEmail(opts) {
  return wrap(`
    <h2 style="color:#1F3864;">Time to schedule session ${opts.sessionNumber} of ${opts.sessionsIncluded}</h2>
    <p>Hi ${opts.clientName}, it's time to get your next ${opts.packageName} session on the calendar.</p>
    <p><a href="${opts.portalUrl}" style="color:#C9A455;">Schedule it in your portal</a></p>
    <p style="color:#6B7A94;font-size:0.85rem;">Life happens — you have up to 3 reschedules and one skip available per term if you need them. Details are in your portal.</p>
  `);
}

export function magicLinkEmail(opts) {
  return wrap(`
    <h2 style="color:#1F3864;">Your portal link</h2>
    <p>Hi ${opts.clientName}, click below to open your mentorship portal. This link expires in 15 minutes.</p>
    <p><a href="${opts.loginUrl}" style="color:#C9A455;font-weight:bold;">Open my portal</a></p>
    <p style="color:#6B7A94;font-size:0.85rem;">Didn't request this? You can ignore this email.</p>
  `);
}

export function giftedEnrollmentEmail(opts) {
  return wrap(`
    <h2 style="color:#1F3864;">You've been gifted a mentorship term</h2>
    <p>Hi ${opts.clientName}, you have a sponsored ${opts.packageName} term waiting — no payment needed.</p>
    <p><a href="${opts.bookingUrl}" style="color:#C9A455;font-weight:bold;">Book your first session</a></p>
  `);
}


// ===== intake questionnaire =====
export const INTAKE_SECTIONS = [
  {
    key: "goals",
    title: "Goal Alignment",
    description: "What you're actually here to get out of this.",
  },
  {
    key: "working_style",
    title: "Communication & Working Style",
    description: "How we'll work together between and during sessions.",
  },
  {
    key: "growth",
    title: "Growth & Mindset",
    description: "Where you're stuck, and what it'll take to get unstuck.",
  },
];

export const INTAKE_QUESTIONS = [
  {
    id: "goal_outcome",
    section: "goals",
    type: "textarea",
    required: true,
    label:
      "Looking back at the end of this term, what will have had to happen for you to call it a success?",
  },
  {
    id: "goal_capability",
    section: "goals",
    type: "textarea",
    required: true,
    label: "What's the one capability, credential, or skill you're trying to build that you don't have yet?",
  },
  {
    id: "goal_different",
    section: "goals",
    type: "textarea",
    required: false,
    label: "If we get this right, what changes about your day-to-day work or decisions?",
  },
  {
    id: "style_feedback",
    section: "working_style",
    type: "textarea",
    required: true,
    label: "How do you like to receive direct feedback — plainly and fast, or with context first?",
  },
  {
    id: "style_off_limits",
    section: "working_style",
    type: "textarea",
    required: false,
    label:
      "Is there anything off-limits for us to get into — a topic, a relationship, a decision you've already made peace with?",
    helper: "Totally fine to leave this blank.",
  },
  {
    id: "style_between_sessions",
    section: "working_style",
    type: "textarea",
    required: true,
    label:
      "Between sessions, how involved do you want me to be — hands-off until we meet, or reachable if something urgent comes up?",
  },
  {
    id: "growth_real_blocker",
    section: "growth",
    type: "textarea",
    required: true,
    label: "What's actually in your way right now — not the symptom, the root of it?",
  },
  {
    id: "growth_setback_response",
    section: "growth",
    type: "textarea",
    required: true,
    label: "When a plan falls apart on you, what's your first instinct — push through, reassess, or step back?",
  },
  {
    id: "growth_support_needed",
    section: "growth",
    type: "textarea",
    required: false,
    label:
      "What would you need from me — an introduction, a resource, a specific kind of pressure — to actually follow through on what we build?",
  },
];

export function renderIntakeForm() {
  return INTAKE_SECTIONS.map((section) => {
    const questions = INTAKE_QUESTIONS.filter((q) => q.section === section.key);
    return `
      <div style="margin-bottom:1.75rem;">
        <h3 style="font-size:1.05rem;margin-bottom:0.1rem;">${section.title}</h3>
        <p class="muted" style="font-size:0.85rem;margin-bottom:1rem;">${section.description}</p>
        ${questions
          .map(
            (q) => `
          <div class="field">
            <label>${q.label}${q.required ? "" : ' <span class="muted">(optional)</span>'}</label>
            ${q.helper ? `<p class="muted" style="font-size:0.78rem;margin:-0.2rem 0 0.4rem;">${q.helper}</p>` : ""}
            <textarea name="intake_${q.id}" ${q.required ? "required" : ""}></textarea>
          </div>`
          )
          .join("")}
      </div>`;
  }).join("");
}

export function parseIntakeFromForm(form) {
  const responses = {};
  for (const q of INTAKE_QUESTIONS) {
    const value = form.get(`intake_${q.id}`);
    responses[q.id] = value ? String(value) : "";
  }
  return responses;
}

export function renderIntakeReadOnly(responsesJson) {
  const responses = JSON.parse(responsesJson);
  return INTAKE_SECTIONS.map((section) => {
    const questions = INTAKE_QUESTIONS.filter((q) => q.section === section.key && responses[q.id]);
    if (questions.length === 0) return "";
    return `
      <div style="margin-bottom:1.5rem;">
        <h3 style="font-size:0.95rem;">${section.title}</h3>
        ${questions
          .map(
            (q) => `
          <div style="margin-bottom:1rem;">
            <p class="muted" style="font-size:0.82rem;margin-bottom:0.2rem;">${q.label}</p>
            <p style="white-space:pre-wrap;">${escapeHtml(responses[q.id])}</p>
          </div>`
          )
          .join("")}
      </div>`;
  }).join("");
}

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}


// ===== cron: due-enrollment check =====

export async function runDueEnrollmentsCheck(env, origin) {
  const due = await listDueEnrollments(env);
  for (const enr of due) {
    const client = await getClient(env, enr.client_id);
    const pkg = await getPackage(env, enr.package_id);
    if (!client || !pkg) continue;

    const nextSessionNumber = enr.sessions_used + 1;
    await createBooking(env, {
      enrollment_id: enr.id,
      client_id: enr.client_id,
      package_id: enr.package_id,
      session_number: nextSessionNumber,
      duration_min: pkg.session_length_min,
    });

    await sendEmail(env, {
      to: client.email,
      subject: `Schedule session ${nextSessionNumber} of ${enr.sessions_total}`,
      html: scheduleNextSessionEmail({
        clientName: client.name,
        packageName: pkg.name,
        sessionNumber: nextSessionNumber,
        sessionsIncluded: enr.sessions_total,
        portalUrl: `${origin}/portal`,
      }),
    });

    await markPromptSent(env, enr.id);
  }
}
