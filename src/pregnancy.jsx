import React from 'react';
import { t, useLang } from './i18n';
import { Btn, wrap } from './screens';
import { Card, ICONS, Icon, TODAY_DATE, TODAY_KEY } from './shared';
import { StageBadge } from './stages';

/* pregnancy.jsx — Lunara · Gebelik (Fa) ana ekranı
   Hafta hafta takip: bebek + anne, tekme sayacı, kilo, randevular.
   screens.jsx (Btn), shared.jsx, stages.jsx (StageBadge), i18n sonrası yüklenir. */
/* eslint-disable */

// Hafta kilometre taşları — meyve karşılaştırması + gelişim + anne notu
const WEEK_MILESTONES = [
  { w: 8,  fEn: 'a raspberry', fTr: 'bir ahududu',     len: 1.6,  wt: 1,
    devEn: 'Tiny limbs are forming and the heart is beating fast.', devTr: 'Minik kollar bacaklar oluşuyor, kalp hızla atıyor.',
    youEn: 'Nausea and tiredness are common now.', youTr: 'Bulantı ve yorgunluk bu dönemde sık.' },
  { w: 12, fEn: 'a lime', fTr: 'bir misket limonu',    len: 5.4,  wt: 14,
    devEn: 'Reflexes develop; fingers can open and close.', devTr: 'Refleksler gelişiyor; parmaklar açılıp kapanabiliyor.',
    youEn: 'The first trimester is ending — energy often returns.', youTr: 'İlk trimester bitiyor — enerji çoğu zaman geri gelir.' },
  { w: 16, fEn: 'an avocado', fTr: 'bir avokado',       len: 11.6, wt: 100,
    devEn: 'Baby can make facial expressions and hear muffled sounds.', devTr: 'Bebek yüz ifadeleri yapabiliyor, boğuk sesleri duyabiliyor.',
    youEn: 'You may start to feel flutters soon.', youTr: 'Yakında ilk kıpırtıları hissedebilirsin.' },
  { w: 20, fEn: 'a banana', fTr: 'bir muz',             len: 16.4, wt: 300,
    devEn: 'Halfway there — baby is swallowing and growing hair.', devTr: 'Yolun yarısı — bebek yutkunuyor ve saçları çıkıyor.',
    youEn: 'The anatomy scan usually happens around now.', youTr: 'Ayrıntılı ultrason genelde bu sıralarda yapılır.' },
  { w: 24, fEn: 'an ear of corn', fTr: 'bir mısır koçanı', len: 30, wt: 600,
    devEn: 'Lungs are developing and baby responds to your voice.', devTr: 'Akciğerler gelişiyor; bebek sesine tepki veriyor.',
    youEn: 'Kicks are stronger and more regular now.', youTr: 'Tekmeler artık daha güçlü ve düzenli.' },
  { w: 28, fEn: 'an eggplant', fTr: 'bir patlıcan',     len: 37.6, wt: 1000,
    devEn: 'Eyes can open; baby has sleep–wake rhythms.', devTr: 'Gözler açılabiliyor; bebeğin uyku–uyanıklık ritmi var.',
    youEn: 'Third trimester — count kicks daily from now.', youTr: 'Üçüncü trimester — artık her gün tekme say.' },
  { w: 32, fEn: 'a squash', fTr: 'bir kabak',           len: 42.4, wt: 1700,
    devEn: 'Baby is practising breathing and gaining fat.', devTr: 'Bebek nefes provası yapıyor ve yağ depoluyor.',
    youEn: 'You may feel more breathless and tired.', youTr: 'Daha çok nefes darlığı ve yorgunluk hissedebilirsin.' },
  { w: 36, fEn: 'a honeydew melon', fTr: 'bir kavun',   len: 47.4, wt: 2600,
    devEn: 'Baby is settling head-down, getting ready.', devTr: 'Bebek baş aşağı yerleşiyor, hazırlanıyor.',
    youEn: 'Weekly check-ups usually begin around now.', youTr: 'Haftalık kontroller genelde bu sıralarda başlar.' },
  { w: 40, fEn: 'a watermelon', fTr: 'bir karpuz',      len: 51.2, wt: 3400,
    devEn: 'Full term — baby is ready to meet you.', devTr: 'Miadında — bebek seninle tanışmaya hazır.',
    youEn: 'Any day now. Watch for labour signs.', youTr: 'Artık her an olabilir. Doğum belirtilerine dikkat.' },
];
function milestoneFor(week) {
  let m = WEEK_MILESTONES[0];
  for (const x of WEEK_MILESTONES) { if (week >= x.w) m = x; }
  return m;
}
function pregnancyWeek(dueDate, today = TODAY_DATE) {
  const due = new Date(dueDate + 'T00:00:00');
  const daysLeft = Math.round((due - today) / 86400000);
  const daysPregnant = 280 - daysLeft;
  return { week: Math.max(0, Math.floor(daysPregnant / 7)), dayOfWeek: ((daysPregnant % 7) + 7) % 7, daysLeft };
}
function trimesterOf(week) {
  return week < 14 ? 1 : week < 28 ? 2 : 3;
}

