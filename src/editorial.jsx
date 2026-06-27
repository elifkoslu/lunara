import React from 'react';
import { t, useLang } from './i18n';
import { TodayWorkoutCard } from './nourish';
import { MoonDisc, cycleDayFrom, moonName, moonPhase, phaseLabel, phaseOf } from './screens';
import { Card, DOSES_TODAY, ICONS, Icon, LABS, PATIENT, PROGRAM, PROVIDER, RangeBar, SYMPTOMS, SymptomTrack, TODAY_DATE, TODAY_KEY, medTaken, nowHM, todaysDoses, whenLabel } from './shared';

/* editorial.jsx — Aesthetic A: warm bone + maroon, magazine */
/* eslint-disable */

function DashboardEditorial({ lunara, api, onNav, hasDoses = true }) {
  return (
    <div style={{ padding: '18px 36px 40px', display: 'flex', flexDirection: 'column', gap: 22 }}>
      <EdHero lunara={lunara} hasDoses={hasDoses} onNav={onNav}/>
      <EdMoonToday/>
      {lunara && <WeeklySummary lunara={lunara} hasDoses={hasDoses}/>}
      {hasDoses ? (
        <div className="mb-stack" style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 22 }}>
          <EdToday lunara={lunara} api={api}/>
          <EdSymptomFeeling/>
        </div>
      ) : (
        <EdSymptomFeeling/>
      )}
      {lunara && api && <TodayWorkoutCard lunara={lunara} api={api} onNav={onNav}/>}
      {hasDoses && <EdLabsStrip/>}
      <div className="mb-stack" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 22 }}>
        {hasDoses ? <EdCareNote/> : <EdLibraryRead/>}
        {hasDoses ? <EdLibraryRead/> : <EdCareNote/>}
      </div>
    </div>
  );
}

// ─── Weekly summary ────────────────────────────────────────────
function WeeklySummary({ lunara, hasDoses = true }) {
  const lang = useLang();
  const today = new Date(TODAY_DATE);
  const keys = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    keys.push(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'));
  }
  const symLog = lunara.symptomLog || {};
  const doseLog = lunara.doseLog || {};
  const tracked = keys.filter(k => symLog[k] && Object.keys(symLog[k]).length > 0).length;
  const entries = keys.reduce((s, k) => s + (symLog[k] ? Object.values(symLog[k]).filter(v => v > 0).length : 0), 0);
  const doses = keys.reduce((s, k) => s + (doseLog[k] ? Object.keys(doseLog[k]).length : 0), 0);
  const weekAgo = today.getTime() - 7 * 86400000;
  const notes = (lunara.notes || []).filter(n => typeof n.id === 'number' && n.id >= weekAgo).length;

  const day = cycleDayFrom(lunara.periodStart, today);
  const phaseWord = phaseLabel(phaseOf(day)).toLocaleLowerCase(lang === 'tr' ? 'tr' : 'en');

  const tiles = [
    { value: tracked, label: t('days tracked', 'gün takip'), icon: ICONS.check },
    ...(hasDoses ? [{ value: doses, label: t('doses taken', 'doz alındı'), icon: ICONS.pill }] : []),
    { value: entries, label: t('symptoms logged', 'belirti kaydı'), icon: ICONS.pulse },
    { value: notes, label: t('notes', 'not'), icon: ICONS.book },
  ];

  const narrative = tracked === 0
    ? t('No check-ins yet this week — a quick daily note builds your picture.',
        'Bu hafta henüz kayıt yok — kısa bir günlük not resmini oluşturur.')
    : t(`You logged ${tracked} of the last 7 days — you’re in your ${phaseWord} phase.`,
        `Son 7 günün ${tracked}’ini kaydettin — ${phaseWord} fazındasın.`);

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
        <div className="eyebrow">{t('This week', 'Bu hafta')}</div>
        <span style={{ fontSize: 10.5, color: 'var(--muted-2)', fontFamily: 'var(--mono)' }}>{t('last 7 days', 'son 7 gün')}</span>
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        {tiles.map((tile, i) => (
          <div key={i} style={{ flex: '1 1 92px', display: 'flex', flexDirection: 'column', gap: 7, padding: '15px 16px', borderRadius: 'var(--r-md)', background: 'var(--bone)' }}>
            <span style={{ color: 'var(--accent)' }}><Icon d={tile.icon} size={16}/></span>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 28, lineHeight: 1, letterSpacing: '-0.01em' }}>{tile.value}</span>
            <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)', letterSpacing: '0.02em' }}>{tile.label}</span>
          </div>
        ))}
      </div>
      <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 15, lineHeight: 1.5, color: 'var(--ink-2)', margin: 0 }}>
        {narrative}
      </p>
    </Card>
  );
}

