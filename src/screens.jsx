import React from 'react';
import { I18N, t, useLang } from './i18n';
import { RegimenEditor } from './regimen';
import { libraryFor, symptomsFor } from './screen-content';
import { Card, ICONS, Icon, LABS, Logo, RangeBar, SYMPTOMS, Sparkline, SymptomTrack, TODAY_DATE, TODAY_KEY, getTodayKey, labCurrent, labHistory, medTaken, nowHM, todaysDoses, whenLabel } from './shared';
import { STAGES } from './stages';
import { SupplementsPanel } from './supplements';

/* screens.jsx — Lunara navigable screens (interactive, persistent) */
/* eslint-disable */

// ─── Shared helpers ────────────────────────────────────────────
const CYCLE_LEN = 32; // PCOS — longer
function daysBetween(aIso, b) {
  const a = new Date(aIso + 'T00:00:00');
  return Math.floor((b - a) / 86400000);
}
function cycleDayFrom(periodStartIso, today = TODAY_DATE) {
  const d = daysBetween(periodStartIso, today);
  return ((d % CYCLE_LEN) + CYCLE_LEN) % CYCLE_LEN + 1;
}
function phaseOf(day) {
  if (day <= 5) return { key: 'menstrual', label: 'Menstrual', labelTr: 'Menstrüel' };
  if (day <= 13) return { key: 'follicular', label: 'Follicular', labelTr: 'Folliküler' };
  if (day <= 18) return { key: 'ovulation', label: 'Ovulation', labelTr: 'Ovulasyon' };
  return { key: 'luteal', label: 'Luteal', labelTr: 'Luteal' };
}
function phaseLabel(ph) { return t(ph.label, ph.labelTr); }
const MOON_NAMES_TR = {
  'New': 'Yeni ay', 'Waxing crescent': 'İlk hilal', 'First quarter': 'İlk dördün',
  'Waxing gibbous': 'Şişkin (büyüyen)', 'Full': 'Dolunay', 'Waning gibbous': 'Şişkin (küçülen)',
  'Last quarter': 'Son dördün', 'Waning crescent': 'Son hilal',
};
function moonName(moon) { return I18N.lang === 'tr' ? (MOON_NAMES_TR[moon.name] || moon.name) : moon.name; }
const PHASE_TINT = {
  menstrual: 'oklch(0.70 0.12 24)',
  follicular: 'oklch(0.74 0.08 80)',
  ovulation: 'oklch(0.72 0.11 50)',
  luteal: 'oklch(0.70 0.06 150)',
};

// Moon phase (synodic) for a given date
function moonPhase(date) {
  const synodic = 29.53058867;
  const ref = new Date(Date.UTC(2000, 0, 6, 18, 14));
  const days = (date - ref) / 86400000;
  const age = ((days % synodic) + synodic) % synodic;
  const frac = age / synodic; // 0 new, .5 full
  const names = ['New', 'Waxing crescent', 'First quarter', 'Waxing gibbous', 'Full', 'Waning gibbous', 'Last quarter', 'Waning crescent'];
  const idx = Math.floor((frac * 8) + 0.5) % 8;
  return { frac, age, name: names[idx], illum: (1 - Math.cos(frac * 2 * Math.PI)) / 2 };
}

function MoonDisc({ size = 64, frac }) {
  const m = 'moon-' + Math.round(frac * 1000);
  const r = 42;
  const off = Math.cos(frac * 2 * Math.PI) * r; // new→±r, full→0
  const waxing = frac < 0.5;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <radialGradient id={m + 'g'} cx="42%" cy="38%" r="65%">
          <stop offset="0%" stopColor="oklch(0.92 0.03 70)"/>
          <stop offset="100%" stopColor="oklch(0.80 0.05 60)"/>
        </radialGradient>
        <mask id={m}>
          <rect width="100" height="100" fill="black"/>
          <circle cx="50" cy="50" r={r} fill="white"/>
          <circle cx={50 + (waxing ? off : -off)} cy="50" r={r} fill="black"/>
        </mask>
      </defs>
      <circle cx="50" cy="50" r={r} fill="oklch(0.42 0.04 60)" opacity="0.18"/>
      <circle cx="50" cy="50" r={r} fill={`url(#${m}g)`} mask={`url(#${m})`}/>
      <circle cx="50" cy="50" r={r} fill="none" stroke="var(--line)" strokeWidth="1" opacity="0.5"/>
    </svg>
  );
}

// Section header used across screens
function ScreenHead({ eyebrow, title, accent, right }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 22 }}>
      <div>
        <div className="eyebrow" style={{ marginBottom: 6 }}>{eyebrow}</div>
        <h2 className="serif-display" style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 30, margin: 0, color: 'var(--ink)' }}>
          {title}
        </h2>
      </div>
      {right}
    </div>
  );
}

function Btn({ children, primary, onClick, style }) {
  return (
    <button onClick={onClick} style={{
      padding: '10px 16px', borderRadius: 999,
      background: primary ? 'var(--ink)' : 'transparent',
      color: primary ? 'var(--ivory)' : 'var(--ink-2)',
      boxShadow: primary ? 'none' : 'inset 0 0 0 1px var(--line)',
      fontSize: 13, fontWeight: primary ? 600 : 500,
      display: 'inline-flex', alignItems: 'center', gap: 8,
      transition: 'all 160ms ease', ...style,
    }}>{children}</button>
  );
}

const wrap = { padding: '18px 36px 48px', display: 'flex', flexDirection: 'column', gap: 20 };

