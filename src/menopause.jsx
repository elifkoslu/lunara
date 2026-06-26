import React from 'react';
import { t, useLang } from './i18n';
import { Btn, wrap } from './screens';
import { Card, ICONS, Icon, TODAY_DATE, TODAY_KEY, medTaken, todaysDoses } from './shared';
import { StageBadge } from './stages';

/* menopause.jsx — Lunara · Menopoz (Si) ana ekranı
   Durum, semptom (sıcak basması vb.), HRT özeti, uzun vadeli kemik & kalp sağlığı.
   screens.jsx, shared.jsx (todaysDoses, medTaken), stages.jsx (StageBadge) sonrası. */
/* eslint-disable */

function yearsSince(iso, today = TODAY_DATE) {
  const d = new Date(iso + 'T00:00:00');
  const months = (today.getFullYear() - d.getFullYear()) * 12 + (today.getMonth() - d.getMonth());
  return { years: Math.floor(months / 12), months: months % 12, totalMonths: months };
}

const MENO_SYMPTOMS = [
  { key: 'hotflash', en: 'Hot flushes', tr: 'Sıcak basması', icon: ICONS.flame },
  { key: 'nightsweat', en: 'Night sweats', tr: 'Gece terlemesi', icon: ICONS.drop },
  { key: 'sleep', en: 'Poor sleep', tr: 'Uyku sorunu', icon: ICONS.moon },
  { key: 'mood', en: 'Mood', tr: 'Ruh hali', icon: ICONS.spark },
  { key: 'joints', en: 'Joint aches', tr: 'Eklem ağrısı', icon: ICONS.pulse },
];

