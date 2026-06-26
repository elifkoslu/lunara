import React from 'react';
import { t, useLang } from './i18n';
import { Btn, ScreenHead, cycleDayFrom, phaseOf, wrap } from './screens';
import { Card, ICONS, Icon, TODAY_DATE, TODAY_KEY, getTodayKey } from './shared';
import { StageBadge } from './stages';

/* menarche.jsx — Lunara · Menarş (Do) ana ekranı
   Genç kullanıcı için döngü farkındalığı: nazik, eğitici, yargısız.
   screens.jsx (cycleDayFrom, phaseOf, Btn, wrap, ScreenHead), shared.jsx, i18n sonrası yüklenir. */
/* eslint-disable */

// Plain-language phase explainers for first cycles
const MENARCHE_PHASES = {
  menstrual:  { en: 'Your period', tr: 'Regl dönemin',
    bodyEn: 'The lining of your uterus is shedding — this is your period. Cramps, tiredness or a low mood are common. Rest, warmth and water help.',
    bodyTr: 'Rahim iç zarı dökülüyor — buna regl denir. Kramp, yorgunluk ya da moralsizlik normaldir. Dinlenmek, sıcaklık ve su iyi gelir.' },
  follicular: { en: 'Building up', tr: 'Toparlanma',
    bodyEn: 'Your body is getting ready for the month ahead. Energy and mood usually lift — a good time for sport, friends and new things.',
    bodyTr: 'Bedenin önündeki aya hazırlanıyor. Enerji ve moral genelde yükselir — spor, arkadaşlar ve yeni şeyler için iyi zaman.' },
  ovulation:  { en: 'Mid-point', tr: 'Orta nokta',
    bodyEn: 'Around the middle of your cycle an egg may be released. You might feel confident and chatty, or notice a little clear discharge — all normal.',
    bodyTr: 'Döngünün ortasında bir yumurta serbest kalabilir. Kendine güvenli ve konuşkan hissedebilir ya da hafif berrak akıntı fark edebilirsin — hepsi normal.' },
  luteal:     { en: 'Winding down', tr: 'Yavaşlama',
    bodyEn: 'Before your next period you may feel more sensitive, hungry or tired. Be gentle with yourself — it passes.',
    bodyTr: 'Bir sonraki reglinden önce daha hassas, aç ya da yorgun hissedebilirsin. Kendine nazik ol — geçer.' },
};

const FEEL_CHIPS = [
  { key: 'happy',  en: 'Good',    tr: 'İyi',      icon: ICONS.spark },
  { key: 'tired',  en: 'Tired',   tr: 'Yorgun',   icon: ICONS.moon },
  { key: 'cramps', en: 'Cramps',  tr: 'Kramp',    icon: ICONS.flame },
  { key: 'sad',    en: 'Low',     tr: 'Moralsiz', icon: ICONS.drop },
  { key: 'energy', en: 'Energetic', tr: 'Enerjik', icon: ICONS.pulse },
];

const LEARN_CARDS = [
  { tagEn: 'BASICS', tagTr: 'TEMELLER',
    titleEn: 'What is a cycle?', titleTr: 'Döngü nedir?',
    bodyEn: 'A monthly rhythm where your body prepares, then resets. Counted from the first day of one period to the first day of the next.',
    bodyTr: 'Bedeninin hazırlanıp sonra sıfırlandığı aylık bir ritim. Bir reglin ilk gününden bir sonrakinin ilk gününe kadar sayılır.' },
  { tagEn: 'NORMAL', tagTr: 'NORMAL',
    titleEn: 'What’s normal?', titleTr: 'Neler normal?',
    bodyEn: 'In the first years cycles are often irregular — anywhere from 21 to 45 days. Spotting, mood changes and cramps are all common.',
    bodyTr: 'İlk yıllarda döngüler genelde düzensizdir — 21 ila 45 gün arası olabilir. Lekelenme, ruh hali değişimi ve krampler yaygındır.' },
  { tagEn: 'ASK', tagTr: 'DANIŞ',
    titleEn: 'When to ask for help', titleTr: 'Ne zaman yardım istemeli',
    bodyEn: 'Very heavy bleeding, periods lasting over 7 days, or strong pain that stops your day are worth talking to a trusted adult or doctor about.',
    bodyTr: 'Çok yoğun kanama, 7 günden uzun süren regl ya da gününü durduran şiddetli ağrı için güvendiğin bir yetişkin veya doktorla konuşmaya değer.' },
];

