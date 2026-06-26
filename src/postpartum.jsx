import React from 'react';
import { t, useLang } from './i18n';
import { Btn, wrap } from './screens';
import { Card, ICONS, Icon, TODAY_DATE, TODAY_KEY } from './shared';
import { StageBadge } from './stages';

/* postpartum.jsx — Lunara · Doğum sonrası (Sol) ana ekranı
   İyileşme, ruh hali (PPD destekleyici), emzirme ve uyku.
   screens.jsx (Btn), shared.jsx, stages.jsx (StageBadge), i18n sonrası yüklenir. */
/* eslint-disable */

function ppWeeks(birthDate, today = TODAY_DATE) {
  const b = new Date(birthDate + 'T00:00:00');
  const days = Math.floor((today - b) / 86400000);
  return { days: Math.max(0, days), week: Math.max(0, Math.floor(days / 7)) };
}

// Recovery notes by week band
const PP_RECOVERY = [
  { upto: 1, en: 'The first days', tr: 'İlk günler',
    bEn: 'Bleeding (lochia) is heaviest now and eases over weeks. Rest, hydrate, and let others help. Gentle moving only.',
    bTr: 'Lohusalık kanaması şimdi en yoğun, haftalar içinde azalır. Dinlen, sıvı al, yardım iste. Yalnızca nazik hareket.' },
  { upto: 3, en: 'Settling in', tr: 'Düzene girme',
    bEn: 'Bleeding lightens; afterpains fade. Short walks are fine. Keep up pelvic-floor breathing — no hard core work yet.',
    bTr: 'Kanama hafifler; sancılar geçer. Kısa yürüyüşler uygun. Pelvik taban nefesine devam — henüz ağır karın çalışması yok.' },
  { upto: 6, en: 'Healing', tr: 'İyileşme',
    bEn: 'Most bleeding has stopped. Around your 6-week check your clinician confirms healing and when to resume exercise.',
    bTr: 'Kanama çoğunlukla durdu. 6. hafta kontrolünde hekimin iyileşmeyi ve egzersize ne zaman döneceğini onaylar.' },
  { upto: 999, en: 'Finding your feet', tr: 'Ayağa kalkma',
    bEn: 'Gradually rebuild strength. Your cycle may return — especially if not exclusively breastfeeding. Be patient with yourself.',
    bTr: 'Gücünü kademeli topla. Döngün geri dönebilir — özellikle yalnızca emzirmiyorsan. Kendine sabırlı ol.' },
];
function recoveryFor(week) { return PP_RECOVERY.find(r => week <= r.upto) || PP_RECOVERY[PP_RECOVERY.length - 1]; }

const MOODS = [
  { v: 1, en: 'Very low', tr: 'Çok kötü' },
  { v: 2, en: 'Low', tr: 'Kötü' },
  { v: 3, en: 'Okay', tr: 'İdare eder' },
  { v: 4, en: 'Good', tr: 'İyi' },
  { v: 5, en: 'Great', tr: 'Harika' },
];

