import React from 'react';
import { t, useLang } from './i18n';
import { TodayWorkoutCard } from './nourish';
import { MonthNav, WeekdayRow, useMonthView } from './month-grid';
import { MoonDisc, PHASE_TINT, bleedExpected, bledOn, cycleDayFrom, cycleLenOf, moonName, moonPhase, phaseLabel, phaseOf } from './screens';
import { Card, ICONS, Icon, LABS, RangeBar, SYMPTOMS, SymptomTrack, TODAY_DATE, TODAY_KEY, labCurrent, medTaken, nowHM, todaysDoses, whenLabel } from './shared';

/* editorial.jsx — Aesthetic A: warm bone + maroon, magazine */
/* eslint-disable */

function DashboardEditorial({ lunara, api, onNav, hasDoses = true }) {
  return (
    <div style={{ padding: '18px 36px 40px', display: 'flex', flexDirection: 'column', gap: 22 }}>
      <EdHero lunara={lunara} hasDoses={hasDoses} onNav={onNav}/>
      <EdMoonToday/>
      {lunara && <MonthSummary lunara={lunara} hasDoses={hasDoses}/>}
      {hasDoses ? (
        <div className="mb-stack" style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 22 }}>
          <EdToday lunara={lunara} api={api} onNav={onNav}/>
          <EdSymptomFeeling/>
        </div>
      ) : (
        <EdSymptomFeeling/>
      )}
      {lunara && api && <TodayWorkoutCard lunara={lunara} api={api} onNav={onNav}/>}
      {hasDoses && lunara && (lunara.labPanels || []).length > 0 && <EdLabsStrip lunara={lunara}/>}
    </div>
  );
}

