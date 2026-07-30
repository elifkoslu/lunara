import React from 'react';
import { I18N, LangToggle, t } from './i18n';
import { cycleDayFrom, wrap } from './screens';
import { STAGES, StageChip } from './stages';

/* shared.jsx — BHRT app primitives, data, nav */
/* eslint-disable */

// ─── Sample patient data ───────────────────────────────────────
const PATIENT = {
  name: 'Maeve',
  initial: 'm',
  age: 31,
  condition: 'PCOS · hormone imbalance',
  conditionTr: 'PKOS · hormon dengesizliği',
  cycleDay: 14,
  cycleLength: 32, // PCOS = longer
  programWeek: 18,
};

// Today's prescribed doses
const DOSES_TODAY = [
  {
    id: 'e2-am',
    name: 'Estradiol',
    detail: 'Bi-est 80/20 transdermal',
    dose: '0.5 mg',
    route: 'topical',
    when: 'morning',
    time: '07:30',
    taken: true,
    takenAt: '07:42',
  },
  {
    id: 'test-am',
    name: 'Testosterone',
    detail: 'Cream, inner thigh',
    dose: '1.5 mg',
    route: 'topical',
    when: 'morning',
    time: '07:30',
    taken: true,
    takenAt: '07:42',
  },
  {
    id: 'prog-pm',
    name: 'Progesterone',
    detail: 'Oral micronized · Prometrium',
    dose: '100 mg',
    route: 'oral',
    when: 'bedtime',
    time: '22:00',
    taken: false,
  },
];

// Last 14 days symptom intensities (0-3) for trend
const SYMPTOMS = [
  { key: 'mood',    label: 'Mood',       labelTr: 'Ruh hali',  good: 'lifted',  goodTr: 'iyi',     bad: 'low',      badTr: 'düşük',    today: 1,
    series: [3,3,2,3,2,2,1,2,1,1,2,1,1,1] },
  { key: 'energy',  label: 'Energy',     labelTr: 'Enerji',    good: 'high',    goodTr: 'yüksek',  bad: 'fatigued', badTr: 'yorgun',   today: 2,
    series: [3,3,3,2,2,2,2,1,2,2,2,2,1,2] },
  { key: 'acne',    label: 'Acne',       labelTr: 'Akne',      good: 'clear',   goodTr: 'temiz',   bad: 'flaring',  badTr: 'alevli',   today: 1,
    series: [3,3,3,3,2,2,2,2,1,1,1,2,1,1] },
  { key: 'sleep',   label: 'Sleep',      labelTr: 'Uyku',      good: 'restful', goodTr: 'dinlenmiş', bad: 'broken', badTr: 'bölük',    today: 1,
    series: [2,3,3,3,2,1,2,2,1,1,1,2,1,1] },
  { key: 'cramps',  label: 'Cramps',     labelTr: 'Kramp',     good: 'none',    goodTr: 'yok',     bad: 'strong',   badTr: 'güçlü',    today: 0,
    series: [3,2,1,0,0,0,1,1,0,0,0,1,0,0] },
  { key: 'libido',  label: 'Libido',     labelTr: 'Libido',    good: 'present', goodTr: 'var',     bad: 'absent',   badTr: 'yok',      today: 2,
    series: [0,0,1,1,1,1,2,2,2,2,2,2,2,2] },
  { key: 'fog',     label: 'Brain fog',  labelTr: 'Zihin pusu', good: 'sharp',  goodTr: 'berrak',  bad: 'foggy',    badTr: 'puslu',    today: 1,
    series: [3,3,2,2,3,2,2,1,1,1,2,1,1,1] },
  { key: 'flow',    label: 'Flow',       labelTr: 'Akış',      good: '—',       goodTr: '—',       bad: 'heavy',    badTr: 'yoğun',    today: 0,
    series: [2,2,1,1,0,0,0,0,0,0,0,0,0,0] },
];

