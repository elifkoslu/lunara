import React from 'react';
import { I18N, t, useLang } from './i18n';
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
    teaserEn: 'A monthly rhythm where your body prepares, then resets.',
    teaserTr: 'Bedeninin hazırlanıp sonra sıfırlandığı aylık bir ritim.',
    bodyEn: [
      'A cycle is the time from the first day of one period to the first day of the next. In the early years it often varies between 21 and 45 days, and being irregular is completely normal.',
      'The cycle has four phases: your period (bleeding), building up, the mid-point (an egg may be released), and winding down. Your energy, mood and body can shift a little in each one.',
      'Over time you get to know your own rhythm — it’s like learning to read the signals your body sends you.',
    ],
    bodyTr: [
      'Döngü, bir reglin ilk gününden bir sonraki reglin ilk gününe kadar geçen süredir. İlk yıllarda çoğu zaman 21–45 gün arasında değişir ve düzensiz olması tamamen normaldir.',
      'Döngü dört evreye ayrılır: regl (kanama), toparlanma, orta nokta (yumurtlama olabilir) ve yavaşlama. Her evrede enerjin, ruh halin ve bedenin biraz değişebilir.',
      'Zamanla kendi ritmini tanırsın — bu, bedeninin sana gönderdiği işaretleri okumayı öğrenmek gibidir.',
    ] },
  { tagEn: 'NORMAL', tagTr: 'NORMAL',
    titleEn: 'What’s normal?', titleTr: 'Neler normal?',
    teaserEn: 'Irregularity, spotting and cramps are common in the first years.',
    teaserTr: 'İlk yıllarda düzensizlik, lekelenme ve krampler yaygındır.',
    bodyEn: [
      'For the first few years cycles can be irregular — 25 days one month, 40 the next. This is because your hormones are still settling, and it usually isn’t something to worry about.',
      'Light spotting, clear or whitish discharge, cramps, bloating and mood changes are all normal.',
      'Everyone’s body is different and “normal” is a wide range. Knowing your own pattern helps you understand what’s usual for you.',
    ],
    bodyTr: [
      'İlk birkaç yıl döngüler düzensiz olabilir — bir ay 25, diğer ay 40 gün. Bu, hormonların henüz dengelenmesinden kaynaklanır ve genellikle endişe verici değildir.',
      'Hafif lekelenme, berrak ya da beyazımsı akıntı, kramp, şişkinlik ve ruh hali değişimleri normaldir.',
      'Herkesin bedeni farklıdır ve “normal” geniş bir aralıktır. Kendi düzenini bilmek, senin için neyin olağan olduğunu anlamanı sağlar.',
    ] },
  { tagEn: 'PRODUCTS', tagTr: 'ÜRÜNLER',
    titleEn: 'Pads, tampons & cups', titleTr: 'Ped, tampon ve kap',
    teaserEn: 'Pick whatever feels most comfortable — there’s no right or wrong.',
    teaserTr: 'Sana en rahat geleni seçebilirsin — doğru ya da yanlış yok.',
    bodyEn: [
      'Pads are worn outside the body and are the easiest way to start. Tampons and menstrual cups are used inside; you can move to these whenever you feel ready.',
      'Change a pad every 4–6 hours and a tampon every 4–8 hours. Don’t leave a tampon in overnight.',
    ],
    bodyTr: [
      'Ped dıştan kullanılır ve başlamak için en kolay seçenektir. Tampon ve adet kabı içeriden kullanılır; bunlara hazır hissettiğinde geçebilirsin.',
      'Pedi 4–6 saatte bir, tamponu 4–8 saatte bir değiştir. Tamponu gece boyunca takılı bırakma.',
    ],
    bulletsEn: ['Pad: outside, easiest start', 'Tampon: inside, handy for sport & swimming', 'Cup: reusable and economical'],
    bulletsTr: ['Ped: dıştan, en kolay başlangıç', 'Tampon: içeriden, spor ve yüzme için pratik', 'Adet kabı: yeniden kullanılabilir ve ekonomik'] },
  { tagEn: 'RELIEF', tagTr: 'RAHATLAMA',
    titleEn: 'Easing cramps', titleTr: 'Krampleri hafifletmek',
    teaserEn: 'Warmth, gentle movement and water usually help.',
    teaserTr: 'Sıcaklık, hareket ve su çoğu zaman yardımcı olur.',
    bodyEn: [
      'A warm water bottle on your tummy or lower back relaxes the muscles. A short walk and gentle stretching boost circulation and can ease the ache.',
      'Drinking plenty of water and eating regularly help with bloating and tiredness.',
      'If the pain is strong enough to stop your day, talk to a trusted adult — a doctor can suggest a suitable pain reliever if needed.',
    ],
    bodyTr: [
      'Karnına ya da beline sıcak su torbası koymak kasları gevşetir. Kısa bir yürüyüş ve hafif esneme kan dolaşımını artırarak ağrıyı azaltabilir.',
      'Bol su içmek ve düzenli beslenmek şişkinliği ve yorgunluğu hafifletir.',
      'Ağrı gününü durduracak kadar şiddetliyse güvendiğin bir yetişkinle konuş; gerekirse doktor uygun bir ağrı kesici önerebilir.',
    ],
    bulletsEn: ['Warm bottle or warm shower', 'Light movement and stretching', 'Water and balanced meals'],
    bulletsTr: ['Sıcak su torbası ya da ılık duş', 'Hafif hareket ve esneme', 'Su ve dengeli beslenme'] },
  { tagEn: 'TRACKING', tagTr: 'TAKİP',
    titleEn: 'Tracking your cycle', titleTr: 'Döngünü takip etmek',
    teaserEn: 'Noting your period and how you feel teaches you your pattern.',
    teaserTr: 'Reglini ve nasıl hissettiğini not etmek düzenini öğretir.',
    bodyEn: [
      'Marking the day each period starts lets you see your cycle length over time. Lunara counts this for you.',
      'Noting how you feel each day — energy, mood, cramps — helps you understand what happens in each phase.',
      'After a few months you can predict roughly when your next period will come, which helps you feel prepared.',
    ],
    bodyTr: [
      'Her reglin başladığı günü işaretlemek, zamanla döngü uzunluğunu görmeni sağlar. Lunara bunu senin için sayar.',
      'Nasıl hissettiğini (enerji, ruh hali, kramp) günlük not etmek, hangi evrede neler yaşadığını anlamana yardım eder.',
      'Birkaç ay sonra bir sonraki reglinin yaklaşık ne zaman geleceğini tahmin edebilirsin — bu da hazırlıklı olmanı sağlar.',
    ] },
  { tagEn: 'ASK', tagTr: 'DANIŞ',
    titleEn: 'When to ask for help', titleTr: 'Ne zaman yardım istemeli',
    teaserEn: 'Some signs are worth checking with an adult or doctor.',
    teaserTr: 'Bazı işaretler için bir yetişkin ya da doktora danışmak iyidir.',
    bodyEn: ['It’s important to talk to a trusted adult or doctor if you notice any of these:'],
    bodyTr: ['Aşağıdaki durumlarda güvendiğin bir yetişkin ya da doktorla konuşmak önemlidir:'],
    bulletsEn: [
      'Bleeding heavy enough to soak a pad or tampon every hour',
      'A period lasting more than 7 days',
      'Pain strong enough to stop your day',
      'No period at all by age 15–16',
      'Periods stopping for more than 3 months (when not pregnant)',
    ],
    bulletsTr: [
      'Pedi/tamponu saatte bir değiştirecek kadar yoğun kanama',
      '7 günden uzun süren regl',
      'Gününü durduran şiddetli ağrı',
      '15–16 yaşına kadar hiç regl olmaması',
      'Reglin 3 aydan uzun süre durması (gebelik dışında)',
    ],
    footEn: 'Asking for help is nothing to be embarrassed about — it’s part of understanding your body.',
    footTr: 'Yardım istemek utanılacak bir şey değildir — bedenini anlamanın bir parçasıdır.' },
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
  const [reader, setReader] = React.useState(null);

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
              onClick={() => setReader(c)}>
              <div className="eyebrow" style={{ color: 'var(--accent)' }}>{t(c.tagEn, c.tagTr)}</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 19, lineHeight: 1.2, letterSpacing: '-0.01em' }}>{t(c.titleEn, c.titleTr)}</div>
              <p style={{ fontSize: 12.8, color: 'var(--muted)', lineHeight: 1.5, margin: 0, flex: 1 }}>{t(c.teaserEn, c.teaserTr)}</p>
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

      {reader && <LearnReader topic={reader} onClose={() => setReader(null)}/>}
    </div>
  );
}

