import { router } from "./router.js";
import {
  INTAKE_QUESTIONS,
  INTAKE_SECTIONS,
  activateEnrollment,
  addAvailability,
  addHomework,
  advanceEnrollmentAfterScheduling,
  baseStyles,
  bookingConfirmedEmail,
  clearPortalSessionCookie,
  clearSessionCookie,
  confirmBooking,
  countReschedulesForEnrollment,
  createBooking,
  createEnrollment,
  createSponsorshipCode,
  deleteAvailability,
  findOrCreateClient,
  generateMeetingLink,
  getBooking,
  getBookingByCheckoutRef,
  getClient,
  getClientByEmail,
  getEnrollment,
  getFirstBookingForEnrollment,
  getIntakeForBooking,
  getMentorProfile,
  getPackage,
  getPackageTiers,
  getPortalClientId,
  getSponsorshipCode,
  getTier,
  giftedEnrollmentEmail,
  isAuthed,
  layout,
  listActivePackages,
  listAllEnrollments,
  listAvailability,
  listBookingsForClient,
  listBookingsForEnrollment,
  listClients,
  listDueEnrollments,
  listEnrollmentsForClient,
  listHomeworkForBooking,
  listHomeworkForClient,
  listSponsorshipCodes,
  listUpcomingBookings,
  magicLinkEmail,
  makeLoginToken,
  makePortalSessionCookie,
  makeSessionCookie,
  markPromptSent,
  openSlotsForDate,
  parseIntakeFromForm,
  redeemSponsorshipCode,
  renderIntakeForm,
  renderIntakeReadOnly,
  rescheduleBooking,
  runDueEnrollmentsCheck,
  saveIntakeResponse,
  scheduleBooking,
  scheduleNextSessionEmail,
  sendEmail,
  skipThisMonth,
  tokens,
  updateMentorProfile,
  updatePackage,
  updateTier,
  verifyLoginToken,
  verifyStripeSignature
} from "./lib.js";