// Latest labs (with reference ranges + trend)
const LABS = [
  { key: 'e2',   name: 'Estradiol',      nameTr: 'Estradiol',           value: 87,   unit: 'pg/mL',  range: [50, 200],   status: 'in',     drawn: '2 weeks ago',
    history: [22, 28, 35, 51, 64, 78, 87], target: 80 },
  { key: 'p4',   name: 'Progesterone',   nameTr: 'Progesteron',         value: 11.4, unit: 'ng/mL',  range: [10, 25],    status: 'in',     drawn: '2 weeks ago',
    history: [0.4, 0.6, 1.2, 4.1, 8.0, 9.6, 11.4], target: 15 },
  { key: 't',    name: 'Total Testos.',  nameTr: 'Total Testosteron',   value: 42,   unit: 'ng/dL',  range: [30, 70],    status: 'in',     drawn: '2 weeks ago',
    history: [12, 18, 22, 28, 34, 38, 42], target: 50 },
  { key: 'ft',   name: 'Free T',         nameTr: 'Serbest Testosteron', value: 3.6,  unit: 'pg/mL',  range: [1.5, 6.5],  status: 'in',     drawn: '2 weeks ago',
    history: [0.9, 1.4, 1.8, 2.4, 2.9, 3.2, 3.6], target: 4.0 },
  { key: 'shbg', name: 'SHBG',           nameTr: 'SHBG',                value: 64,   unit: 'nmol/L', range: [25, 90],    status: 'in',     drawn: '2 weeks ago',
    history: [98, 92, 86, 78, 71, 67, 64], target: 55 },
  { key: 'fsh',  name: 'FSH',            nameTr: 'FSH',                 value: 5.8,  unit: 'mIU/mL', range: [3, 12],     status: 'in',     drawn: '2 weeks ago',
    history: [4.9, 5.1, 5.6, 6.0, 5.7, 5.9, 5.8], target: 6 },
];

// ── User-entered lab panels: helpers ──────────────────────────────
// A panel = { id, date:'YYYY-MM-DD', readings:[{ key, name, nameTr, unit, value }] }
function labReadings(panels, key) {
  return (panels || [])
    .map(p => { const r = (p.readings || []).find(x => x.key === key); return r ? { date: p.date, value: r.value } : null; })
    .filter(Boolean)
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}
function labHistory(panels, key) { return labReadings(panels, key).map(r => r.value); }
function labCurrent(panels, key) { const h = labReadings(panels, key); return h.length ? h[h.length - 1].value : null; }

const PROVIDER = {
  name: 'Dr. Sera Halevi, MD',
  spec: 'Reproductive endocrinology',
  specTr: 'Üreme endokrinolojisi',
  initials: 'SH',
  nextConsult: 'Wed, 3 Jun · 10:30',
  lastMsg: 'Your SHBG continues to drop nicely. Let\u2019s hold the current dose for two more weeks.',
  lastMsgAt: 'Yesterday',
  lastMsgTr: 'SHBG değerin güzel düşmeye devam ediyor. Mevcut dozu iki hafta daha koruyalım.',
  lastMsgAtTr: 'Dün',
};

const PROGRAM = {
  name: 'Hormone Restore',
  nameTr: 'Hormon Restorasyonu',
  startedAt: 'Started 17 Jan 2026',
  phase: 'Stabilization',
  phaseTr: 'Stabilizasyon',
  phaseIdx: 2, phaseTotal: 4,
  phases: ['Baseline', 'Titration', 'Stabilization', 'Maintenance'],
  adherence: 0.94,
  nextLabs: 'Fri, 5 Jun',
};

