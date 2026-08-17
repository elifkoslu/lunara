import React from 'react';
import { I18N, t, useLang } from './i18n';
import { Btn, cycleDayFrom, cycleLenOf, wrap } from './screens';
import { useMonthView, MonthNav, WeekdayRow } from './month-grid';
import { Card, ICONS, Icon, TODAY_DATE, TODAY_KEY } from './shared';
import { StageBadge } from './stages';

/* ttc.jsx — Lunara · Gebe kalma (Mi) ana ekranı
   Doğurgan pencere, ovülasyon tahmini, bazal vücut ısısı (BBT),
   LH testi ve ilişki zamanlaması. screens.jsx (cycleDayFrom, Btn),
   shared.jsx, stages.jsx (StageBadge), i18n sonrası yüklenir. */
/* eslint-disable */

/* Doğurgan pencere kullanıcının kendi döngü uzunluğundan türetilir.
   Buradaki sayılar eskiden sabitti (32 günlük döngü, ovülasyon 18. gün,
   pencere 13-18). 28 günlük bir döngüde ovülasyon 14. gündür — yani pencere
   beş gün geç gösteriliyordu; gebe kalma ekranının tek işlevi tam da bu.

   Kural: luteal faz uzunluğu kişiden kişiye pek değişmez (~14 gün), değişen
   folliküler fazdır → ovülasyon ≈ L - 14. Doğurgan pencere, spermin ~5 gün
   yaşayabilmesi nedeniyle ovülasyondan önceki 5 günü ve ovülasyon gününü
   kapsar. Bunlar takvime dayalı tahminlerdir; BBT ve LH kaydı gerçek günü
   daha iyi gösterir. */
const TTC_LEN_FALLBACK = 28;
function ttcCycle(cycleLength) {
  const L = Math.max(15, Math.min(60, Number(cycleLength) || TTC_LEN_FALLBACK));
  const ov = Math.max(10, L - 14);
  return { L, ov, fertileStart: Math.max(1, ov - 5), fertileEnd: ov };
}

/* Döngü günü bilinmiyorsa doğurgan pencere de bilinmiyor. Korumasız
   bırakılırsa toOv = ov - null = ov çıkıyor ve uygulama "ovülasyon 14 gün
   içinde bekleniyor" diye uydurma bir tahmin veriyordu. */
function ttcStatus(day, cycleLength) {
  const c = ttcCycle(cycleLength);
  if (day == null) {
    return { day: null, unknown: true, toOv: null, fertile: false, peak: false, ovulation: false, ...c };
  }
  const toOv = c.ov - day;
  const fertile = day >= c.fertileStart && day <= c.fertileEnd;
  const peak = day >= c.ov - 1 && day <= c.ov; // en doğurgan 2 gün
  return { day, toOv, fertile, peak, ovulation: day === c.ov, ...c };
}

// Demo BBT serisi (folliküler, henüz ısı yükselişi yok) — son 14 gün
const BBT_BASE = [36.32, 36.28, 36.35, 36.30, 36.40, 36.36, 36.34, 36.42, 36.38, 36.41, 36.37, 36.44, 36.40, 36.43];

