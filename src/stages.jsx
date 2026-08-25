import React from 'react';
import { I18N, t, useLang } from './i18n';
import { Btn, cycleDayFrom, phaseOf, wrap } from './screens';
import { ICONS, Icon, Logo } from './shared';
import { StageSurvey } from './survey';

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
    nav: ['home', 'cycle', 'symptoms', 'move', 'nourish'],
  },
  cycle: {
    note: 'Re', order: 1, available: true,
    en: 'Cycle tracking', tr: 'Döngü takibi',
    toneEn: 'Balance', toneTr: 'Denge',
    descEn: 'Knowing your cycle, symptoms and rhythm.',
    descTr: 'Döngünü, belirtilerini ve ritmini tanımak.',
    accent: null, accentSoft: null, // mevcut estetik paleti yönetir (maroon)
    nav: ['home', 'symptoms', 'cycle', 'move', 'nourish', 'care'],
  },
  ttc: {
    note: 'Mi', order: 2, available: true,
    en: 'Preparing', tr: 'Hazırlık',
    toneEn: 'Hope', toneTr: 'Umut',
    descEn: 'Fertile window, ovulation and timing.',
    descTr: 'Doğurgan pencere, ovülasyon ve zamanlama.',
    accent: 'oklch(0.64 0.12 52)', accentSoft: 'oklch(0.87 0.07 55)',
    nav: ['home', 'cycle', 'symptoms', 'move', 'nourish', 'care'],
  },
  pregnancy: {
    note: 'Fa', order: 3, available: true,
    en: 'Pregnancy', tr: 'Gebelik',
    toneEn: 'Nourishing', toneTr: 'Besleyici',
    descEn: 'Week by week, for you and your baby.',
    descTr: 'Hafta hafta, sen ve bebeğin için.',
    accent: 'oklch(0.56 0.10 8)', accentSoft: 'oklch(0.86 0.06 14)',
    nav: ['home', 'symptoms', 'move', 'nourish', 'care'],
  },
  postpartum: {
    note: 'Sol', order: 4, available: true,
    en: 'Postpartum', tr: 'Doğum sonrası',
    toneEn: 'Restoring', toneTr: 'Onarıcı',
    descEn: 'Recovery, mood and feeding in the fourth trimester.',
    descTr: 'İyileşme, ruh hali ve emzirme.',
    accent: 'oklch(0.58 0.07 205)', accentSoft: 'oklch(0.86 0.04 205)',
    nav: ['home', 'symptoms', 'move', 'nourish', 'care'],
  },
  perimeno: {
    note: 'La', order: 5, available: true,
    en: 'Perimenopause', tr: 'Perimenopoz',
    toneEn: 'Maturity', toneTr: 'Olgunluk',
    descEn: 'Shifting cycles, symptoms and hormone support (BHRT).',
    descTr: 'Değişen döngüler, belirtiler ve hormon desteği (BHRT).',
    accent: 'oklch(0.62 0.10 75)', accentSoft: 'oklch(0.87 0.07 78)',
    nav: ['home', 'symptoms', 'doses', 'cycle', 'move', 'nourish', 'labs', 'care'],
  },
  menopause: {
    note: 'Si', order: 6, available: true,
    en: 'Menopause', tr: 'Menopoz',
    toneEn: 'Wisdom', toneTr: 'Bilgelik',
    descEn: 'Symptom care, bone and heart health.',
    descTr: 'Belirti yönetimi, kemik ve kalp sağlığı.',
    accent: 'oklch(0.50 0.10 300)', accentSoft: 'oklch(0.84 0.05 300)',
    nav: ['home', 'symptoms', 'doses', 'move', 'nourish', 'labs', 'care'],
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
/* Yedek liste. Anket asıl akış ama durumunu net bilen kişi soru cevaplamak
   zorunda kalmasın; "kendim seçeyim" buraya getiriyor. */
// Anket ya da listeyle belirlenmiş evrenin onay rozeti
function SecilenEvre({ stage, onDegistir }) {
  useLang();
  const s = STAGES[stage] || {};
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14, margin: '0 0 22px',
      padding: '15px 17px', borderRadius: 14, background: 'var(--accent-soft)',
    }}>
      <span style={{
        width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
        background: s.accent || 'oklch(0.42 0.10 28)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--ivory)',
      }}>{s.note}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="eyebrow" style={{ marginBottom: 2 }}>{t('Your stage', 'Dönemin')}</div>
        <div style={{ fontSize: 15.5, color: 'var(--ink)' }}>{t(s.en || stage, s.tr || stage)}</div>
      </div>
      <button onClick={onDegistir} style={{
        fontSize: 12.5, color: 'var(--muted)', background: 'transparent', border: 'none',
        cursor: 'pointer', padding: 0, flexShrink: 0,
      }}>{t('change', 'değiştir')}</button>
    </div>
  );
}

function StageList({ picked, onPick, onAnket }) {
  useLang();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '0 0 24px' }}>
      {STAGE_ORDER.map(key => {
        const s = STAGES[key];
        const on = picked === key;
        const color = s.accent || 'oklch(0.42 0.10 28)';
        return (
          <button key={key} disabled={!s.available} onClick={() => s.available && onPick(key)}
            aria-pressed={on}
            style={{
              display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left',
              padding: '15px 17px', borderRadius: 14, border: 'none',
              background: on ? 'var(--accent-soft)' : 'var(--bone)',
              boxShadow: on ? 'inset 0 0 0 1.5px var(--accent)' : 'inset 0 0 0 1px var(--line-soft)',
              cursor: s.available ? 'pointer' : 'default', opacity: s.available ? 1 : 0.45,
            }}>
            <span style={{
              width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--ivory)',
            }}>{s.note}</span>
            <span style={{ fontSize: 15, color: 'var(--ink)' }}>{t(s.en, s.tr)}</span>
          </button>
        );
      })}
      <button onClick={onAnket} style={{
        marginTop: 4, fontSize: 12.5, color: 'var(--muted)', background: 'transparent',
        border: 'none', cursor: 'pointer', padding: 0, alignSelf: 'center',
      }}>{t('Not sure? Answer a few questions instead', 'Emin değil misin? Birkaç soru cevapla')}</button>
    </div>
  );
}