function MenopauseHome({ lunara, api, onNav }) {
  useLang();
  const since = yearsSince(lunara.menopause.lastPeriod);
  const postmeno = since.totalMonths >= 12;
  const { meds } = todaysDoses(lunara);
  const takenCount = meds.filter(d => medTaken(lunara, d.id)).length;
  const todayLog = lunara.symptomLog[TODAY_KEY] || {};
  const durStr = since.years >= 1
    ? t(`${since.years} year${since.years>1?'s':''}${since.months?` ${since.months} mo`:''}`, `${since.years} yıl${since.months?` ${since.months} ay`:''}`)
    : t(`${since.totalMonths} months`, `${since.totalMonths} ay`);

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
            <div style={{ textAlign: 'center' }}>
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none" style={{ marginBottom: 4 }}>
                <circle cx="60" cy="60" r="46" fill="none" stroke="var(--accent)" strokeWidth="2" opacity="0.5"/>
                <circle cx="60" cy="60" r="30" fill="var(--accent)" opacity="0.9"/>
              </svg>
              <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 17, color: 'var(--ink-2)' }}>
                {postmeno ? t('Postmenopause', 'Postmenopoz') : t('Transition', 'Geçiş dönemi')}
              </div>
            </div>
          </div>
          <div style={{ padding: '30px 34px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <StageBadge stage="menopause"/>
              <span className="eyebrow">{postmeno ? t('PERIOD-FREE', 'REGLSİZ') : t('PERIMENOPAUSE', 'PERİMENOPOZ')} · {durStr}</span>
            </div>
            <h2 className="serif-display" style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 32, lineHeight: 1.12, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
              {t(<>A new chapter — <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>steady and free</em> of the monthly cycle.</>,
                 <>Yeni bir bölüm — aylık döngüden <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>azade ve dingin</em>.</>)}
            </h2>
            <p style={{ fontFamily: 'var(--serif)', fontSize: 15.5, lineHeight: 1.55, color: 'var(--ink-2)', margin: 0, maxWidth: 440 }}>
              {t('Symptoms can come and go for years. Tracking them and protecting bone and heart health are what matter most now.',
                 'Belirtiler yıllarca gelip gidebilir. Şimdi en önemlisi onları takip etmek ve kemik ile kalp sağlığını korumak.')}
            </p>
          </div>
        </div>
      </Card>

      {/* Symptoms + HRT */}
      <div className="mb-stack" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 22 }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div className="eyebrow">{t('How are your symptoms today?', 'Bugün belirtilerin nasıl?')}</div>
            <button onClick={() => onNav && onNav('symptoms')} style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', gap: 4, alignItems: 'center', cursor: 'pointer' }}>
              {t('All', 'Tümü')} <Icon d={ICONS.arrow} size={11}/>
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {MENO_SYMPTOMS.map(s => {
              const on = (todayLog[s.key] || 0) > 0;
              return (
                <button key={s.key} onClick={() => api.logSymptom(TODAY_KEY, s.key, on ? 0 : 2)} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '11px 15px', borderRadius: 999, cursor: 'pointer',
                  background: on ? 'var(--accent)' : 'var(--bone)',
                  color: on ? 'var(--ivory)' : 'var(--ink-2)',
                  boxShadow: on ? 'none' : 'inset 0 0 0 1px var(--line-soft)',
                  fontSize: 13.5, fontWeight: on ? 600 : 500, transition: 'all 140ms ease',
                }}>
                  <Icon d={s.icon} size={15}/> {t(s.en, s.tr)}
                </button>
              );
            })}
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.5, margin: '16px 0 0' }}>
            {t('A symptom diary helps you and your doctor judge whether your HRT dose is right.',
               'Belirti günlüğü, HRT dozunun doğru olup olmadığını sana ve doktoruna gösterir.')}
          </p>
        </Card>

        <Card>
          <div className="eyebrow" style={{ marginBottom: 12 }}>{t('Hormone therapy', 'Hormon tedavisi')}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 34, letterSpacing: '-0.02em' }}>{takenCount}/{meds.length}</span>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>{t('taken today', 'bugün alındı')}</span>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.5, margin: '6px 0 14px' }}>
            {t('Your menopausal hormone therapy eases symptoms and supports bone health.',
               'Menopoz hormon tedavin belirtileri hafifletir ve kemik sağlığını destekler.')}
          </p>
          <Btn primary onClick={() => onNav && onNav('doses')}>
            <Icon d={ICONS.pill} size={14}/> {t('Open doses', 'Dozları aç')}
          </Btn>
        </Card>
      </div>

      {/* Long-term health */}
      <Card>
        <div className="eyebrow" style={{ marginBottom: 14 }}>{t('Protecting your long-term health', 'Uzun vadeli sağlığını korumak')}</div>
        <div className="mb-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
          {[
            { icon: ICONS.ring, en: 'Bone health', tr: 'Kemik sağlığı', bEn: 'Calcium, vitamin D and strength work guard against bone loss. Ask about a DEXA scan.', bTr: 'Kalsiyum, D vitamini ve kuvvet çalışması kemik kaybına karşı korur. DEXA taramasını sor.' },
            { icon: ICONS.heart, en: 'Heart health', tr: 'Kalp sağlığı', bEn: 'Risk rises after menopause — keep blood pressure, lipids and movement in check.', bTr: 'Menopozdan sonra risk artar — tansiyon, kan yağları ve hareketi kontrol altında tut.' },
            { icon: ICONS.brain, en: 'Mind & sleep', tr: 'Zihin & uyku', bEn: 'Routine, daylight and gentle exercise support memory, mood and rest.', bTr: 'Düzen, gün ışığı ve hafif egzersiz hafızayı, ruh halini ve uykuyu destekler.' },
          ].map((c, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--bone)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}><Icon d={c.icon} size={16}/></span>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 16, letterSpacing: '-0.01em' }}>{t(c.en, c.tr)}</div>
              <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.5, margin: 0 }}>{t(c.bEn, c.bTr)}</p>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', color: 'var(--muted-2)', fontSize: 12 }}>
        <Icon d={ICONS.heart} size={14} stroke="var(--muted-2)"/>
        <span style={{ fontStyle: 'italic', fontFamily: 'var(--serif)' }}>
          {t('Guidance only — your doctor tailors hormone therapy and screening to you.',
             'Yalnızca rehberlik — hormon tedavisi ve taramaları doktorun sana göre düzenler.')}
        </span>
      </div>
    </div>
  );
}

export { yearsSince, MENO_SYMPTOMS, MenopauseHome };