// ─── Hero ──────────────────────────────────────────────────────
// Cycle-phase daily tips (bilingual)
const HERO_PHASE_TIP = {
  menstrual:  { en: 'Rest is productive today — gentle movement, iron-rich food, and warmth.',
                tr: 'Bugün dinlenmek verimli — hafif hareket, demirden zengin besinler ve sıcaklık.' },
  follicular: { en: 'Energy is climbing — a good day to build, train harder, and start new things.',
                tr: 'Enerji yükseliyor — inşa etmek, daha sıkı çalışmak ve yeniliklere başlamak için iyi gün.' },
  ovulation:  { en: 'You’re near your peak — strength, focus, and sociability run high. Use the momentum.',
                tr: 'Zirveye yakınsın — güç, odak ve sosyallik yüksek. Bu ivmeyi kullan.' },
  luteal:     { en: 'Wind down gently — steady movement, complex carbs, and earlier sleep ease PMS.',
                tr: 'Nazikçe yavaşla — istikrarlı hareket, kompleks karbonhidrat ve erken uyku PMS’i hafifletir.' },
};
// Moon-phase clause (8), appended to the daily tip
const HERO_MOON_CLAUSE = [
  { en: 'With the new moon, it’s a moment to set a quiet intention.', tr: 'Yeni ayla birlikte sessiz bir niyet belirleme anı.' },
  { en: 'The waxing moon supports fresh starts.', tr: 'Büyüyen ay yeni başlangıçları destekler.' },
  { en: 'The first-quarter moon nudges you to act.', tr: 'İlk dördün ay seni harekete iter.' },
  { en: 'The gibbous moon rewards refining, not restarting.', tr: 'Şişkin ay yeniden başlamayı değil ince ayarı ödüllendirir.' },
  { en: 'Under the full moon, emotions and energy run vivid.', tr: 'Dolunay altında duygular ve enerji canlı akar.' },
  { en: 'The waning moon is for sharing and digesting.', tr: 'Küçülen ay paylaşmak ve sindirmek içindir.' },
  { en: 'The last-quarter moon invites you to let go.', tr: 'Son dördün ay bırakmaya davet eder.' },
  { en: 'The waning crescent calls for rest.', tr: 'İncelen hilal dinlenmeyi çağırır.' },
];