function TtcHome({ lunara, api, onNav }) {
  useLang();
  const day = cycleDayFrom(lunara.periodStart, TODAY_DATE, cycleLenOf(lunara));
  const L = cycleLenOf(lunara);
  const st = ttcStatus(day, L);
  const lhToday = lunara.ttc.lh[TODAY_KEY];
  const bbtToday = lunara.ttc.bbt[TODAY_KEY];

  const headEn = st.unknown ? 'Set up your cycle first'
    : st.ovulation ? 'Ovulation day' : st.peak ? 'Your most fertile days' : st.fertile ? 'Your fertile window is open' : st.toOv > 0 ? 'Fertile window approaching' : 'After ovulation — the two-week wait';
  const headTr = st.unknown ? 'Önce döngünü kuralım'
    : st.ovulation ? 'Ovülasyon günü' : st.peak ? 'En doğurgan günlerindesin' : st.fertile ? 'Doğurgan pencere açık' : st.toOv > 0 ? 'Doğurgan pencere yaklaşıyor' : 'Ovülasyon sonrası — iki haftalık bekleyiş';
  const subEn = st.unknown ? 'Mark the first day of your last period — the fertile window is calculated from it.'
    : st.toOv > 0 ? `Ovulation expected in ${st.toOv} day${st.toOv>1?'s':''}. Timing now gives the best chance.` : st.ovulation ? 'An egg is likely released today.' : 'A test makes sense from about day 28.';
  const subTr = st.unknown ? 'Son reglinin ilk gününü işaretle — doğurgan pencere ondan hesaplanıyor.'
    : st.toOv > 0 ? `Ovülasyon ${st.toOv} gün içinde bekleniyor. Şimdi zamanlamak en iyi şansı verir.` : st.ovulation ? 'Bugün bir yumurta serbest kalmış olabilir.' : 'Yaklaşık 28. günden itibaren test mantıklı.';

  return (
    <div style={{ padding: '18px 36px 48px', display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Hero */}
      <Card pad={0} style={{ overflow: 'hidden' }}>
        <div className="mb-stack" style={{ display: 'grid', gridTemplateColumns: '320px 1fr' }}>
          <div style={{
            position: 'relative', minHeight: 250,
            background: 'linear-gradient(155deg, var(--accent-soft) 0%, var(--card) 72%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FertilityRing day={day} cycle={st}/>
          </div>
          <div style={{ padding: '30px 34px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <StageBadge stage="ttc"/>
              <span className="eyebrow">
                {day == null
                  ? t('CYCLE NOT SET YET', 'DÖNGÜ HENÜZ BELİRLENMEDİ')
                  : <>{t('CYCLE DAY', 'DÖNGÜ GÜNÜ')} {day} · {st.L}</>}
              </span>
            </div>
            <h2 className="serif-display" style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 32, lineHeight: 1.12, margin: '0 0 12px', letterSpacing: '-0.02em' }}>
              {t(headEn, headTr)}
            </h2>
            <p style={{ fontFamily: 'var(--serif)', fontSize: 16, lineHeight: 1.55, color: 'var(--ink-2)', margin: '0 0 20px', maxWidth: 440 }}>
              {t(subEn, subTr)}
            </p>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Btn primary onClick={() => api.toggleIntimacy(TODAY_KEY)}>
                <Icon d={ICONS.heart} size={14} sw={lunara.ttc.intimacy[TODAY_KEY] ? 0 : 1.6}
                  fill={lunara.ttc.intimacy[TODAY_KEY] ? 'var(--ivory)' : 'none'}/>
                {lunara.ttc.intimacy[TODAY_KEY] ? t('Logged today', 'Bugün işaretli') : t('Log intimacy', 'İlişkiyi işaretle')}
              </Btn>
              {/* Zirve günleri döngü çapasından türüyor; çapa yokken bu satır
                  hesaplanmış bir tahmin gibi görünüp yanıltıyordu. */}
              {!st.unknown && (
                <span style={{ fontSize: 12.5, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
                  {t('PEAK', 'ZİRVE')} · {t('day', 'gün')} {st.ov - 1}–{st.ov}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Fertile window — monthly */}
      <Card>
        <div className="eyebrow" style={{ marginBottom: 16 }}>{t('Fertile window', 'Doğurgan pencere')}</div>
        <FertileStrip day={day} lunara={lunara} api={api}/>
        <div style={{ display: 'flex', gap: 18, marginTop: 16, flexWrap: 'wrap' }}>
          <Legend color="var(--accent-soft)" label={t('Fertile', 'Doğurgan')}/>
          <Legend color="var(--accent)" label={t('Peak', 'Zirve')}/>
          <Legend ring label={t('Ovulation', 'Ovülasyon')}/>
          <Legend heart label={t('Intimacy logged', 'İlişki işaretli')}/>
        </div>
      </Card>

      {/* BBT + LH */}
      <div className="mb-stack" style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 22 }}>
        {/* BBT chart */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 4 }}>{t('Basal body temperature', 'Bazal vücut ısısı')}</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 20 }}>{t('14-day chart', '14 günlük grafik')}</div>
            </div>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)' }}>
              {bbtToday ? `${bbtToday.toFixed(2)}°C` : '—'}
            </span>
          </div>
          <BBTChart lunara={lunara}/>
          <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, margin: '14px 0 14px' }}>
            {t('A sustained rise of ~0.3°C confirms ovulation has happened — expected around day 18.',
               'Sürekli ~0,3°C’lik bir yükseliş ovülasyonun gerçekleştiğini doğrular — 18. gün civarında beklenir.')}
          </p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Btn primary onClick={() => api.logBBT(TODAY_KEY, +(36.45 + Math.random() * 0.05).toFixed(2))}>
              <Icon d={ICONS.plus} size={13} sw={2}/> {t('Log morning temp', 'Sabah ısısını gir')}
            </Btn>
            {bbtToday && <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>{t('Logged', 'Girildi')} {bbtToday.toFixed(2)}°C</span>}
          </div>
        </Card>

        {/* LH + timing */}
        <Card>
          <div className="eyebrow" style={{ marginBottom: 14 }}>{t('Ovulation test (LH)', 'Ovülasyon testi (LH)')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { k: 'low',  en: 'Negative', tr: 'Negatif' },
              { k: 'high', en: 'High',     tr: 'Yüksek' },
              { k: 'peak', en: 'Peak (surge)', tr: 'Zirve (LH artışı)' },
            ].map(o => {
              const on = lhToday === o.k;
              return (
                <button key={o.k} onClick={() => api.setLH(TODAY_KEY, o.k)} style={{
                  display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left',
                  padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                  background: on ? 'var(--accent)' : 'var(--bone)',
                  color: on ? 'var(--ivory)' : 'var(--ink-2)',
                  boxShadow: on ? 'none' : 'inset 0 0 0 1px var(--line-soft)',
                  transition: 'all 140ms ease',
                }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${on ? 'var(--ivory)' : 'var(--muted-2)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{on && <Icon d={ICONS.check} size={12} sw={2.4}/>}</span>
                  <span style={{ fontSize: 14, fontWeight: on ? 600 : 500 }}>{t(o.en, o.tr)}</span>
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: 12, background: 'var(--accent-soft)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <Icon d={ICONS.spark} size={15} stroke="var(--ink-2)"/>
            <span style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.5 }}>
              {lhToday === 'peak'
                ? t('Surge detected — ovulation likely in 24–36h. The next two days are key.', 'LH artışı saptandı — ovülasyon 24–36 saatte muhtemel. Önümüzdeki iki gün kritik.')
                : t('Test daily from day 11. A positive means time intercourse over the next 1–2 days.', '11. günden itibaren her gün test et. Pozitif sonuç önümüzdeki 1–2 günde ilişki zamanı demek.')}
            </span>
          </div>
        </Card>
      </div>

      {/* Tips */}
      <Card>
        <div className="eyebrow" style={{ marginBottom: 14 }}>{t('To support conception', 'Gebe kalmayı desteklemek için')}</div>
        <div className="mb-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
          {[
            { icon: ICONS.leaf, en: 'Folic acid daily', tr: 'Her gün folik asit', bEn: 'Start 400–800 mcg before and through early pregnancy.', bTr: 'Gebelik öncesi ve erken döneminde 400–800 mcg.' },
            { icon: ICONS.heart, en: 'Timing every 1–2 days', tr: '1–2 günde bir zamanlama', bEn: 'Through the fertile window — not only on the peak day.', bTr: 'Doğurgan pencere boyunca — yalnızca zirve gününde değil.' },
            { icon: ICONS.moon, en: 'Rest & steady habits', tr: 'Dinlenme & düzen', bEn: 'Sleep, gentle movement and low stress support a regular cycle.', bTr: 'Uyku, hafif hareket ve düşük stres düzenli döngüyü destekler.' },
          ].map((c, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--bone)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                <Icon d={c.icon} size={16}/>
              </span>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 16, letterSpacing: '-0.01em' }}>{t(c.en, c.tr)}</div>
              <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.5, margin: 0 }}>{t(c.bEn, c.bTr)}</p>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', color: 'var(--muted-2)', fontSize: 12 }}>
        <Icon d={ICONS.heart} size={14} stroke="var(--muted-2)"/>
        <span style={{ fontStyle: 'italic', fontFamily: 'var(--serif)' }}>
          {t('Predictions are estimates — your doctor can guide timing and testing.',
             'Tahminler yaklaşıktır — zamanlama ve testler için doktorun yol gösterebilir.')}
        </span>
      </div>
    </div>
  );
}