const X_PATH = 'M18 6 6 18M6 6l12 12';

// In-place reader for a learn topic — gentle, teen-friendly long-form content.
function LearnReader({ topic, onClose }) {
  useLang();
  const body = (I18N.lang === 'tr' ? topic.bodyTr : topic.bodyEn) || [];
  const bullets = (I18N.lang === 'tr' ? topic.bulletsTr : topic.bulletsEn) || [];
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(20,14,10,0.5)', backdropFilter: 'blur(3px)', padding: 18,
    }}>
      <div onClick={e => e.stopPropagation()} className="sheet-up" style={{
        width: '100%', maxWidth: 520, maxHeight: '88vh', overflow: 'auto',
        background: 'var(--card)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-card)', padding: 28,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 6 }}>{t(topic.tagEn, topic.tagTr)}</div>
            <h2 className="serif-display" style={{ margin: 0, fontSize: 27, lineHeight: 1.15 }}>{t(topic.titleEn, topic.titleTr)}</h2>
          </div>
          <button onClick={onClose} style={{ padding: 6, color: 'var(--muted)', cursor: 'pointer', flexShrink: 0 }}><Icon d={X_PATH} size={18} sw={2}/></button>
        </div>

        {body.map((p, i) => (
          <p key={i} style={{ fontFamily: 'var(--serif)', fontSize: 15.5, lineHeight: 1.65, color: 'var(--ink-2)', margin: '0 0 14px' }}>{p}</p>
        ))}

        {bullets.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '4px 0 6px', padding: '16px 18px', borderRadius: 'var(--r-md)', background: 'var(--bone)' }}>
            {bullets.map((b, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, marginTop: 7 }}/>
                <span style={{ fontSize: 13.8, color: 'var(--ink-2)', lineHeight: 1.5 }}>{b}</span>
              </div>
            ))}
          </div>
        )}

        {(topic.footEn || topic.footTr) && (
          <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, lineHeight: 1.6, color: 'var(--muted)', margin: '16px 0 0' }}>
            {t(topic.footEn, topic.footTr)}
          </p>
        )}
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