// ─── Icons (minimal stroke) ────────────────────────────────────
const Icon = ({ d, size = 18, stroke = 'currentColor', fill = 'none', sw = 1.4 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
       strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d={d} />
  </svg>
);
const ICONS = {
  home: 'M3 11l9-8 9 8M5 10v10h14V10',
  pulse: 'M3 12h4l3-8 4 16 3-8h4',
  vial: 'M9 3h6M10 3v8.5L5.5 18a3.5 3.5 0 005.5 4.2A3.5 3.5 0 0018.5 18L14 11.5V3',
  pill: 'M10.5 3.5a5 5 0 017 7l-7 7a5 5 0 01-7-7l7-7zM7 7l10 10',
  chat: 'M21 12a8 8 0 11-3.2-6.4L21 5l-1 4-3-1.5',
  book: 'M4 4h7a3 3 0 013 3v13M20 4h-7a3 3 0 00-3 3v13M4 4v16h7M20 4v16h-7',
  cog: 'M12 3l1.6 2.5 2.9-.7.6 2.9 2.6 1.3-1 2.8 1 2.8-2.6 1.3-.6 2.9-2.9-.7L12 21l-1.6-2.5-2.9.7-.6-2.9L4.3 15l1-2.8-1-2.8L6.9 8.1l.6-2.9 2.9.7zM12 9a3 3 0 100 6 3 3 0 000-6z',
  search: 'M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3',
  bell: 'M6 8a6 6 0 1112 0c0 7 3 8 3 8H3s3-1 3-8M10 21a2 2 0 004 0',
  plus: 'M12 5v14M5 12h14',
  check: 'M5 13l4 4L19 7',
  clock: 'M12 6v6l4 2M12 22a10 10 0 110-20 10 10 0 010 20z',
  drop: 'M12 3s6 7 6 12a6 6 0 01-12 0c0-5 6-12 6-12z',
  moon: 'M21 13A9 9 0 1111 3a7 7 0 0010 10z',
  flame: 'M12 3s4 4 4 9a4 4 0 11-8 0c0-3 2-4 2-6 0-1 2-3 2-3z',
  spark: 'M12 2v6M12 16v6M2 12h6M16 12h6M5 5l4 4M15 15l4 4M5 19l4-4M15 9l4-4',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  arrowUp: 'M12 19V5M5 12l7-7 7 7',
  arrowDown: 'M12 5v14M19 12l-7 7-7-7',
  leaf: 'M21 3c0 9-6 15-12 15-3 0-6-1-6-1s6-9 12-12c1-1 6-2 6-2zM3 21c2-8 8-12 12-13',
  brain: 'M9 4a3 3 0 00-3 3 3 3 0 00-2 5 3 3 0 002 5 3 3 0 003 3 3 3 0 003-2v-14a3 3 0 00-3 0zM15 4a3 3 0 013 3 3 3 0 012 5 3 3 0 01-2 5 3 3 0 01-3 3 3 3 0 01-3-2',
  heart: 'M12 21s-7-4.5-7-10a4.5 4.5 0 018-3 4.5 4.5 0 018 3c0 5.5-7 10-7 10z',
  ring: 'M12 22a10 10 0 110-20 10 10 0 010 20zM12 18a6 6 0 110-12 6 6 0 010 12z',
};

// ─── Side rail (stage-aware routes) ──────────────────────────
function navItemsFor(stage) {
  const reg = {
    home:     { icon: ICONS.home,  label: t('Today', 'Bugün') },
    symptoms: { icon: ICONS.pulse, label: t('Symptoms', 'Belirtiler') },
    doses:    { icon: ICONS.pill,  label: t('Doses', 'Dozlar') },
    cycle:    { icon: ICONS.moon,  label: t('Cycle & moon', 'Döngü & ay') },
    move:     { icon: ICONS.pulse, label: t('Movement', 'Hareket') },
    nourish:  { icon: ICONS.leaf,  label: t('Nutrition', 'Beslenme') },
    labs:     { icon: ICONS.vial,  label: t('Labs', 'Tahliller') },
    care:     { icon: ICONS.chat,  label: t('Care team', 'Destek ekibi') },
  };
  // per-stage nav (defaults to full list)
  const STAGE_NAV = (typeof STAGES !== 'undefined' && STAGES[stage] && STAGES[stage].nav)
    || ['home','symptoms','doses','cycle','move','nourish','labs','care'];
  return STAGE_NAV.map(k => ({ k, ...reg[k] }));
}

function SideRail({ active = 'home', onNav, profile, stage = 'cycle' }) {
  const items = navItemsFor(stage);
  return (
    <aside style={{
      width: 220, flexShrink: 0,
      borderRight: '1px solid var(--line)',
      background: 'var(--bone)',
      display: 'flex', flexDirection: 'column',
      padding: '26px 18px',
      gap: 26,
    }}>
      {/* Wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingLeft: 2 }}>
        <Logo size={48}/>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 38, fontStyle: 'var(--display-italic)',
                      color: 'var(--ink)', letterSpacing: '0.01em', fontWeight: 500 }}>
          Lunara
        </div>
      </div>

      {/* Stage chip — current life stage + note */}
      <StageChip stage={stage} onNav={onNav}/>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map(item => {
          const isActive = item.k === active;
          return (
            <button
              key={item.k}
              onClick={() => onNav && onNav(item.k)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px',
                borderRadius: 10,
                fontSize: 14,
                color: isActive ? 'var(--ink)' : 'var(--muted)',
                background: isActive ? 'var(--card)' : 'transparent',
                boxShadow: isActive ? 'inset 0 0 0 1px var(--line)' : 'none',
                fontWeight: isActive ? 600 : 500,
                textAlign: 'left',
                transition: 'all 160ms ease',
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--ink)'; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--muted)'; }}
            >
              <Icon d={item.icon} size={17} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div style={{ flex: 1 }} />

      {/* Profile */}
      <button
        onClick={() => onNav && onNav('profile')}
        style={{
          display: 'flex', alignItems: 'center', gap: 10, width: '100%',
          padding: '12px 8px 12px', borderTop: '1px solid var(--line)',
          background: active === 'profile' ? 'var(--card)' : 'transparent',
          borderRadius: active === 'profile' ? 10 : 0,
          textAlign: 'left', cursor: 'pointer',
          transition: 'background 160ms ease',
        }}
      >
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: 'var(--accent-soft)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--serif)', fontSize: 15, color: 'var(--ink)', fontStyle: 'var(--display-italic)',
          flexShrink: 0,
        }}>{((profile && profile.name) ? profile.name : '·').charAt(0).toLocaleLowerCase(I18N.lang === 'tr' ? 'tr' : 'en')}</div>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{(profile && profile.name) ? profile.name : t('Your profile', 'Profilin')}</span>
          <span style={{ fontSize: 10.5, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile ? t(profile.condition, profile.conditionTr || profile.condition) : ''}</span>
        </div>
        <Icon d={ICONS.cog} size={15} stroke="var(--muted-2)"/>
      </button>

      {/* Language */}
      <LangToggle/>
    </aside>
  );
}

// Selene mark — fine orbit + gradient crescent + sparkle (sidebar size)
function Logo({ size = 28 }) {
  const gid = 'lunara-logo-grad';
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--accent)"/>
          <stop offset="100%" stopColor="var(--accent-soft)"/>
        </linearGradient>
        <mask id="lunara-logo-mask">
          <rect width="100" height="100" fill="black"/>
          <circle cx="50" cy="52" r="27" fill="white"/>
          <circle cx="63" cy="46" r="25" fill="black"/>
        </mask>
      </defs>
      <g transform="rotate(-18 50 50)">
        <ellipse cx="50" cy="50" rx="42" ry="42" stroke="var(--accent)" strokeWidth="2" opacity="0.4"/>
      </g>
      <circle cx="50" cy="52" r="27" fill={`url(#${gid})`} mask="url(#lunara-logo-mask)"/>
      <circle cx="74" cy="26" r="4.5" fill="var(--accent)"/>
    </svg>
  );
}

