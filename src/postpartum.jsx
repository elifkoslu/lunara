import React from 'react';
import { t, useLang } from './i18n';
import { Btn, wrap } from './screens';
import { Card, ICONS, Icon, TODAY_DATE, TODAY_KEY } from './shared';
import { StageDateField } from './stage-date';
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

// ── EPDS — Edinburgh Postnatal Depression Scale (validated 10-item screen) ──
// Each option carries its score (0–3); options are listed in display order.
const EPDS = [
  { qEn: 'I have been able to laugh and see the funny side of things', qTr: 'Gülebiliyor ve olayların komik yanını görebiliyordum',
    opts: [{ en: 'As much as I always could', tr: 'Her zamanki kadar', s: 0 }, { en: 'Not quite so much now', tr: 'Artık pek o kadar değil', s: 1 }, { en: 'Definitely not so much now', tr: 'Kesinlikle eskisi kadar değil', s: 2 }, { en: 'Not at all', tr: 'Hiç', s: 3 }] },
  { qEn: 'I have looked forward with enjoyment to things', qTr: 'Geleceğe keyifle bakabiliyordum',
    opts: [{ en: 'As much as I ever did', tr: 'Her zamanki kadar', s: 0 }, { en: 'Rather less than I used to', tr: 'Eskisinden biraz daha az', s: 1 }, { en: 'Definitely less than I used to', tr: 'Eskisinden kesinlikle daha az', s: 2 }, { en: 'Hardly at all', tr: 'Neredeyse hiç', s: 3 }] },
  { qEn: 'I have blamed myself unnecessarily when things went wrong', qTr: 'Bir şeyler ters gittiğinde gereksiz yere kendimi suçladım',
    opts: [{ en: 'Yes, most of the time', tr: 'Evet, çoğu zaman', s: 3 }, { en: 'Yes, some of the time', tr: 'Evet, bazen', s: 2 }, { en: 'Not very often', tr: 'Çok sık değil', s: 1 }, { en: 'No, never', tr: 'Hayır, hiçbir zaman', s: 0 }] },
  { qEn: 'I have been anxious or worried for no good reason', qTr: 'Belirgin bir neden yokken kaygılandım ya da endişelendim',
    opts: [{ en: 'No, not at all', tr: 'Hayır, hiç', s: 0 }, { en: 'Hardly ever', tr: 'Çok nadiren', s: 1 }, { en: 'Yes, sometimes', tr: 'Evet, bazen', s: 2 }, { en: 'Yes, very often', tr: 'Evet, çok sık', s: 3 }] },
  { qEn: 'I have felt scared or panicky for no very good reason', qTr: 'İyi bir neden yokken korktum ya da paniğe kapıldım',
    opts: [{ en: 'Yes, quite a lot', tr: 'Evet, oldukça sık', s: 3 }, { en: 'Yes, sometimes', tr: 'Evet, bazen', s: 2 }, { en: 'No, not much', tr: 'Hayır, pek değil', s: 1 }, { en: 'No, not at all', tr: 'Hayır, hiç', s: 0 }] },
  { qEn: 'Things have been getting on top of me', qTr: 'İşler üstüme üstüme geldi',
    opts: [{ en: "Yes, most of the time I haven't coped at all", tr: 'Evet, çoğu zaman hiç baş edemedim', s: 3 }, { en: "Yes, sometimes I haven't coped as usual", tr: 'Evet, bazen her zamanki gibi baş edemedim', s: 2 }, { en: 'No, most of the time I have coped well', tr: 'Hayır, çoğu zaman oldukça iyi baş ettim', s: 1 }, { en: 'No, I have been coping as well as ever', tr: 'Hayır, her zamanki gibi baş ettim', s: 0 }] },
  { qEn: 'I have been so unhappy that I have had difficulty sleeping', qTr: 'O kadar mutsuzdum ki uyumakta zorlandım',
    opts: [{ en: 'Yes, most of the time', tr: 'Evet, çoğu zaman', s: 3 }, { en: 'Yes, sometimes', tr: 'Evet, bazen', s: 2 }, { en: 'Not very often', tr: 'Çok sık değil', s: 1 }, { en: 'No, not at all', tr: 'Hayır, hiç', s: 0 }] },
  { qEn: 'I have felt sad or miserable', qTr: 'Üzgün ya da mutsuz hissettim',
    opts: [{ en: 'Yes, most of the time', tr: 'Evet, çoğu zaman', s: 3 }, { en: 'Yes, quite often', tr: 'Evet, oldukça sık', s: 2 }, { en: 'Not very often', tr: 'Çok sık değil', s: 1 }, { en: 'No, not at all', tr: 'Hayır, hiç', s: 0 }] },
  { qEn: 'I have been so unhappy that I have been crying', qTr: 'O kadar mutsuzdum ki ağladım',
    opts: [{ en: 'Yes, most of the time', tr: 'Evet, çoğu zaman', s: 3 }, { en: 'Yes, quite often', tr: 'Evet, oldukça sık', s: 2 }, { en: 'Only occasionally', tr: 'Yalnızca ara sıra', s: 1 }, { en: 'No, never', tr: 'Hayır, hiçbir zaman', s: 0 }] },
  { qEn: 'The thought of harming myself has occurred to me', qTr: 'Kendime zarar verme düşüncesi aklıma geldi',
    opts: [{ en: 'Yes, quite often', tr: 'Evet, oldukça sık', s: 3 }, { en: 'Sometimes', tr: 'Bazen', s: 2 }, { en: 'Hardly ever', tr: 'Neredeyse hiç', s: 1 }, { en: 'Never', tr: 'Hiçbir zaman', s: 0 }] },
];