/* ════════════════ DOSES ════════════════ */
function DosesScreen({ lunara, api }) {
  const [editing, setEditing] = React.useState(false);
  useLang();
  const { meds, day } = todaysDoses(lunara);
  const takenCount = meds.filter(d => medTaken(lunara, d.id)).length;
  const cycLen = lunara.regimen ? lunara.regimen.cycleLength : 28;
  // simple 7-day adherence model
  const week = I18N.lang === 'tr' ? ['Pe','Cu','Ct','Pz','Pt','Sa','Ça'] : ['Th','Fr','Sa','Su','Mo','Tu','We'];
  const adherence = [3, 3, 2, 3, meds.length || 3, 3, takenCount];
  return (
    <div style={wrap}>
      <ScreenHead eyebrow={t(`REGIMEN · DAY ${day} OF ${cycLen}`, `REJİM · ${cycLen} GÜNÜN ${day}. GÜNÜ`)} title={t("Today's doses", 'Bugünün dozları')}
        right={<Btn primary={editing} onClick={() => setEditing(e => !e)}>
          <Icon d={editing ? ICONS.check : ICONS.cog} size={14} sw={editing ? 2 : 1.4}/> {editing ? t('Done', 'Bitti') : t('Edit schedule', 'Programı düzenle')}
        </Btn>} />

      {editing && <RegimenEditor lunara={lunara} api={api} onClose={() => setEditing(false)}/>}

      <div className="mb-stack" style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20 }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 22 }}>{takenCount} / {meds.length} {t('taken', 'alındı')}</span>
            <span className="eyebrow-mono" style={{ color: 'var(--accent)' }}>{t('TAP TO LOG', 'KAYDETMEK İÇİN DOKUN')}</span>
          </div>
          {meds.length === 0 ? (
            <div style={{ padding: '28px 0', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontStyle: 'italic', color: 'var(--ink)', marginBottom: 6 }}>{t('A rest day', 'Bir ara günü')}</div>
              <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>{t('No medications scheduled for today in your cycle.', 'Bugün döngünde planlı ilaç yok.')}</p>
            </div>
          ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {meds.map((d, i) => {
              const taken = medTaken(lunara, d.id);
              return (
                <button key={d.id} onClick={() => api.toggleMed(TODAY_KEY, d.id, d.time === '22:00' ? nowHM() : '07:42')}
                  style={{
                    display: 'grid', gridTemplateColumns: '46px 1fr auto', gap: 14, alignItems: 'center',
                    padding: '14px 0', borderBottom: i < meds.length - 1 ? '1px solid var(--line-soft)' : 'none',
                    textAlign: 'left', cursor: 'pointer', background: 'transparent', width: '100%',
                  }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 14,
                    background: taken ? 'var(--accent)' : 'var(--bone)',
                    color: taken ? 'var(--ivory)' : 'var(--muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: taken ? 'none' : 'inset 0 0 0 1px var(--line)',
                    transition: 'all 180ms ease',
                  }}>
                    <Icon d={taken ? ICONS.check : ICONS.clock} size={18} sw={taken ? 2 : 1.5}/>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <span style={{ fontFamily: 'var(--serif)', fontSize: 18 }}>{t(d.name, d.nameTr || d.name)}</span>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-2)' }}>{d.dose}</span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{t(d.detail || '', d.detailTr || d.detail || '')}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 12.5, color: taken ? 'var(--muted)' : 'var(--ink)', fontWeight: taken ? 400 : 600 }}>
                      {taken ? `${t('Taken', 'Alındı')} ${taken}` : d.time}
                    </span>
                    <div className="eyebrow-mono" style={{ fontSize: 9.5, color: 'var(--muted-2)' }}>{whenLabel(d.when).toUpperCase()}</div>
                  </div>
                </button>
              );
            })}
          </div>
          )}
        </Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card>
            <div className="eyebrow" style={{ marginBottom: 14 }}>{t('This week', 'Bu hafta')}</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 90 }}>
              {adherence.map((v, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: 64 }}>
                    <div style={{ width: '100%', height: `${(v/3)*100}%`, background: i === 6 ? 'var(--accent)' : 'var(--accent-soft)',
                      borderRadius: 6, transition: 'height 200ms ease' }}/>
                  </div>
                  <span style={{ fontSize: 10.5, color: i === 6 ? 'var(--ink)' : 'var(--muted)', fontWeight: i === 6 ? 700 : 400, fontFamily: 'var(--mono)' }}>{week[i]}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line-soft)', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{t('30-day adherence', '30 günlük uyum')}</span>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 16 }}>94%</span>
            </div>
          </Card>
          <Card style={{ background: 'linear-gradient(160deg, var(--accent-soft), var(--card))' }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>{t('Refill soon', 'Yakında yenileme')}</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 18, marginBottom: 4 }}>{t('Estradiol cream · 12 days left', 'Estradiol krem · 12 gün kaldı')}</div>
            <p style={{ fontSize: 12.5, color: 'var(--muted)', margin: '0 0 14px', lineHeight: 1.5 }}>{t('Auto-refill is on. Ships from your compounding pharmacy.', 'Otomatik yenileme açık. Kompound eczanenden gönderilir.')}</p>
            <Btn primary>{t('Manage refills', 'Yenilemeleri yönet')}</Btn>
          </Card>
        </div>
      </div>

      {/* Supplements + phase recommendations */}
      <div style={{ marginTop: 4 }}>
        <div className="eyebrow" style={{ marginBottom: 14 }}>{t('SUPPLEMENTS', 'TAKVİYELER')}</div>
        <SupplementsPanel lunara={lunara} api={api}/>
      </div>
    </div>
  );
}

/* ════════════════ SYMPTOMS ════════════════ */
const RATE_LABELS = ['None', 'Mild', 'Moderate', 'Strong'];
const RATE_LABELS_TR = ['Yok', 'Hafif', 'Orta', 'Güçlü'];
function rateLabel(v) { return I18N.lang === 'tr' ? RATE_LABELS_TR[v] : RATE_LABELS[v]; }

// Belirti anahtarı için son 14 günün gerçek log serisini üret (yoksa örnek seriye düş)
function realSeries(symptomLog, key, fallback) {
  const out = [];
  let hasReal = false;
  for (let i = 13; i >= 0; i--) {
    const d = new Date(TODAY_DATE);
    d.setDate(d.getDate() - i);
    const dk = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
    const day = symptomLog[dk];
    if (day && day[key] != null) { out.push(day[key]); hasReal = true; }
    else out.push(0);
  }
  return hasReal ? out : (fallback || out);
}