function Legend({ color, ring, heart, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--ink-2)' }}>
      {ring
        ? <span style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid var(--ink)' }}/>
        : heart
          ? <Icon d={ICONS.heart} size={13} stroke="var(--accent)" fill="var(--accent)"/>
          : <span style={{ width: 12, height: 12, borderRadius: 4, background: color }}/>}
      {label}
    </div>
  );
}

// Fertility ring — cycle with fertile window arc, ovulation + today markers
function FertilityRing({ day, size = 178, cycle }) {
  const cy = cycle || ttcCycle();
  const r = (size - 30) / 2;
  const c = 2 * Math.PI * r;
  const arc = (from, to, color, w) => {
    const dash = ((to - from + 1) / cy.L) * c;
    const off = -((from - 1) / cy.L) * c;
    return <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={w}
      strokeDasharray={`${dash} ${c}`} strokeDashoffset={off}/>;
  };
  const ovAngle = ((cy.ov - 1) / cy.L) * 360;
  const todayAngle = ((day - 1) / cy.L) * 360;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--card)" strokeWidth="13" opacity="0.7"/>
        {arc(cy.fertileStart, cy.fertileEnd, 'var(--accent-soft)', 13)}
        {arc(cy.ov - 1, cy.ov, 'var(--accent)', 13)}
        <g transform={`rotate(${ovAngle} ${size/2} ${size/2})`}>
          <circle cx={size/2 + r} cy={size/2} r="6" fill="none" stroke="var(--ink)" strokeWidth="2.4"/>
        </g>
        {/* Gün bilinmiyorken "buradasın" işaretçisi çizilmez */}
        {day != null && (
          <g transform={`rotate(${todayAngle} ${size/2} ${size/2})`}>
            <circle cx={size/2 + r} cy={size/2} r="5" fill="var(--ink)" stroke="var(--card)" strokeWidth="2"/>
          </g>
        )}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        <span className="eyebrow" style={{ fontSize: 9.5 }}>{day == null ? t('CYCLE', 'DÖNGÜ') : t('DAY', 'GÜN')}</span>
        <span style={{ fontFamily: 'var(--serif)', fontSize: day == null ? 30 : 44, lineHeight: 0.9, letterSpacing: '-0.03em' }}>
          {day == null ? '—' : day}
        </span>
      </div>
    </div>
  );
}