function EdHero({ lunara, hasDoses = true, onNav }) {
  const lang = useLang();
  const today = TODAY_DATE;
  const day = lunara ? cycleDayFrom(lunara.periodStart, today) : PATIENT.cycleDay;
  const ph = phaseOf(day);
  const remaining = lunara
    ? DOSES_TODAY.filter(d => !lunara.doses[d.id]).length
    : DOSES_TODAY.filter(d => !d.taken).length;
  const moon = moonPhase(new Date('2026-06-18T21:00:00'));
  const moonIdx = moonPhaseIndex(moon.frac);
  const phaseWord = phaseLabel(ph).toLocaleLowerCase(lang === 'tr' ? 'tr' : 'en');

  // Data-driven headline: dose status + phase
  const doseLine = remaining === 0
    ? t('All doses done for today.', 'Bugün tüm dozlar tamam.')
    : t(`${remaining} dose${remaining > 1 ? 's' : ''} left today.`, `Bugün ${remaining} doz kaldı.`);
  const headline = hasDoses ? t(
    <>{doseLine} You’re in your <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>{phaseWord}</em> phase.</>,
    <>{doseLine} <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>{phaseWord}</em> fazındasın.</>
  ) : t(
    <>You’re in your <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>{phaseWord}</em> phase — day {day} of your cycle.</>,
    <>Döngünün {day}. günündesin — <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>{phaseWord}</em> fazı.</>
  );
  // Daily tip: cycle phase + moon clause
  const tip = t(HERO_PHASE_TIP[ph.key].en, HERO_PHASE_TIP[ph.key].tr)
    + ' ' + t(HERO_MOON_CLAUSE[moonIdx].en, HERO_MOON_CLAUSE[moonIdx].tr);

  return (
    <Card className="mb-stack" pad={0} style={{ overflow: 'hidden', display: 'grid', gridTemplateColumns: '320px 1fr', minHeight: 230 }}>
      {/* Hero image — drop your own; falls back to the painterly gradient */}
      <div style={{ position: 'relative', minHeight: 230 }}>
        <image-slot id="hero-editorial" shape="rect" fit="cover"
          placeholder={t('Drop an image', 'Bir görsel bırak')}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
            background: `
              radial-gradient(120% 80% at 28% 35%, oklch(0.34 0.08 25) 0%, transparent 60%),
              radial-gradient(80% 110% at 75% 70%, oklch(0.62 0.10 40) 0%, transparent 65%),
              linear-gradient(160deg, oklch(0.84 0.04 70) 0%, oklch(0.55 0.10 28) 100%)
            ` }}></image-slot>
        <div style={{
          position: 'absolute', top: 22, left: 22, pointerEvents: 'none',
          fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'rgba(251,246,235,0.85)',
        }}>{hasDoses ? t('Cycle portrait · stabilization', 'Döngü portresi · stabilizasyon') : t('Cycle portrait', 'Döngü portresi') + ' · ' + phaseWord}</div>
        <div style={{
          position: 'absolute', bottom: 22, left: 22, right: 22, pointerEvents: 'none',
          color: 'oklch(0.96 0.02 70)',
        }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em', opacity: 0.7 }}>
            {t('DAY', 'GÜN')} {day} · {t('CYCLE', 'DÖNGÜ')} {PATIENT.cycleLength}
          </div>
        </div>
      </div>
      {/* Editorial copy */}
      <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 10 }}>{hasDoses
            ? <>{t('WEEK', 'HAFTA')} {PATIENT.programWeek} · {t(PROGRAM.phase, PROGRAM.phaseTr)}</>
            : <>{t('CYCLE DAY', 'DÖNGÜ GÜNÜ')} {day} · {phaseWord}</>}</div>
          <h2 className="serif-display" style={{ fontSize: 28, lineHeight: 1.15, margin: 0, color: 'var(--ink)', textWrap: 'pretty' }}>
            {headline}
          </h2>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 15, lineHeight: 1.5, color: 'var(--ink-2)', marginTop: 14, marginBottom: 0, maxWidth: 440 }}>
            {tip}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 20, alignItems: 'center' }}>
          <PillButton primary onClick={() => onNav && onNav('symptoms')}>
            <Icon d={ICONS.plus} size={14} sw={2}/> {t('Log how you feel', 'Nasıl hissettiğini kaydet')}
          </PillButton>
          <PillButton onClick={() => onNav && onNav(hasDoses ? 'labs' : 'cycle')}>
            {t('View full report', 'Tam raporu gör')} <Icon d={ICONS.arrow} size={13}/>
          </PillButton>
        </div>
      </div>
    </Card>
  );
}

function PillButton({ children, primary, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '11px 18px', borderRadius: 999,
      background: primary ? 'var(--ink)' : 'transparent',
      color: primary ? 'var(--ivory)' : 'var(--ink-2)',
      boxShadow: primary ? 'none' : 'inset 0 0 0 1px var(--line)',
      fontSize: 13, fontWeight: primary ? 600 : 500,
      display: 'flex', alignItems: 'center', gap: 8,
    }}>{children}</button>
  );
}

