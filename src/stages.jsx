import React from 'react';
import { I18N, t, useLang } from './i18n';
import { Btn, cycleDayFrom, phaseOf, wrap } from './screens';
import { ICONS, Icon, Logo } from './shared';

/* stages.jsx — Lunara yaşam evresi katmanı
   7 evre = gamın 7 notası (Do..Si). Hafif kat: her evrenin notası + rengi + tonu.
   Yükselen gam = hayat yolculuğu; oktav (Do′) = nesil yenilenmesi.
   shared.jsx, i18n.jsx, screens.jsx (cycleDayFrom, phaseOf, Btn, wrap) sonrası yüklenir. */
/* eslint-disable */

const STAGES = {
  menarche: {
    note: 'Do', order: 0, available: true,
    en: 'First cycles', tr: 'İlk dönemler',
    toneEn: 'Awareness', toneTr: 'Farkındalık',
    descEn: 'Getting to know your body and its new rhythm.',
    descTr: 'Bedenini ve yeni ritmini tanımaya başlamak.',
    accent: 'oklch(0.58 0.10 155)', accentSoft: 'oklch(0.88 0.05 155)',
    nav: ['home', 'cycle', 'symptoms', 'nourish', 'library'],
  },
  cycle: {
    note: 'Re', order: 1, available: true,
    en: 'Cycle tracking', tr: 'Döngü takibi',
    toneEn: 'Balance', toneTr: 'Denge',
    descEn: 'Knowing your cycle, symptoms and rhythm.',
    descTr: 'Döngünü, belirtilerini ve ritmini tanımak.',
    accent: null, accentSoft: null, // mevcut estetik paleti yönetir (maroon)
    nav: ['home', 'symptoms', 'cycle', 'nourish', 'care', 'library'],
  },
  ttc: {
    note: 'Mi', order: 2, available: true,
    en: 'Preparing', tr: 'Hazırlık',
    toneEn: 'Hope', toneTr: 'Umut',
    descEn: 'Fertile window, ovulation and timing.',
    descTr: 'Doğurgan pencere, ovülasyon ve zamanlama.',
    accent: 'oklch(0.64 0.12 52)', accentSoft: 'oklch(0.87 0.07 55)',
    nav: ['home', 'cycle', 'symptoms', 'nourish', 'care', 'library'],
  },
  pregnancy: {
    note: 'Fa', order: 3, available: true,
    en: 'Pregnancy', tr: 'Gebelik',
    toneEn: 'Nourishing', toneTr: 'Besleyici',
    descEn: 'Week by week, for you and your baby.',
    descTr: 'Hafta hafta, sen ve bebeğin için.',
    accent: 'oklch(0.56 0.10 8)', accentSoft: 'oklch(0.86 0.06 14)',
    nav: ['home', 'symptoms', 'nourish', 'care', 'library'],
  },
  postpartum: {
    note: 'Sol', order: 4, available: true,
    en: 'Postpartum', tr: 'Doğum sonrası',
    toneEn: 'Restoring', toneTr: 'Onarıcı',
    descEn: 'Recovery, mood and feeding in the fourth trimester.',
    descTr: 'İyileşme, ruh hali ve emzirme.',
    accent: 'oklch(0.58 0.07 205)', accentSoft: 'oklch(0.86 0.04 205)',
    nav: ['home', 'symptoms', 'nourish', 'care', 'library'],
  },
  perimeno: {
    note: 'La', order: 5, available: true,
    en: 'Perimenopause', tr: 'Perimenopoz',
    toneEn: 'Maturity', toneTr: 'Olgunluk',
    descEn: 'Shifting cycles, symptoms and hormone support (BHRT).',
    descTr: 'Değişen döngüler, belirtiler ve hormon desteği (BHRT).',
    accent: 'oklch(0.62 0.10 75)', accentSoft: 'oklch(0.87 0.07 78)',
    nav: ['home', 'symptoms', 'doses', 'cycle', 'nourish', 'labs', 'care', 'library'],
  },
  menopause: {
    note: 'Si', order: 6, available: true,
    en: 'Menopause', tr: 'Menopoz',
    toneEn: 'Wisdom', toneTr: 'Bilgelik',
    descEn: 'Symptom care, bone and heart health.',
    descTr: 'Belirti yönetimi, kemik ve kalp sağlığı.',
    accent: 'oklch(0.50 0.10 300)', accentSoft: 'oklch(0.84 0.05 300)',
    nav: ['home', 'symptoms', 'doses', 'nourish', 'labs', 'care', 'library'],
  },
};
const STAGE_ORDER = Object.keys(STAGES).sort((a, b) => STAGES[a].order - STAGES[b].order);

