import React from 'react';
import { t, useLang } from './i18n';
import { Card } from './shared';
import { referenceFor, curveFor, bandFor } from './physiology';

/* reference-card.jsx — "bugün normalde ne olurdu" kartı.

   Ovülatuar bir döngüde o güne düşen hormon düzeylerini gösterir. Bu bir HEDEF
   değil, bağlamdır: normal çalışan bir yumurtalığın ürettiği düzeyler. Perimenopozda
   kendi değerlerin bunun hem üstünde hem altında olabilir ve gün gün değişir —
   hormon tedavisinin amacı bu eğriyi yeniden üretmek değildir. Kart bu yüzden
   hiçbir yerde doz önermez, yalnızca karşılaştırma zemini kurar. */
/* eslint-disable */

const CURVE_W = 320;
const CURVE_H = 54;

/* Tek hormonun eğrisi + bugünün noktası, istenirse perimenopoz zarfıyla.

   Zarf, ovülatuar eğriyle AYNI rengi kullanır: anlattığı şey farklı bir hormon
   değil, aynı hormonun perimenopozdaki dağılımı. Renk kimliği bu kartta
   hormona ayrılmış durumda (mavi estradiol, turuncu progesteron); zarfa ayrı
   bir renk vermek o kimliği bozardı. Ayrım kesik kenar + altındaki etiketle
   yapılıyor, yani yalnızca renge yaslanmıyor. */
function MiniCurve({ series, day, length, color, band }) {
  const tepe = band ? Math.max(...series, ...band.high) : Math.max(...series);
  const max = tepe * 1.08 || 1;
  const x = i => (i / Math.max(1, length - 1)) * CURVE_W;
  const y = v => CURVE_H - (v / max) * CURVE_H;
  const yol = (arr) => arr.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const d = yol(series);
  const idx = Math.max(0, Math.min(length - 1, day - 1));

  // Zarf: üst sınır ileri, alt sınır geri → kapalı alan
  const zarf = band
    ? yol(band.high) + ' ' + band.low.map((v, i) => `L${x(band.low.length - 1 - i).toFixed(1)},${y(band.low[band.low.length - 1 - i]).toFixed(1)}`).join(' ') + ' Z'
    : null;

  return (
    <svg viewBox={`0 0 ${CURVE_W} ${CURVE_H + 6}`} width="100%" height={CURVE_H + 6}
         preserveAspectRatio="none" aria-hidden="true" style={{ display: 'block', overflow: 'visible' }}>
      {zarf && <path d={zarf} fill={color} opacity="0.13"/>}
      {zarf && (
        <>
          <path d={yol(band.high)} fill="none" stroke={color} strokeWidth="1.25"
                strokeDasharray="4 3" opacity="0.55"/>
          <path d={yol(band.low)} fill="none" stroke={color} strokeWidth="1.25"
                strokeDasharray="4 3" opacity="0.55"/>
        </>
      )}
      {!zarf && <path d={`${d} L${CURVE_W},${CURVE_H} L0,${CURVE_H} Z`} fill={color} opacity="0.10"/>}
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
      <line x1={x(idx)} y1="0" x2={x(idx)} y2={CURVE_H} stroke="var(--ink)" strokeWidth="1" opacity="0.30"/>
      <circle cx={x(idx)} cy={y(series[idx])} r="4.5" fill={color} stroke="var(--card)" strokeWidth="2"/>
    </svg>
  );
}

