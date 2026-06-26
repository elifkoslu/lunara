import React from 'react';
import { t, useLang } from './i18n';
import { Btn } from './screens';
import { Card, ICONS, Icon, TODAY_DATE, regimenDay, whenLabel } from './shared';

/* regimen.jsx — Lunara döngü-temelli ilaç programı düzenleyici
   Her ilaç döngünün [startDay..endDay] günlerinde aktif olur.
   Döngü uzunluğu kullanıcı tarafından belirlenir (örn. 29 gün = 25 aktif + 4 ara).
   shared.jsx (Card, Icon, ICONS, Btn from screens, t, whenLabel) ve i18n'e bağlıdır. */
/* eslint-disable */

const MED_COLORS = [
  'oklch(0.55 0.13 28)',   // maroon-rose
  'oklch(0.60 0.10 220)',  // blue
  'oklch(0.62 0.10 50)',   // amber
  'oklch(0.55 0.09 150)',  // green
  'oklch(0.55 0.12 320)',  // plum
];
function medColor(regimen, id) {
  const i = regimen.meds.findIndex(m => m.id === id);
  return MED_COLORS[((i % MED_COLORS.length) + MED_COLORS.length) % MED_COLORS.length];
}

const WHEN_OPTS = ['morning', 'midday', 'evening', 'bedtime'];