// ─── Today's regimen ───────────────────────────────────────────
function EdToday({ lunara, api }) {
  const { meds } = todaysDoses(lunara);
  const taken = meds.filter(d => medTaken(lunara, d.id)).length;
  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 4 }}>{t("Today's regimen", 'Bugünün rejimi')}</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 22, letterSpacing: '-0.01em' }}>
            {taken} / {meds.length} {t('taken', 'alındı')}
          </div>
        </div>
        <span style={{
          fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: '0.06em',
          color: 'var(--accent)', padding: '6px 10px', borderRadius: 999,
          background: 'var(--accent-soft)', opacity: 0.6,
        }}>
          {t('STREAK · 14 DAYS', 'SERİ · 14 GÜN')}
        </span>
      </div>

      {meds.length === 0 ? (
        <div style={{ padding: '14px 0', fontFamily: 'var(--serif)', fontSize: 16, fontStyle: 'italic', color: 'var(--muted)' }}>
          {t('A rest day — no doses scheduled.', 'Bir ara günü — planlı doz yok.')}
        </div>
      ) : (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {meds.map((d, i) => (
          <DoseRow key={d.id} dose={d} last={i === meds.length - 1}
            taken={medTaken(lunara, d.id)}
            onToggle={api ? () => api.toggleMed(TODAY_KEY, d.id, d.time === '22:00' ? nowHM() : '07:42') : null}/>
        ))}
      </div>
      )}
    </Card>
  );
}

function DoseRow({ dose, last, taken, onToggle }) {
  const isTaken = !!taken;
  return (
    <button onClick={onToggle || undefined} style={{
      display: 'grid', gridTemplateColumns: '46px 1fr auto', gap: 14, alignItems: 'center',
      padding: '14px 0', borderBottom: last ? 'none' : '1px solid var(--line-soft)',
      textAlign: 'left', width: '100%', background: 'transparent',
      cursor: onToggle ? 'pointer' : 'default',
    }}>
      <div style={{
        width: 46, height: 46, borderRadius: 14,
        background: isTaken ? 'var(--accent)' : 'var(--bone)',
        color: isTaken ? 'var(--ivory)' : 'var(--muted)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: isTaken ? 'none' : 'inset 0 0 0 1px var(--line)',
        transition: 'all 180ms ease',
      }}>
        <Icon d={isTaken ? ICONS.check : ICONS.clock} size={18} sw={isTaken ? 2 : 1.5}/>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontFamily: 'var(--serif)', fontSize: 18, letterSpacing: '-0.01em' }}>{t(dose.name, dose.nameTr || dose.name)}</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-2)' }}>{dose.dose}</span>
        </div>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>{t(dose.detail || '', dose.detailTr || dose.detail || '')}</span>
      </div>
      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 12.5, color: isTaken ? 'var(--muted)' : 'var(--ink)', fontWeight: isTaken ? 400 : 600 }}>
          {isTaken ? `${t('Taken', 'Alındı')} ${taken}` : dose.time}
        </span>
        <span className="eyebrow-mono" style={{ fontSize: 9.5, color: 'var(--muted-2)' }}>{whenLabel(dose.when).toUpperCase()}</span>
      </div>
    </button>
  );
}

