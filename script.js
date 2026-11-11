(() => {
  'use strict';
  const C = window.INVITE; if (!C) return;
  const $ = (s, r = document) => r.querySelector(s);
  const mk = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
  const root = document.documentElement;
  root.lang = C.lang; root.dir = C.dir;
  Object.entries(C.theme || {}).forEach(([k, v]) => root.style.setProperty('--' + k, v));

  const start = new Date(`${C.date}T${C.time}:00${C.utcOffset}`);
  const end = new Date(start.getTime() + C.durationHours * 36e5);
  const fmt = o => new Intl.DateTimeFormat(C.locale, { timeZone: C.timeZone, ...o });
  const T = {
    host: C.host.name, bride: C.couple.bride, groom: C.couple.groom, venue: C.venue.name,
    date: fmt({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(start),
    timeLabel: C.timeLabel, event: C.eventTitle, eventType: C.eventType,
    names: `${C.couple.bride} weds ${C.couple.groom}`,
    phones: C.contacts.map(c => c.display).join(' or ')
  };
  const tpl = s => String(s).replace(/\{(\w+)\}/g, (m, k) => (k in T ? T[k] : m));
  document.title = `${C.eventType} ${T.names}`;
  document.querySelectorAll('[data-t]').forEach(e => { if (T[e.dataset.t] != null) e.textContent = T[e.dataset.t]; });

  // Letter
  $('#greet').textContent = C.letter.greeting;
  C.letter.paragraphs.forEach(p => $('#letterBody').append(mk('p', '', tpl(p))));
  C.letter.families.forEach(f => {
    const d = mk('div', 'fam'); d.append(mk('span', 'small', f.role), mk('b', '', f.name), mk('span', '', f.parentage));
    $('#families').append(d);
  });

  // Calendar for the real event month (Sunday-first)
  (function () {
    const [y, m, d] = C.date.split('-').map(Number);
    const first = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
    const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const tb = $('#calendar');
    tb.append(mk('caption', '', new Intl.DateTimeFormat(C.locale, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(y, m - 1, 1)))));
    const hr = mk('tr');
    for (let i = 0; i < 7; i++) {
      const th = mk('th', '', new Intl.DateTimeFormat(C.locale, { weekday: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(2023, 0, 1 + i))));
      th.scope = 'col'; hr.append(th);
    }
    tb.append(hr);
    let tr = mk('tr');
    for (let i = 0; i < first; i++) tr.append(mk('td'));
    for (let n = 1; n <= days; n++) {
      const td = mk('td', n === d ? 'mark' : '', n);
      if (n === d) { td.setAttribute('aria-current', 'date'); td.title = T.date; }
      tr.append(td);
      if ((first + n) % 7 === 0) { tb.append(tr); tr = mk('tr'); }
    }
    if (tr.children.length) { while (tr.children.length < 7) tr.append(mk('td')); tb.append(tr); }
  })();

  // Countdown with event-day / past states
  const dayKey = d => fmt({ year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
  function tick() {
    const now = new Date(), ms = start - now, st = $('#status'), u = $('#units');
    if (ms > 0) {
      u.hidden = false;
      const s = Math.floor(ms / 1000);
      $('[data-u=d]').textContent = Math.floor(s / 86400);
      $('[data-u=h]').textContent = Math.floor(s % 86400 / 3600);
      $('[data-u=m]').textContent = Math.floor(s % 3600 / 60);
      st.textContent = dayKey(now) === dayKey(start) ? 'Today is the day.' : '';
    } else if (now < end) {
      u.hidden = true; st.textContent = 'The celebration is under way. Welcome.';
    } else {
      u.hidden = true; st.textContent = `${T.names} celebrated on ${T.date}. Thank you for your duas.`;
    }
  }
  tick(); setInterval(tick, 15000);

  // Calendar file
  function buildICS() {
    const f = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const esc = s => String(s).replace(/[\\;,]/g, '\\$&').replace(/\n/g, '\\n');
    const fold = l => l.match(/.{1,70}/g).join('\r\n ');
    const loc = `${C.venue.name}, ${C.venue.address}`;
    return [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Invitation//EN', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
      `UID:${C.date}-${C.couple.bride}-${C.couple.groom}@invitation`.replace(/\s/g, ''),
      `DTSTAMP:${f(new Date())}`, `DTSTART:${f(start)}`, `DTEND:${f(end)}`,
      `SUMMARY:${esc(`${C.eventType} ${T.names}`)}`, `LOCATION:${esc(loc)}`,
      `DESCRIPTION:${esc(`${C.eventTitle}. ${C.timeLabel}. Hosted by ${C.host.name}. Contact: ${T.phones}`)}`,
      'END:VEVENT', 'END:VCALENDAR'
    ].map(fold).join('\r\n') + '\r\n';
  }
  window.__invite = { buildICS };
  $('#addCal').addEventListener('click', () => {
    const a = mk('a'); a.href = URL.createObjectURL(new Blob([buildICS()], { type: 'text/calendar' }));
    a.download = 'nikah-invitation.ics'; document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });

  // Schedule
  const ev = (C.schedule || []).filter(e => e && e.title);
  if (!ev.length) $('#schedule').remove();
  else ev.forEach(e => {
    const li = mk('li', 'reveal'); li.append(mk('span', 'small', e.time || ''), mk('h3', '', e.title));
    if (e.description) li.append(mk('p', '', e.description));
    $('#timeline').append(li);
  });

  // Venue
  if (!C.venue || !C.venue.name) $('#venue').remove();
  else {
    $('#vName').textContent = C.venue.name; $('#vAddr').textContent = C.venue.address;
    $('#mapLink').href = C.venue.mapUrl || 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(`${C.venue.name}, ${C.venue.address}`);
    if (/^https:\/\//.test(C.venue.embedUrl || '')) {
      const f = mk('iframe'); f.src = C.venue.embedUrl; f.title = `Map of ${C.venue.name}`; f.loading = 'lazy'; f.referrerPolicy = 'no-referrer-when-downgrade';
      $('#vMap').append(f);
    }
  }

  // FAQ (native details/summary = keyboard accessible)
  const qs = (C.faq || []).filter(x => x && x.q && x.a);
  if (!qs.length) $('#faq').remove();
  else qs.forEach(x => { const d = mk('details'); d.append(mk('summary', '', tpl(x.q)), mk('p', '', tpl(x.a))); $('#faqList').append(d); });

  // Closing
  $('#clLine').textContent = C.closing.line; $('#clSign').textContent = tpl(C.closing.signature);
  C.contacts.forEach(c => { const a = mk('a', '', c.display); a.href = 'tel:' + c.tel; $('#phones').append(a); });

  // One-time reveals
  const rv = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.15 });
    rv.forEach(e => io.observe(e));
  } else rv.forEach(e => e.classList.add('in'));

  // Opening, music
  const cover = $('#cover'), main = $('#main'), openBtn = $('#openBtn'), skipBtn = $('#skipBtn');
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  let done = false, audio = null, video = null;
  function music() {
    if (!C.music || !C.music.src) return;
    try {
      audio = new Audio(C.music.src); audio.loop = true;
      const b = mk('button', 'music'); b.type = 'button'; document.body.append(b);
      const sync = on => { b.textContent = on ? 'Sound on' : 'Sound off'; b.setAttribute('aria-label', on ? 'Mute music' : 'Unmute music'); b.setAttribute('aria-pressed', String(on)); };
      sync(false);
      b.addEventListener('click', () => { if (audio.paused) audio.play().then(() => sync(true)).catch(() => sync(false)); else { audio.pause(); sync(false); } });
      audio.play().then(() => sync(true)).catch(() => sync(false));
    } catch (e) { /* music must never block the invitation */ }
  }
  function reveal() {
    if (done) return; done = true;
    if (video) video.pause();
    cover.classList.add('gone'); document.body.classList.remove('locked'); main.inert = false;
    setTimeout(() => { cover.hidden = true; }, 900);
    window.scrollTo(0, 0); $('#hero h1').focus({ preventScroll: true });
  }
  function fallback() { cover.classList.add('fallback'); skipBtn.textContent = 'Continue'; }
  function playVideo(src) {
    video = mk('video'); video.playsInline = true; video.muted = true; video.controls = false; video.setAttribute('playsinline', '');
    if (C.opening.poster) video.poster = C.opening.poster;
    video.src = src; $('#stage').replaceChildren(video); skipBtn.hidden = false; openBtn.hidden = true;
    video.addEventListener('ended', reveal); video.addEventListener('error', fallback);
    const p = video.play(); if (p && p.catch) p.catch(fallback);
    setTimeout(() => { if (!done && video.currentTime === 0) fallback(); }, 8000);
  }
  if (reduce) { cover.hidden = true; document.body.classList.remove('locked'); }
  else {
    main.inert = true;
    openBtn.addEventListener('click', () => {
      openBtn.disabled = true; music();
      if (C.opening && C.opening.video) playVideo(C.opening.video);
      else { cover.classList.add('opening'); setTimeout(reveal, 1400); }
    });
    skipBtn.addEventListener('click', reveal);
  }
})();