// ─── Persistent state (localStorage) ───────────────────────────
const LS_KEY = 'lunara.v1';
function loadState() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch (e) { return {}; }
}
function useLunara() {
  const [state, setState] = React.useState(() => {
    const saved = loadState();
    return {
      // dose id -> ISO time taken (or false) — legacy, regimen/doseLog is canonical
      doses: saved.doses || {},
      // 'YYYY-MM-DD' -> { symptomKey: 0..3 }
      symptomLog: saved.symptomLog || {},
      // ISO date string of last period start (defaults to today = cycle day 1
      // until the user sets it in onboarding or on the cycle screen)
      periodStart: saved.periodStart || getTodayKey(),
      // journal notes [{ id, at, text }]
      notes: saved.notes || [],
      // 'YYYY-MM-DD' -> { stepIdx: true }  (workout step completion)
      workoutLog: saved.workoutLog || {},
      // user's supplements [{ id, name, dose, when }] — starts empty
      supplements: saved.supplements || [],
      // 'YYYY-MM-DD' -> { suppId: time }  (supplement taken log)
      suppLog: saved.suppLog || {},
      // cyclic medication regimen — each med active on cycle days [startDay..endDay].
      // Starts EMPTY: medication must be entered by the user (or their clinician),
      // never pre-seeded in a health app.
      regimen: saved.regimen || {
        cycleLength: 28,
        anchor: saved.periodStart || getTodayKey(),  // date that counts as day 1
        meds: [],
      },
      // 'YYYY-MM-DD' -> { medId: time }  (dose taken log, date-scoped)
      doseLog: saved.doseLog || {},
      // editable user profile + preferences
      profile: saved.profile || {
        name: '',
        condition: '',
        conditionTr: '',
        age: '',
        email: '',
        reminders: true,
        cycleAlerts: true,
        labReminders: true,
        emailUpdates: false,
      },
      // life stage (Do..Si) + whether onboarding was completed
      stage: saved.stage || 'perimeno',
      onboarded: saved.onboarded !== undefined ? saved.onboarded : false,
      // TTC (gebe kalma) logs: 'YYYY-MM-DD' -> value
      ttc: saved.ttc || { bbt: {}, lh: {}, intimacy: {} },
      // Pregnancy (gebelik): due date + logs
      pregnancy: saved.pregnancy || {
        dueDate: '2026-10-08',   // ~24. hafta (bugün 2026-06-18)
        weightKg: 68,
        kicks: {},               // 'YYYY-MM-DD' -> count
      },
      // Postpartum (doğum sonrası): birth date + logs
      postpartum: saved.postpartum || {
        birthDate: '2026-06-04', // ~2. hafta
        feeds: {},               // 'YYYY-MM-DD' -> count
        mood: {},                // 'YYYY-MM-DD' -> 1..5
        epds: [],                // EPDS results [{ id, date, score, q10, answers }]
      },
      // Menopause (menopoz): son regl tarihi
      menopause: saved.menopause || { lastPeriod: '2024-03-01' },
      // User-entered lab panels: [{ id, date, readings:[{key,name,nameTr,unit,value}] }]
      labPanels: saved.labPanels || [],
    };
  });
  React.useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {}
  }, [state]);
  const api = React.useMemo(() => ({
    toggleDose: (id, time) => setState(s => ({
      ...s, doses: { ...s.doses, [id]: s.doses[id] ? false : (time || nowHM()) },
    })),
    logSymptom: (dateKey, key, val) => setState(s => ({
      ...s, symptomLog: { ...s.symptomLog, [dateKey]: { ...(s.symptomLog[dateKey] || {}), [key]: val } },
    })),
    setPeriodStart: (iso) => setState(s => ({ ...s, periodStart: iso })),
    addNote: (text) => setState(s => ({
      ...s, notes: [{ id: Date.now(), at: nowHM(), text }, ...s.notes],
    })),
    toggleWorkoutStep: (dateKey, idx) => setState(s => {
      const day = { ...(s.workoutLog[dateKey] || {}) };
      if (day[idx]) delete day[idx]; else day[idx] = true;
      return { ...s, workoutLog: { ...s.workoutLog, [dateKey]: day } };
    }),
    setWorkoutAll: (dateKey, idxList, done) => setState(s => {
      const day = done ? Object.fromEntries(idxList.map(i => [i, true])) : {};
      return { ...s, workoutLog: { ...s.workoutLog, [dateKey]: day } };
    }),
    toggleSupp: (dateKey, id, time) => setState(s => {
      const day = { ...(s.suppLog[dateKey] || {}) };
      if (day[id]) delete day[id]; else day[id] = time || nowHM();
      return { ...s, suppLog: { ...s.suppLog, [dateKey]: day } };
    }),
    addSupp: (supp) => setState(s => ({
      ...s, supplements: [...s.supplements, { id: 'supp-' + Date.now(), when: 'morning', ...supp }],
    })),
    removeSupp: (id) => setState(s => ({
      ...s, supplements: s.supplements.filter(x => x.id !== id),
    })),
    updateProfile: (patch) => setState(s => ({
      ...s, profile: { ...s.profile, ...patch },
    })),
    setStage: (stage) => setState(s => ({ ...s, stage, onboarded: true })),
    setOnboarded: (v) => setState(s => ({ ...s, onboarded: v })),
    logBBT: (dateKey, temp) => setState(s => ({ ...s, ttc: { ...s.ttc, bbt: { ...s.ttc.bbt, [dateKey]: temp } } })),
    setLH: (dateKey, level) => setState(s => {
      const lh = { ...s.ttc.lh };
      if (lh[dateKey] === level) delete lh[dateKey]; else lh[dateKey] = level;
      return { ...s, ttc: { ...s.ttc, lh } };
    }),
    toggleIntimacy: (dateKey) => setState(s => {
      const im = { ...s.ttc.intimacy };
      if (im[dateKey]) delete im[dateKey]; else im[dateKey] = true;
      return { ...s, ttc: { ...s.ttc, intimacy: im } };
    }),
    logWeight: (kg) => setState(s => ({ ...s, pregnancy: { ...s.pregnancy, weightKg: kg } })),
    addKick: (dateKey) => setState(s => ({ ...s, pregnancy: { ...s.pregnancy, kicks: { ...s.pregnancy.kicks, [dateKey]: (s.pregnancy.kicks[dateKey] || 0) + 1 } } })),
    resetKicks: (dateKey) => setState(s => {
      const k = { ...s.pregnancy.kicks }; delete k[dateKey];
      return { ...s, pregnancy: { ...s.pregnancy, kicks: k } };
    }),
    addFeed: (dateKey) => setState(s => ({ ...s, postpartum: { ...s.postpartum, feeds: { ...s.postpartum.feeds, [dateKey]: (s.postpartum.feeds[dateKey] || 0) + 1 } } })),
    resetFeeds: (dateKey) => setState(s => {
      const f = { ...s.postpartum.feeds }; delete f[dateKey];
      return { ...s, postpartum: { ...s.postpartum, feeds: f } };
    }),
    setMood: (dateKey, level) => setState(s => ({ ...s, postpartum: { ...s.postpartum, mood: { ...s.postpartum.mood, [dateKey]: level } } })),
    addEpds: (entry) => setState(s => ({ ...s, postpartum: { ...s.postpartum, epds: [{ id: 'epds-' + Date.now(), ...entry }, ...(s.postpartum.epds || [])] } })),
    removeEpds: (id) => setState(s => ({ ...s, postpartum: { ...s.postpartum, epds: (s.postpartum.epds || []).filter(e => e.id !== id) } })),
    // ── cyclic regimen ──
    addMed: (med) => setState(s => ({
      ...s, regimen: { ...s.regimen, meds: [...s.regimen.meds, {
        id: 'med-' + Date.now(), route: 'oral', when: 'morning', time: '08:00',
        startDay: 1, endDay: s.regimen.cycleLength, ...med,
      }] },
    })),
    updateMed: (id, patch) => setState(s => ({
      ...s, regimen: { ...s.regimen, meds: s.regimen.meds.map(m => m.id === id ? { ...m, ...patch } : m) },
    })),
    removeMed: (id) => setState(s => ({
      ...s, regimen: { ...s.regimen, meds: s.regimen.meds.filter(m => m.id !== id) },
    })),
    setRegimenCycle: (n) => setState(s => ({
      ...s, regimen: { ...s.regimen, cycleLength: Math.max(1, Math.min(60, n)) },
    })),
    setRegimenAnchor: (iso) => setState(s => ({
      ...s, regimen: { ...s.regimen, anchor: iso },
    })),
    toggleMed: (dateKey, id, time) => setState(s => {
      const day = { ...(s.doseLog[dateKey] || {}) };
      if (day[id]) delete day[id]; else day[id] = time || nowHM();
      return { ...s, doseLog: { ...s.doseLog, [dateKey]: day } };
    }),
    // ── lab panels ──
    addLabPanel: (panel) => setState(s => ({
      ...s, labPanels: [{ id: 'lab-' + Date.now(), ...panel }, ...(s.labPanels || [])],
    })),
    removeLabPanel: (id) => setState(s => ({
      ...s, labPanels: (s.labPanels || []).filter(p => p.id !== id),
    })),
  }), []);
  return [state, api];
}
function nowHM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}
// Doz/zaman etiketi yerelleştirme
const WHEN_TR = { morning: 'sabah', midday: 'öğle', evening: 'akşam', bedtime: 'yatmadan', night: 'gece' };
function whenLabel(w) {
  return (typeof I18N !== 'undefined' && I18N.lang === 'tr') ? (WHEN_TR[w] || w) : w;
}
// Gerçek bugünün tarihi (her yükleme anında)
function getTodayKey() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}
const TODAY_KEY = getTodayKey();
const TODAY_DATE = new Date();