// ─── Symptom feeling ───────────────────────────────────────────
function EdSymptomFeeling() {
  const picks = SYMPTOMS.slice(0, 4);
  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 4 }}>{t("How you've been feeling", 'Nasıl hissettin')}</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 22, letterSpacing: '-0.01em' }}>{t('The last fortnight', 'Son iki hafta')}</div>
        </div>
        <button style={{
          fontSize: 12, color: 'var(--muted)', display: 'flex', gap: 4, alignItems: 'center',
        }}>{t('All symptoms', 'Tüm belirtiler')} <Icon d={ICONS.arrow} size={11}/></button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {picks.map(s => (
          <div key={s.key} style={{ display: 'grid', gridTemplateColumns: '110px 1fr auto', gap: 14, alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 13.5, fontWeight: 500 }}>{t(s.label, s.labelTr)}</span>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>{t('now', 'şu an')}: {s.today <= 1 ? t(s.good, s.goodTr) : t(s.bad, s.badTr)}</span>
            </div>
            <SymptomTrack series={s.series} color="var(--accent)"/>
            <Trend up={s.series[s.series.length-1] < s.series[0]}/>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Trend({ up }) {
  const better = up; // for these symptoms lower is better
  return (
    <span style={{
      display: 'flex', alignItems: 'center', gap: 4,
      fontSize: 11, color: better ? 'var(--signal-good)' : 'var(--signal-warn)',
      fontFamily: 'var(--mono)', letterSpacing: '0.04em',
    }}>
      <Icon d={better ? ICONS.arrowDown : ICONS.arrowUp} size={12} sw={1.8}/>
      {better ? t('better', 'iyi') : t('rising', 'artıyor')}
    </span>
  );
}

// ─── Labs strip ────────────────────────────────────────────────
function EdLabsStrip() {
  const picks = ['e2', 'p4', 't', 'ft', 'shbg'].map(k => LABS.find(l => l.key === k));
  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 4 }}>{t('Latest panel · 2 weeks ago', 'Son panel · 2 hafta önce')}</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 22, letterSpacing: '-0.01em' }}>
            {t(<>Hormones, <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>settling</em></>,
               <>Hormonlar, <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>dengeleniyor</em></>)}
          </div>
        </div>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>{t('Next draw — Fri 5 Jun', 'Sonraki tahlil — 5 Haz Cum')}</span>
      </div>
      <div className="mb-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 22 }}>
        {picks.map(l => (
          <div key={l.key} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 500 }}>{l.name}</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 28, letterSpacing: '-0.02em', lineHeight: 1 }}>{l.value}</span>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>{l.unit}</span>
            </div>
            <RangeBar value={l.value} range={l.range} target={l.target}/>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--muted-2)', fontFamily: 'var(--mono)' }}>
              <span>{l.range[0]}</span><span>{l.range[1]}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Care note ─────────────────────────────────────────────────
function EdCareNote() {
  return (
    <Card style={{ background: 'linear-gradient(160deg, oklch(0.92 0.03 60), var(--card))' }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'var(--accent)',
          color: 'var(--ivory)', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 18,
        }}>{PROVIDER.initials}</div>
        <div style={{ flex: 1 }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>{t(PROVIDER.lastMsgAt, PROVIDER.lastMsgAtTr)} · {t('from', '—')} {PROVIDER.name}</div>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 19, lineHeight: 1.45, margin: 0, color: 'var(--ink)', textWrap: 'pretty' }}>
            &ldquo;{t(PROVIDER.lastMsg, PROVIDER.lastMsgTr)}&rdquo;
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 16, alignItems: 'center' }}>
            <PillButton>{t('Reply', 'Yanıtla')}</PillButton>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>· {t('next consult', 'sonraki görüşme')} <strong style={{ color: 'var(--ink)', fontWeight: 600 }}>{PROVIDER.nextConsult}</strong></span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function EdLibraryRead() {
  return (
    <Card>
      <div className="eyebrow" style={{ marginBottom: 10 }}>{t('From the Library', 'Blog’dan')}</div>
      <div style={{ fontFamily: 'var(--serif)', fontSize: 22, lineHeight: 1.2, letterSpacing: '-0.01em', marginBottom: 8, textWrap: 'pretty' }}>
        {t('Why SHBG matters more than total testosterone', 'Neden SHBG toplam testosterondan daha önemli')}
      </div>
      <p style={{ fontSize: 13.2, color: 'var(--muted)', lineHeight: 1.5, margin: '6px 0 18px' }}>
        {t('A 4\u00a0min read for the PCOS regimen — what a high SHBG hides, and how progesterone shifts it.',
           'PKOS rejimi için 4 dk\u2019lık bir okuma — yüksek SHBG neyi gizler ve progesteron onu nasıl değiştirir.')}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <PillButton>{t('Save for later', 'Sonraya kaydet')}</PillButton>
        <span style={{ fontSize: 11, color: 'var(--muted-2)', fontFamily: 'var(--mono)', letterSpacing: '0.06em' }}>{t('EST · 4 MIN', 'TAHM · 4 DK')}</span>
      </div>
    </Card>
  );
}

