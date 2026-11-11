/* ALL editable content lives here. Text is inserted with textContent (never as HTML).
   Tokens usable inside text: {host} {bride} {groom} {venue} {date} {timeLabel} {phones} {event} */
window.INVITE = {
  lang: "en", dir: "ltr",            // use "ar"/"rtl" for right-to-left
  locale: "en-IN",
  date: "2026-11-20",                // event day (YYYY-MM-DD)
  time: "18:30",                     // START TIME used for countdown + .ics. CONFIRM THIS (24h, local)
  utcOffset: "+05:30", timeZone: "Asia/Kolkata",   // IST
  durationHours: 4,
  timeLabel: "After Namaz-e-Maghrib",
  eventTitle: "Arrival of Baraat, Nikah & Dinner",
  eventType: "The Nikah of",
  couple: { bride: "Falak", groom: "Asif" },
  host: { name: "Mr. Mushtaq Ahmed" },
  contacts: [ { display: "80988 32802", tel: "+918098832802" }, { display: "88706 71114", tel: "+918870671114" } ],
  letter: {
    greeting: "Assalamu alaikum wa rahmatullahi wa barakatuhu,",
    paragraphs: [
      "With the blessings of Allah, {host} requests the pleasure of your company at the Nikah of his daughter, {bride}, with {groom}.",
      "Please join us for the {event}, {date}, {timeLabel}, at {venue}. Your presence and duas will complete our happiness."
    ],
    families: [
      { role: "Bride", name: "Falak Naaz", parentage: "D/o Mushtaq Ahmed & Late Mohammed Haneef" },
      { role: "Groom", name: "Mohammed Asif", parentage: "S/o Mohammed Kasim & Late Ubaidur Rahman" }
    ]
  },
  schedule: [   // entries without a title are skipped; empty array hides the section
    { time: "After Maghrib", title: "Arrival of the Baraat", description: "The groom’s family arrives at the hall." },
    { time: "Followed by", title: "Nikah", description: "" },
    { time: "To follow", title: "Dinner", description: "" }
  ],
  venue: {
    name: "Azizia Convention Hall",
    address: "Padrayanapura, Bangalore-26",
    mapUrl: "",     // paste a Google Maps share link; blank = search link built from the address
    embedUrl: ""    // only a real https embed URL; blank = no embedded map
  },
  faq: [         // empty array hides the section
    { q: "Who is invited?", a: "Family and friends. Everyone is welcome." },
    { q: "When should I arrive?", a: "{timeLabel}, on {date}." },
    { q: "Where is it held?", a: "{venue}, Padrayanapura, Bangalore-26. Use the Open map button above." },
    { q: "Who can I call?", a: "Please call {phones}." }
  ],
  closing: { line: "With love and duas,", signature: "{host} and family" },
  opening: { video: "", poster: "" },      // e.g. "assets/opening.mp4", "assets/poster.jpg"
  music: { src: "" },                       // e.g. "assets/music.mp3" (starts only after guest taps Open)
  theme: { wine: "#1a0207", velvet: "#4a0915", ruby: "#8f1426", gold: "#d9b47c", ivory: "#f7eee6" }
};