// ─── 30 günlük özet ────────────────────────────────────────────
// Yedi gün, düzensiz kaydeden birinde çoğu zaman 0–1 gösteriyordu; bir döngünün
// tamamı da göze girmiyordu. 30 gün hem bir döngüyü kapsıyor hem sayıları
// anlamlı kılıyor.
function MonthSummary({ lunara, hasDoses = true }) {
  const lang = useLang();
  const today = new Date(TODAY_DATE);
  const PENCERE = 30;
  const keys = [];
  for (let i = PENCERE - 1; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    keys.push(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'));
  }
  const symLog = lunara.symptomLog || {};
  const doseLog = lunara.doseLog || {};
  const tracked = keys.filter(k => symLog[k] && Object.keys(symLog[k]).length > 0).length;
  const entries = keys.reduce((s, k) => s + (symLog[k] ? Object.values(symLog[k]).filter(v => v > 0).length : 0), 0);
  const doses = keys.reduce((s, k) => s + (doseLog[k] ? Object.keys(doseLog[k]).length : 0), 0);
  const bledDays = keys.filter(k => bledOn(lunara, k) > 0).length;

  const day = cycleDayFrom(lunara.periodStart, today, cycleLenOf(lunara));
  const phaseWord = phaseLabel(phaseOf(day, cycleLenOf(lunara))).toLocaleLowerCase(lang === 'tr' ? 'tr' : 'en');

  const tiles = [
    { value: tracked, label: t('days tracked', 'gün takip'), icon: ICONS.check },
    ...(hasDoses ? [{ value: doses, label: t('doses taken', 'doz alındı'), icon: ICONS.pill }] : []),
    { value: entries, label: t('symptoms logged', 'belirti kaydı'), icon: ICONS.pulse },
    // "not" yerine kanama günü: blog kalkınca not kutucuğu boşta kalmıştı ve
    // ay takviminde gösterilen kanamanın sayısal karşılığı burada eksikti.
    { value: bledDays, label: t('bleeding days', 'kanama günü'), icon: ICONS.drop },
  ];

  const narrative = tracked === 0
    ? t('No check-ins in the last 30 days — a quick daily note builds your picture.',
        'Son 30 günde kayıt yok — kısa bir günlük not resmini oluşturur.')
    : t(`You logged ${tracked} of the last 30 days — you’re in your ${phaseWord} phase.`,
        `Son 30 günün ${tracked}’ini kaydettin — ${phaseWord} fazındasın.`);

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
        <div className="eyebrow">{t('Last 30 days', 'Son 30 gün')}</div>
        <span style={{ fontSize: 10.5, color: 'var(--muted-2)', fontFamily: 'var(--mono)' }}>
          {keys[0].slice(8) + '.' + keys[0].slice(5, 7)} – {keys[keys.length - 1].slice(8) + '.' + keys[keys.length - 1].slice(5, 7)}
        </span>
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

/* Bugün ekranındaki ay takvimi — eskiden burada dekoratif bir gradyan vardı.
   Bir bakışta dört soruyu cevaplaması gerekiyor: bugün hangi fazdayım, bu ay
   fazlar nereye düşüyor, kanama ne zaman bekleniyor, gerçekte ne zaman oldu.

   Kodlama katmanları üst üste binebildiği için ayrı CSS özelliklerine dağıtıldı:
   faz → hücre zemini + alt şerit, beklenen kanama → kesikli outline,
   gerçekleşen kanama → dolu pembe zemin, bugün → boxShadow halkası.
   Böylece dört durum aynı hücrede aynı anda okunabiliyor. */
const BEKLENEN_CIZGI = '#b04a72';   // menstrüel pembenin koyusu: hem açık tonlu
                                    // hücrede hem dolu pembe hücrede görünür
function HeroMonth({ lunara }) {
  const { go, isCurrentMonth, monthLabel, weekdays, cells } = useMonthView();
  useLang();
  const L = cycleLenOf(lunara);

  return (
    <div style={{ padding: '18px 18px 16px', background: 'var(--bone)', borderRight: '1px solid var(--line-soft)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 8 }}>
        <div className="eyebrow">{t('Cycle month', 'Döngü ayı')}</div>
        <MonthNav label={monthLabel} onPrev={() => go(-1)} onNext={() => go(1)} atCurrent={isCurrentMonth}/>
      </div>

      <WeekdayRow weekdays={weekdays}/>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
        {cells.map((c, i) => {
          if (!c) return <div key={'b' + i}/>;
          const cd = lunara ? cycleDayFrom(lunara.periodStart, c.date, L) : 1;
          const ph = phaseOf(cd, L);
          const bekleniyor = bleedExpected(cd, L);
          const oldu = bledOn(lunara, c.key) > 0;
          const durum = [phaseLabel(ph)];
          if (bekleniyor) durum.push(t('bleeding expected', 'kanama bekleniyor'));
          if (oldu) durum.push(t('bleeding logged', 'kanama kaydedildi'));
          return (
            <div key={c.key} title={`${c.d} · ${t('day', 'gün')} ${cd} · ${durum.join(' · ')}`}
              style={{
                position: 'relative', height: 34, borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                // '3d' ≈ %24 opaklık: fazın hangi haftalara düştüğü hücre
                // zemininden okunacak kadar belirgin, gün numarasını
                // bastırmayacak kadar hafif
                background: oldu ? PHASE_TINT.menstrual : PHASE_TINT[ph.key] + '3d',
                outline: bekleniyor ? `1.5px dashed ${BEKLENEN_CIZGI}` : 'none',
                outlineOffset: -2,
                boxShadow: c.isToday ? '0 0 0 2px var(--ink)' : 'none',
                opacity: c.isFuture ? 0.5 : 1,
              }}>
              <span style={{
                fontFamily: 'var(--mono)', fontSize: 11.5, lineHeight: 1,
                fontWeight: c.isToday ? 700 : 500, color: 'var(--ink)',
              }}>{c.d}</span>
              {/* faz şeridi — rengin taşıdığı kimliğin tam doygun hâli */}
              <span style={{
                position: 'absolute', left: 6, right: 6, bottom: 3, height: 3,
                borderRadius: 2, background: PHASE_TINT[ph.key],
              }}/>
            </div>
          );
        })}
      </div>

      {/* Renk körlüğünde faz çiftleri ΔE 8'in altında ayrışıyor; bu yüzden
          açıklama isteğe bağlı değil, kimliğin ikinci taşıyıcısı. */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 12px', marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--line-soft)' }}>
        {['menstrual', 'follicular', 'ovulation', 'luteal'].map(k => (
          <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: 'var(--muted)' }}>
            <span style={{ width: 12, height: 4, borderRadius: 2, background: PHASE_TINT[k] }}/>
            {phaseLabel(phaseOf(k === 'menstrual' ? 1 : k === 'follicular' ? 7 : k === 'ovulation' ? (L - 14) : (L - 4), L))}
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 12px', marginTop: 6 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: 'var(--muted)' }}>
          <span style={{ width: 12, height: 12, borderRadius: 4, border: `1.5px dashed ${BEKLENEN_CIZGI}` }}/>
          {t('bleeding expected', 'beklenen kanama')}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: 'var(--muted)' }}>
          <span style={{ width: 12, height: 12, borderRadius: 4, background: PHASE_TINT.menstrual }}/>
          {t('bleeding logged', 'gerçekleşen kanama')}
        </span>
      </div>
    </div>
  );
}

function EdHero({ lunara, hasDoses = true, onNav }) {
  const lang = useLang();
  const today = TODAY_DATE;
  const day = lunara ? cycleDayFrom(lunara.periodStart, today, cycleLenOf(lunara)) : 1;
  const ph = phaseOf(day, cycleLenOf(lunara));
  // Real regimen: meds active today, not yet taken
  const { meds } = lunara ? todaysDoses(lunara) : { meds: [] };
  const remaining = meds.filter(m => !medTaken(lunara, m.id)).length;
  const showDoses = hasDoses && meds.length > 0;
  const moon = moonPhase(today);
  const moonIdx = moonPhaseIndex(moon.frac);
  const phaseWord = phaseLabel(ph).toLocaleLowerCase(lang === 'tr' ? 'tr' : 'en');

  // Data-driven headline: dose status + phase
  const doseLine = remaining === 0
    ? t('All doses done for today.', 'Bugün tüm dozlar tamam.')
    : t(`${remaining} dose${remaining > 1 ? 's' : ''} left today.`, `Bugün ${remaining} doz kaldı.`);
  const headline = showDoses ? t(
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
    <Card className="mb-stack" pad={0} style={{ overflow: 'hidden', display: 'grid', gridTemplateColumns: '352px 1fr', minHeight: 230 }}>
      <HeroMonth lunara={lunara}/>
      {/* Editorial copy */}
      <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 10 }}>{t('CYCLE DAY', 'DÖNGÜ GÜNÜ')} {day} · {phaseWord}</div>
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
// Consecutive days (ending today or yesterday) with at least one dose logged
function doseStreak(doseLog) {
  const key = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const d = new Date(TODAY_DATE);
  if (!doseLog[key(d)] || Object.keys(doseLog[key(d)]).length === 0) d.setDate(d.getDate() - 1);
  let streak = 0;
  while (doseLog[key(d)] && Object.keys(doseLog[key(d)]).length > 0) { streak++; d.setDate(d.getDate() - 1); }
  return streak;
}

function EdToday({ lunara, api, onNav }) {
  const { meds } = todaysDoses(lunara);
  const taken = meds.filter(d => medTaken(lunara, d.id)).length;
  const noRegimen = !lunara.regimen || (lunara.regimen.meds || []).length === 0;
  const streak = doseStreak(lunara.doseLog || {});
  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 4 }}>{t("Today's regimen", 'Bugünün rejimi')}</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 22, letterSpacing: '-0.01em' }}>
            {noRegimen ? t('No plan yet', 'Henüz program yok') : <>{taken} / {meds.length} {t('taken', 'alındı')}</>}
          </div>
        </div>
        {streak >= 2 && (
          <span style={{
            fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: '0.06em',
            color: 'var(--accent)', padding: '6px 10px', borderRadius: 999,
            background: 'var(--accent-soft)', opacity: 0.6,
          }}>
            {t(`STREAK · ${streak} DAYS`, `SERİ · ${streak} GÜN`)}
          </span>
        )}
      </div>

      {noRegimen ? (
        <div style={{ padding: '6px 0 10px' }}>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 15, fontStyle: 'italic', color: 'var(--muted)', margin: '0 0 14px', lineHeight: 1.5 }}>
            {t('Add the medication plan your clinician prescribed to track doses here.',
               'Dozlarını burada takip etmek için hekiminin verdiği ilaç programını ekle.')}
          </p>
          <PillButton onClick={() => onNav && onNav('doses')}>
            {t('Add medication', 'İlaç ekle')} <Icon d={ICONS.arrow} size={13}/>
          </PillButton>
        </div>
      ) : meds.length === 0 ? (
        <div style={{ padding: '14px 0', fontFamily: 'var(--serif)', fontSize: 16, fontStyle: 'italic', color: 'var(--muted)' }}>
          {t('A rest day — no doses scheduled.', 'Bir ara günü — planlı doz yok.')}
        </div>
      ) : (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {meds.map((d, i) => (
          <DoseRow key={d.id} dose={d} last={i === meds.length - 1}
            taken={medTaken(lunara, d.id)}
            onToggle={api ? () => api.toggleMed(TODAY_KEY, d.id, nowHM()) : null}/>
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
          {isTaken ? `${t('Taken', 'Alındı')} ${taken.at}` : dose.time}
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
// Latest real lab values on the dashboard — rendered only when the user
// has entered panels on the Labs screen.
function EdLabsStrip({ lunara }) {
  const lang = useLang();
  const panels = (lunara && lunara.labPanels) || [];
  const picks = LABS.filter(l => labCurrent(panels, l.key) != null).slice(0, 5);
  if (picks.length === 0) return null;
  const last = [...panels].sort((a, b) => (a.date < b.date ? 1 : -1))[0];
  const lastStr = last ? new Date(last.date + 'T00:00:00').toLocaleDateString(lang === 'tr' ? 'tr' : 'en', { day: 'numeric', month: 'long' }) : '';
  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 4 }}>{t('Latest panel', 'Son panel')}{lastStr ? ` · ${lastStr}` : ''}</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 22, letterSpacing: '-0.01em' }}>
            {t('Your hormones', 'Hormonların')}
          </div>
        </div>
      </div>
      <div className="mb-2" style={{ display: 'grid', gridTemplateColumns: `repeat(${picks.length}, 1fr)`, gap: 22 }}>
        {picks.map(l => {
          const v = labCurrent(panels, l.key);
          return (
            <div key={l.key} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 500 }}>{t(l.name, l.nameTr || l.name)}</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontFamily: 'var(--serif)', fontSize: 28, letterSpacing: '-0.02em', lineHeight: 1 }}>{v}</span>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>{l.unit}</span>
              </div>
              <RangeBar value={v} range={l.range} target={l.target}/>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--muted-2)', fontFamily: 'var(--mono)' }}>
                <span>{l.range[0]}</span><span>{l.range[1]}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ─── Care note ─────────────────────────────────────────────────


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
  const today = TODAY_DATE;
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

export { DashboardEditorial, HERO_PHASE_TIP, HERO_MOON_CLAUSE, EdHero, PillButton, EdToday, DoseRow, EdSymptomFeeling, Trend, EdLabsStrip, MOON_FX, moonPhaseIndex, EdMoonToday, FxBlock };