// 7-day fertile strip with intimacy toggles
/* ── Ayın doğurgan pencere takvimi ─────────────────────────────────
   Önce üç gün öncesinden üç gün sonrasına yedi günlük bir şeritti; pencerenin
   ayın neresine düştüğünü göstermiyordu. Aylık görünümde zirve günleri koyu,
   doğurgan günler açık tonda; her güne dokunarak ilişki işaretlenebiliyor.
   Doğurganlık yalnız renkle anlatılmıyor — ovülasyon günü halkalı, işaretli
   günde kalp simgesi var. */
function FertileStrip({ day, lunara, api }) {
  const { go, isCurrentMonth, monthLabel, weekdays, cells } = useMonthView();
  const L = cycleLenOf(lunara);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
        <MonthNav label={monthLabel} onPrev={() => go(-1)} onNext={() => go(1)} atCurrent={isCurrentMonth}/>
      </div>
      <WeekdayRow weekdays={weekdays}/>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {cells.map((c, i) => {
          if (!c) return <div key={'b' + i}/>;
          const cd = cycleDayFrom(lunara.periodStart, c.date, L);
          const st = ttcStatus(cd, L);
          const iliski = !!(lunara.ttc && lunara.ttc.intimacy && lunara.ttc.intimacy[c.key]);
          const bg = st.peak ? 'var(--accent)' : st.fertile ? 'var(--accent-soft)' : 'var(--ivory)';
          const fg = st.peak ? 'var(--ivory)' : 'var(--ink)';
          return (
            <button key={c.key} onClick={() => api.toggleIntimacy(c.key)}
              aria-label={cd == null ? String(c.d)
                : `${c.d} · ${st.peak ? t('peak', 'zirve') : st.fertile ? t('fertile', 'doğurgan') : t('day', 'gün')} ${cd}`}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                padding: '5px 2px 6px', borderRadius: 10, cursor: 'pointer', minHeight: 56,
                background: bg, color: fg,
                boxShadow: c.isToday ? 'inset 0 0 0 2px var(--ink)' : (st.fertile || st.peak ? 'none' : 'inset 0 0 0 1px var(--line-soft)'),
                opacity: c.isFuture ? 0.5 : 1,
                transition: 'all 140ms ease',
              }}>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 15, lineHeight: 1.1 }}>{c.d}</span>
              {st.ovulation
                ? <span style={{ width: 10, height: 10, borderRadius: '50%', border: `2px solid ${fg}` }}/>
                : <span style={{ width: 10, height: 10 }}/>}
              <Icon d={ICONS.heart} size={11} stroke={iliski ? fg : 'transparent'} fill={iliski ? fg : 'none'}/>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 8.5, opacity: 0.65 }}>{cd}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function isoKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// BBT line chart — data-driven over the last 14 days, with a coverline,