function OnboardingScreen({ lunara, api, onDone }) {
  useLang();
  const [picked, setPicked] = React.useState(lunara.stage || null);
  // Anket asıl akış; elleSec listeye geçer, anketBitti detay adımını açar.
  const [elleSec, setElleSec] = React.useState(false);
  const [anketBitti, setAnketBitti] = React.useState(false);
  const [yasAraligi, setYasAraligi] = React.useState(null);
  const [name, setName] = React.useState((lunara.profile && lunara.profile.name) || '');
  const [age, setAge] = React.useState((lunara.profile && lunara.profile.age) || '');
  const [periodStart, setPeriodStart] = React.useState('');
  const [cycleLen, setCycleLen] = React.useState(28);
  const lang = I18N.lang;

  // Stages whose experience is driven by the menstrual cycle.
  const CYCLE_STAGES = ['menarche', 'cycle', 'ttc', 'perimeno'];
  const isCycle = CYCLE_STAGES.includes(picked);
  const todayMax = new Date().toISOString().slice(0, 10);

  const finish = () => {
    if (!picked) return;
    // Anketten gelen yaş aralığı kaybolmasın; kesin yaş Profil'den girilebiliyor
    if (api.updateProfile) api.updateProfile({ name: name.trim(), age: age, ageRange: yasAraligi || undefined });
    if (CYCLE_STAGES.includes(picked)) {
      if (periodStart && api.setPeriodStart) api.setPeriodStart(periodStart);
      if (periodStart && api.setRegimenAnchor) api.setRegimenAnchor(periodStart);
      if (cycleLen && api.setRegimenCycle) api.setRegimenCycle(parseInt(cycleLen, 10) || 28);
    }
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

        {/* Anket. Yedi seçenekli liste kaldırıldı: kişiden kendi durumunu
            bir kategoriye çevirmesini istemek yerine somut sorular sorup
            kategoriyi uygulama çıkarıyor. Liste yine de erişilebilir —
            durumunu net bilen tek dokunuşla oraya geçebilsin. */}
        {anketBitti ? (
          /* Anket bitince sonuç kartı yerini kompakt bir rozete bırakıyor;
             aksi hâlde ekranda iki ayrı "Başla" butonu kalıyordu. */
          <SecilenEvre stage={picked} onDegistir={() => { setAnketBitti(false); setElleSec(false); }}/>
        ) : elleSec ? (
          <StageList picked={picked} onPick={(k) => { setPicked(k); setAnketBitti(true); }}
            onAnket={() => setElleSec(false)}/>
        ) : (
          <StageSurvey
            onSecildi={(evre, cevaplar) => {
              setPicked(evre);
              setYasAraligi((cevaplar && cevaplar.yasAraligi) || null);
              setAnketBitti(true);
            }}
            onElleSec={() => setElleSec(true)}/>
        )}

        {anketBitti && (
        <>
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
        </div>

        {/* Döngü bilgisi — yalnızca döngü-temelli evrelerde */}
        {isCycle && (
          <div className="fade-up" style={{ margin: '0 0 24px' }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>{t('Cycle details (optional)', 'Döngü bilgisi (isteğe bağlı)')}</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <label style={{ flex: '2 1 220px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span className="eyebrow">{t('Last period start', 'Son adet başlangıcı')}</span>
                <input type="date" max={todayMax} value={periodStart} onChange={e => setPeriodStart(e.target.value)}
                  style={{
                    border: '1px solid var(--line)', borderRadius: 12, padding: '13px 15px',
                    fontFamily: 'var(--sans)', fontSize: 15, color: 'var(--ink)',
                    background: 'var(--card)', outline: 'none', width: '100%', boxSizing: 'border-box',
                  }}/>
              </label>
              <label style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span className="eyebrow">{t('Cycle length (days)', 'Döngü uzunluğu (gün)')}</span>
                <input value={cycleLen} onChange={e => setCycleLen(e.target.value.replace(/\D/g, '').slice(0, 2))} inputMode="numeric"
                  placeholder="28"
                  style={{
                    border: '1px solid var(--line)', borderRadius: 12, padding: '13px 15px',
                    fontFamily: 'var(--sans)', fontSize: 15, color: 'var(--ink)',
                    background: 'var(--card)', outline: 'none', width: '100%', boxSizing: 'border-box',
                  }}/>
              </label>
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)', margin: '8px 0 0', fontStyle: 'italic' }}>
              {t('Helps Lunara personalise your cycle phases and reminders. You can change this anytime.',
                 'Lunara’nın döngü fazlarını ve hatırlatıcılarını kişiselleştirmesine yardımcı olur. İstediğin zaman değiştirebilirsin.')}
            </p>
          </div>
        )}

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
        </>
        )}
      </div>
    </div>
  );
}

export { STAGES, STAGE_ORDER, stageName, applyStageTheme, NoteGlyph, StageBadge, StageChip, OnboardingScreen };