function stageName(key) {
  const s = STAGES[key]; if (!s) return '';
  return t(s.en, s.tr);
}

// Apply per-stage accent to document root (inline beats data-theme rules).
// 'cycle' clears overrides so the aesthetic switcher (editorial/clinical/...) governs.
function applyStageTheme(key) {
  const s = STAGES[key];
  const root = document.documentElement;
  if (s && s.accent) {
    root.style.setProperty('--accent', s.accent);
    root.style.setProperty('--accent-soft', s.accentSoft);
  } else {
    root.style.removeProperty('--accent');
    root.style.removeProperty('--accent-soft');
  }
}

// ─── Small note + color marker ─────────────────────────────────
function NoteGlyph({ color = 'currentColor', size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="8" cy="18" r="3.2" fill={color}/>
      <path d="M11.2 18V5l8 -2v11" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="16" cy="14" r="3.2" fill={color}/>
    </svg>
  );
}

function StageBadge({ stage, withName }) {
  const s = STAGES[stage]; if (!s) return null;
  const color = s.accent || 'var(--accent)';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.04em',
      color: 'var(--ink-2)',
    }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }}/>
      <span style={{ fontStyle: 'italic', fontFamily: 'var(--serif)', fontSize: 13 }}>{s.note}</span>
      {withName && <span>· {stageName(stage)}</span>}
    </span>
  );
}