function SymptomsScreen({ lunara, api }) {
  const todayLog = lunara.symptomLog[TODAY_KEY] || {};
  const syms = symptomsFor(lunara.stage);
  const logged = syms.filter(s => todayLog[s.key] != null).length;
  const [note, setNote] = React.useState('');
  return (
    <div style={wrap}>
      <ScreenHead eyebrow={t('JOURNAL · TODAY', 'GÜNLÜK · BUGÜN')} title={t('How are you feeling?', 'Nasıl hissediyorsun?')}
        right={<span style={{ fontSize: 12.5, color: 'var(--muted)' }}>{logged} / {syms.length} {t('logged', 'kaydedildi')}</span>} />
      <div className="mb-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Logger */}
        <Card>
          <div className="eyebrow" style={{ marginBottom: 16 }}>{t('Rate today', 'Bugünü puanla')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {syms.map(s => {
              const val = todayLog[s.key] ?? null;
              return (
                <div key={s.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 500 }}>{t(s.label, s.labelTr)}</span>
                    <span style={{ fontSize: 11.5, color: val == null ? 'var(--muted-2)' : 'var(--accent)', fontFamily: 'var(--mono)' }}>
                      {val == null ? '—' : rateLabel(val)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[0,1,2,3].map(v => {
                      const on = val === v;
                      return (
                        <button key={v} onClick={() => api.logSymptom(TODAY_KEY, s.key, v)}
                          style={{
                            flex: 1, height: 30, borderRadius: 8,
                            background: on ? 'var(--accent)' : 'var(--bone)',
                            color: on ? 'var(--ivory)' : 'var(--muted)',
                            boxShadow: on ? 'none' : 'inset 0 0 0 1px var(--line-soft)',
                            fontSize: 11, fontWeight: on ? 700 : 500, cursor: 'pointer',
                            transition: 'all 140ms ease',
                          }}>{v}</button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
        {/* History + note */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
              <div className="eyebrow">{t('Last 14 days', 'Son 14 gün')}</div>
              <span style={{ fontSize: 10.5, color: 'var(--muted-2)', fontFamily: 'var(--mono)' }}>{t('today →', 'bugün →')}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              {syms.slice(0, 6).map(s => (
                <div key={s.key} style={{ display: 'grid', gridTemplateColumns: '92px 1fr', gap: 12, alignItems: 'center' }}>
                  <span style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>{t(s.label, s.labelTr)}</span>
                  <SymptomTrack series={realSeries(lunara.symptomLog, s.key, s.series)} color="var(--accent)"/>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <div className="eyebrow" style={{ marginBottom: 12 }}>{t('Add a note', 'Not ekle')}</div>
            <textarea value={note} onChange={e => setNote(e.target.value)}
              placeholder={t('A line about your day, mood, anything…', 'Günün, ruh halin, aklındaki herhangi bir şey hakkında bir satır…')}
              style={{
                width: '100%', minHeight: 64, resize: 'vertical',
                border: '1px solid var(--line)', borderRadius: 12, padding: 12,
                fontFamily: 'var(--sans)', fontSize: 13.5, color: 'var(--ink)',
                background: 'var(--ivory)', outline: 'none', boxSizing: 'border-box',
              }}/>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
              <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>{lunara.notes.length} {t(lunara.notes.length === 1 ? 'note saved' : 'notes saved', 'not kayıtlı')}</span>
              <Btn primary onClick={() => { if (note.trim()) { api.addNote(note.trim()); setNote(''); } }}>
                <Icon d={ICONS.plus} size={13} sw={2}/> {t('Save note', 'Notu kaydet')}
              </Btn>
            </div>
            {lunara.notes.length > 0 && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line-soft)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {lunara.notes.slice(0, 3).map(n => (
                  <div key={n.id} style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.5 }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--muted-2)', marginRight: 8 }}>{n.at}</span>
                    {n.text}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ════════════════ LABS ════════════════ */
const X_ICON = 'M18 6 6 18M6 6l12 12';
// Short date label: 'YYYY-MM-DD' -> '4 Haz' / '4 Jun'
function fmtLabDate(iso) {
  const M_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const M_TR = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
  const p = String(iso || '').split('-');
  if (p.length !== 3) return iso || '';
  const d = parseInt(p[2], 10), mi = parseInt(p[1], 10) - 1;
  return d + ' ' + (I18N.lang === 'tr' ? M_TR : M_EN)[mi] || iso;
}

function LabsScreen({ lunara, api }) {
  const panels = (lunara && lunara.labPanels) || [];
  const hasData = panels.length > 0;
  const [adding, setAdding] = React.useState(false);

  // When the user has entered values, show only analytes with data; otherwise
  // fall back to the sample LABS so the screen has something to look at.
  const withData = LABS.filter(l => labHistory(panels, l.key).length > 0);
  const shown = hasData ? withData : LABS;
  const [sel, setSel] = React.useState(shown[0] ? shown[0].key : LABS[0].key);
  React.useEffect(() => {
    if (shown.length && !shown.find(l => l.key === sel)) setSel(shown[0].key);
  }, [hasData, shown.length]); // eslint-disable-line

  const lab = LABS.find(l => l.key === sel) || LABS[0];
  const value = hasData ? labCurrent(panels, lab.key) : lab.value;
  const history = hasData ? labHistory(panels, lab.key) : lab.history;
  const dates = hasData ? labReadingsDates(panels, lab.key) : ['Dec','Jan','Feb','Mar','Apr','May','Now'];
  const inRange = value != null && value >= lab.range[0] && value <= lab.range[1];

  const name = (l) => t(l.name, l.nameTr || l.name);

  return (
    <div style={wrap}>
      <ScreenHead
        eyebrow={hasData
          ? t(`${panels.length} panel · last ${fmtLabDate(panels[0].date)}`, `${panels.length} panel · son ${fmtLabDate(panels[0].date)}`)
          : t('SAMPLE DATA', 'ÖRNEK VERİ')}
        title={t('Lab results', 'Tahlil sonuçları')}
        right={<Btn onClick={() => setAdding(true)}><Icon d={ICONS.plus} size={13} sw={2}/> {t('Add results', 'Sonuç ekle')}</Btn>} />

      {!hasData && (
        <p style={{ fontSize: 12.5, color: 'var(--muted)', margin: '-6px 0 16px', fontStyle: 'italic' }}>
          {t('These are sample values. Tap “Add results” to enter your own.',
             'Bunlar örnek değerlerdir. Kendi değerlerini girmek için “Sonuç ekle”ye dokun.')}
        </p>
      )}

      <div className="mb-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 20 }}>
        {/* List */}
        <Card pad={0} style={{ overflow: 'hidden' }}>
          {shown.map((l, i) => {
            const on = l.key === sel;
            const v = hasData ? labCurrent(panels, l.key) : l.value;
            return (
              <button key={l.key} onClick={() => setSel(l.key)}
                style={{
                  width: '100%', textAlign: 'left', cursor: 'pointer',
                  display: 'grid', gridTemplateColumns: '1fr auto 120px', gap: 14, alignItems: 'center',
                  padding: '16px 22px', background: on ? 'var(--bone)' : 'transparent',
                  borderBottom: i < shown.length - 1 ? '1px solid var(--line-soft)' : 'none',
                  borderLeft: `3px solid ${on ? 'var(--accent)' : 'transparent'}`,
                  transition: 'background 140ms ease',
                }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600 }}>{name(l)}</span>
                  <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{t('ref', 'ref')} {l.range[0]}–{l.range[1]} {l.unit}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                  <span style={{ fontFamily: 'var(--serif)', fontSize: 22 }}>{v != null ? v : '—'}</span>
                </div>
                <div style={{ width: 120 }}>{v != null && <RangeBar value={v} range={l.range} target={l.target}/>}</div>
              </button>
            );
          })}
        </Card>
        {/* Detail */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 4 }}>{name(lab)}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontFamily: 'var(--serif)', fontSize: 40, letterSpacing: '-0.02em' }}>{value != null ? value : '—'}</span>
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>{lab.unit}</span>
              </div>
            </div>
            {value != null && (
              <span style={{
                fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: '0.06em',
                padding: '6px 12px', borderRadius: 999,
                background: inRange ? 'var(--accent-soft)' : 'var(--signal-warn)',
                color: inRange ? 'var(--ink-2)' : 'var(--ivory)',
              }}>{inRange ? t('IN RANGE', 'ARALIKTA') : t('OUT OF RANGE', 'ARALIK DIŞI')}</span>
            )}
          </div>
          {history.length > 0 && (
            <>
              <div style={{ margin: '20px 0 8px' }}>
                <Sparkline data={history.length === 1 ? [history[0], history[0]] : history} color="var(--accent)" width={420} height={90}/>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--muted-2)', fontFamily: 'var(--mono)' }}>
                {(hasData ? dates : dates.map(m => (I18N.lang === 'tr'
                  ? ({Dec:'Ara',Jan:'Oca',Feb:'Şub',Mar:'Mar',Apr:'Nis',May:'May',Now:'Şimdi'}[m] || m) : m).toUpperCase()))
                  .map((d, i) => <span key={i}>{d}</span>)}
              </div>
            </>
          )}
          <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 15, lineHeight: 1.5, color: 'var(--ink-2)', marginTop: 22, borderTop: '1px solid var(--line-soft)', paddingTop: 18 }}>
            {labNote(lab.key)}
          </p>
        </Card>
      </div>

      {/* Entered panels */}
      {hasData && (
        <Card style={{ marginTop: 20 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>{t('Entered results', 'Girilen sonuçlar')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {panels.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                padding: '10px 14px', borderRadius: 'var(--r-md)', background: 'var(--bone)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{fmtLabDate(p.date)}</span>
                  <span style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.readings.map(r => `${t(r.name, r.nameTr || r.name)} ${r.value}`).join(' · ')}
                  </span>
                </div>
                <button onClick={() => api.removeLabPanel(p.id)} title={t('Remove', 'Sil')}
                  style={{ flexShrink: 0, padding: 6, borderRadius: 8, color: 'var(--muted)', cursor: 'pointer' }}>
                  <Icon d={X_ICON} size={15} sw={1.8}/>
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {adding && <AddLabForm onClose={() => setAdding(false)} onSave={(panel) => api.addLabPanel(panel)} />}
    </div>
  );
}

// Reading dates for an analyte (short labels), oldest -> newest
function labReadingsDates(panels, key) {
  return (panels || [])
    .filter(p => (p.readings || []).some(r => r.key === key))
    .map(p => p.date)
    .sort()
    .map(fmtLabDate);
}

/* Simple manual lab-entry form (modal). Fill any subset of analytes. */
function AddLabForm({ onClose, onSave }) {
  const [date, setDate] = React.useState(getTodayKey());
  const [vals, setVals] = React.useState({});
  const set = (key, v) => setVals(o => ({ ...o, [key]: v }));

  const readings = LABS
    .map(l => {
      const raw = vals[l.key];
      if (raw == null || String(raw).trim() === '') return null;
      const num = parseFloat(String(raw).replace(',', '.'));
      if (isNaN(num)) return null;
      return { key: l.key, name: l.name, nameTr: l.nameTr, unit: l.unit, value: num };
    })
    .filter(Boolean);

  const submit = () => { if (readings.length) { onSave({ date, readings }); onClose(); } };

  const labelStyle = { fontSize: 10.5, fontFamily: 'var(--mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' };
  const fieldStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 'var(--r-sm)',
    border: '1px solid var(--line)', background: 'var(--ivory)', color: 'var(--ink)',
    fontFamily: 'var(--sans)', fontSize: 14, outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(20,14,10,0.5)', backdropFilter: 'blur(3px)', padding: 18,
    }}>
      <div onClick={e => e.stopPropagation()} className="sheet-up" style={{
        width: '100%', maxWidth: 460, maxHeight: '88vh', overflow: 'auto',
        background: 'var(--card)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-card)',
        padding: 24,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 4 }}>{t('New results', 'Yeni sonuç')}</div>
            <h2 className="serif-display" style={{ margin: 0, fontSize: 24 }}>{t('Add lab values', 'Tahlil değeri ekle')}</h2>
          </div>
          <button onClick={onClose} style={{ padding: 6, color: 'var(--muted)', cursor: 'pointer' }}>
            <Icon d={X_ICON} size={18} sw={2}/>
          </button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ ...labelStyle, display: 'block', marginBottom: 6 }}>{t('DATE', 'TARİH')}</label>
          <input type="date" value={date} max={getTodayKey()} onChange={e => setDate(e.target.value)} style={fieldStyle}/>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {LABS.map(l => (
            <div key={l.key} style={{ display: 'grid', gridTemplateColumns: '1fr 130px', gap: 12, alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                <span style={{ fontSize: 13.5, fontWeight: 600 }}>{t(l.name, l.nameTr || l.name)}</span>
                <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{t('ref', 'ref')} {l.range[0]}–{l.range[1]} {l.unit}</span>
              </div>
              <input
                type="text" inputMode="decimal" placeholder={l.unit}
                value={vals[l.key] || ''} onChange={e => set(l.key, e.target.value)}
                style={{ ...fieldStyle, textAlign: 'right' }}/>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '12px 0', borderRadius: 999, cursor: 'pointer',
            border: '1px solid var(--line)', background: 'transparent', color: 'var(--ink-2)',
            fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 600,
          }}>{t('Cancel', 'İptal')}</button>
          <button onClick={submit} disabled={!readings.length} style={{
            flex: 2, padding: '12px 0', borderRadius: 999,
            cursor: readings.length ? 'pointer' : 'not-allowed',
            border: 'none', background: 'var(--ink)', color: 'var(--ivory)',
            fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 600,
            opacity: readings.length ? 1 : 0.45,
          }}>{t('Save', 'Kaydet')}{readings.length ? ` · ${readings.length}` : ''}</button>
        </div>
      </div>
    </div>
  );
}
function labNote(key) {
  const notes = {
    e2: 'Estradiol has climbed steadily into the target window — symptom relief tends to follow this curve by two to three weeks.',
    p4: 'Progesterone is in range and supports a stable luteal phase. Hold the bedtime dose.',
    t: 'Total testosterone reached mid-range; pair this with the free-T reading for the full picture.',
    ft: 'Free testosterone is the active fraction — trending toward target as SHBG falls.',
    shbg: 'SHBG has dropped 34 points from baseline, freeing more active testosterone. This is the lever we have been watching.',
    fsh: 'FSH is stable, consistent with intact ovarian signaling.',
  };
  const notesTr = {
    e2: 'Estradiol istikrarlı şekilde hedef aralığa tırmandı — belirti rahatlaması bu eğriyi iki üç hafta gecikmeyle izler.',
    p4: 'Progesteron aralıkta ve istikrarlı bir luteal faz sağlıyor. Yatmadan önceki dozu koru.',
    t: 'Toplam testosteron orta aralığa ulaştı; tam tablo için serbest-T değeriyle birlikte değerlendir.',
    ft: 'Serbest testosteron aktif fraksiyondur — SHBG düştükçe hedefe doğru ilerliyor.',
    shbg: 'SHBG başlangıca göre 34 puan düştü, daha fazla aktif testosteron serbest kaldı. İzlediğimiz kaldıraç bu.',
    fsh: 'FSH stabil, sağlam yumurtalık sinyaliyle uyumlu.',
  };
  return t(notes[key] || '', notesTr[key] || '');
}

/* ════════════════ CYCLE + MOON ════════════════ */
function CycleScreen({ lunara, api }) {
  const today = TODAY_DATE;
  const day = cycleDayFrom(lunara.periodStart, today);
  const ph = phaseOf(day);
  const moon = moonPhase(today);
  const [confirming, setConfirming] = React.useState(false);
  const [justStarted, setJustStarted] = React.useState(false);
  useLang();

  const handlePeriodStart = () => {
    api.setPeriodStart(getTodayKey());
    setConfirming(false);
    setJustStarted(true);
    setTimeout(() => setJustStarted(false), 3000);
  };
  // build 7-day strip around today
  const strip = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(today); date.setDate(today.getDate() - 3 + i);
    const cd = cycleDayFrom(lunara.periodStart, date);
    return { date, cd, phase: phaseOf(cd), moon: moonPhase(date), isToday: i === 3 };
  });
  return (
    <div style={wrap}>
      <ScreenHead eyebrow={t(`CYCLE DAY ${day} · ${CYCLE_LEN}-DAY`, `DÖNGÜ GÜNÜ ${day} · ${CYCLE_LEN} GÜNLÜK`)} title={t('Cycle & moon', 'Döngü & ay')}
        right={
          justStarted ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--signal-good)' }}>
              <Icon d={ICONS.check} size={14} stroke="var(--signal-good)" sw={2}/> {t('Period logged ✓', 'Regl kaydedildi ✓')}
            </span>
          ) : confirming ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>{t('Reset cycle to day 1?', 'Döngüyü 1. güne sıfırla?')}</span>
              <Btn primary onClick={handlePeriodStart}>{t('Yes', 'Evet')}</Btn>
              <Btn onClick={() => setConfirming(false)}>{t('Cancel', 'İptal')}</Btn>
            </div>
          ) : (
            <Btn primary onClick={() => setConfirming(true)}>
              <Icon d={ICONS.drop} size={13}/> {t('Period started today', 'Regl bugün başladı')}
            </Btn>
          )
        } />
      <div className="mb-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Cycle ring */}
        <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CycleRing day={day} phase={ph}/>
          <div style={{ display: 'flex', gap: 16, marginTop: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
            {Object.entries(PHASE_TINT).map(([k, c]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: ph.key === k ? 'var(--ink)' : 'var(--muted)', fontWeight: ph.key === k ? 600 : 400 }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: c }}/>{phaseLabel(phaseOf(k === 'menstrual' ? 1 : k === 'follicular' ? 8 : k === 'ovulation' ? 15 : 25))}
              </div>
            ))}
          </div>
        </Card>
        {/* Moon */}
        <Card style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>{t("Tonight's moon", 'Bu geceki ay')}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 8 }}>
            <MoonDisc size={92} frac={moon.frac}/>
            <div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 26, letterSpacing: '-0.01em' }}>{moonName(moon)}</div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 4 }}>{Math.round(moon.illum * 100)}% {t('illuminated', 'aydınlık')} · {t('day', 'gün')} {Math.round(moon.age)} / {t('lunar month', 'ay devri')}</div>
            </div>
          </div>
          <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14.5, lineHeight: 1.55, color: 'var(--ink-2)', margin: '8px 0 0' }}>
            {t('Many track how mood and sleep shift with the lunar month alongside their cycle. Lunara keeps both in view.',
               'Birçok kişi ruh hali ve uykunun, döngüyle birlikte ay devrine göre nasıl değiştiğini izler. Lunara ikisini de göz önünde tutar.')}
          </p>
        </Card>
      </div>
      {/* 7-day strip */}
      <Card>
        <div className="eyebrow" style={{ marginBottom: 16 }}>{t('This week', 'Bu hafta')}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10 }}>
          {strip.map((d, i) => (
            <div key={i} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              padding: '14px 6px', borderRadius: 14,
              background: d.isToday ? 'var(--ink)' : 'var(--ivory)',
              boxShadow: d.isToday ? 'none' : 'inset 0 0 0 1px var(--line-soft)',
            }}>
              <span style={{ fontSize: 10.5, fontFamily: 'var(--mono)', color: d.isToday ? 'rgba(251,246,235,0.7)' : 'var(--muted)' }}>
                {d.date.toLocaleDateString(I18N.lang === 'tr' ? 'tr' : 'en', { weekday: 'short' }).toUpperCase()}
              </span>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 20, color: d.isToday ? 'var(--ivory)' : 'var(--ink)' }}>{d.date.getDate()}</span>
              <MoonDisc size={26} frac={d.moon.frac}/>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: PHASE_TINT[d.phase.key] }}/>
              <span style={{ fontSize: 9.5, color: d.isToday ? 'rgba(251,246,235,0.7)' : 'var(--muted-2)', fontFamily: 'var(--mono)' }}>{t('D','G')}{d.cd}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function CycleRing({ day, phase, size = 260 }) {
  const r = (size - 50) / 2;
  const c = 2 * Math.PI * r;
  const segs = [
    { from: 0, to: 5, k: 'menstrual' },
    { from: 5, to: 13, k: 'follicular' },
    { from: 13, to: 18, k: 'ovulation' },
    { from: 18, to: 32, k: 'luteal' },
  ];
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--line-soft)" strokeWidth="20"/>
        {segs.map((s, i) => {
          const dash = ((s.to - s.from) / CYCLE_LEN) * c;
          const offset = -(s.from / CYCLE_LEN) * c;
          return <circle key={i} cx={size/2} cy={size/2} r={r} fill="none" stroke={PHASE_TINT[s.k]} strokeWidth="20"
            strokeDasharray={`${dash} ${c}`} strokeDashoffset={offset} opacity="0.92"/>;
        })}
        <g transform={`rotate(${((day-1)/CYCLE_LEN)*360} ${size/2} ${size/2})`}>
          <circle cx={size/2 + r} cy={size/2} r="10" fill="var(--ink)" stroke="var(--ivory)" strokeWidth="3"/>
        </g>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span className="eyebrow">{t('Day', 'Gün')}</span>
        <span style={{ fontFamily: 'var(--serif)', fontSize: 72, lineHeight: 0.9, letterSpacing: '-0.04em' }}>{day}</span>
        <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 15, color: 'var(--ink-2)' }}>{phaseLabel(phase).toLocaleLowerCase(I18N.lang === 'tr' ? 'tr' : 'en')}</span>
      </div>
    </div>
  );
}