/* ── Visual timeline: cycle days 1..L, each med a colored band ── */
function RoutineTimeline({ regimen, today }) {
  const L = regimen.cycleLength;
  const cur = regimenDay(regimen, today || TODAY_DATE);
  // day axis ticks every 7 + last
  const ticks = [];
  for (let d = 1; d <= L; d += 7) ticks.push(d);
  if (ticks[ticks.length - 1] !== L) ticks.push(L);

  const Track = ({ med }) => {
    const c = medColor(regimen, med.id);
    const segs = [];
    if (med.startDay <= med.endDay) {
      segs.push([med.startDay, med.endDay]);
    } else {
      segs.push([med.startDay, L]); segs.push([1, med.endDay]);
    }
    return (
      <div style={{ position: 'relative', height: 18, background: 'var(--bone)', borderRadius: 6, overflow: 'hidden' }}>
        {segs.map(([a, b], i) => (
          <div key={i} style={{
            position: 'absolute', top: 0, bottom: 0,
            left: `${((a - 1) / L) * 100}%`, width: `${((b - a + 1) / L) * 100}%`,
            background: c, borderRadius: 5,
          }}/>
        ))}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      {/* med rows */}
      {regimen.meds.map(m => (
        <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '96px 1fr', gap: 12, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
            <span style={{ width: 9, height: 9, borderRadius: 3, background: medColor(regimen, m.id), flexShrink: 0 }}/>
            <span style={{ fontSize: 12, color: 'var(--ink-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t(m.name, m.nameTr || m.name)}</span>
          </div>
          <Track med={m}/>
        </div>
      ))}
      {/* axis */}
      <div style={{ display: 'grid', gridTemplateColumns: '96px 1fr', gap: 12, marginTop: 2 }}>
        <span/>
        <div style={{ position: 'relative', height: 16 }}>
          {ticks.map(d => (
            <span key={d} style={{
              position: 'absolute', left: `${((d - 1) / L) * 100}%`, transform: d === L ? 'translateX(-100%)' : 'none',
              fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--muted-2)',
            }}>{d}</span>
          ))}
          {/* current day marker */}
          <div style={{ position: 'absolute', top: -88, height: 96, left: `${((cur - 0.5) / L) * 100}%`, width: 2, background: 'var(--ink)', opacity: 0.4 }}/>
          <span style={{ position: 'absolute', top: 0, left: `${((cur - 0.5) / L) * 100}%`, transform: 'translateX(-50%)', fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink)', fontWeight: 700, whiteSpace: 'nowrap' }}>
            {t('today', 'bugün')} ·{cur}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Range control: start + end day steppers ── */
function DayRange({ start, end, max, onChange }) {
  const Step = ({ val, set, label }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
      <span className="eyebrow" style={{ fontSize: 9.5 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1px solid var(--line)', borderRadius: 9, overflow: 'hidden', background: 'var(--ivory)' }}>
        <button onClick={() => set(Math.max(1, val - 1))} style={stepBtn}>−</button>
        <span style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--ink)' }}>{val}</span>
        <button onClick={() => set(Math.min(max, val + 1))} style={stepBtn}>+</button>
      </div>
    </div>
  );
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
      <Step val={start} set={v => onChange(v, end)} label={t('Start day', 'Başlangıç günü')}/>
      <span style={{ paddingBottom: 9, color: 'var(--muted-2)' }}>→</span>
      <Step val={end} set={v => onChange(start, v)} label={t('End day', 'Bitiş günü')}/>
    </div>
  );
}
const stepBtn = {
  width: 32, height: 34, fontSize: 17, color: 'var(--ink-2)', cursor: 'pointer',
  background: 'var(--bone)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
};

/* ── The editor ── */
function RegimenEditor({ lunara, api, onClose }) {
  const r = lunara.regimen;
  const [adding, setAdding] = React.useState(false);
  useLang();

  return (
    <Card style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 4 }}>{t('CYCLE SCHEDULE', 'DÖNGÜ PROGRAMI')}</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 22, letterSpacing: '-0.01em' }}>{t('Build your routine', 'Rutinini oluştur')}</div>
        </div>
        {onClose && <Btn onClick={onClose}>{t('Done', 'Bitti')}</Btn>}
      </div>

      {/* Cycle length */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--bone)', borderRadius: 12, marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{t('Cycle length', 'Döngü uzunluğu')}</div>
          <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{t('Days before the routine repeats', 'Rutin tekrarlanmadan önceki gün sayısı')}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1px solid var(--line)', borderRadius: 9, overflow: 'hidden', background: 'var(--ivory)' }}>
          <button onClick={() => api.setRegimenCycle(r.cycleLength - 1)} style={stepBtn}>−</button>
          <span style={{ width: 44, textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--ink)' }}>{r.cycleLength}</span>
          <button onClick={() => api.setRegimenCycle(r.cycleLength + 1)} style={stepBtn}>+</button>
        </div>
      </div>

      {/* Timeline preview */}
      <div style={{ padding: '16px 16px 8px', background: 'var(--ivory)', borderRadius: 12, marginBottom: 18, border: '1px solid var(--line-soft)' }}>
        <div className="eyebrow" style={{ marginBottom: 14 }}>{t('Your cycle at a glance', 'Döngüne bakış')}</div>
        {r.meds.length > 0
          ? <RoutineTimeline regimen={r}/>
          : <div style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic', fontFamily: 'var(--serif)', padding: '6px 0' }}>{t('No medications yet.', 'Henüz ilaç yok.')}</div>}
      </div>

      {/* Med list (editable) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {r.meds.map(m => <MedEditRow key={m.id} med={m} max={r.cycleLength} api={api} color={medColor(r, m.id)}/>)}
      </div>

      {/* Add */}
      {adding
        ? <MedAddForm max={r.cycleLength} onAdd={(med) => { api.addMed(med); setAdding(false); }} onCancel={() => setAdding(false)}/>
        : <button onClick={() => setAdding(true)} style={{
            marginTop: 14, width: '100%', padding: '12px', borderRadius: 12,
            border: '1px dashed var(--line)', color: 'var(--ink-2)', background: 'transparent',
            fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer',
          }}>
            <Icon d={ICONS.plus} size={15} sw={2}/> {t('Add a medication', 'İlaç ekle')}
          </button>}
    </Card>
  );
}

function MedEditRow({ med, max, api, color }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ border: '1px solid var(--line-soft)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px' }}>
        <span style={{ width: 10, height: 10, borderRadius: 3, background: color, flexShrink: 0 }}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 16 }}>{t(med.name, med.nameTr || med.name)}</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-2)' }}>{med.dose}</span>
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
            {t('days', 'gün')} {med.startDay}–{med.endDay} · {whenLabel(med.when)}
          </div>
        </div>
        <button onClick={() => setOpen(o => !o)} style={{ fontSize: 12, color: 'var(--muted)', padding: '6px 10px', borderRadius: 8, boxShadow: 'inset 0 0 0 1px var(--line)' }}>
          {open ? t('Close', 'Kapat') : t('Edit', 'Düzenle')}
        </button>
      </div>
      {open && (
        <div style={{ padding: '4px 14px 16px', display: 'flex', flexDirection: 'column', gap: 12, borderTop: '1px solid var(--line-soft)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10, marginTop: 12 }}>
            <LabeledInput label={t('Name', 'Ad')} value={med.name} onChange={v => api.updateMed(med.id, { name: v, nameTr: v })}/>
            <LabeledInput label={t('Dose', 'Doz')} value={med.dose} onChange={v => api.updateMed(med.id, { dose: v })}/>
          </div>
          <div>
            <span className="eyebrow" style={{ fontSize: 9.5 }}>{t('When', 'Ne zaman')}</span>
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              {WHEN_OPTS.map(w => {
                const on = med.when === w;
                return (
                  <button key={w} onClick={() => api.updateMed(med.id, { when: w })} style={{
                    flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 11.5, cursor: 'pointer',
                    background: on ? 'var(--ink)' : 'var(--bone)', color: on ? 'var(--ivory)' : 'var(--ink-2)',
                    boxShadow: on ? 'none' : 'inset 0 0 0 1px var(--line-soft)', fontWeight: on ? 700 : 500,
                  }}>{whenLabel(w)}</button>
                );
              })}
            </div>
          </div>
          <DayRange start={med.startDay} end={med.endDay} max={max}
            onChange={(s, e) => api.updateMed(med.id, { startDay: s, endDay: e })}/>
          <button onClick={() => api.removeMed(med.id)} style={{
            alignSelf: 'flex-start', fontSize: 12, color: 'var(--signal-low)', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', marginTop: 2,
          }}>
            <Icon d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" size={14} stroke="var(--signal-low)"/> {t('Remove', 'Kaldır')}
          </button>
        </div>
      )}
    </div>
  );
}