// ─── Moon phase today + its possible effects ──────────────────
// 8 phases: 0 New · 1 Waxing crescent · 2 First quarter · 3 Waxing gibbous
//           4 Full · 5 Waning gibbous · 6 Last quarter · 7 Waning crescent
const MOON_FX = [
  { // New
    titleEn: 'A time to begin', titleTr: 'Başlangıç zamanı',
    physEn: 'Energy is at its lowest — the body wants rest and quiet. Appetite and sleep may run deeper.',
    physTr: 'Enerji en düşük seviyede — beden dinlenme ve sessizlik ister. İştah ve uyku derinleşebilir.',
    emoEn: 'Inward and reflective. A good moment to set intentions, journal, and plan gently.',
    emoTr: 'İçe dönük ve düşünceli. Niyet belirlemek, günlük tutmak ve nazikçe plan yapmak için iyi an.' },
  { // Waxing crescent
    titleEn: 'Building momentum', titleTr: 'İvme kazanma',
    physEn: 'Energy begins to rise. Motivation to move and start new routines returns.',
    physTr: 'Enerji yükselmeye başlar. Hareket etme ve yeni rutinlere başlama isteği döner.',
    emoEn: 'Hopeful and curious. Optimism grows — lean into small, concrete steps.',
    emoTr: 'Umutlu ve meraklı. İyimserlik artar — küçük, somut adımlara yönel.' },
  { // First quarter
    titleEn: 'Push through', titleTr: 'Engelleri aş',
    physEn: 'Strength and stamina climb. The body responds well to challenge and effort.',
    physTr: 'Güç ve dayanıklılık yükselir. Beden zorlanmaya ve çabaya iyi yanıt verir.',
    emoEn: 'Determined, sometimes tense. Decisions and friction surface — channel it into action.',
    emoTr: 'Kararlı, bazen gergin. Kararlar ve sürtüşmeler yüzeye çıkar — bunu eyleme dönüştür.' },
  { // Waxing gibbous
    titleEn: 'Refine & focus', titleTr: 'İnce ayar & odak',
    physEn: 'High, steady energy. Good for sustained work and detail-oriented tasks.',
    physTr: 'Yüksek, istikrarlı enerji. Sürekli çalışma ve detay işleri için ideal.',
    emoEn: 'Focused but can feel impatient. Trust the process; refine rather than restart.',
    emoTr: 'Odaklı ama sabırsız hissedebilirsin. Sürece güven; yeniden başlamak yerine ince ayar yap.' },
  { // Full
    titleEn: 'Peak & release', titleTr: 'Zirve & boşalma',
    physEn: 'Energy peaks; sleep can become lighter or restless. Senses feel heightened.',
    physTr: 'Enerji zirvede; uyku hafifleyebilir veya huzursuzlaşabilir. Duyular keskinleşir.',
    emoEn: 'Vivid emotions and heightened sensitivity. Connection and expression come easily.',
    emoTr: 'Yoğun duygular ve artan hassasiyet. Bağ kurmak ve kendini ifade etmek kolaylaşır.' },
  { // Waning gibbous
    titleEn: 'Give back & digest', titleTr: 'Paylaş & sindir',
    physEn: 'Energy starts to ease. A natural window to recover and slow the intensity.',
    physTr: 'Enerji azalmaya başlar. Toparlanmak ve yoğunluğu yavaşlatmak için doğal bir pencere.',
    emoEn: 'Reflective and generous. A good time to share, teach, and process what happened.',
    emoTr: 'Düşünceli ve cömert. Paylaşmak, öğretmek ve yaşananları sindirmek için iyi zaman.' },
  { // Last quarter
    titleEn: 'Let go', titleTr: 'Bırak',
    physEn: 'Energy dips further. The body asks for lighter movement and more rest.',
    physTr: 'Enerji daha da düşer. Beden daha hafif hareket ve daha çok dinlenme ister.',
    emoEn: 'Releasing and re-evaluating. Clear what no longer serves you; forgive and simplify.',
    emoTr: 'Bırakma ve yeniden değerlendirme. Sana hizmet etmeyeni bırak; affet ve sadeleştir.' },
  { // Waning crescent
    titleEn: 'Rest & restore', titleTr: 'Dinlen & onar',
    physEn: 'Lowest energy before the cycle renews. Prioritise sleep, warmth, and gentleness.',
    physTr: 'Döngü yenilenmeden önce en düşük enerji. Uykuya, sıcaklığa ve nazikliğe öncelik ver.',
    emoEn: 'Quiet, dreamy, sensitive. Withdraw a little; restore before the next beginning.',
    emoTr: 'Sakin, dalgın, hassas. Biraz geri çekil; yeni başlangıç öncesi kendini onar.' },
];
function moonPhaseIndex(frac) {
  return Math.floor((frac * 8) + 0.5) % 8;
}