// ===== route-public =====
function money(cents) {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: cents % 100 ? 2 : 0 })}`;
}

function tieredPackageCard(pkg, tiers) {
  return `
    <div class="card package-card" style="grid-column: span 1;">
      <div class="tagline">${pkg.tagline}</div>
      <h2>${pkg.name}</h2>
      <p class="muted">${pkg.description}</p>
      <div style="display:flex;flex-direction:column;gap:0.6rem;margin-top:0.5rem;">
        ${tiers
          .map(
            (t) => `
          <a class="button secondary" style="justify-content:space-between;text-align:left;" href="/book/${pkg.id}?tier=${t.id}">
            <span>${t.term_months}-month term</span>
            <strong>${money(t.price_cents)}</strong>
          </a>`
          )
          .join("")}
      </div>
      <p class="muted" style="font-size:0.8rem;margin-top:0.4rem;">${pkg.session_length_min}-minute sessions, one each month.</p>
    </div>`;
}

function simplePackageCard(pkg) {
  return `
    <div class="card package-card">
      <div class="tagline">${pkg.tagline}</div>
      <h2>${pkg.name}</h2>
      <p class="muted">${pkg.description}</p>
      <div class="price">${money(pkg.price_cents)} <small>/ session</small></div>
      <p class="muted" style="font-size:0.85rem;">${pkg.session_length_min}-minute session</p>
      <a class="button" href="/book/${pkg.id}">Book ${pkg.name}</a>
    </div>`;
}

router.get("/", async (c) => {
  const packages = await listActivePackages(c.env);
  const cards = await Promise.all(
    packages.map(async (p) => (p.tiered ? tieredPackageCard(p, await getPackageTiers(c.env, p.id)) : simplePackageCard(p)))
  );
  const body = `
    <section class="hero">
      <div class="shell">
        <div class="eyebrow">Criterion Partners · Mentorship</div>
        <h1>Straightforward mentorship, built around real work</h1>
        <p class="lead">No wasted time, on either side. Every session is built around a real problem you're solving — not theory, not chatting.</p>
        <p class="signature">Ask better questions of your data.</p>
      </div>
    </section>
    <section class="shell" id="packages" style="padding-top:3rem;">
      <h2>Packages</h2>
      <div class="package-grid">${cards.join("")}</div>
      <p class="muted" style="font-size:0.85rem;">Have a Sponsorship Code? You'll enter it during checkout.</p>
    </section>
  `;
  return c.html(layout({ title: c.env.SITE_NAME, body, siteName: c.env.SITE_NAME }));
});


// ===== route-booking =====
router.get("/book/:packageId", async (c) => {
  const pkg = await getPackage(c.env, c.req.param("packageId"));
  if (!pkg || !pkg.active) return c.notFound();

  let tierId = c.req.query("tier") ?? "";
  const prefillCode = c.req.query("code") ?? "";

  if (pkg.tiered) {
    const tiers = await getPackageTiers(c.env, pkg.id);
    const tier = tiers.find((t) => t.id === tierId);
    if (!tier) {
      const body = `
        <section class="shell" style="padding:3rem 0;max-width:520px;">
          <div class="eyebrow">Book</div>
          <h1>${pkg.name}</h1>
          <p class="muted">${pkg.description}</p>
          <div style="display:flex;flex-direction:column;gap:0.75rem;margin-top:1.5rem;">
            ${tiers.map((t) => `
              <a class="button secondary" style="justify-content:space-between;" href="/book/${pkg.id}?tier=${t.id}">
                <span>${t.term_months}-month term</span><strong>${money(t.price_cents)}</strong>
              </a>`).join("")}
          </div>
        </section>`;
      return c.html(layout({ title: `Book ${pkg.name}`, body, siteName: c.env.SITE_NAME }));
    }
  }

  const tier = pkg.tiered ? await getTier(c.env, tierId) : null;
  const priceLine = pkg.tiered
    ? `${money(tier.price_cents)} total · ${tier.term_months} sessions, one each month`
    : `${money(pkg.price_cents)} one time`;

  const body = `
    <section class="shell" style="padding:3rem 0;">
      <div class="eyebrow">Book</div>
      <h1>${pkg.name}${pkg.tiered ? ` — ${tier.term_months}-month term` : ""}</h1>
      <p class="muted">${pkg.description}</p>
      <p><strong>${priceLine}</strong> · ${pkg.session_length_min} minutes per session</p>

      <div class="card" style="margin-top:2rem;">
        <h2 style="font-size:1.15rem;">1. Pick a time for your first session</h2>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.5rem;">
          <button type="button" class="button secondary" id="prev-month">←</button>
          <strong id="month-label"></strong>
          <button type="button" class="button secondary" id="next-month">→</button>
        </div>
        <div class="calendar-grid" id="calendar"></div>
        <div id="slots" class="slot-grid"></div>

        <h2 style="font-size:1.15rem;margin-top:2rem;">2. Your details</h2>
        <form id="intake-form">
          <div class="field"><label>Full name</label><input required name="name" /></div>
          <div class="field"><label>Email</label><input required type="email" name="email" /></div>
          <div class="field"><label>Phone (optional)</label><input name="phone" /></div>

          ${pkg.requires_intake ? `
          <h2 style="font-size:1.15rem;margin-top:2rem;">3. A bit about where you're at</h2>
          <p class="muted" style="font-size:0.85rem;margin-top:-0.5rem;">This shapes our first session. You'll be able to see these answers in your portal, but not edit them — you'll do a fresh version of this at renewal.</p>
          ${renderIntakeForm()}
          ` : ""}
        </form>

        <h2 style="font-size:1.15rem;margin-top:2rem;">${pkg.requires_intake ? "4" : "3"}. Payment</h2>
        <div class="field">
          <label>Sponsorship Code <span class="muted">(optional)</span></label>
          <input id="sponsorship-code" name="sponsorship_code" value="${prefillCode}" placeholder="Leave blank to pay normally" />
        </div>
        <div id="banner-error" class="banner error" style="display:none;"></div>
        <button class="button" id="pay-button" disabled>Select a time to continue</button>
      </div>
    </section>

    <script>
      const PACKAGE_ID = ${JSON.stringify(pkg.id)};
      const TIER_ID = ${JSON.stringify(pkg.tiered ? tier.id : null)};
      let selectedDate = null, selectedTime = null, viewMonth = new Date();
      viewMonth.setDate(1);
      const monthLabel = document.getElementById('month-label');
      const calendarEl = document.getElementById('calendar');
      const slotsEl = document.getElementById('slots');
      const payButton = document.getElementById('pay-button');
      const errorBanner = document.getElementById('banner-error');

      function fmtDate(d) { return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }

      async function renderCalendar() {
        monthLabel.textContent = viewMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
        const year = viewMonth.getFullYear(), month = viewMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const startOffset = firstDay.getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const res = await fetch('/api/availability?packageId=' + PACKAGE_ID + '&month=' + (month+1) + '&year=' + year);
        const { availableDates } = await res.json();
        const availSet = new Set(availableDates);
        let html = ['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => '<div class="day-head">'+d+'</div>').join('');
        for (let i=0;i<startOffset;i++) html += '<button class="day empty" disabled></button>';
        for (let day=1; day<=daysInMonth; day++) {
          const d = new Date(year, month, day);
          const key = fmtDate(d);
          const isPast = d < new Date(new Date().toDateString());
          const has = availSet.has(key) && !isPast;
          html += '<button type="button" class="day" data-date="' + key + '" ' + (has ? '' : 'disabled') + '>' + day + '</button>';
        }
        calendarEl.innerHTML = html;
        calendarEl.querySelectorAll('button.day[data-date]').forEach(btn => btn.addEventListener('click', () => selectDate(btn.dataset.date, btn)));
      }

      async function selectDate(dateStr, btn) {
        calendarEl.querySelectorAll('button.day').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedDate = dateStr; selectedTime = null;
        const res = await fetch('/api/slots?packageId=' + PACKAGE_ID + '&date=' + dateStr);
        const { slots } = await res.json();
        slotsEl.innerHTML = slots.map(s => '<button type="button" class="slot" data-time="'+s+'">'+s+'</button>').join('') || '<p class="muted">No open times this day.</p>';
        slotsEl.querySelectorAll('button.slot').forEach(b => b.addEventListener('click', () => {
          slotsEl.querySelectorAll('button.slot').forEach(x => x.classList.remove('selected'));
          b.classList.add('selected');
          selectedTime = b.dataset.time;
          payButton.disabled = false;
          payButton.textContent = document.getElementById('sponsorship-code').value.trim() ? 'Redeem code & book' : 'Continue to payment';
        }));
      }

      document.getElementById('prev-month').addEventListener('click', () => { viewMonth.setMonth(viewMonth.getMonth()-1); renderCalendar(); });
      document.getElementById('next-month').addEventListener('click', () => { viewMonth.setMonth(viewMonth.getMonth()+1); renderCalendar(); });
      document.getElementById('sponsorship-code').addEventListener('input', (e) => {
        if (selectedTime) payButton.textContent = e.target.value.trim() ? 'Redeem code & book' : 'Continue to payment';
      });
      renderCalendar();
      ${prefillCode ? "document.getElementById('sponsorship-code').dispatchEvent(new Event('input'));" : ""}

      payButton.addEventListener('click', async (e) => {
        e.preventDefault();
        errorBanner.style.display = 'none';
        const form = document.getElementById('intake-form');
        if (!form.reportValidity()) return;
        if (!selectedDate || !selectedTime) return;

        payButton.disabled = true;
        payButton.textContent = 'Working…';
        const data = Object.fromEntries(new FormData(form).entries());
        try {
          const res = await fetch('/api/checkout', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...data, packageId: PACKAGE_ID, tierId: TIER_ID, date: selectedDate, time: selectedTime,
              sponsorshipCode: document.getElementById('sponsorship-code').value.trim() }),
          });
          const json = await res.json();
          if (!res.ok) throw new Error(json.error || 'Something went wrong');
          window.location.href = json.redirectUrl;
        } catch (err) {
          payButton.disabled = false;
          payButton.textContent = 'Continue to payment';
          errorBanner.textContent = err.message;
          errorBanner.style.display = 'block';
        }
      });
    </script>
  `;
  return c.html(layout({ title: `Book ${pkg.name}`, body, siteName: c.env.SITE_NAME }));
});

router.get("/book/confirmed", async (c) => {
  const body = `
    <section class="shell" style="padding:5rem 0;text-align:center;">
      <h1>You're all set</h1>
      <p class="muted">Check your email for your session details, meeting link, and a link to your portal. If payment is still processing you'll get a confirmation shortly.</p>
      <a class="button" href="/">Back home</a>
    </section>`;
  return c.html(layout({ title: "Booked", body, siteName: c.env.SITE_NAME }));
});

// ---- JSON APIs ------------------------------------------------------------

router.get("/api/availability", async (c) => {
  const packageId = c.req.query("packageId");
  const month = Number(c.req.query("month"));
  const year = Number(c.req.query("year"));
  const slots = await listAvailability(c.env, { from: `${year}-${String(month).padStart(2, "0")}-01`, packageId });
  const lastDay = new Date(year, month, 0).getDate();
  const monthPrefix = `${year}-${String(month).padStart(2, "0")}`;
  const availableDates = Array.from(
    new Set(slots.filter((s) => s.date.startsWith(monthPrefix) && s.date <= `${monthPrefix}-${String(lastDay).padStart(2, "0")}`).map((s) => s.date))
  );
  return c.json({ availableDates });
});

router.get("/api/slots", async (c) => {
  const packageId = c.req.query("packageId");
  const date = c.req.query("date");
  const pkg = await getPackage(c.env, packageId);
  if (!pkg) return c.json({ slots: [] });
  const slots = await openSlotsForDate(c.env, date, packageId, pkg.session_length_min);
  return c.json({ slots });
});

router.post("/api/checkout", async (c) => {
  const body = await c.req.json();
  const pkg = await getPackage(c.env, body.packageId);
  if (!pkg) return c.json({ error: "Package not found" }, 404);

  const tier = pkg.tiered ? await getTier(c.env, body.tierId) : null;
  if (pkg.tiered && !tier) return c.json({ error: "Term not found" }, 404);

  const sessionsTotal = pkg.tiered ? tier.term_months : pkg.sessions_included ?? 1;
  const paymentLinkUrl = pkg.tiered ? tier.payment_link_url : pkg.payment_link_url;

  const client = await findOrCreateClient(c.env, { name: body.name, email: body.email, phone: body.phone });
  const intakeResponses = pkg.requires_intake ? parseIntakeAnswers(body) : null;

  // ---- Sponsorship code path: skip payment entirely -----------------------
  if (body.sponsorshipCode) {
    const sc = await getSponsorshipCode(c.env, body.sponsorshipCode);
    if (!sc) return c.json({ error: "That code isn't valid." }, 400);
    if (sc.package_id !== pkg.id) return c.json({ error: "That code isn't valid for this package." }, 400);
    if (sc.tier_id && tier && sc.tier_id !== tier.id) return c.json({ error: "That code is for a different term length." }, 400);
    if (sc.uses_count >= sc.max_uses) return c.json({ error: "That code has already been used." }, 400);
    if (sc.expires_at && sc.expires_at < new Date().toISOString().slice(0, 10)) return c.json({ error: "That code has expired." }, 400);
    if (sc.client_email && sc.client_email !== body.email.toLowerCase()) return c.json({ error: "That code is reserved for a different email address." }, 400);

    let enrollmentId = null;
    if (pkg.tiered) {
      enrollmentId = await createEnrollment(c.env, {
        client_id: client.id, package_id: pkg.id, tier_id: tier.id, term_months: tier.term_months,
        sessions_total: sessionsTotal, payment_type: "sponsorship_code", sponsorship_code_id: sc.id,
      });
    }
    const bookingId = await createBooking(c.env, {
      enrollment_id: enrollmentId, client_id: client.id, package_id: pkg.id, session_number: 1,
      scheduled_date: body.date, scheduled_time: body.time, duration_min: pkg.session_length_min,
    });
    if (intakeResponses) await saveIntakeResponse(c.env, { booking_id: bookingId, client_id: client.id, responses: intakeResponses });
    if (enrollmentId) await activateEnrollment(c.env, enrollmentId, body.date);
    await redeemSponsorshipCode(c.env, sc.id);

    const meetingLink = generateMeetingLink(bookingId);
    await confirmBooking(c.env, bookingId, meetingLink);
    await sendEmail(c.env, {
      to: client.email,
      subject: `Confirmed: ${pkg.name}`,
      html: bookingConfirmedEmail({
        clientName: client.name, packageName: pkg.name, date: body.date, time: body.time, meetingLink,
        sessionNumber: 1, sessionsIncluded: sessionsTotal,
        portalUrl: `${new URL(c.req.url).origin}/portal`,
      }),
    });
    return c.json({ redirectUrl: "/book/confirmed" });
  }

  // ---- Normal payment path via Bluevine -------------------------------------
  if (!paymentLinkUrl) return c.json({ error: "Payment isn't set up for this package yet — check back shortly." }, 500);

  let enrollmentId = null;
  if (pkg.tiered) {
    enrollmentId = await createEnrollment(c.env, {
      client_id: client.id, package_id: pkg.id, tier_id: tier.id, term_months: tier.term_months,
      sessions_total: sessionsTotal, payment_type: "bluevine",
    });
  }
  const bookingId = await createBooking(c.env, {
    enrollment_id: enrollmentId, client_id: client.id, package_id: pkg.id, session_number: 1,
    scheduled_date: body.date, scheduled_time: body.time, duration_min: pkg.session_length_min,
  });
  if (intakeResponses) await saveIntakeResponse(c.env, { booking_id: bookingId, client_id: client.id, responses: intakeResponses });

  const url = new URL(paymentLinkUrl);
  url.searchParams.set("client_reference_id", bookingId);
  url.searchParams.set("prefilled_email", body.email);
  return c.json({ redirectUrl: url.toString() });
});

function parseIntakeAnswers(body) {
  const responses = {};
  for (const q of INTAKE_QUESTIONS) responses[q.id] = body[`intake_${q.id}`] ?? "";
  return responses;
}


// ===== route-schedule =====
router.get("/schedule/:bookingId", async (c) => {
  const booking = await getBooking(c.env, c.req.param("bookingId"));
  if (!booking) return c.notFound();
  if (booking.scheduled_date) {
    const body = `<section class="shell" style="padding:5rem 0;text-align:center;"><h1>Already scheduled</h1>
      <p class="muted">This session is set for ${booking.scheduled_date} at ${booking.scheduled_time}.</p></section>`;
    return c.html(layout({ title: "Already scheduled", body, siteName: c.env.SITE_NAME }));
  }
  const pkg = await getPackage(c.env, booking.package_id);
  if (!pkg) return c.notFound();

  const body = `
    <section class="shell" style="padding:3rem 0;max-width:640px;">
      <h1>Schedule session ${booking.session_number}</h1>
      <p class="muted">${pkg.name} — already paid, just pick a time.</p>
      <div class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.5rem;">
          <button type="button" class="button secondary" id="prev-month">←</button>
          <strong id="month-label"></strong>
          <button type="button" class="button secondary" id="next-month">→</button>
        </div>
        <div class="calendar-grid" id="calendar"></div>
        <div id="slots" class="slot-grid"></div>
        <div id="banner-error" class="banner error" style="display:none;"></div>
        <button class="button" id="confirm-button" disabled>Select a time</button>
      </div>
    </section>
    <script>
      const PACKAGE_ID = ${JSON.stringify(pkg.id)};
      const BOOKING_ID = ${JSON.stringify(booking.id)};
      let selectedDate = null, selectedTime = null, viewMonth = new Date();
      viewMonth.setDate(1);
      const monthLabel = document.getElementById('month-label');
      const calendarEl = document.getElementById('calendar');
      const slotsEl = document.getElementById('slots');
      const confirmButton = document.getElementById('confirm-button');
      const errorBanner = document.getElementById('banner-error');
      function fmtDate(d) { return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
      async function renderCalendar() {
        monthLabel.textContent = viewMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
        const year = viewMonth.getFullYear(), month = viewMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const startOffset = firstDay.getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const res = await fetch('/api/availability?packageId=' + PACKAGE_ID + '&month=' + (month+1) + '&year=' + year);
        const { availableDates } = await res.json();
        const availSet = new Set(availableDates);
        let html = ['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => '<div class="day-head">'+d+'</div>').join('');
        for (let i=0;i<startOffset;i++) html += '<button class="day empty" disabled></button>';
        for (let day=1; day<=daysInMonth; day++) {
          const d = new Date(year, month, day);
          const key = fmtDate(d);
          const isPast = d < new Date(new Date().toDateString());
          const has = availSet.has(key) && !isPast;
          html += '<button type="button" class="day" data-date="' + key + '" ' + (has ? '' : 'disabled') + '>' + day + '</button>';
        }
        calendarEl.innerHTML = html;
        calendarEl.querySelectorAll('button.day[data-date]').forEach(btn => btn.addEventListener('click', () => selectDate(btn.dataset.date, btn)));
      }
      async function selectDate(dateStr, btn) {
        calendarEl.querySelectorAll('button.day').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedDate = dateStr; selectedTime = null;
        const res = await fetch('/api/slots?packageId=' + PACKAGE_ID + '&date=' + dateStr);
        const { slots } = await res.json();
        slotsEl.innerHTML = slots.map(s => '<button type="button" class="slot" data-time="'+s+'">'+s+'</button>').join('') || '<p class="muted">No open times this day.</p>';
        slotsEl.querySelectorAll('button.slot').forEach(b => b.addEventListener('click', () => {
          slotsEl.querySelectorAll('button.slot').forEach(x => x.classList.remove('selected'));
          b.classList.add('selected');
          selectedTime = b.dataset.time;
          confirmButton.disabled = false;
          confirmButton.textContent = 'Confirm ' + selectedDate + ' at ' + selectedTime;
        }));
      }
      document.getElementById('prev-month').addEventListener('click', () => { viewMonth.setMonth(viewMonth.getMonth()-1); renderCalendar(); });
      document.getElementById('next-month').addEventListener('click', () => { viewMonth.setMonth(viewMonth.getMonth()+1); renderCalendar(); });
      renderCalendar();
      confirmButton.addEventListener('click', async () => {
        confirmButton.disabled = true;
        confirmButton.textContent = 'Booking…';
        const res = await fetch('/api/schedule', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId: BOOKING_ID, date: selectedDate, time: selectedTime }),
        });
        if (res.ok) {
          document.querySelector('section').innerHTML = '<h1>Booked</h1><p class="muted">See you ' + selectedDate + ' at ' + selectedTime + '. Check your email for the meeting link, or view it in your portal.</p>';
        } else {
          const json = await res.json();
          errorBanner.textContent = json.error || 'Something went wrong';
          errorBanner.style.display = 'block';
          confirmButton.disabled = false;
          confirmButton.textContent = 'Try again';
        }
      });
    </script>
  `;
  return c.html(layout({ title: "Schedule your session", body, siteName: c.env.SITE_NAME }));
});

router.post("/api/schedule", async (c) => {
  const { bookingId, date, time } = await c.req.json();
  const booking = await getBooking(c.env, bookingId);
  if (!booking) return c.json({ error: "Booking not found" }, 404);
  if (booking.scheduled_date) return c.json({ error: "Already scheduled" }, 400);

  await scheduleBooking(c.env, bookingId, date, time);
  const meetingLink = generateMeetingLink(bookingId);
  await confirmBooking(c.env, bookingId, meetingLink);
  if (booking.enrollment_id) await advanceEnrollmentAfterScheduling(c.env, booking.enrollment_id, date);

  const pkg = await getPackage(c.env, booking.package_id);
  const client = await getClient(c.env, booking.client_id);
  if (pkg && client) {
    await sendEmail(c.env, {
      to: client.email,
      subject: `Confirmed: ${pkg.name} — session ${booking.session_number}`,
      html: bookingConfirmedEmail({
        clientName: client.name, packageName: pkg.name, date, time, meetingLink,
        sessionNumber: booking.session_number, sessionsIncluded: pkg.sessions_included ?? 1,
        portalUrl: `${new URL(c.req.url).origin}/portal`,
      }),
    });
  }
  return c.json({ ok: true });
});


// ===== route-portal =====
router.get("/portal/login", async (c) => {
  const body = `
    <section class="shell" style="max-width:420px;padding:5rem 0;">
      <h1>Your portal</h1>
      <p class="muted">Enter your email and we'll send you a link — no password needed.</p>
      <form method="post" action="/portal/login">
        <div class="field"><label>Email</label><input type="email" name="email" required autofocus /></div>
        <button class="button" type="submit">Send me a link</button>
      </form>
    </section>`;
  return c.html(layout({ title: "Portal login", body, siteName: c.env.SITE_NAME }));
});

router.post("/portal/login", async (c) => {
  const form = await c.req.formData();
  const email = String(form.get("email") ?? "");
  const client = await getClientByEmail(c.env, email);
  if (client) {
    const token = await makeLoginToken(c.env, client.id);
    const loginUrl = `${new URL(c.req.url).origin}/portal/verify?token=${token}`;
    await sendEmail(c.env, { to: client.email, subject: "Your portal link", html: magicLinkEmail({ clientName: client.name, loginUrl }) });
  }
  const body = `
    <section class="shell" style="max-width:420px;padding:5rem 0;text-align:center;">
      <h1>Check your email</h1>
      <p class="muted">If that email is on file, a login link is on its way. It expires in 15 minutes.</p>
    </section>`;
  return c.html(layout({ title: "Check your email", body, siteName: c.env.SITE_NAME }));
});

router.get("/portal/verify", async (c) => {
  const token = c.req.query("token") ?? "";
  const clientId = await verifyLoginToken(c.env, token);
  if (!clientId) {
    const body = `<section class="shell" style="padding:5rem 0;text-align:center;"><h1>That link expired</h1><p class="muted">Request a new one.</p><a class="button" href="/portal/login">Get a new link</a></section>`;
    return c.html(layout({ title: "Link expired", body, siteName: c.env.SITE_NAME }), 400);
  }
  c.header("Set-Cookie", await makePortalSessionCookie(c.env, clientId));
  return c.redirect("/portal");
});

router.get("/portal/logout", async (c) => {
  c.header("Set-Cookie", clearPortalSessionCookie());
  return c.redirect("/portal/login");
});

router.get("/portal", async (c) => {
  const clientId = await getPortalClientId(c.env, c.req.header("Cookie") ?? null);
  if (!clientId) return c.redirect("/portal/login");
  const client = await getClient(c.env, clientId);
  if (!client) return c.redirect("/portal/login");

  const mentor = await getMentorProfile(c.env);
  const enrollments = await listEnrollmentsForClient(c.env, clientId);

  const mentorCard = `
    <div class="card" style="display:flex;gap:1.25rem;align-items:flex-start;margin-bottom:2rem;">
      ${mentor.photo_url ? `<img src="${mentor.photo_url}" alt="${mentor.name}" style="width:88px;height:88px;border-radius:4px;object-fit:cover;" />` : ""}
      <div>
        <div style="display:flex;align-items:center;gap:0.6rem;flex-wrap:wrap;">
          <h2 style="font-size:1.1rem;margin:0;">${mentor.name}</h2>
          ${mentor.badge_url ? `<img src="${mentor.badge_url}" alt="${mentor.badge_label ?? ""}" style="height:22px;" />` : mentor.badge_label ? `<span class="badge confirmed">${mentor.badge_label}</span>` : ""}
        </div>
        <p class="muted" style="font-size:0.85rem;margin:0.2rem 0 0.6rem;">${mentor.title}</p>
        <p style="font-size:0.9rem;white-space:pre-wrap;">${mentor.bio}</p>
      </div>
    </div>`;

  const enrollmentBlocks = await Promise.all(
    enrollments.map(async (enr) => {
      const pkg = await getPackage(c.env, enr.package_id);
      const bookings = await listBookingsForEnrollment(c.env, enr.id);
      const firstBooking = await getFirstBookingForEnrollment(c.env, enr.id);
      const intake = firstBooking ? await getIntakeForBooking(c.env, firstBooking.id) : null;

      const dots = `<div class="timeline">${Array.from({ length: enr.sessions_total })
        .map((_, i) => `<div class="dot${i < enr.sessions_used ? " filled" : ""}"></div>`).join("")}</div>`;

      const reschedulesUsed = await countReschedulesForEnrollment(c.env, enr.id);
      const reschedulesRemaining = Math.max(0, 3 - reschedulesUsed);

      const sessionRows = await Promise.all(
        bookings.map(async (b) => {
          const homework = await listHomeworkForBooking(c.env, b.id);
          const now = Date.now();
          const scheduledAt = b.scheduled_date ? new Date(`${b.scheduled_date}T${b.scheduled_time || "00:00"}:00`).getTime() : 0;
          const isUpcoming = b.status === "confirmed" && scheduledAt > now;
          const canReschedule = isUpcoming && b.reschedule_count === 0 && reschedulesRemaining > 0 && scheduledAt - now > 48 * 60 * 60 * 1000;
          const needsScheduling = b.status === "pending" && !b.scheduled_date;

          return `
            <div class="card" style="margin-bottom:1rem;">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                <div>
                  <strong>Session ${b.session_number} of ${enr.sessions_total}</strong>
                  ${b.scheduled_date ? `<p class="muted" style="font-size:0.85rem;margin:0.2rem 0;">${b.scheduled_date} at ${b.scheduled_time}</p>` : `<p class="muted" style="font-size:0.85rem;margin:0.2rem 0;">Not yet scheduled</p>`}
                </div>
                <span class="badge ${b.status === "confirmed" ? "confirmed" : b.status === "canceled" ? "canceled" : "pending"}">${b.status}</span>
              </div>
              ${b.meeting_link ? `<p style="margin:0.5rem 0 0;"><a href="${b.meeting_link}" target="_blank">Join meeting</a></p>` : ""}
              ${needsScheduling ? `
                <div style="margin-top:0.75rem;display:flex;gap:0.6rem;flex-wrap:wrap;">
                  <a class="button" href="/schedule/${b.id}">Schedule this session</a>
                  ${enr.skip_used === 0 ? `<form method="post" action="/portal/skip"><input type="hidden" name="bookingId" value="${b.id}" /><input type="hidden" name="enrollmentId" value="${enr.id}" /><button class="button secondary" type="submit">Skip this month</button></form>` : ""}
                </div>
                <p class="muted" style="font-size:0.78rem;margin-top:0.5rem;">Skipping tacks this session onto the end of your term instead. You get one skip per term.</p>
              ` : ""}
              ${canReschedule ? `<a class="button secondary" style="margin-top:0.6rem;" href="/portal/reschedule/${b.id}">Reschedule</a>` : ""}
              ${homework.length > 0 ? `
                <div style="margin-top:0.85rem;border-top:1px solid var(--border);padding-top:0.75rem;">
                  <p style="font-size:0.82rem;font-weight:600;color:var(--ink);margin-bottom:0.4rem;">Homework</p>
                  ${homework.map((h) => `
                    <div style="margin-bottom:0.6rem;">
                      <p style="font-size:0.88rem;margin:0 0 0.2rem;">${h.assignment}</p>
                      <p class="muted" style="font-size:0.78rem;margin:0;"><em>Why:</em> ${h.rationale}</p>
                      <p class="muted" style="font-size:0.78rem;margin:0;"><em>Benefit:</em> ${h.benefits}</p>
                    </div>`).join("")}
                </div>` : ""}
            </div>`;
        })
      );

      return `
        <div style="margin-bottom:2.5rem;">
          <div style="display:flex;justify-content:space-between;align-items:baseline;">
            <h2 style="font-size:1.2rem;">${pkg?.name ?? "Mentorship"} — ${enr.term_months}-month term</h2>
            <span class="badge ${enr.status === "active" ? "confirmed" : enr.status === "completed" ? "pending" : "canceled"}">${enr.status.replace("_", " ")}</span>
          </div>
          ${dots}
          <p class="muted" style="font-size:0.8rem;margin-top:0.3rem;">${reschedulesRemaining} of 3 reschedules remaining this term · ${enr.skip_used ? "skip used" : "1 skip available"}</p>
          ${enr.status === "completed" ? `<div class="banner">This term is complete. <a href="/book/${enr.package_id}">Renew for another term</a>.</div>` : ""}
          ${intake ? `
            <details style="margin:1rem 0;">
              <summary style="cursor:pointer;font-weight:600;font-size:0.9rem;color:var(--ink);">Your intake answers</summary>
              <div class="card" style="margin-top:0.75rem;">${renderIntakeReadOnly(intake.responses_json)}</div>
            </details>` : ""}
          ${sessionRows.join("")}
        </div>`;
    })
  );

  const body = `
    <section class="shell" style="padding:3rem 0;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <h1>Hi, ${client.name.split(" ")[0]}</h1>
        <a href="/portal/logout" class="muted" style="font-size:0.85rem;">Log out</a>
      </div>
      ${mentorCard}
      ${enrollmentBlocks.join("") || `<p class="muted">No mentorship terms yet.</p>`}
    </section>`;
  return c.html(layout({ title: "Your portal", body, siteName: c.env.SITE_NAME }));
});

router.post("/portal/skip", async (c) => {
  const clientId = await getPortalClientId(c.env, c.req.header("Cookie") ?? null);
  if (!clientId) return c.redirect("/portal/login");
  const form = await c.req.formData();
  const bookingId = String(form.get("bookingId"));
  const enrollmentId = String(form.get("enrollmentId"));

  const booking = await getBooking(c.env, bookingId);
  if (booking && booking.client_id === clientId) {
    await c.env.DB.prepare("UPDATE bookings SET status='canceled' WHERE id=?").bind(bookingId).run();
    await skipThisMonth(c.env, enrollmentId);
  }
  return c.redirect("/portal");
});

router.get("/portal/reschedule/:bookingId", async (c) => {
  const clientId = await getPortalClientId(c.env, c.req.header("Cookie") ?? null);
  if (!clientId) return c.redirect("/portal/login");
  const booking = await getBooking(c.env, c.req.param("bookingId"));
  if (!booking || booking.client_id !== clientId) return c.notFound();

  const [year, month] = booking.scheduled_date.split("-").map(Number);
  const pkg = await getPackage(c.env, booking.package_id);

  const body = `
    <section class="shell" style="padding:3rem 0;max-width:600px;">
      <h1>Reschedule session ${booking.session_number}</h1>
      <p class="muted">Currently ${booking.scheduled_date} at ${booking.scheduled_time}. New time must stay within ${new Date(year, month - 1).toLocaleString("default", { month: "long", year: "numeric" })} and be at least 7 days out.</p>
      <div class="card">
        <div class="calendar-grid" id="calendar"></div>
        <div id="slots" class="slot-grid"></div>
        <div id="banner-error" class="banner error" style="display:none;"></div>
        <button class="button" id="confirm-button" disabled>Select a time</button>
      </div>
    </section>
    <script>
      const PACKAGE_ID = ${JSON.stringify(booking.package_id)};
      const BOOKING_ID = ${JSON.stringify(booking.id)};
      const YEAR = ${year}, MONTH = ${month};
      const MIN_DATE = new Date(Date.now() + 7*24*60*60*1000);
      let selectedDate = null, selectedTime = null;
      const calendarEl = document.getElementById('calendar');
      const slotsEl = document.getElementById('slots');
      const confirmButton = document.getElementById('confirm-button');
      const errorBanner = document.getElementById('banner-error');
      function fmtDate(d) { return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }

      async function renderCalendar() {
        const firstDay = new Date(YEAR, MONTH-1, 1);
        const startOffset = firstDay.getDay();
        const daysInMonth = new Date(YEAR, MONTH, 0).getDate();
        const res = await fetch('/api/availability?packageId=' + PACKAGE_ID + '&month=' + MONTH + '&year=' + YEAR);
        const { availableDates } = await res.json();
        const availSet = new Set(availableDates);
        let html = ['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => '<div class="day-head">'+d+'</div>').join('');
        for (let i=0;i<startOffset;i++) html += '<button class="day empty" disabled></button>';
        for (let day=1; day<=daysInMonth; day++) {
          const d = new Date(YEAR, MONTH-1, day);
          const key = fmtDate(d);
          const eligible = availSet.has(key) && d >= MIN_DATE;
          html += '<button type="button" class="day" data-date="' + key + '" ' + (eligible ? '' : 'disabled') + '>' + day + '</button>';
        }
        calendarEl.innerHTML = html;
        calendarEl.querySelectorAll('button.day[data-date]').forEach(btn => btn.addEventListener('click', () => selectDate(btn.dataset.date, btn)));
      }
      async function selectDate(dateStr, btn) {
        calendarEl.querySelectorAll('button.day').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedDate = dateStr; selectedTime = null;
        const res = await fetch('/api/slots?packageId=' + PACKAGE_ID + '&date=' + dateStr);
        const { slots } = await res.json();
        slotsEl.innerHTML = slots.map(s => '<button type="button" class="slot" data-time="'+s+'">'+s+'</button>').join('') || '<p class="muted">No open times this day.</p>';
        slotsEl.querySelectorAll('button.slot').forEach(b => b.addEventListener('click', () => {
          slotsEl.querySelectorAll('button.slot').forEach(x => x.classList.remove('selected'));
          b.classList.add('selected');
          selectedTime = b.dataset.time;
          confirmButton.disabled = false;
          confirmButton.textContent = 'Confirm ' + selectedDate + ' at ' + selectedTime;
        }));
      }
      renderCalendar();
      confirmButton.addEventListener('click', async () => {
        confirmButton.disabled = true;
        confirmButton.textContent = 'Saving…';
        const res = await fetch('/api/reschedule', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId: BOOKING_ID, date: selectedDate, time: selectedTime }),
        });
        if (res.ok) window.location.href = '/portal';
        else {
          const json = await res.json();
          errorBanner.textContent = json.error || 'Something went wrong';
          errorBanner.style.display = 'block';
          confirmButton.disabled = false;
          confirmButton.textContent = 'Try again';
        }
      });
    </script>`;
  return c.html(layout({ title: "Reschedule", body, siteName: c.env.SITE_NAME }));
});

router.post("/api/reschedule", async (c) => {
  const clientId = await getPortalClientId(c.env, c.req.header("Cookie") ?? null);
  if (!clientId) return c.json({ error: "Please log in again." }, 401);
  const { bookingId, date, time } = await c.req.json();
  const booking = await getBooking(c.env, bookingId);
  if (!booking || booking.client_id !== clientId) return c.json({ error: "Session not found" }, 404);
  if (booking.reschedule_count > 0) return c.json({ error: "This session has already been rescheduled once." }, 400);
  if (booking.enrollment_id) {
    const used = await countReschedulesForEnrollment(c.env, booking.enrollment_id);
    if (used >= 3) return c.json({ error: "You've used all 3 reschedules available for this term." }, 400);
  }

  const scheduledAt = new Date(`${booking.scheduled_date}T${booking.scheduled_time}:00`).getTime();
  if (scheduledAt - Date.now() < 48 * 60 * 60 * 1000) {
    return c.json({ error: "Reschedules need to happen at least 48 hours before the original session." }, 400);
  }
  if (!date.startsWith(booking.scheduled_date.slice(0, 7))) {
    return c.json({ error: "The new time has to stay within the same month." }, 400);
  }
  if (new Date(date).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000) {
    return c.json({ error: "The new time needs to be at least a week out." }, 400);
  }

  await rescheduleBooking(c.env, bookingId, date, time);
  return c.json({ ok: true });
});


// ===== route-admin =====
// Matches Hono's "/admin/*" semantics: protects /admin and everything under it.
router.use("/admin", async (c, next) => {
  if (new URL(c.req.url).pathname === "/admin/login") return next();
  const authed = await isAuthed(c.env, c.req.header("Cookie") ?? null);
  if (!authed) return c.redirect("/admin/login");
  return next();
});

function adminNav(active) {
  const items = [
    ["/admin", "Dashboard"],
    ["/admin/enrollments", "Enrollments"],
    ["/admin/availability", "Availability"],
    ["/admin/clients", "Clients"],
    ["/admin/packages", "Packages"],
    ["/admin/codes", "Sponsorship Codes"],
    ["/admin/profile", "Mentor Profile"],
  ];
  return `<div style="display:flex;gap:1.25rem;border-bottom:1px solid var(--border);margin-bottom:2rem;padding-bottom:0.75rem;flex-wrap:wrap;">
    ${items.map(([href, label]) => `<a href="${href}" style="text-decoration:none;font-weight:600;font-size:0.85rem;color:${active === href ? "var(--gold-dark)" : "var(--muted)"};">${label}</a>`).join("")}
    <a href="/admin/logout" style="margin-left:auto;text-decoration:none;font-size:0.8rem;color:var(--muted);">Log out</a>
  </div>`;
}
// ---- Auth ------------------------------------------------------------

router.get("/admin/login", async (c) => {
  const body = `<section class="shell" style="max-width:400px;padding:5rem 0;"><h1>Admin login</h1>
    <form method="post" action="/admin/login"><div class="field"><label>Password</label><input type="password" name="password" required autofocus /></div>
    <button class="button" type="submit">Log in</button></form></section>`;
  return c.html(layout({ title: "Admin login", body, siteName: c.env.SITE_NAME }));
});
router.post("/admin/login", async (c) => {
  const form = await c.req.formData();
  if (form.get("password") !== c.env.ADMIN_PASSWORD) {
    const body = `<section class="shell" style="max-width:400px;padding:5rem 0;"><h1>Admin login</h1><div class="banner error">Wrong password.</div>
      <form method="post" action="/admin/login"><div class="field"><label>Password</label><input type="password" name="password" required autofocus /></div>
      <button class="button" type="submit">Log in</button></form></section>`;
    return c.html(layout({ title: "Admin login", body, siteName: c.env.SITE_NAME }), 401);
  }
  c.header("Set-Cookie", await makeSessionCookie(c.env));
  return c.redirect("/admin");
});
router.get("/admin/logout", async (c) => { c.header("Set-Cookie", clearSessionCookie()); return c.redirect("/admin/login"); });

// ---- Dashboard ---------------------------------------------------------

router.get("/admin", async (c) => {
  const bookings = await listUpcomingBookings(c.env);
  const rows = await Promise.all(bookings.map(async (b) => `
      <tr>
        <td>${b.scheduled_date || "TBD"} ${b.scheduled_time || ""}</td>
        <td>${b.client_name}<br/><span class="muted" style="font-size:0.8rem;">${b.client_email}</span></td>
        <td>${b.package_name} <span class="muted">#${b.session_number}</span></td>
        <td><span class="badge ${b.status}">${b.status}</span></td>
        <td>${b.meeting_link ? `<a href="${b.meeting_link}" target="_blank">Join</a>` : "—"}</td>
        <td><a href="/admin/bookings/${b.id}/homework" style="font-size:0.85rem;">+ Homework</a></td>
      </tr>`));

  const body = `
    <section class="shell" style="padding:3rem 0;">
      <h1>Dashboard</h1>
      ${adminNav("/admin")}
      <h2 style="font-size:1.1rem;">Upcoming & recent sessions</h2>
      <table>
        <thead><tr><th>When</th><th>Client</th><th>Package</th><th>Status</th><th>Meeting</th><th></th></tr></thead>
        <tbody>${rows.join("") || `<tr><td colspan="6" class="muted">No bookings yet.</td></tr>`}</tbody>
      </table>
    </section>`;
  return c.html(layout({ title: "Admin — Dashboard", body, siteName: c.env.SITE_NAME }));
});

// ---- Homework ------------------------------------------------------------

router.get("/admin/bookings/:id/homework", async (c) => {
  const booking = await getBooking(c.env, c.req.param("id"));
  if (!booking) return c.notFound();
  const body = `
    <section class="shell" style="padding:3rem 0;max-width:560px;">
      <h1>Assign homework</h1>
      <p class="muted">Session ${booking.session_number} — ${booking.scheduled_date || "unscheduled"}</p>
      <form method="post" action="/admin/bookings/${booking.id}/homework">
        <div class="field"><label>What they should do</label><textarea name="assignment" required></textarea></div>
        <div class="field"><label>Why you assigned it</label><textarea name="rationale" required></textarea></div>
        <div class="field"><label>What it gets them</label><textarea name="benefits" required></textarea></div>
        <button class="button" type="submit">Save homework</button>
      </form>
    </section>`;
  return c.html(layout({ title: "Assign homework", body, siteName: c.env.SITE_NAME }));
});
router.post("/admin/bookings/:id/homework", async (c) => {
  const form = await c.req.formData();
  await addHomework(c.env, {
    booking_id: c.req.param("id"),
    assignment: String(form.get("assignment")),
    rationale: String(form.get("rationale")),
    benefits: String(form.get("benefits")),
  });
  return c.redirect("/admin");
});

// ---- Enrollments ------------------------------------------------------------

router.get("/admin/enrollments", async (c) => {
  const enrollments = await listAllEnrollments(c.env);
  const rows = enrollments.map((e) => `
    <tr>
      <td>${e.client_name}<br/><span class="muted" style="font-size:0.8rem;">${e.client_email}</span></td>
      <td>${e.package_name} — ${e.term_months}mo</td>
      <td>${e.sessions_used} / ${e.sessions_total}</td>
      <td><span class="badge ${e.status === "active" ? "confirmed" : e.status === "completed" ? "pending" : "canceled"}">${e.status.replace("_", " ")}</span></td>
      <td>${e.payment_type === "sponsorship_code" ? "Sponsored" : "Bluevine"}</td>
      <td>${e.skip_used ? "Used" : "Available"}</td>
    </tr>`).join("");
  const body = `
    <section class="shell" style="padding:3rem 0;">
      <h1>Enrollments</h1>
      ${adminNav("/admin/enrollments")}
      <table>
        <thead><tr><th>Client</th><th>Term</th><th>Progress</th><th>Status</th><th>Payment</th><th>Skip</th></tr></thead>
        <tbody>${rows || `<tr><td colspan="6" class="muted">No enrollments yet.</td></tr>`}</tbody>
      </table>
    </section>`;
  return c.html(layout({ title: "Admin — Enrollments", body, siteName: c.env.SITE_NAME }));
});

// ---- Availability --------------------------------------------------------

router.get("/admin/availability", async (c) => {
  const packages = await listActivePackages(c.env);
  const today = new Date().toISOString().slice(0, 10);
  const slots = await listAvailability(c.env, { from: today });
  const rows = slots.map((s) => `
      <tr><td>${s.date}</td><td>${s.start_time}–${s.end_time}</td>
        <td>${s.package_id ? packages.find((p) => p.id === s.package_id)?.name ?? s.package_id : "Any package"}</td>
        <td><form method="post" action="/admin/availability/${s.id}/delete"><button class="button secondary" type="submit">Remove</button></form></td></tr>`).join("");
  const body = `
    <section class="shell" style="padding:3rem 0;">
      <h1>Availability</h1>
      ${adminNav("/admin/availability")}
      <div class="card" style="max-width:480px;margin-bottom:2rem;">
        <h2 style="font-size:1.05rem;">Add a window</h2>
        <form method="post" action="/admin/availability">
          <div class="field"><label>Date</label><input type="date" name="date" required /></div>
          <div class="field"><label>Start time</label><input type="time" name="start_time" value="09:00" required /></div>
          <div class="field"><label>End time</label><input type="time" name="end_time" value="17:00" required /></div>
          <div class="field"><label>For which package?</label>
            <select name="package_id"><option value="">Any package</option>${packages.map((p) => `<option value="${p.id}">${p.name}</option>`).join("")}</select>
          </div>
          <button class="button" type="submit">Add window</button>
        </form>
      </div>
      <table><thead><tr><th>Date</th><th>Window</th><th>Package</th><th></th></tr></thead>
        <tbody>${rows || `<tr><td colspan="4" class="muted">No upcoming availability yet.</td></tr>`}</tbody></table>
    </section>`;
  return c.html(layout({ title: "Admin — Availability", body, siteName: c.env.SITE_NAME }));
});
router.post("/admin/availability", async (c) => {
  const form = await c.req.formData();
  await addAvailability(c.env, { date: String(form.get("date")), start_time: String(form.get("start_time")), end_time: String(form.get("end_time")), package_id: form.get("package_id") ? String(form.get("package_id")) : null });
  return c.redirect("/admin/availability");
});
router.post("/admin/availability/:id/delete", async (c) => { await deleteAvailability(c.env, c.req.param("id")); return c.redirect("/admin/availability"); });

// ---- Clients -------------------------------------------------------------

router.get("/admin/clients", async (c) => {
  const clients = await listClients(c.env);
  const rows = clients.map((cl) => `<tr><td>${cl.name}</td><td>${cl.email}</td><td>${cl.phone ?? "—"}</td><td>${cl.created_at}</td></tr>`).join("");
  const body = `<section class="shell" style="padding:3rem 0;"><h1>Clients</h1>${adminNav("/admin/clients")}
    <table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Since</th></tr></thead>
    <tbody>${rows || `<tr><td colspan="4" class="muted">No clients yet.</td></tr>`}</tbody></table></section>`;
  return c.html(layout({ title: "Admin — Clients", body, siteName: c.env.SITE_NAME }));
});

// ---- Packages & tiers --------------------------------------------------------

router.get("/admin/packages", async (c) => {
  const packages = await listActivePackages(c.env);
  const cards = await Promise.all(packages.map(async (p) => {
    if (p.tiered) {
      const tiers = await getPackageTiers(c.env, p.id);
      return `
      <div class="card" style="margin-bottom:1.25rem;">
        <h2 style="font-size:1.05rem;">${p.name} <span class="muted" style="font-weight:400;font-size:0.85rem;">(tiered)</span></h2>
        ${tiers.map((t) => `
          <form method="post" action="/admin/tiers/${t.id}" style="border-top:1px solid var(--border);padding-top:1rem;margin-top:1rem;">
            <p style="font-weight:600;font-size:0.9rem;">${t.term_months}-month term</p>
            <div class="field"><label>Price (cents)</label><input type="number" name="price_cents" value="${t.price_cents}" required /></div>
            <div class="field"><label>Bluevine payment link URL</label><input type="url" name="payment_link_url" value="${t.payment_link_url ?? ""}" required /></div>
            <button class="button secondary" type="submit">Save ${t.term_months}mo</button>
          </form>`).join("")}
      </div>`;
    }
    return `
      <div class="card" style="margin-bottom:1.25rem;">
        <form method="post" action="/admin/packages/${p.id}">
          <h2 style="font-size:1.05rem;">${p.name}</h2>
          <div class="field"><label>Name</label><input name="name" value="${p.name}" required /></div>
          <div class="field"><label>Tagline</label><input name="tagline" value="${p.tagline}" required /></div>
          <div class="field"><label>Description</label><textarea name="description" required>${p.description}</textarea></div>
          <div class="field"><label>Price (cents)</label><input type="number" name="price_cents" value="${p.price_cents}" required /></div>
          <div class="field"><label>Session length (min)</label><input type="number" name="session_length_min" value="${p.session_length_min}" required /></div>
          <div class="field"><label>Sessions included</label><input type="number" name="sessions_included" value="${p.sessions_included}" required /></div>
          <div class="field"><label>Bluevine payment link URL</label><input type="url" name="payment_link_url" value="${p.payment_link_url ?? ""}" required /></div>
          <button class="button" type="submit">Save ${p.name}</button>
        </form>
      </div>`;
  }));
  const body = `<section class="shell" style="padding:3rem 0;"><h1>Packages</h1>${adminNav("/admin/packages")}${cards.join("")}</section>`;
  return c.html(layout({ title: "Admin — Packages", body, siteName: c.env.SITE_NAME }));
});
router.post("/admin/packages/:id", async (c) => {
  const existing = await getPackage(c.env, c.req.param("id"));
  if (!existing) return c.notFound();
  const form = await c.req.formData();
  await updatePackage(c.env, {
    ...existing, name: String(form.get("name")), tagline: String(form.get("tagline")), description: String(form.get("description")),
    price_cents: Number(form.get("price_cents")), session_length_min: Number(form.get("session_length_min")),
    sessions_included: Number(form.get("sessions_included")), payment_link_url: String(form.get("payment_link_url")),
  });
  return c.redirect("/admin/packages");
});
router.post("/admin/tiers/:id", async (c) => {
  const existing = await getTier(c.env, c.req.param("id"));
  if (!existing) return c.notFound();
  const form = await c.req.formData();
  await updateTier(c.env, { ...existing, price_cents: Number(form.get("price_cents")), payment_link_url: String(form.get("payment_link_url")) });
  return c.redirect("/admin/packages");
});

// ---- Sponsorship codes ---------------------------------------------------

router.get("/admin/codes", async (c) => {
  const codes = await listSponsorshipCodes(c.env);
  const packages = await listActivePackages(c.env);
  const tiersByPackage = {};
  for (const p of packages) if (p.tiered) tiersByPackage[p.id] = await getPackageTiers(c.env, p.id);

  const origin = new URL(c.req.url).origin;
  const rows = codes.map((code) => {
    const link = `${origin}/book/${code.package_id}${code.tier_id ? `?tier=${code.tier_id}` : ""}${code.tier_id ? "&" : "?"}code=${code.code}`;
    return `<tr>
      <td><strong>${code.code}</strong>${code.note ? `<br/><span class="muted" style="font-size:0.78rem;">${code.note}</span>` : ""}</td>
      <td>${code.package_id}${code.tier_id ? ` (${code.tier_id})` : ""}</td>
      <td>${code.client_email ?? "Anyone"}</td>
      <td>${code.uses_count} / ${code.max_uses}</td>
      <td><a href="${link}" style="font-size:0.8rem;">Copy link</a></td>
    </tr>`;
  }).join("");

  const body = `
    <section class="shell" style="padding:3rem 0;">
      <h1>Sponsorship Codes</h1>
      <p class="muted" style="font-size:0.85rem;">Waives payment entirely for whoever redeems it — used for gifted mentorships, not discounts.</p>
      ${adminNav("/admin/codes")}
      <div class="card" style="max-width:520px;margin-bottom:2rem;">
        <h2 style="font-size:1.05rem;">Create a code</h2>
        <form method="post" action="/admin/codes">
          <div class="field"><label>Code</label><input name="code" required placeholder="e.g. SOPHIA-MENTORSHIP" /></div>
          <div class="field"><label>Package</label>
            <select name="package_id" id="package-select" required>
              ${packages.map((p) => `<option value="${p.id}">${p.name}</option>`).join("")}
            </select>
          </div>
          <div class="field"><label>Term (only if package is tiered — leave blank to let them choose)</label>
            <select name="tier_id"><option value="">Any / not applicable</option>
              ${Object.entries(tiersByPackage).flatMap(([pkgId, tiers]) => tiers.map((t) => `<option value="${t.id}">${pkgId} — ${t.term_months}mo</option>`)).join("")}
            </select>
          </div>
          <div class="field"><label>Restrict to one email (optional)</label><input type="email" name="client_email" placeholder="Leave blank for anyone with the code" /></div>
          <div class="field"><label>Max uses</label><input type="number" name="max_uses" value="1" required /></div>
          <div class="field"><label>Private note (for you only)</label><input name="note" placeholder="e.g. Gift for Sophia — 3mo mentorship reset" /></div>
          <button class="button" type="submit">Create code</button>
        </form>
      </div>
      <table><thead><tr><th>Code</th><th>Package</th><th>Restricted to</th><th>Uses</th><th></th></tr></thead>
      <tbody>${rows || `<tr><td colspan="5" class="muted">No codes yet.</td></tr>`}</tbody></table>
    </section>`;
  return c.html(layout({ title: "Admin — Sponsorship Codes", body, siteName: c.env.SITE_NAME }));
});
router.post("/admin/codes", async (c) => {
  const form = await c.req.formData();
  await createSponsorshipCode(c.env, {
    code: String(form.get("code")), package_id: String(form.get("package_id")),
    tier_id: form.get("tier_id") ? String(form.get("tier_id")) : undefined,
    client_email: form.get("client_email") ? String(form.get("client_email")) : undefined,
    max_uses: Number(form.get("max_uses") || 1), note: form.get("note") ? String(form.get("note")) : undefined,
  });
  return c.redirect("/admin/codes");
});

// ---- Mentor profile --------------------------------------------------------

router.get("/admin/profile", async (c) => {
  const profile = await getMentorProfile(c.env);
  const body = `
    <section class="shell" style="padding:3rem 0;max-width:560px;">
      <h1>Mentor Profile</h1>
      <p class="muted" style="font-size:0.85rem;">Shown to mentees in their portal.</p>
      ${adminNav("/admin/profile")}
      <form method="post" action="/admin/profile" class="card">
        <div class="field"><label>Name</label><input name="name" value="${profile.name}" required /></div>
        <div class="field"><label>Title</label><input name="title" value="${profile.title}" required /></div>
        <div class="field"><label>Photo URL</label><input type="url" name="photo_url" value="${profile.photo_url ?? ""}" placeholder="Link to a hosted photo" /></div>
        <div class="field"><label>Badge image URL</label><input type="url" name="badge_url" value="${profile.badge_url ?? ""}" placeholder="e.g. your Women in Tech mentor badge" /></div>
        <div class="field"><label>Badge label (used if no image)</label><input name="badge_label" value="${profile.badge_label ?? ""}" placeholder="e.g. Women in Tech Mentor" /></div>
        <div class="field"><label>Bio & credentials</label><textarea name="bio" required style="min-height:9rem;">${profile.bio}</textarea></div>
        <button class="button" type="submit">Save profile</button>
      </form>
    </section>`;
  return c.html(layout({ title: "Admin — Mentor Profile", body, siteName: c.env.SITE_NAME }));
});
router.post("/admin/profile", async (c) => {
  const form = await c.req.formData();
  await updateMentorProfile(c.env, {
    id: 1, name: String(form.get("name")), title: String(form.get("title")),
    photo_url: form.get("photo_url") ? String(form.get("photo_url")) : null,
    badge_url: form.get("badge_url") ? String(form.get("badge_url")) : null,
    badge_label: form.get("badge_label") ? String(form.get("badge_label")) : null,
    bio: String(form.get("bio")),
  });
  return c.redirect("/admin/profile");
});


// ===== route-webhook =====
router.post("/api/webhook/stripe", async (c) => {
  const payload = await c.req.text();
  const sig = c.req.header("Stripe-Signature");
  if (!sig || !(await verifyStripeSignature(payload, sig, c.env.STRIPE_WEBHOOK_SECRET))) {
    return c.text("Invalid signature", 400);
  }

  const event = JSON.parse(payload);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const bookingId = session.client_reference_id;
    if (!bookingId) return c.text("ok");

    const booking = await getBooking(c.env, bookingId);
    if (!booking || booking.status === "confirmed") return c.text("ok");

    const pkg = await getPackage(c.env, booking.package_id);
    const meetingLink = generateMeetingLink(bookingId);
    await confirmBooking(c.env, bookingId, meetingLink);
    if (booking.enrollment_id) {
      await activateEnrollment(c.env, booking.enrollment_id, booking.scheduled_date);
    }

    const client = await c.env.DB.prepare("SELECT * FROM clients WHERE id = ?").bind(booking.client_id).first();
    if (client && pkg) {
      await sendEmail(c.env, {
        to: client.email,
        subject: `Confirmed: ${pkg.name}`,
        html: bookingConfirmedEmail({
          clientName: client.name, packageName: pkg.name, date: booking.scheduled_date, time: booking.scheduled_time,
          meetingLink, sessionNumber: booking.session_number, sessionsIncluded: pkg.sessions_included ?? 1,
          portalUrl: `${new URL(c.req.url).origin}/portal`,
        }),
      });
    }
  }

  return c.text("ok");
});