function MedAddForm({ max, onAdd, onCancel }) {
  const [name, setName] = React.useState('');
  const [dose, setDose] = React.useState('');
  const [when, setWhen] = React.useState('morning');
  const [start, setStart] = React.useState(1);
  const [end, setEnd] = React.useState(max);
  const submit = () => { if (name.trim()) onAdd({ name: name.trim(), nameTr: name.trim(), dose: dose.trim() || '—', when, startDay: start, endDay: end }); };
  return (
    <div style={{ marginTop: 14, padding: 16, borderRadius: 12, border: '1px solid var(--line)', background: 'var(--ivory)', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="eyebrow">{t('New medication', 'Yeni ilaç')}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
        <LabeledInput label={t('Name', 'Ad')} value={name} onChange={setName} autoFocus placeholder={t('e.g. Progesterone', 'örn. Progesteron')}/>
        <LabeledInput label={t('Dose', 'Doz')} value={dose} onChange={setDose} placeholder="100 mg"/>
      </div>
      <div>
        <span className="eyebrow" style={{ fontSize: 9.5 }}>{t('When', 'Ne zaman')}</span>
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          {WHEN_OPTS.map(w => {
            const on = when === w;
            return (
              <button key={w} onClick={() => setWhen(w)} style={{
                flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 11.5, cursor: 'pointer',
                background: on ? 'var(--ink)' : 'var(--bone)', color: on ? 'var(--ivory)' : 'var(--ink-2)',
                boxShadow: on ? 'none' : 'inset 0 0 0 1px var(--line-soft)', fontWeight: on ? 700 : 500,
              }}>{whenLabel(w)}</button>
            );
          })}
        </div>
      </div>
      <DayRange start={start} end={end} max={max} onChange={(s, e) => { setStart(s); setEnd(e); }}/>
      <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
        <Btn primary onClick={submit}><Icon d={ICONS.check} size={13} sw={2}/> {t('Add', 'Ekle')}</Btn>
        <Btn onClick={onCancel}>{t('Cancel', 'İptal')}</Btn>
      </div>
    </div>
  );
}

function LabeledInput({ label, value, onChange, placeholder, autoFocus }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span className="eyebrow" style={{ fontSize: 9.5 }}>{label}</span>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} autoFocus={autoFocus}
        style={{
          border: '1px solid var(--line)', borderRadius: 9, padding: '10px 12px',
          fontFamily: 'var(--sans)', fontSize: 13.5, color: 'var(--ink)',
          background: 'var(--card)', outline: 'none', width: '100%', boxSizing: 'border-box',
        }}/>
    </label>
  );
}

export { MED_COLORS, medColor, WHEN_OPTS, RoutineTimeline, DayRange, stepBtn, RegimenEditor, MedEditRow, MedAddForm, LabeledInput };