function PostpartumHome({ lunara, api, onNav }) {
  useLang();
  const pp = lunara.postpartum;
  const { days, week } = ppWeeks(pp.birthDate);
  const rec = recoveryFor(week);
  const feedsToday = pp.feeds[TODAY_KEY] || 0;
  const moodToday = pp.mood[TODAY_KEY];
  const lowMood = moodToday != null && moodToday <= 2;

  return (
    <div style={{ padding: '18px 36px 48px', display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Hero */}
      <Card pad={0} style={{ overflow: 'hidden' }}>
        <div className="mb-stack" style={{ display: 'grid', gridTemplateColumns: '320px 1fr' }}>
          <div style={{
            position: 'relative', minHeight: 240,
            background: 'linear-gradient(155deg, var(--accent-soft) 0%, var(--card) 72%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <RecoveryRing week={week}/>
          </div>
          <div style={{ padding: '30px 34px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <StageBadge stage="postpartum"/>
              <span className="eyebrow">{t('THE FOURTH TRIMESTER', 'DÖRDÜNCÜ TRİMESTER')}</span>
            </div>
            <h2 className="serif-display" style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 32, lineHeight: 1.12, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
              {t(<>You’re <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>{week} week{week !== 1 ? 's' : ''}</em> into recovery.</>,
                 <><em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>{week}. hafta</em>ndasın — iyileşme sürüyor.</>)}
            </h2>
            <p style={{ fontFamily: 'var(--serif)', fontSize: 15.5, lineHeight: 1.55, color: 'var(--ink-2)', margin: '0 0 18px', maxWidth: 440 }}>
              {t('Healing takes time and looks different for everyone. Rest is not a luxury right now — it’s part of recovery.',
                 'İyileşmek zaman alır ve herkeste farklıdır. Şu an dinlenmek lüks değil — iyileşmenin bir parçası.')}
            </p>
            <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}>
              <HeroStat label={t('Baby', 'Bebek')} value={`${days} ${t('days old', 'günlük')}`}/>
              <HeroStat label={t('Next check-up', 'Sonraki kontrol')} value={t('6-week visit', '6. hafta')}/>
            </div>
          </div>
        </div>
      </Card>

      {/* Recovery + mood */}
      <div className="mb-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
        <Card>
          <div className="eyebrow" style={{ marginBottom: 10 }}>{t('Your recovery', 'İyileşmen')}</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 22, marginBottom: 8 }}>{t(rec.en, rec.tr)}</div>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 15, lineHeight: 1.55, color: 'var(--ink-2)', margin: 0 }}>{t(rec.bEn, rec.bTr)}</p>
        </Card>

        <Card>
          <div className="eyebrow" style={{ marginBottom: 12 }}>{t('How are you, really?', 'Sen nasılsın, gerçekten?')}</div>
          <div style={{ display: 'flex', gap: 7 }}>
            {MOODS.map(m => {
              const on = moodToday === m.v;
              return (
                <button key={m.v} onClick={() => api.setMood(TODAY_KEY, m.v)} style={{
                  flex: 1, padding: '12px 4px', borderRadius: 12, cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  background: on ? 'var(--accent)' : 'var(--bone)',
                  color: on ? 'var(--ivory)' : 'var(--ink-2)',
                  boxShadow: on ? 'none' : 'inset 0 0 0 1px var(--line-soft)',
                  transition: 'all 140ms ease',
                }}>
                  <MoodFace v={m.v} color={on ? 'var(--ivory)' : 'var(--muted)'}/>
                  <span style={{ fontSize: 10, fontWeight: on ? 700 : 500 }}>{t(m.en, m.tr)}</span>
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: 12, background: lowMood ? 'oklch(0.92 0.04 25)' : 'var(--accent-soft)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <Icon d={ICONS.heart} size={15} stroke="var(--ink-2)"/>
            <span style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.5 }}>
              {lowMood
                ? t('Feeling low for more than two weeks, or struggling to cope, deserves support — please reach out to your doctor or midwife. You are not alone.',
                     'İki haftadan uzun süren kötü hissetme ya da baş edememe destek gerektirir — lütfen doktoruna veya ebene ulaş. Yalnız değilsin.')
                : t('Baby blues are common in the first weeks. Noticing your mood daily helps you and your care team spot what needs attention.',
                     'İlk haftalarda hüzün yaygındır. Ruh halini her gün fark etmek, dikkat gerektireni sana ve ekibine gösterir.')}
            </span>
          </div>
          {lowMood && (
            <button onClick={() => onNav && onNav('care')} style={{ marginTop: 10, fontSize: 12.5, color: 'var(--accent)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              {t('Message your care team', 'Destek ekibine yaz')} <Icon d={ICONS.arrow} size={13} stroke="var(--accent)"/>
            </button>
          )}
        </Card>
      </div>

      {/* Feeding + sleep */}
      <div className="mb-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 4 }}>{t("Today's feeds", 'Bugünkü beslemeler')}</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 20 }}>{t('Feeding log', 'Besleme kaydı')}</div>
            </div>
            {feedsToday > 0 && <button onClick={() => api.resetFeeds(TODAY_KEY)} style={{ fontSize: 11.5, color: 'var(--muted)', cursor: 'pointer' }}>{t('Reset', 'Sıfırla')}</button>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <button onClick={() => api.addFeed(TODAY_KEY)} style={{
              width: 92, height: 92, borderRadius: '50%', flexShrink: 0, cursor: 'pointer', border: 'none',
              background: 'var(--accent)', color: 'var(--ivory)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
              boxShadow: '0 10px 26px -10px var(--accent)',
            }}>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 34, lineHeight: 1 }}>{feedsToday}</span>
              <span style={{ fontSize: 10, fontFamily: 'var(--mono)', letterSpacing: '0.06em', opacity: 0.9 }}>+1</span>
            </button>
            <p style={{ fontSize: 12.8, color: 'var(--muted)', lineHeight: 1.5, margin: 0 }}>
              {t('Newborns often feed 8–12 times a day. Tap for each feed — breast or bottle.',
                 'Yenidoğanlar genelde günde 8–12 kez beslenir. Her beslemede dokun — meme ya da biberon.')}
            </p>
          </div>
        </Card>

        <Card>
          <div className="eyebrow" style={{ marginBottom: 12 }}>{t('Rest when you can', 'Fırsat buldukça dinlen')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { icon: ICONS.moon, en: 'Sleep when baby sleeps', tr: 'Bebek uyurken uyu', bEn: 'Short naps add up and protect your mood.', bTr: 'Kısa şekerlemeler birikir ve ruh halini korur.' },
              { icon: ICONS.drop, en: 'Hydrate & eat regularly', tr: 'Su iç & düzenli ye', bEn: 'Especially important while breastfeeding.', bTr: 'Özellikle emzirirken önemli.' },
              { icon: ICONS.spark, en: 'Accept help', tr: 'Yardımı kabul et', bEn: 'Let others hold, cook, clean — you recover.', bTr: 'Başkaları tutsun, pişirsin, temizlesin — sen iyileş.' },
            ].map((x, i, arr) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', paddingBottom: i < arr.length-1 ? 12 : 0, borderBottom: i < arr.length-1 ? '1px solid var(--line-soft)' : 'none' }}>
                <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--bone)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}><Icon d={x.icon} size={15}/></span>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{t(x.en, x.tr)}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.45 }}>{t(x.bEn, x.bTr)}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', color: 'var(--muted-2)', fontSize: 12 }}>
        <Icon d={ICONS.heart} size={14} stroke="var(--muted-2)"/>
        <span style={{ fontStyle: 'italic', fontFamily: 'var(--serif)' }}>
          {t('Support, not medical advice. If something feels wrong, contact your doctor or midwife.',
             'Destek, tıbbi tavsiye değil. Bir şey ters geliyorsa doktoruna veya ebene başvur.')}
        </span>
      </div>
    </div>
  );
}