// Which regimen cycle day is `today` (1..cycleLength)
function regimenDay(regimen, today = TODAY_DATE) {
  const L = (regimen && regimen.cycleLength) || 28;
  const anchor = new Date(((regimen && regimen.anchor) || getTodayKey()) + 'T00:00:00');
  const d = Math.floor((today - anchor) / 86400000);
  return ((d % L) + L) % L + 1;
}
// Meds active on a given cycle day (supports wrap-around ranges)
function activeMeds(regimen, day) {
  if (!regimen || !regimen.meds) return [];
  return regimen.meds.filter(m => {
    if (m.startDay <= m.endDay) return day >= m.startDay && day <= m.endDay;
    return day >= m.startDay || day <= m.endDay;
  });
}
// Today's active doses + current cycle day
function todaysDoses(lunara, when) {
  if (!lunara || !lunara.regimen) return { meds: [], day: null };
  const day = regimenDay(lunara.regimen, when || TODAY_DATE);
  return { meds: activeMeds(lunara.regimen, day), day };
}
// Is a med logged as taken today?
function medTaken(lunara, id, dateKey) {
  const k = dateKey || TODAY_KEY;
  return (lunara && lunara.doseLog && lunara.doseLog[k] && lunara.doseLog[k][id]) || false;
}

// Date navigator — lets a screen log to any past day (never the future).
const dateNavBtn = { width: 28, height: 28, borderRadius: 8, background: 'var(--bone)', color: 'var(--ink-2)', fontSize: 16, lineHeight: 1, boxShadow: 'inset 0 0 0 1px var(--line-soft)' };
function DateNav({ date, onChange }) {
  const today = getTodayKey();
  const isToday = date === today;
  const locale = I18N.lang === 'tr' ? 'tr' : 'en';
  const label = isToday
    ? t('Today', 'Bugün')
    : new Date(date + 'T00:00:00').toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'long' });
  const keyOf = dt => dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');
  const shift = n => { const nd = new Date(date + 'T00:00:00'); nd.setDate(nd.getDate() + n); const k = keyOf(nd); if (k <= today) onChange(k); };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button onClick={() => shift(-1)} style={{ ...dateNavBtn, cursor: 'pointer' }} aria-label="Previous day">‹</button>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 999, background: 'var(--card)', boxShadow: 'inset 0 0 0 1px var(--line)' }}>
        <Icon d={ICONS.clock} size={13} stroke="var(--muted)"/>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap' }}>{label}</span>
        <input type="date" max={today} value={date} onChange={e => e.target.value && onChange(e.target.value)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} aria-label="Pick a date"/>
      </div>
      <button onClick={() => shift(1)} disabled={isToday} style={{ ...dateNavBtn, opacity: isToday ? 0.35 : 1, cursor: isToday ? 'default' : 'pointer' }} aria-label="Next day">›</button>
      {!isToday && <button onClick={() => onChange(today)} style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, cursor: 'pointer', paddingLeft: 2 }}>{t('Today', 'Bugün')}</button>}
    </div>
  );
}