/* ════════════════ CARE TEAM (AI destekli) ════════════════ */
function CareScreen({ lunara, onNav }) {
  const stage = (lunara && lunara.stage) || 'cycle';
  const stageInfo = (typeof STAGES !== 'undefined' && STAGES[stage]) || {};
  const cycleDay = lunara ? cycleDayFrom(lunara.periodStart, TODAY_DATE) : 14;
  const ph = phaseOf(cycleDay);
  const todayLog = (lunara && lunara.symptomLog && lunara.symptomLog[TODAY_KEY]) || {};
  const profileName = (lunara && lunara.profile && lunara.profile.name) || 'there';
  useLang();

  const systemPrompt = `You are Lunara's AI wellness companion — warm, knowledgeable and supportive, like a trusted friend who happens to know a lot about women's health. Respond in the same language the user writes in (Turkish if they write Turkish, English if English).

User context:
- Name: ${profileName}
- Life stage: ${t(stageInfo.en || stage, stageInfo.tr || stage)} (${stageInfo.note || ''})
- Cycle day: ${cycleDay} (${t(ph.label, ph.labelTr || ph.label)} phase)
- Logged symptoms today: ${Object.keys(todayLog).length > 0 ? Object.entries(todayLog).map(([k,v]) => k+': '+v+'/3').join(', ') : 'none'}

Guidelines:
- Warm, concise, empowering — never clinical or scary
- Acknowledge feelings before information
- End with 1 gentle actionable suggestion
- Never diagnose. For serious concerns say: "This is worth discussing with your doctor."
- Append: "💙 This is general wellness support, not medical advice."`;

  const INITIAL_MSG = { who: 'ai', text: t(
    `Hi ${profileName} 👋 I'm your Lunara companion. You're on cycle day ${cycleDay} — ${ph.label.toLowerCase()} phase. Ask me anything about your cycle, symptoms or how you're feeling.`,
    `Merhaba ${profileName} 👋 Ben Lunara yoldaşınım. Döngünün ${cycleDay}. günündesin — ${ph.labelTr || ph.label.toLowerCase()} fazındasın. Döngün, belirtilerin veya nasıl hissettiğin hakkında her şeyi sorabilirsin.`
  ), at: t('Just now', 'Az önce') };

  const [msgs, setMsgs] = React.useState([INITIAL_MSG]);
  const [draft, setDraft] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const bottomRef = React.useRef(null);
  const inputRef = React.useRef(null);

  React.useEffect(() => { if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const send = async () => {
    const text = draft.trim();
    if (!text || loading) return;
    setDraft('');
    setMsgs(prev => [...prev, { who: 'me', text, at: nowHM() }]);
    setLoading(true);
    try {
      const history = msgs.map(m => ({ role: m.who === 'me' ? 'user' : 'assistant', content: m.text }));
      history.push({ role: 'user', content: text });
      const reply = await window.claude.complete({ system: systemPrompt, messages: history, max_tokens: 400 });
      setMsgs(prev => [...prev, { who: 'ai', text: reply, at: nowHM() }]);
    } catch (e) {
      setMsgs(prev => [...prev, { who: 'ai', text: t('Having trouble connecting — please try again. 🌙', 'Bağlantı sorunu — lütfen tekrar dene. 🌙'), at: nowHM() }]);
    } finally { setLoading(false); }
  };

  return (
    <div style={wrap}>
      <ScreenHead eyebrow={t('LUNARA AI · WELLNESS COMPANION', 'LUNARA AI · SAĞLIK YOLDAŞI')}
        title={t('Your companion', 'Yoldaşın')}
        right={<Btn onClick={() => onNav && onNav('nourish')}><Icon d={ICONS.leaf} size={13}/> {t('Nourish & move', 'Beslenme ve hareket')}</Btn>} />
      <div className="mb-stack" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20, alignItems: 'start' }}>
        <Card style={{ display: 'flex', flexDirection: 'column', minHeight: 500 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 16, borderBottom: '1px solid var(--line-soft)' }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, var(--accent-soft), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Logo size={24}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Lunara AI</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--muted)' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--signal-good)', display: 'inline-block' }}/>
                {t('Online · responds instantly', 'Çevrimiçi · anında yanıtlar')}
              </div>
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--muted-2)', textAlign: 'right', lineHeight: 1.4 }}>
              {t('Day', 'Gün')} {cycleDay}<br/>
              <span style={{ fontStyle: 'italic', fontFamily: 'var(--serif)', fontSize: 12 }}>{t(ph.label, ph.labelTr || ph.label)}</span>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, padding: '18px 0', maxHeight: 360, minHeight: 240 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.who === 'me' ? 'flex-end' : 'flex-start' }}>
                {m.who === 'ai' && (
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent-soft)', flexShrink: 0, marginRight: 8, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Logo size={16}/></div>
                )}
                <div style={{ maxWidth: '78%' }}>
                  <div style={{ padding: '12px 15px', borderRadius: 18, background: m.who === 'me' ? 'var(--accent)' : 'var(--bone)', color: m.who === 'me' ? 'var(--ivory)' : 'var(--ink)', fontSize: 14, lineHeight: 1.55, whiteSpace: 'pre-wrap', borderBottomRightRadius: m.who === 'me' ? 4 : 18, borderBottomLeftRadius: m.who === 'me' ? 18 : 4 }}>{m.text}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted-2)', fontFamily: 'var(--mono)', marginTop: 4, textAlign: m.who === 'me' ? 'right' : 'left' }}>{m.at}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Logo size={16}/></div>
                <div style={{ padding: '12px 16px', borderRadius: 18, borderBottomLeftRadius: 4, background: 'var(--bone)', display: 'flex', gap: 5, alignItems: 'center' }}>
                  {[0,1,2].map(i => <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--muted-2)', display: 'inline-block', animation: 'pulseSoft 1.2s ease-in-out '+(i*0.18)+'s infinite' }}/>)}
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>
          <div style={{ display: 'flex', gap: 10, paddingTop: 14, borderTop: '1px solid var(--line-soft)' }}>
            <input ref={inputRef} value={draft} onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder={t('Ask anything about your cycle, symptoms…', 'Döngün, belirtilerin hakkında her şeyi sor…')}
              disabled={loading}
              style={{ flex: 1, border: '1px solid var(--line)', borderRadius: 999, padding: '11px 18px', fontFamily: 'var(--sans)', fontSize: 14, background: 'var(--ivory)', outline: 'none', color: 'var(--ink)', opacity: loading ? 0.6 : 1 }}/>
            <button onClick={send} disabled={loading || !draft.trim()}
              style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0, background: draft.trim() && !loading ? 'var(--accent)' : 'var(--line)', color: draft.trim() && !loading ? 'var(--ivory)' : 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: draft.trim() && !loading ? 'pointer' : 'default', transition: 'all 160ms ease', border: 'none' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/></svg>
            </button>
          </div>
        </Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Card>
            <div className="eyebrow" style={{ marginBottom: 12 }}>{t('Quick questions', 'Hızlı sorular')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {careQuickPrompts(stage, ph.key).map((q, i) => (
                <button key={i} onClick={() => { setDraft(q); inputRef.current && inputRef.current.focus(); }}
                  style={{ padding: '10px 14px', borderRadius: 12, textAlign: 'left', cursor: 'pointer', background: 'var(--bone)', color: 'var(--ink-2)', fontSize: 13, lineHeight: 1.4, boxShadow: 'inset 0 0 0 1px var(--line-soft)', border: 'none' }}>{q}</button>
              ))}
            </div>
          </Card>
          <Card style={{ background: 'var(--bone)' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Icon d={ICONS.heart} size={16} stroke="var(--muted)"/>
              <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.5, margin: 0, fontFamily: 'var(--serif)', fontStyle: 'italic' }}>
                {t('Lunara AI is a wellness companion, not a medical professional. Always consult your doctor for diagnosis or urgent concerns.',
                   'Lunara AI bir sağlık yoldaşıdır, tıbbi uzman değildir. Tanı veya acil durumlar için mutlaka doktoruna danış.')}
              </p>
            </div>
          </Card>
          <Card style={{ background: 'linear-gradient(160deg, var(--accent-soft), var(--card))', cursor: 'pointer' }} onClick={() => onNav && onNav('nourish')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <Icon d={ICONS.leaf} size={17} stroke="var(--accent)"/>
              <div className="eyebrow">{t('Care plan', 'Bakım planı')}</div>
            </div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 19, lineHeight: 1.25, marginBottom: 10 }}>{t('Movement & food for your phase', 'Fazına göre hareket & beslenme')}</div>
            <Btn primary>{t('Open', 'Aç')} <Icon d={ICONS.arrow} size={13}/></Btn>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ════════════════ LIBRARY ════════════════ */
function LibraryScreen({ lunara }) {
  const { featured, articles } = libraryFor(lunara ? lunara.stage : 'cycle');
  return (
    <div style={wrap}>
      <ScreenHead eyebrow={t('LIBRARY', 'BLOG')} title={t('Learn', 'Öğren')}
        right={<Btn><Icon d={ICONS.search} size={13}/> {t('Search', 'Ara')}</Btn>} />
      <Card className="mb-stack" pad={0} style={{ overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 220 }}>
        <div style={{ position: 'relative', background: 'linear-gradient(150deg, oklch(0.55 0.10 28), oklch(0.78 0.08 60))' }}>
          <div style={{ position: 'absolute', bottom: 20, left: 22, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em', color: 'rgba(251,246,235,0.85)' }}>{t('FEATURED', 'ÖNE ÇIKAN')}</div>
        </div>
        <div style={{ padding: '30px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>{featured.tag}</div>
          <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 27, lineHeight: 1.15, margin: 0, letterSpacing: '-0.01em' }}>{featured.title}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 18 }}>
            <Btn primary>{t('Read', 'Oku')}</Btn>
            <span style={{ fontSize: 11.5, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{featured.read.toUpperCase()} · {featured.by}</span>
          </div>
        </div>
      </Card>
      <div className="mb-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
        {articles.map((a, i) => (
          <Card key={i} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 12, minHeight: 150 }}>
            <div className="eyebrow" style={{ color: 'var(--accent)' }}>{a.tag}</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 18, lineHeight: 1.25, flex: 1, letterSpacing: '-0.01em' }}>{a.title}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: 'var(--muted-2)', fontFamily: 'var(--mono)' }}>{a.read.toUpperCase()}</span>
              <Icon d={ICONS.arrow} size={14} stroke="var(--muted)"/>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Stage + phase aware quick prompts for AI chat
function careQuickPrompts(stage, phaseKey) {
  const sets = {
    menarche: [
      t('Why do I get cramps?', 'Neden kramp oluyorum?'),
      t('Is my cycle length normal?', 'Döngü uzunluğum normal mi?'),
      t('What foods help during my period?', 'Reglimde hangi yiyecekler iyi gelir?'),
    ],
    cycle: [
      t('Why do I feel tired this week?', 'Bu hafta neden yorgun hissediyorum?'),
      t('What does my cervical fluid tell me?', 'Servikal sıvım bana ne söylüyor?'),
      t('How do I support my hormones naturally?', 'Hormonlarımı doğal olarak nasıl desteklerim?'),
    ],
    ttc: [
      t('How do I know when I\'m ovulating?', 'Ovülasyon yaptığımı nasıl anlarım?'),
      t('Which supplements help with conception?', 'Hangi takviyeler gebe kalmaya yardımcı olur?'),
      t('When should I take a pregnancy test?', 'Ne zaman gebelik testi yapmalıyım?'),
    ],
    pregnancy: [
      t('Is my nausea normal at this stage?', 'Bu aşamada bulantım normal mi?'),
      t('What exercises are safe now?', 'Şu an hangi egzersizler güvenli?'),
      t('When should I feel first movements?', 'İlk hareketleri ne zaman hissedeceğim?'),
    ],
    postpartum: [
      t('How do I know if I have PPD?', 'Doğum sonrası depresyonum var mı?'),
      t('Why is breastfeeding so hard at first?', 'Emzirme neden başta bu kadar zor?'),
      t('When will my cycle return?', 'Döngüm ne zaman geri döner?'),
    ],
    perimeno: [
      t('What causes hot flushes?', 'Sıcak basmasına ne yol açar?'),
      t('How does BHRT help with my symptoms?', 'BHRT belirtilerime nasıl yardımcı olur?'),
      t('What should I track to support my doctor?', 'Doktoruma yardımcı olmak için ne takip etmeliyim?'),
    ],
    menopause: [
      t('How do I protect my bone density?', 'Kemik yoğunluğumu nasıl koruyorum?'),
      t('Why is sleep so disrupted now?', 'Uyku neden bu kadar bozuldu?'),
      t('Is BHRT safe for me?', 'BHRT benim için güvenli mi?'),
    ],
  };
  return sets[stage] || sets.cycle;
}

export { CYCLE_LEN, daysBetween, cycleDayFrom, phaseOf, phaseLabel, MOON_NAMES_TR, moonName, PHASE_TINT, moonPhase, MoonDisc, ScreenHead, Btn, wrap, DosesScreen, RATE_LABELS, RATE_LABELS_TR, rateLabel, realSeries, SymptomsScreen, LabsScreen, labNote, CycleScreen, CycleRing, CareScreen, LibraryScreen, careQuickPrompts };