function HeroStat({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span className="eyebrow" style={{ fontSize: 9.5 }}>{label}</span>
      <span style={{ fontFamily: 'var(--serif)', fontSize: 16, letterSpacing: '-0.01em' }}>{value}</span>
    </div>
  );
}

function MoodFace({ v, color }) {
  // 1 sad → 5 happy: vary the mouth curve
  const mouth = {
    1: 'M8 16 Q12 13 16 16',
    2: 'M8 15.5 Q12 14 16 15.5',
    3: 'M8 15 H16',
    4: 'M8 14 Q12 16.5 16 14',
    5: 'M8 13.5 Q12 17 16 13.5',
  }[v];
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round">
      <circle cx="12" cy="12" r="9.2"/>
      <circle cx="9" cy="10" r="0.6" fill={color} stroke="none"/>
      <circle cx="15" cy="10" r="0.6" fill={color} stroke="none"/>
      <path d={mouth}/>
    </svg>
  );
}

// Recovery ring (0–6 week focus)
function RecoveryRing({ week, size = 178 }) {
  const r = (size - 30) / 2;
  const c = 2 * Math.PI * r;
  const frac = Math.min(1, week / 6);
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--card)" strokeWidth="13" opacity="0.7"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--accent)" strokeWidth="13"
          strokeDasharray={`${frac * c} ${c}`} strokeLinecap="round" opacity="0.9"/>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span className="eyebrow" style={{ fontSize: 9.5 }}>{t('WEEK', 'HAFTA')}</span>
        <span style={{ fontFamily: 'var(--serif)', fontSize: 50, lineHeight: 0.9, letterSpacing: '-0.03em' }}>{week}</span>
        <span style={{ fontSize: 10.5, color: 'var(--muted)', fontFamily: 'var(--mono)', marginTop: 4 }}>{t('postpartum', 'doğum sonrası')}</span>
      </div>
    </div>
  );
}

export { ppWeeks, PP_RECOVERY, recoveryFor, MOODS, PostpartumHome, HeroStat, MoodFace, RecoveryRing };