function ProgramBar({ idx, total }) {
  return (
    <div style={{ display: 'flex', gap: 3, marginTop: 2 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          flex: 1, height: 4, borderRadius: 4,
          background: i < idx ? 'var(--accent)' : i === idx ? 'var(--accent-soft)' : 'var(--line)',
        }}/>
      ))}
    </div>
  );
}

// ─── Top bar ───────────────────────────────────────────────────
function TopBar({ greeting, lunara }) {
  const locale = I18N.lang === 'tr' ? 'tr' : 'en';
  const dateStr = TODAY_DATE
    .toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })
    .toLocaleUpperCase(locale);
  const day = lunara && lunara.periodStart ? cycleDayFrom(lunara.periodStart, TODAY_DATE) : null;
  const name = lunara && lunara.profile && lunara.profile.name;
  const h = TODAY_DATE.getHours();
  const greet = h < 12 ? t('Good morning', 'Günaydın') : h < 18 ? t('Good afternoon', 'İyi günler') : t('Good evening', 'İyi akşamlar');
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '22px 36px 6px',
    }}>
      <div>
        <div className="eyebrow" style={{ marginBottom: 6 }}>
          {dateStr}{day != null ? <> · {t('CYCLE DAY', 'DÖNGÜ GÜNÜ')} {day}</> : null}
        </div>
        <h1 className="serif-display" style={{
          fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 30,
          margin: 0, color: 'var(--ink)',
        }}>
          {greeting || `${greet}${name ? `, ${name}` : ''}.`}
        </h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button style={pillBtn}>
          <Icon d={ICONS.search} size={15} />
          <span>{t('Search', 'Ara')}</span>
        </button>
        <button style={{ ...pillBtn, padding: '10px 12px' }} aria-label="Notifications">
          <Icon d={ICONS.bell} size={15} />
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--accent)', marginLeft: -2,
          }}/>
        </button>
      </div>
    </div>
  );
}
const pillBtn = {
  display: 'flex', alignItems: 'center', gap: 8,
  padding: '10px 14px', borderRadius: 999,
  background: 'var(--card)', color: 'var(--ink-2)',
  boxShadow: 'inset 0 0 0 1px var(--line)',
  fontSize: 13, fontWeight: 500,
};