function MenarcheHome({ lunara, api, onNav }) {
  useLang();
  const today = TODAY_DATE;
  const day = cycleDayFrom(lunara.periodStart, today);
  const ph = phaseOf(day);
  const info = MENARCHE_PHASES[ph.key];
  const todayLog = lunara.symptomLog[TODAY_KEY] || {};
  const [confirming, setConfirming] = React.useState(false);
  const [justStarted, setJustStarted] = React.useState(false);

  const handlePeriodStart = () => {
    api.setPeriodStart(getTodayKey());
    setConfirming(false);
    setJustStarted(true);
    setTimeout(() => setJustStarted(false), 3000);
  };

  return (
    <div style={{ padding: '18px 36px 48px', display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Hero */}
      <Card pad={0} style={{ overflow: 'hidden' }}>
        <div className="mb-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <div style={{ padding: '34px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <StageBadge stage="menarche"/>
              <span className="eyebrow">{t('Welcome', 'Hoş geldin')}</span>
            </div>
            <h2 className="serif-display" style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 34, lineHeight: 1.12, margin: '0 0 14px', letterSpacing: '-0.02em' }}>
              {t(<>Hi {lunara.profile.name} — your body is finding its <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>rhythm</em>.</>,
                 <>Merhaba {lunara.profile.name} — bedenin kendi <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>ritmini</em> buluyor.</>)}
            </h2>
            <p style={{ fontFamily: 'var(--serif)', fontSize: 16, lineHeight: 1.55, color: 'var(--ink-2)', margin: 0 }}>
              {t('There’s nothing to get “right”. Lunara is here to help you understand what’s happening — at your own pace.',
                 '“Doğru” yapman gereken bir şey yok. Lunara, olanları kendi hızında anlamana yardım etmek için burada.')}
            </p>
          </div>
          {/* Soft visual panel */}
          <div style={{
            position: 'relative', minHeight: 240,
            background: 'linear-gradient(155deg, var(--accent-soft) 0%, var(--card) 70%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CycleAwarenessDial day={day} phaseKey={ph.key}/>
          </div>
        </div>
      </Card>

      {/* This month + today's feeling */}
      <div className="mb-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
        {/* Where are you */}
        <Card>
          <div className="eyebrow" style={{ marginBottom: 12 }}>{t('Where you are this month', 'Bu ay neredesin')}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 30, letterSpacing: '-0.01em' }}>{t(info.en, info.tr)}</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)' }}>{t('day', 'gün')} {day}</span>
          </div>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 15, lineHeight: 1.55, color: 'var(--ink-2)', margin: '0 0 18px' }}>
            {t(info.bodyEn, info.bodyTr)}
          </p>
          {justStarted ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--signal-good)', fontStyle: 'italic', fontFamily: 'var(--serif)' }}>
              <Icon d={ICONS.check} size={14} stroke="var(--signal-good)" sw={2}/> {t('Period logged ✓', 'Regl kaydedildi ✓')}
            </span>
          ) : confirming ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>{t('Reset cycle to day 1?', 'Döngüyü 1. güne sıfırla?')}</span>
              <Btn primary onClick={handlePeriodStart}>{t('Yes', 'Evet')}</Btn>
              <Btn onClick={() => setConfirming(false)}>{t('Cancel', 'İptal')}</Btn>
            </div>
          ) : (
            <Btn primary onClick={() => setConfirming(true)}>
              <Icon d={ICONS.drop} size={14}/> {t('My period started', 'Reglim başladı')}
            </Btn>
          )}
        </Card>

        {/* How do you feel */}
        <Card>
          <div className="eyebrow" style={{ marginBottom: 12 }}>{t('How do you feel today?', 'Bugün nasıl hissediyorsun?')}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {FEEL_CHIPS.map(c => {
              const on = (todayLog[c.key] || 0) > 0;
              return (
                <button key={c.key} onClick={() => api.logSymptom(TODAY_KEY, c.key, on ? 0 : 2)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '11px 15px', borderRadius: 999,
                    background: on ? 'var(--accent)' : 'var(--bone)',
                    color: on ? 'var(--ivory)' : 'var(--ink-2)',
                    boxShadow: on ? 'none' : 'inset 0 0 0 1px var(--line-soft)',
                    fontSize: 13.5, fontWeight: on ? 600 : 500, cursor: 'pointer',
                    transition: 'all 140ms ease',
                  }}>
                  <Icon d={c.icon} size={15}/> {t(c.en, c.tr)}
                </button>
              );
            })}
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.5, margin: '16px 0 0' }}>
            {t('Noticing how you feel each day helps you learn your own pattern. No wrong answers.',
               'Her gün nasıl hissettiğini fark etmek kendi düzenini öğrenmene yardım eder. Yanlış cevap yok.')}
          </p>
        </Card>
      </div>

      {/* Learn */}
      <div>
        <div className="eyebrow" style={{ marginBottom: 14 }}>{t('LEARN', 'ÖĞREN')}</div>
        <div className="mb-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
          {LEARN_CARDS.map((c, i) => (
            <Card key={i} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 10, minHeight: 170 }}
              onClick={() => onNav && onNav('library')}>
              <div className="eyebrow" style={{ color: 'var(--accent)' }}>{t(c.tagEn, c.tagTr)}</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 19, lineHeight: 1.2, letterSpacing: '-0.01em' }}>{t(c.titleEn, c.titleTr)}</div>
              <p style={{ fontSize: 12.8, color: 'var(--muted)', lineHeight: 1.5, margin: 0, flex: 1 }}>{t(c.bodyEn, c.bodyTr)}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--ink-2)' }}>
                {t('Read', 'Oku')} <Icon d={ICONS.arrow} size={13}/>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Reassurance footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', color: 'var(--muted-2)', fontSize: 12 }}>
        <Icon d={ICONS.heart} size={14} stroke="var(--muted-2)"/>
        <span style={{ fontStyle: 'italic', fontFamily: 'var(--serif)' }}>
          {t('Everyone’s rhythm is different — and yours is exactly right for you.',
             'Herkesin ritmi farklıdır — ve seninki tam sana göre.')}
        </span>
      </div>
    </div>
  );
}

// Gentle awareness dial — soft ring with a marker, no clinical numbers
function CycleAwarenessDial({ day, phaseKey, size = 168 }) {
  const r = (size - 30) / 2;
  const c = 2 * Math.PI * r;
  const approxLen = 28;
  const frac = Math.min(1, (day - 1) / approxLen);
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--card)" strokeWidth="14" opacity="0.7"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--accent)" strokeWidth="14"
          strokeDasharray={`${frac * c} ${c}`} strokeLinecap="round" opacity="0.85"/>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        <span className="eyebrow" style={{ fontSize: 9.5 }}>{t('DAY', 'GÜN')}</span>
        <span style={{ fontFamily: 'var(--serif)', fontSize: 46, lineHeight: 0.9, letterSpacing: '-0.03em' }}>{day}</span>
      </div>
    </div>
  );
}

export { MENARCHE_PHASES, FEEL_CHIPS, LEARN_CARDS, MenarcheHome, CycleAwarenessDial };