function PregnancyHome({ lunara, api, onNav }) {
  useLang();
  const lang = useLang();
  const p = lunara.pregnancy;
  const { week, daysLeft } = pregnancyWeek(p.dueDate);
  const ms = milestoneFor(week);
  const tri = trimesterOf(week);
  const triName = t(['', 'First', 'Second', 'Third'][tri] + ' trimester', ['', 'Birinci', 'İkinci', 'Üçüncü'][tri] + ' trimester');
  const kicksToday = p.kicks[TODAY_KEY] || 0;
  const dueStr = new Date(p.dueDate + 'T00:00:00').toLocaleDateString(lang === 'tr' ? 'tr' : 'en', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div style={{ padding: '18px 36px 48px', display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Hero */}
      <Card pad={0} style={{ overflow: 'hidden' }}>
        <div className="mb-stack" style={{ display: 'grid', gridTemplateColumns: '320px 1fr' }}>
          <div style={{
            position: 'relative', minHeight: 256,
            background: 'linear-gradient(155deg, var(--accent-soft) 0%, var(--card) 72%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <WeekRing week={week}/>
          </div>
          <div style={{ padding: '30px 34px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <StageBadge stage="pregnancy"/>
              <span className="eyebrow">{triName}</span>
            </div>
            <h2 className="serif-display" style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 32, lineHeight: 1.12, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
              {t(<>Week {week} — baby is about the size of <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>{ms.fEn}</em>.</>,
                 <>{week}. hafta — bebek yaklaşık <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>{ms.fTr}</em> büyüklüğünde.</>)}
            </h2>
            <p style={{ fontFamily: 'var(--serif)', fontSize: 15.5, lineHeight: 1.55, color: 'var(--ink-2)', margin: '0 0 18px', maxWidth: 440 }}>
              {t(ms.devEn, ms.devTr)}
            </p>
            <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}>
              <HeroStat label={t('Due date', 'Tahmini doğum')} value={dueStr}/>
              <HeroStat label={t('Days to go', 'Kalan gün')} value={`${daysLeft}`}/>
              <HeroStat label={t('Length / weight', 'Boy / ağırlık')} value={`${ms.len} cm · ${ms.wt >= 1000 ? (ms.wt/1000).toFixed(1)+' kg' : ms.wt+' g'}`}/>
            </div>
          </div>
        </div>
      </Card>

      {/* Baby + You */}
      <div className="mb-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
            <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--bone)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}><Icon d={ICONS.spark} size={16}/></span>
            <div className="eyebrow">{t('Baby this week', 'Bu hafta bebek')}</div>
          </div>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 16, lineHeight: 1.55, color: 'var(--ink-2)', margin: 0 }}>{t(ms.devEn, ms.devTr)}</p>
        </Card>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
            <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--bone)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}><Icon d={ICONS.heart} size={16}/></span>
            <div className="eyebrow">{t('You this week', 'Bu hafta sen')}</div>
          </div>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 16, lineHeight: 1.55, color: 'var(--ink-2)', margin: 0 }}>{t(ms.youEn, ms.youTr)}</p>
        </Card>
      </div>

      {/* Quick logs: kicks + weight */}
      <div className="mb-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
        {/* Kick counter */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 4 }}>{t("Today's kicks", 'Bugünkü tekmeler')}</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 20 }}>{t('Kick counter', 'Tekme sayacı')}</div>
            </div>
            {kicksToday > 0 && (
              <button onClick={() => api.resetKicks(TODAY_KEY)} style={{ fontSize: 11.5, color: 'var(--muted)', cursor: 'pointer' }}>{t('Reset', 'Sıfırla')}</button>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <button onClick={() => api.addKick(TODAY_KEY)} style={{
              width: 92, height: 92, borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
              background: 'var(--accent)', color: 'var(--ivory)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
              boxShadow: '0 10px 26px -10px var(--accent)', border: 'none',
            }}>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 34, lineHeight: 1 }}>{kicksToday}</span>
              <span style={{ fontSize: 10, fontFamily: 'var(--mono)', letterSpacing: '0.06em', opacity: 0.9 }}>+1</span>
            </button>
            <p style={{ fontSize: 12.8, color: 'var(--muted)', lineHeight: 1.5, margin: 0 }}>
              {t('From week 28, feeling about 10 movements within 2 hours is reassuring. Tap for each kick.',
                 '28. haftadan itibaren 2 saat içinde ~10 hareket hissetmek güven vericidir. Her tekmede dokun.')}
            </p>
          </div>
        </Card>

        {/* Weight */}
        <Card>
          <div className="eyebrow" style={{ marginBottom: 14 }}>{t('Weight', 'Kilo')}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={() => api.logWeight(+(p.weightKg - 0.1).toFixed(1))} style={stepperBtn}>−</button>
            <div style={{ textAlign: 'center', minWidth: 110 }}>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 40, letterSpacing: '-0.02em' }}>{p.weightKg.toFixed(1)}</span>
              <span style={{ fontSize: 14, color: 'var(--muted)', marginLeft: 4 }}>kg</span>
            </div>
            <button onClick={() => api.logWeight(+(p.weightKg + 0.1).toFixed(1))} style={stepperBtn}>+</button>
          </div>
          <p style={{ fontSize: 12.8, color: 'var(--muted)', lineHeight: 1.5, margin: '16px 0 0' }}>
            {t('Gradual, steady gain is healthy. Your doctor tracks the right range for you.',
               'Kademeli ve istikrarlı artış sağlıklıdır. Sana uygun aralığı doktorun izler.')}
          </p>
        </Card>
      </div>

      {/* Appointments */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
          <div className="eyebrow">{t('Upcoming appointments', 'Yaklaşan randevular')}</div>
          <button onClick={() => onNav && onNav('care')} style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', gap: 4, alignItems: 'center', cursor: 'pointer' }}>
            {t('Care team', 'Destek ekibi')} <Icon d={ICONS.arrow} size={11}/>
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {[
            { tag: 'SCAN', d: t('Fri 26 Jun · 10:00', '26 Haz Cum · 10:00'), en: 'Growth ultrasound', tr: 'Gelişim ultrasonu' },
            { tag: 'TEST', d: t('Wed 8 Jul · AM', '8 Tem Çar · Sabah'), en: 'Glucose screening', tr: 'Şeker yükleme testi' },
            { tag: 'VISIT', d: t('Thu 23 Jul · 14:30', '23 Tem Per · 14:30'), en: 'Routine check-up', tr: 'Rutin kontrol' },
          ].map((a, i, arr) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '70px 1fr auto', gap: 12, alignItems: 'center', padding: '12px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--line-soft)' : 'none' }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.04em', color: 'var(--accent)' }}>{a.tag}</span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 13.5, color: 'var(--ink)', fontWeight: 500 }}>{t(a.en, a.tr)}</span>
                <span style={{ fontSize: 11, color: 'var(--muted-2)', fontFamily: 'var(--mono)' }}>{a.d}</span>
              </div>
              <Icon d={ICONS.arrow} size={13} stroke="var(--muted-2)"/>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', color: 'var(--muted-2)', fontSize: 12 }}>
        <Icon d={ICONS.heart} size={14} stroke="var(--muted-2)"/>
        <span style={{ fontStyle: 'italic', fontFamily: 'var(--serif)' }}>
          {t('Guidance only — always follow your doctor or midwife for your pregnancy.',
             'Yalnızca rehberlik — gebeliğin için her zaman doktorunu veya ebeni izle.')}
        </span>
      </div>
    </div>
  );
}