function EdMoonToday() {
  const lang = useLang();
  const today = new Date('2026-06-18T21:00:00');
  const moon = moonPhase(today);
  const fx = MOON_FX[moonPhaseIndex(moon.frac)];
  const illum = Math.round(moon.illum * 100);
  return (
    <Card pad={0} style={{ overflow: 'hidden' }}>
      <div className="mb-stack" style={{ display: 'grid', gridTemplateColumns: '320px 1fr' }}>
        {/* Moon visual */}
        <div style={{
          position: 'relative',
          background: 'radial-gradient(120% 110% at 30% 25%, oklch(0.34 0.06 60) 0%, oklch(0.22 0.04 40) 60%, oklch(0.16 0.03 30) 100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 18, padding: '34px 28px',
        }}>
          <div style={{ position: 'absolute', top: 18, left: 22, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em', color: 'rgba(251,246,235,0.7)' }}>
            {t("TONIGHT'S MOON", 'BU GECEK\u0130 AY')}
          </div>
          <MoonDisc size={132} frac={moon.frac}/>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 24, color: 'oklch(0.96 0.02 70)', letterSpacing: '-0.01em' }}>
              {moonName(moon)}
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.08em', color: 'rgba(251,246,235,0.6)', marginTop: 5 }}>
              {illum}% {t('ILLUMINATED', 'AYDINLIK')}
            </div>
          </div>
        </div>
        {/* Effects */}
        <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>{t('How this phase may feel', 'Bu faz nas\u0131l hissettirebilir')}</div>
          <h3 className="serif-display" style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 26, margin: '0 0 18px', letterSpacing: '-0.01em' }}>
            {t(fx.titleEn, fx.titleTr)}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }} className="mb-2">
            <FxBlock icon={ICONS.flame} label={t('Physical', 'Fiziksel')} text={t(fx.physEn, fx.physTr)}/>
            <FxBlock icon={ICONS.spark} label={t('Emotional', 'Duygusal')} text={t(fx.emoEn, fx.emoTr)}/>
          </div>
          <p style={{ fontSize: 11, color: 'var(--muted-2)', fontStyle: 'italic', fontFamily: 'var(--serif)', margin: '20px 0 0' }}>
            {t('Lunar associations are reflective, not medical — notice what resonates for you.',
               'Ay ile ilişkiler düşünsel niteliktedir, tıbbi değildir — sana neyin uyduğunu gözlemle.')}
          </p>
        </div>
      </div>
    </Card>
  );
}

function FxBlock({ icon, label, text }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--bone)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
          <Icon d={icon} size={15}/>
        </span>
        <span className="eyebrow">{label}</span>
      </div>
      <p style={{ fontFamily: 'var(--serif)', fontSize: 14.5, lineHeight: 1.5, color: 'var(--ink-2)', margin: 0, textWrap: 'pretty' }}>{text}</p>
    </div>
  );
}

export { DashboardEditorial, HERO_PHASE_TIP, HERO_MOON_CLAUSE, EdHero, PillButton, EdToday, DoseRow, EdSymptomFeeling, Trend, EdLabsStrip, EdCareNote, EdLibraryRead, MOON_FX, moonPhaseIndex, EdMoonToday, FxBlock };