// an ovulation-shift marker and LH high/peak markers.
function BBTChart({ lunara }) {
  useLang();
  // Build a 14-day window ending today from real logged data.
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(TODAY_DATE); d.setDate(TODAY_DATE.getDate() - i);
    const key = isoKey(d);
    days.push({
      key, cd: cycleDayFrom(lunara.periodStart, d, cycleLenOf(lunara)), isToday: i === 0,
      temp: lunara.ttc.bbt[key] != null ? lunara.ttc.bbt[key] : null,
      lh: lunara.ttc.lh[key] || null,
    });
  }
  const realCount = days.filter(d => d.temp != null).length;
  const usingDemo = realCount < 3;
  const series = usingDemo ? days.map((d, i) => ({ ...d, temp: BBT_BASE[i] })) : days;

  // Coverline ≈ average of the lower ~60% of temps + 0.1°C (a sustained rise
  // above it confirms ovulation has happened).
  const temps = series.filter(d => d.temp != null).map(d => d.temp);
  const sorted = [...temps].sort((a, b) => a - b);
  const lowN = Math.max(1, Math.round(sorted.length * 0.6));
  const coverline = temps.length ? +((sorted.slice(0, lowN).reduce((a, b) => a + b, 0) / lowN) + 0.1).toFixed(2) : null;

  // Detect the thermal shift: first day that rises above the coverline.
  let shiftIdx = -1;
  if (coverline != null) {
    for (let i = 3; i < series.length; i++) {
      if (series[i].temp != null && series[i].temp >= coverline && series[i - 1].temp != null && series[i - 1].temp < coverline) { shiftIdx = i; break; }
    }
  }

  const W = 460, H = 176, padL = 32, padR = 12, padT = 16, padB = 32;
  const lo = 36.1, hi = 36.9;
  const xs = i => padL + (i / (series.length - 1)) * (W - padL - padR);
  const ys = v => padT + (1 - (v - lo) / (hi - lo)) * (H - padT - padB);

  // Line, breaking on missing days.
  const segs = []; let cur = [];
  series.forEach((d, i) => {
    if (d.temp != null) cur.push(`${cur.length ? 'L' : 'M'}${xs(i).toFixed(1)},${ys(d.temp).toFixed(1)}`);
    else { if (cur.length) segs.push(cur.join(' ')); cur = []; }
  });
  if (cur.length) segs.push(cur.join(' '));

  const lhColor = k => k === 'peak' ? 'var(--accent)' : k === 'high' ? 'var(--accent-soft)' : null;
  let ovi = shiftIdx; if (ovi < 0) ovi = series.findIndex(d => d.cd === ttcCycle(cycleLenOf(lunara)).ov);

  return (
    <div>
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: 'block' }}>
        {[36.2, 36.4, 36.6, 36.8].map(g => (
          <g key={g}>
            <line x1={padL} x2={W - padR} y1={ys(g)} y2={ys(g)} stroke="var(--line-soft)" strokeWidth="1"/>
            <text x={4} y={ys(g) + 3} fill="var(--muted-2)" fontFamily="var(--mono)" fontSize="9">{g.toFixed(1)}</text>
          </g>
        ))}
        {/* coverline */}
        {coverline != null && (
          <line x1={padL} x2={W - padR} y1={ys(coverline)} y2={ys(coverline)} stroke="var(--ink)" strokeWidth="1" strokeDasharray="4 4" opacity="0.45"/>
        )}
        {/* ovulation / thermal-shift marker */}
        {ovi >= 0 && (
          <g>
            <line x1={xs(ovi)} x2={xs(ovi)} y1={padT} y2={H - padB} stroke="var(--accent)" strokeWidth="1.4" strokeDasharray="3 3" opacity="0.6"/>
            <text x={xs(ovi)} y={padT - 4} textAnchor="middle" fill="var(--accent)" fontFamily="var(--mono)" fontSize="8.5">{shiftIdx >= 0 ? t('shift', 'yükseliş') : t('est. ov.', 'tah. ov.')}</text>
          </g>
        )}
        {segs.map((d, i) => <path key={i} d={d} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>)}
        {series.map((d, i) => d.temp != null && (
          <circle key={i} cx={xs(i)} cy={ys(d.temp)} r={d.isToday ? 3.8 : 2.2} fill="var(--accent)" stroke={d.isToday ? 'var(--card)' : 'none'} strokeWidth={d.isToday ? 1.5 : 0}/>
        ))}
        {/* LH markers */}
        {series.map((d, i) => { const c = lhColor(d.lh); return c ? <circle key={'lh' + i} cx={xs(i)} cy={H - padB + 13} r="3.5" fill={c}/> : null; })}
        {/* cycle-day axis */}
        {series.map((d, i) => (i % 3 === 0 || d.isToday) ? <text key={'x' + i} x={xs(i)} y={H - 5} textAnchor="middle" fill="var(--muted-2)" fontFamily="var(--mono)" fontSize="8">{d.cd}</text> : null)}
      </svg>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 8, fontSize: 10.5, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 14, height: 0, borderTop: '1px dashed var(--ink)', opacity: 0.5 }}/>{t('coverline', 'eşik çizgisi')}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-soft)' }}/>{t('LH high', 'LH yüksek')}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }}/>{t('LH peak', 'LH zirve')}</span>
        {usingDemo && <span style={{ fontStyle: 'italic' }}>{t('example data', 'örnek veri')}</span>}
      </div>
    </div>
  );
}

export { ttcCycle, ttcStatus, BBT_BASE, TtcHome, Legend, FertilityRing, FertileStrip, isoKey, BBTChart };