const stepperBtn = {
  width: 44, height: 44, borderRadius: 12, fontSize: 22, cursor: 'pointer',
  background: 'var(--bone)', color: 'var(--ink-2)', boxShadow: 'inset 0 0 0 1px var(--line-soft)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
};

function HeroStat({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span className="eyebrow" style={{ fontSize: 9.5 }}>{label}</span>
      <span style={{ fontFamily: 'var(--serif)', fontSize: 16, letterSpacing: '-0.01em' }}>{value}</span>
    </div>
  );
}

// 40-week progress ring
function WeekRing({ week, size = 184 }) {
  const r = (size - 30) / 2;
  const c = 2 * Math.PI * r;
  const frac = Math.min(1, week / 40);
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--card)" strokeWidth="13" opacity="0.7"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--accent)" strokeWidth="13"
          strokeDasharray={`${frac * c} ${c}`} strokeLinecap="round" opacity="0.9"/>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
        <span className="eyebrow" style={{ fontSize: 9.5 }}>{t('WEEK', 'HAFTA')}</span>
        <span style={{ fontFamily: 'var(--serif)', fontSize: 52, lineHeight: 0.9, letterSpacing: '-0.03em' }}>{week}</span>
        <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)', marginTop: 4 }}>/ 40</span>
      </div>
    </div>
  );
}

export { WEEK_MILESTONES, milestoneFor, pregnancyWeek, trimesterOf, PregnancyHome, stepperBtn, HeroStat, WeekRing };