// ─── Primitives ────────────────────────────────────────────────
function Card({ children, style, pad = 24, ...rest }) {
  return (
    <div
      style={{
        background: 'var(--card)',
        borderRadius: 'var(--r-lg)',
        boxShadow: 'var(--shadow-card)',
        border: '1px solid var(--line-soft)',
        padding: pad,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

// Tiny sparkline for symptoms / labs
function Sparkline({ data, color = 'var(--accent)', width = 110, height = 32, dot = true, range }) {
  const lo = range ? range[0] : Math.min(...data);
  const hi = range ? range[1] : Math.max(...data);
  const span = Math.max(0.0001, hi - lo);
  const step = data.length > 1 ? width / (data.length - 1) : 0;
  const pts = data.map((v, i) => [i * step, height - ((v - lo) / span) * (height - 4) - 2]);
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const last = pts[pts.length - 1];
  return (
    <svg className="chart" width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      {dot && last && <circle cx={last[0]} cy={last[1]} r="2.5" fill={color}/>}
    </svg>
  );
}

// Reference-range bar with current value tick
function RangeBar({ value, range, target, height = 8 }) {
  const [lo, hi] = range;
  const span = hi - lo;
  const pad = span * 0.25; // axis pad
  const axisLo = lo - pad;
  const axisHi = hi + pad;
  const axisSpan = axisHi - axisLo;
  const valPct = ((value - axisLo) / axisSpan) * 100;
  const loPct = ((lo - axisLo) / axisSpan) * 100;
  const hiPct = ((hi - axisLo) / axisSpan) * 100;
  const tgtPct = target != null ? ((target - axisLo) / axisSpan) * 100 : null;
  return (
    <div style={{ position: 'relative', height, marginTop: 4 }}>
      {/* full axis */}
      <div style={{ position: 'absolute', inset: 0, borderRadius: 999, background: 'var(--line-soft)' }}/>
      {/* in-range band */}
      <div style={{
        position: 'absolute', top: 0, bottom: 0, left: `${loPct}%`, width: `${hiPct - loPct}%`,
        background: 'var(--accent-soft)', borderRadius: 999, opacity: 0.85,
      }}/>
      {/* target tick */}
      {tgtPct != null && (
        <div style={{ position: 'absolute', top: -2, bottom: -2, left: `${tgtPct}%`, width: 1.5,
                      background: 'var(--ink-2)', opacity: 0.35 }}/>
      )}
      {/* current value pin */}
      <div style={{
        position: 'absolute', top: -3, left: `calc(${valPct}% - 6px)`,
        width: 12, height: height + 6, borderRadius: 4,
        background: 'var(--ink)',
        boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
      }}/>
    </div>
  );
}

// Symptom dot scale (0-3) for 14-day series
function SymptomTrack({ series, color = 'var(--accent)', dotSize = 6, gap = 3 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap, height: 22 }}>
      {series.map((v, i) => (
        <div key={i} style={{
          width: dotSize, height: 4 + (v * 5), borderRadius: dotSize / 2,
          background: v === 0 ? 'var(--line)' : color,
          opacity: v === 0 ? 1 : 0.35 + v * 0.22,
        }}/>
      ))}
    </div>
  );
}

export { PATIENT, DOSES_TODAY, SYMPTOMS, LABS, PROVIDER, PROGRAM, Icon, ICONS, navItemsFor, SideRail, Logo, LS_KEY, loadState, useLunara, nowHM, WHEN_TR, whenLabel, getTodayKey, TODAY_KEY, TODAY_DATE, regimenDay, activeMeds, todaysDoses, medTaken, DateNav, ProgramBar, TopBar, pillBtn, Card, Sparkline, RangeBar, SymptomTrack, labReadings, labHistory, labCurrent };