// Score band. q10 = answer to the self-harm item (any positive => urgent).
function epdsBand(score, q10) {
  if (q10 > 0) return {
    key: 'urgent', color: 'oklch(0.55 0.16 25)',
    en: 'Needs attention now', tr: 'Şimdi destek gerekli',
    bEn: 'You answered that thoughts of harming yourself have occurred. Please reach out right now — to a doctor, someone you trust, or emergency services (112). You deserve support and you are not alone.',
    bTr: 'Kendine zarar verme düşüncelerinin olduğunu belirttin. Lütfen hemen ulaş — bir doktora, güvendiğin birine ya da acil durumda 112’ye. Desteği hak ediyorsun ve yalnız değilsin.' };
  if (score >= 13) return {
    key: 'likely', color: 'var(--signal-warn)',
    en: 'Possible depression — talk to someone', tr: 'Olası depresyon — biriyle konuş',
    bEn: 'Your answers suggest you may be experiencing postnatal depression. This is common and treatable. Please talk to your doctor or midwife — asking for support is a strong step.',
    bTr: 'Yanıtların doğum sonrası depresyon yaşıyor olabileceğine işaret ediyor. Bu yaygın ve tedavi edilebilir. Lütfen doktorunla ya da ebenle konuş — destek istemek güçlü bir adımdır.' };
  if (score >= 10) return {
    key: 'possible', color: 'var(--signal-warn)',
    en: 'Some symptoms — keep an eye on it', tr: 'Bazı belirtiler — takip et',
    bEn: 'You have some symptoms worth watching. Re-take this in two weeks; if things stay the same or get worse, talk to your care team.',
    bTr: 'İzlemeye değer bazı belirtilerin var. Bunu iki hafta sonra tekrar yap; aynı kalır veya kötüleşirse destek ekibinle konuş.' };
  return {
    key: 'low', color: 'var(--signal-good)',
    en: 'Low likelihood right now', tr: 'Şu an düşük olasılık',
    bEn: 'Your score is low right now. Keep checking in with yourself — if you start to feel worse, share it with your care team.',
    bTr: 'Skorun şu an düşük. Kendini izlemeyi sürdür — kötüleşmeye başlarsan destek ekibinle paylaş.' };
}
function epdsDate(iso, lang) {
  return new Date(iso + 'T00:00:00').toLocaleDateString(lang === 'tr' ? 'tr' : 'en', { day: 'numeric', month: 'long', year: 'numeric' });
}