function ReferenceCard({ lunara, cycleDay }) {
  useLang();
  const L = (lunara.regimen && lunara.regimen.cycleLength) || lunara.cycleLength || 28;
  const day = Math.max(1, Math.min(L, cycleDay || 1));
  const ref = referenceFor(day, L);
  // Yalnızca iki ana hormon eğri olarak; LH ve testosteron sayı olarak yeter.
  const curves = { e2: curveFor('e2', L), p4: curveFor('p4', L) };
  const COLORS = { e2: '#2a78d6', p4: '#eb6834' };
  /* Zarf yalnızca perimenopozda anlamlı: kartın asıl anlattığı şey, kendi
     değerlerinin bu eğrinin hem üstüne hem altına çıkabildiği. */
  const periVar = lunara.stage === 'perimeno';
  const bands = periVar ? { e2: bandFor('e2', L), p4: bandFor('p4', L) } : {};

  return (
    <Card>
      <div className="eyebrow" style={{ marginBottom: 4 }}>
        {t('Normal cycle reference', 'Normal döngü referansı')}
      </div>
      <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.55, margin: '6px 0 16px' }}>
        {t(`On day ${day} of an ovulatory cycle — ${ref.phaseLabel} phase — these are the levels a cycling ovary typically produces.`,
           `Ovülatuar bir döngünün ${day}. gününde — ${ref.phaseLabel} faz — çalışan bir yumurtalığın tipik olarak ürettiği düzeyler.`)}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {ref.values.filter(v => curves[v.key]).map(v => (
          <div key={v.key}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, marginBottom: 4 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--ink-2)' }}>
                <span style={{ width: 9, height: 9, borderRadius: 3, background: COLORS[v.key], flexShrink: 0 }}/>
                {v.label}
              </span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 15, color: 'var(--ink)' }}>
                {v.value} <span style={{ fontSize: 11, color: 'var(--muted)' }}>{v.unit}</span>
              </span>
            </div>
            <MiniCurve series={curves[v.key]} day={day} length={L} color={COLORS[v.key]} band={bands[v.key]}/>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted-2)', marginTop: 3 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 12, height: 2, background: COLORS[v.key], flexShrink: 0 }}/>
                {t('ovulatory', 'ovülatuar')} {v.low}–{v.high} {v.unit}
              </span>
              {bands[v.key] && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 12, height: 7, background: COLORS[v.key], opacity: 0.2, borderTop: `1.5px dashed ${COLORS[v.key]}`, flexShrink: 0 }}/>
                  {t('perimenopause range', 'perimenopoz aralığı')} {Math.min(...bands[v.key].low)}–{Math.max(...bands[v.key].high)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Eğrisi çizilmeyenler sayı olarak */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--line-soft)' }}>
        {ref.values.filter(v => !curves[v.key]).map(v => (
          <div key={v.key}>
            <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{v.label}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--ink)' }}>
              {v.value} <span style={{ fontSize: 10.5, color: 'var(--muted)' }}>{v.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 11.5, color: 'var(--muted-2)', lineHeight: 1.55, margin: '16px 0 0' }}>
        {periVar
          ? t('The solid line is an ovulatory cycle; the shaded band is the range seen in perimenopause. Notice the asymmetry: estradiol often runs higher than in a young cycle and swings unpredictably, while progesterone collapses because many cycles do not ovulate. That is why a single blood test neither confirms nor rules out perimenopause — context, not a target. Dose decisions belong with your clinician.',
              'Düz çizgi ovülatuar bir döngü; gölgeli bant perimenopozda görülen aralık. Asimetriye dikkat et: estradiol genç bir döngüdekinden sık sık daha yüksek seyreder ve öngörülemez biçimde dalgalanır, progesteron ise çoğu döngüde ovülasyon olmadığı için çöker. Tek bir kan tahlilinin perimenopozu ne teyit ne de dışlamasının sebebi bu — hedef değil, bağlam. Doz kararı hekiminle birlikte verilir.')
          : t('Reference values from ovulatory cycles in healthy women — context, not a target. Hormone therapy does not aim to reproduce this curve. Dose decisions belong with your clinician.',
              'Sağlıklı kadınların ovülatuar döngülerinden alınan referans değerler — hedef değil, bağlam. Hormon tedavisi bu eğriyi yeniden üretmeyi amaçlamaz. Doz kararı hekiminle birlikte verilir.')}
      </p>
    </Card>
  );
}

export { ReferenceCard };