// ─── Sidebar stage chip (replaces program chip) ────────────────
function StageChip({ stage, onNav }) {
  useLang();
  const s = STAGES[stage] || STAGES.cycle;
  const color = s.accent || 'var(--accent)';
  return (
    <button onClick={() => onNav && onNav('onboarding')} style={{
      padding: '12px 12px', width: '100%', textAlign: 'left', cursor: 'pointer',
      background: 'var(--card)', borderRadius: 12,
      boxShadow: 'inset 0 0 0 1px var(--line-soft)',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="eyebrow-mono" style={{ fontSize: 9.5 }}>{t('LIFE STAGE', 'YAŞAM EVRESİ')}</span>
        <span style={{ fontSize: 10.5, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
          {t('change', 'değiştir')} <Icon d={ICONS.arrow} size={11} stroke="var(--muted)"/>
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
          background: color, color: 'var(--ivory)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14,
        }}>{s.note}</span>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2, minWidth: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{stageName(stage)}</span>
          <span style={{ fontSize: 10.5, color: 'var(--muted)' }}>{t(s.toneEn, s.toneTr)}</span>
        </div>
      </div>
    </button>
  );
}

// ═══════════════ ONBOARDING — "life scale" selector ═══════════════
function OnboardingScreen({ lunara, api, onDone }) {
  useLang();
  const [picked, setPicked] = React.useState(lunara.stage || null);
  const [name, setName] = React.useState((lunara.profile && lunara.profile.name) || '');
  const [age, setAge] = React.useState((lunara.profile && lunara.profile.age) || '');
  const lang = I18N.lang;

  const finish = () => {
    if (!picked) return;
    if (api.updateProfile) api.updateProfile({ name: name.trim(), age: age });
    api.setStage(picked);
    onDone && onDone();
  };

  return (
    <div style={{
      minHeight: '100%', background: 'var(--ivory)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '48px 24px 60px',
    }}>
      <div style={{ width: '100%', maxWidth: 760 }}>
        {/* Dil seçici — sağ üst */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 28 }}>
          <div style={{ display: 'flex', gap: 6, padding: 4, borderRadius: 999, background: 'var(--bone)', boxShadow: 'inset 0 0 0 1px var(--line-soft)' }}>
            {[{ k: 'tr', label: 'Türkçe' }, { k: 'en', label: 'English' }].map(o => {
              const on = o.k === lang;
              return (
                <button key={o.k} onClick={() => I18N.set(o.k)}
                  style={{
                    padding: '7px 14px', borderRadius: 999, fontSize: 12.5, fontWeight: on ? 700 : 500,
                    background: on ? 'var(--ink)' : 'transparent',
                    color: on ? 'var(--ivory)' : 'var(--muted)',
                    border: 'none', cursor: 'pointer', transition: 'all 140ms ease',
                  }}>{o.label}</button>
              );
            })}
          </div>
        </div>
        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}><Logo size={52}/></div>
          <h1 className="serif-display" style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 38, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
            {t('Where are you in your story?', 'Hikâyenin neresindesin?')}
          </h1>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 17, lineHeight: 1.5, color: 'var(--ink-2)', margin: '0 auto', maxWidth: 500 }}>
            {t('Every life is a scale of seven notes. Lunara meets you at yours — and walks the whole melody with you.',
               'Her hayat yedi notalık bir gamdır. Lunara seni bulunduğun notada karşılar — ve tüm ezgi boyunca yanında yürür.')}
          </p>
        </div>

        {/* The scale */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '32px 0 28px' }}>
          {STAGE_ORDER.map((key, i) => {
            const s = STAGES[key];
            const on = picked === key;
            const color = s.accent || 'oklch(0.42 0.10 28)';
            return (
              <button key={key} disabled={!s.available} onClick={() => s.available && setPicked(key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '16px 18px', borderRadius: 16, textAlign: 'left', width: '100%',
                  background: on ? 'var(--card)' : 'var(--card)',
                  boxShadow: on ? `inset 0 0 0 2px ${color}` : 'inset 0 0 0 1px var(--line-soft)',
                  opacity: s.available ? 1 : 0.55,
                  cursor: s.available ? 'pointer' : 'default',
                  transition: 'all 160ms ease',
                  transform: on ? 'translateX(4px)' : 'none',
                }}>
                {/* note disc */}
                <span style={{
                  width: 46, height: 46, borderRadius: '50%', flexShrink: 0,
                  background: color, color: '#FBF6EB',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 19,
                  boxShadow: on ? `0 6px 18px -6px ${color}` : 'none',
                }}>{s.note}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                    <span style={{ fontFamily: 'var(--serif)', fontSize: 20, letterSpacing: '-0.01em' }}>{t(s.en, s.tr)}</span>
                    <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)', letterSpacing: '0.04em' }}>{t(s.toneEn, s.toneTr)}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{t(s.descEn, s.descTr)}</div>
                </div>
                {!s.available
                  ? <span style={{ fontSize: 10.5, fontFamily: 'var(--mono)', letterSpacing: '0.06em', color: 'var(--muted-2)', padding: '4px 9px', borderRadius: 999, background: 'var(--bone)' }}>{t('SOON', 'YAKINDA')}</span>
                  : on
                    ? <span style={{ width: 24, height: 24, borderRadius: '50%', background: color, color: '#FBF6EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon d={ICONS.check} size={14} sw={2.4}/></span>
                    : <span style={{ width: 24, height: 24, borderRadius: '50%', boxShadow: 'inset 0 0 0 1.5px var(--line)' }}/>}
              </button>
            );
          })}
        </div>

        {/* Octave note */}
        <p style={{ textAlign: 'center', fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13.5, color: 'var(--muted)', margin: '0 0 26px' }}>
          {t('…and the scale begins again — Do — as a new generation finds her rhythm.',
             '…ve gam yeniden başlar — Do — yeni bir nesil kendi ritmini bulurken.')}
        </p>

        {/* İsim + yaş */}
        <div style={{ display: 'flex', gap: 12, margin: '8px 0 24px', flexWrap: 'wrap' }}>
          <label style={{ flex: '2 1 200px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span className="eyebrow">{t('Your name', 'Adın')}</span>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder={t('What should we call you?', 'Sana nasıl hitap edelim?')}
              style={{
                border: '1px solid var(--line)', borderRadius: 12, padding: '13px 15px',
                fontFamily: 'var(--sans)', fontSize: 15, color: 'var(--ink)',
                background: 'var(--card)', outline: 'none', width: '100%', boxSizing: 'border-box',
              }}/>
          </label>
          <label style={{ flex: '1 1 110px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span className="eyebrow">{t('Age', 'Yaş')}</span>
            <input value={age} onChange={e => setAge(e.target.value.replace(/\D/g, '').slice(0,3))} inputMode="numeric"
              placeholder="—"
              style={{
                border: '1px solid var(--line)', borderRadius: 12, padding: '13px 15px',
                fontFamily: 'var(--sans)', fontSize: 15, color: 'var(--ink)',
                background: 'var(--card)', outline: 'none', width: '100%', boxSizing: 'border-box',
              }}/>
          </label>
        </div>

        {/* Continue */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
          <button disabled={!picked} onClick={finish}
            style={{
              padding: '14px 30px', borderRadius: 999, border: 'none',
              background: picked ? 'var(--ink)' : 'var(--line)', color: 'var(--ivory)',
              fontSize: 14, fontWeight: 600, cursor: picked ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', gap: 8, transition: 'background 160ms ease',
            }}>
            {t('Begin', 'Başla')} <Icon d={ICONS.arrow} size={15} sw={2}/>
          </button>
        </div>
      </div>
    </div>
  );
}

export { STAGES, STAGE_ORDER, stageName, applyStageTheme, NoteGlyph, StageBadge, StageChip, OnboardingScreen };