function PostpartumHome({ lunara, api, onNav }) {
  useLang();
  const pp = lunara.postpartum || {};

  /* Doğum tarihi girilmeden kaçıncı haftada olunduğu hesaplanamaz.
     Eskiden birthDate sabit bir örnek tarihti, o yüzden bu durum hiç
     oluşmuyor ve ekran herkese aynı haftayı gösteriyordu. */
  if (!pp.birthDate) {
    return (
      <div style={{ padding: '18px 36px 48px', display: 'flex', flexDirection: 'column', gap: 22 }}>
        <Card>
          <StageDateField
            label={t('Birth date', 'Doğum tarihi')}
            hint={t('Your recovery week and the guidance on this screen follow from this date.',
                    'Kaçıncı haftada olduğun ve bu ekrandaki öneriler bu tarihten çıkıyor.')}
            value={null}
            onChange={(iso) => api && api.setBirthDate(iso)}/>
        </Card>
      </div>
    );
  }

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

      {/* EPDS screening */}
      <EpdsScreener lunara={lunara} api={api} onNav={onNav}/>

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

      {/* Tarih girildikten sonra da düzeltilebilsin */}
      <Card>
        <StageDateField
          label={t('Birth date', 'Doğum tarihi')}
          value={pp.birthDate}
          onChange={(iso) => api && api.setBirthDate(iso)}/>
      </Card>
    </div>
  );
}

const X_PATH = 'M18 6 6 18M6 6l12 12';

// EPDS card: shows the latest result and opens the screening flow.
function EpdsScreener({ lunara, api, onNav }) {
  const lang = useLang();
  const list = lunara.postpartum.epds || [];
  const last = list[0];
  const [open, setOpen] = React.useState(false);
  const band = last ? epdsBand(last.score, last.q10) : null;
  const flagged = band && (band.key === 'likely' || band.key === 'urgent');

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 4 }}>{t('EMOTIONAL HEALTH', 'DUYGUSAL SAĞLIK')}</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 22 }}>{t('Mood screening', 'Ruh hali taraması')}</div>
        </div>
        <span style={{ fontSize: 10.5, color: 'var(--muted-2)', fontFamily: 'var(--mono)' }}>EPDS · {t('10 questions', '10 soru')}</span>
      </div>

      {last ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px', borderRadius: 'var(--r-md)', background: 'var(--bone)', marginBottom: 14 }}>
          <div style={{ textAlign: 'center', minWidth: 64 }}>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 34, lineHeight: 1, color: band.color }}>{last.score}</span>
            <div style={{ fontSize: 10, color: 'var(--muted-2)', fontFamily: 'var(--mono)' }}>/ 30</div>
          </div>
          <div style={{ minWidth: 0 }}>
            <span style={{ display: 'inline-block', fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: '0.04em', padding: '4px 10px', borderRadius: 999, background: band.color, color: 'var(--ivory)', marginBottom: 6 }}>
              {t(band.en, band.tr)}
            </span>
            <div style={{ fontSize: 11.5, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{t('Last taken', 'Son yapılan')}: {epdsDate(last.date, lang)}</div>
          </div>
        </div>
      ) : (
        <p style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.55, margin: '0 0 14px' }}>
          {t('A short, validated questionnaire that screens for signs of postnatal depression. It takes about two minutes.',
             'Doğum sonrası depresyon belirtilerini tarayan kısa, doğrulanmış bir anket. Yaklaşık iki dakika sürer.')}
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <Btn primary onClick={() => setOpen(true)}>{last ? t('Take again', 'Yeniden değerlendir') : t('Start screening', 'Taramaya başla')}</Btn>
        {flagged && (
          <button onClick={() => onNav && onNav('care')} style={{ fontSize: 12.5, color: 'var(--accent)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            {t('Message your care team', 'Destek ekibine yaz')} <Icon d={ICONS.arrow} size={13} stroke="var(--accent)"/>
          </button>
        )}
      </div>

      <p style={{ fontSize: 11.5, color: 'var(--muted-2)', lineHeight: 1.5, margin: '12px 0 0', fontStyle: 'italic' }}>
        {t('A screening tool, not a diagnosis. Always discuss results with your doctor or midwife.',
           'Bir tarama aracıdır, tanı değildir. Sonuçları her zaman doktorun veya ebenle değerlendir.')}
      </p>

      {open && <EpdsModal onClose={() => setOpen(false)} onSave={(r) => api.addEpds(r)} />}
    </Card>
  );
}

// 10-step screening flow, then a result view.
function EpdsModal({ onClose, onSave }) {
  const lang = useLang();
  const [answers, setAnswers] = React.useState(Array(10).fill(null));
  const [step, setStep] = React.useState(0);
  const [done, setDone] = React.useState(false);

  const total = answers.reduce((a, b) => a + (b || 0), 0);
  const q10 = answers[9] || 0;

  const choose = (s) => {
    const next = [...answers]; next[step] = s; setAnswers(next);
    if (step < 9) setTimeout(() => setStep(step + 1), 150);
    else setTimeout(() => setDone(true), 150);
  };

  const overlay = (children) => (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(20,14,10,0.5)', backdropFilter: 'blur(3px)', padding: 18,
    }}>
      <div onClick={e => e.stopPropagation()} className="sheet-up" style={{
        width: '100%', maxWidth: 480, maxHeight: '88vh', overflow: 'auto',
        background: 'var(--card)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-card)', padding: 24,
      }}>{children}</div>
    </div>
  );

  if (done) {
    const band = epdsBand(total, q10);
    return overlay(
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div className="eyebrow">{t('Your result', 'Sonucun')}</div>
          <button onClick={onClose} style={{ padding: 6, color: 'var(--muted)', cursor: 'pointer' }}><Icon d={X_PATH} size={18} sw={2}/></button>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
          <span style={{ fontFamily: 'var(--serif)', fontSize: 48, lineHeight: 1, color: band.color }}>{total}</span>
          <span style={{ fontSize: 14, color: 'var(--muted)' }}>/ 30</span>
        </div>
        <span style={{ display: 'inline-block', fontSize: 12, fontFamily: 'var(--mono)', letterSpacing: '0.04em', padding: '5px 12px', borderRadius: 999, background: band.color, color: 'var(--ivory)', marginBottom: 14 }}>
          {t(band.en, band.tr)}
        </span>
        <p style={{ fontFamily: 'var(--serif)', fontSize: 15.5, lineHeight: 1.6, color: 'var(--ink-2)', margin: '0 0 16px' }}>{t(band.bEn, band.bTr)}</p>
        <p style={{ fontSize: 11.5, color: 'var(--muted-2)', lineHeight: 1.5, margin: '0 0 20px', fontStyle: 'italic' }}>
          {t('The EPDS is a screening tool, not a diagnosis.', 'EPDS bir tarama aracıdır, tanı koymaz.')}
        </p>
        <button onClick={() => { onSave({ date: TODAY_KEY, score: total, q10, answers }); onClose(); }} style={{
          width: '100%', padding: '13px 0', borderRadius: 999, border: 'none',
          background: 'var(--ink)', color: 'var(--ivory)', fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}>{t('Save result', 'Sonucu kaydet')}</button>
      </>
    );
  }

  const q = EPDS[step];
  return overlay(
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: '0.06em', color: 'var(--muted)' }}>{t('QUESTION', 'SORU')} {step + 1} / 10</span>
        <button onClick={onClose} style={{ padding: 6, color: 'var(--muted)', cursor: 'pointer' }}><Icon d={X_PATH} size={18} sw={2}/></button>
      </div>
      {/* progress */}
      <div style={{ height: 4, borderRadius: 999, background: 'var(--line-soft)', marginBottom: 18, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${((step + 1) / 10) * 100}%`, background: 'var(--accent)', transition: 'width 200ms ease' }}/>
      </div>
      <p style={{ fontFamily: 'var(--serif)', fontSize: 19, lineHeight: 1.4, color: 'var(--ink)', margin: '0 0 18px' }}>
        {t('In the past 7 days…', 'Son 7 gün içinde…')}<br/>
        <span style={{ color: 'var(--ink-2)' }}>{t(q.qEn, q.qTr)}</span>
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {q.opts.map((o, i) => {
          const on = answers[step] === o.s;
          return (
            <button key={i} onClick={() => choose(o.s)} style={{
              textAlign: 'left', padding: '13px 16px', borderRadius: 'var(--r-md)', cursor: 'pointer',
              background: on ? 'var(--accent)' : 'var(--bone)', color: on ? 'var(--ivory)' : 'var(--ink-2)',
              boxShadow: on ? 'none' : 'inset 0 0 0 1px var(--line-soft)',
              fontFamily: 'var(--sans)', fontSize: 14, transition: 'all 120ms ease',
            }}>{t(o.en, o.tr)}</button>
          );
        })}
      </div>
      {step > 0 && (
        <button onClick={() => setStep(step - 1)} style={{ marginTop: 16, fontSize: 13, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          ‹ {t('Back', 'Geri')}
        </button>
      )}
    </>
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
