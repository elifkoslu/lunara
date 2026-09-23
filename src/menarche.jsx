import React from 'react';
import { I18N, t, useLang } from './i18n';
import { Btn, ScreenHead, cycleDayFrom, cycleLenOf, phaseOf, wrap } from './screens';
import { Card, ICONS, Icon, TODAY_DATE, TODAY_KEY, getTodayKey } from './shared';
import { StageBadge } from './stages';
import { donguUzunluklari, reglBaslangiclari, sonrakiReglTahmini } from './menarche-rhythm';

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
  /* Aşağıdaki dört kart menarş bölümünü genişletirken eklendi. Tıbbi iddia
     taşıyan cümleler bilerek genel ve yaygın kabul görmüş olanlarla sınırlı;
     ilaç önerisi yok — ağrı kesici gibi konular yetişkin ve hekim kararı. */
  { tagEn: 'BODY', tagTr: 'BEDEN',
    titleEn: 'Your body is changing', titleTr: 'Bedenin değişiyor',
    teaserEn: 'What happens in puberty — and why all of it is normal.',
    teaserTr: 'Ergenlikte neler olur — ve neden hepsi normaldir.',
    bodyEn: [
      'Puberty usually starts somewhere between 8 and 13 and takes a few years. Everyone moves at their own pace — starting before or after your friends is normal.',
      'For most girls the first change is breast development; the first period usually comes around two years later. A few months to a year before it, you may notice white or clear discharge in your underwear — a sign your body is getting ready.',
      'You may grow quickly, notice hair under your arms and between your legs, a change in how sweat smells, or some spots. All of this means your hormones are doing their job.',
    ],
    bodyTr: [
      'Ergenlik genellikle 8 ile 13 yaş arasında bir yerde başlar ve birkaç yıl sürer. Herkes kendi hızında ilerler — arkadaşlarından önce ya da sonra başlaman normaldir.',
      'Çoğu kızda ilk değişiklik göğüs gelişimidir; ilk regl genellikle bundan iki yıl kadar sonra gelir. Ondan birkaç ay ile bir yıl önce iç çamaşırında beyaz ya da berrak bir akıntı fark edebilirsin — bedeninin hazırlandığının işareti.',
      'Boyun hızla uzayabilir, koltuk altında ve bacak arasında tüylenme başlar, terinin kokusu değişir, sivilce çıkabilir. Bunların hepsi hormonlarının işini yaptığını gösterir.',
    ] },
  { tagEn: 'BE READY', tagTr: 'HAZIRLIK',
    titleEn: 'Being prepared', titleTr: 'Hazırlıklı olmak',
    teaserEn: 'A small kit in your bag makes surprises easier.',
    teaserTr: 'Çantandaki küçük bir kese, sürprizleri kolaylaştırır.',
    bodyEn: [
      'A first period often arrives without warning and is usually light — sometimes it shows up as a brownish mark rather than red.',
      'Keeping a small pouch in your school bag makes things easier:',
    ],
    bodyTr: [
      'İlk regl çoğu zaman habersiz gelir ve genellikle az olur — bazen kırmızı değil, kahverengimsi bir leke olarak görünür.',
      'Okul çantanda küçük bir kese taşımak işini kolaylaştırır:',
    ],
    bulletsEn: [
      'A few pads (or a tampon or cup, if you are used to one)',
      'Spare underwear',
      'Wet wipes and a small bag',
    ],
    bulletsTr: [
      'Birkaç ped (ya da alıştıysan tampon veya regl kabı)',
      'Yedek bir iç çamaşırı',
      'Islak mendil ve küçük bir poşet',
    ],
    footEn: 'If you get caught out at school, you can tell a teacher, the school nurse or a friend you trust — it happens a lot, and nobody finds it strange.',
    footTr: 'Okulda hazırlıksız yakalanırsan öğretmenine, okul hemşiresine ya da güvendiğin bir arkadaşına söyleyebilirsin — bu çok sık olur ve kimse garipsemez.' },
  { tagEn: 'MOVE', tagTr: 'HAREKET',
    titleEn: 'Sport and periods', titleTr: 'Spor ve regl',
    teaserEn: 'Moving during your period is fine — it can even ease cramps.',
    teaserTr: 'Regldeyken hareket etmek serbest — hatta krampa iyi gelebilir.',
    bodyEn: [
      'You can do sport, join PE and dance while you have your period. Gentle movement eases cramps for many people.',
      'Swimming is possible too — for that you need a tampon or a cup, because a pad does not work in water.',
      'On days you feel very tired or sore, slowing down is completely fine. Listen to your body.',
    ],
    bodyTr: [
      'Reglin olduğu günlerde spor yapabilir, beden eğitimi dersine katılabilir, dans edebilirsin. Hafif hareket birçok kişide krampları azaltır.',
      'Yüzmek de mümkün — bunun için tampon ya da regl kabı gerekir, çünkü ped suda işe yaramaz.',
      'Kendini çok yorgun ya da ağrılı hissettiğin günlerde temponu düşürmek de tamamen normal. Bedenini dinle.',
    ] },
  { tagEn: 'FACTS', tagTr: 'GERÇEKLER',
    titleEn: 'Myths vs facts', titleTr: 'Doğru bilinen yanlışlar',
    teaserEn: 'Things people say about periods that are not true.',
    teaserTr: 'Regl hakkında sık duyulan ama doğru olmayan şeyler.',
    bodyEn: ['You may have heard these — none of them is true:'],
    bodyTr: ['Bunları duymuş olabilirsin — hiçbiri doğru değil:'],
    bulletsEn: [
      '“You shouldn’t shower on your period.” — False. Showering feels clean and comfortable, and warm water can ease cramps.',
      '“Every cycle is 28 days.” — False. Especially in the first years, 21–45 days is normal.',
      '“You can’t do sport on your period.” — False. Movement often helps.',
      '“Period blood is dirty.” — False. It is made of the uterine lining and blood — a healthy body at work.',
      '“Everyone can tell you’re on your period.” — False. Nobody knows unless you tell them.',
    ],
    bulletsTr: [
      '“Regldeyken duş alınmaz.” — Yanlış. Duş almak temiz ve rahat hissettirir, ılık su krampa da iyi gelebilir.',
      '“Herkesin döngüsü 28 gündür.” — Yanlış. Özellikle ilk yıllarda 21–45 gün arası normaldir.',
      '“Regldeyken spor yapılmaz.” — Yanlış. Hareket çoğu zaman iyi gelir.',
      '“Regl kanı kirlidir.” — Yanlış. Rahim iç zarından ve kandan oluşur; bedenin sağlıklı bir işleyişidir.',
      '“Regl olduğunu herkes anlar.” — Yanlış. Sen söylemedikçe kimse bilmez.',
    ],
    footEn: 'If something is on your mind, don’t hesitate to ask — asking questions is the best way to get to know your body.',
    footTr: 'Aklına takılan bir şey olursa sormaktan çekinme — soru sormak, bedenini tanımanın en iyi yolu.' },
];

function MenarcheHome({ lunara, api, onNav }) {
  useLang();
  const today = TODAY_DATE;
  const day = cycleDayFrom(lunara.periodStart, today, cycleLenOf(lunara));
  const ph = phaseOf(day, cycleLenOf(lunara));
  // Çapa yokken faz anlatısı gösterilmez; ilk adım son regli işaretlemek
  const info = ph ? MENARCHE_PHASES[ph.key] : null;
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
            {/* ph, döngü çapası yokken null. Eskiden burada ph.key okunuyordu ve
                henüz reglini işaretlememiş her kullanıcı — menarş bölümünün asıl
                kitlesi — "Bir şeyler ters gitti" ekranına düşüyordu. "Reglim
                başladı" düğmesi de çöken ekranın içinde olduğu için çıkış yoktu. */}
            <CycleAwarenessDial day={day} phaseKey={ph ? ph.key : null}/>
          </div>
        </div>
      </Card>

      {/* This month + today's feeling */}
      <div className="mb-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
        {/* Where are you */}
        <Card>
          <div className="eyebrow" style={{ marginBottom: 12 }}>{t('Where you are this month', 'Bu ay neredesin')}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 30, letterSpacing: '-0.01em' }}>
              {info ? t(info.en, info.tr) : t('Not set yet', 'Henüz belli değil')}
            </span>
            {day != null && <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)' }}>{t('day', 'gün')} {day}</span>}
          </div>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 15, lineHeight: 1.55, color: 'var(--ink-2)', margin: '0 0 18px' }}>
            {info
              ? t(info.bodyEn, info.bodyTr)
              : t('Tell us when your last period started and this page will follow your month with you.',
                  'Son reglinin ne zaman başladığını söyle, bu sayfa ayını seninle birlikte takip etsin.')}
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

      {/* Ritim ve son günler — okuma kartları "zamanla kendi ritmini
          tanırsın" diyordu ama ekranda ritmi gösteren bir şey yoktu. */}
      <div className="mb-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
        <RitimKarti lunara={lunara} onYardim={() => setReader(LEARN_CARDS.find(c => c.tagEn === 'ASK'))}/>
        <SonGunlerDuygu lunara={lunara}/>
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


/* Regl geçmişi ve sonraki reglin gelebileceği aralık. Hesaplar
   menarche-rhythm.js'te; burada yalnızca çiziliyor. */
function RitimKarti({ lunara, onYardim }) {
  const lang = useLang();
  const bas = reglBaslangiclari(lunara.periodDays);
  const uz = donguUzunluklari(bas);
  const tah = sonrakiReglTahmini(bas, getTodayKey());
  const fmt = (iso) => new Date(iso + 'T00:00:00')
    .toLocaleDateString(lang === 'tr' ? 'tr' : 'en', { day: 'numeric', month: 'short' });
  // En yeni üstte, en fazla altı regl
  const liste = bas.map((b, i) => ({ b, uz: i > 0 ? uz[i - 1] : null })).reverse().slice(0, 6);

  return (
    <Card>
      <div className="eyebrow" style={{ marginBottom: 12 }}>{t('Your rhythm', 'Ritmin')}</div>
      {!tah ? (
        <p style={{ fontFamily: 'var(--serif)', fontSize: 15, lineHeight: 1.55, color: 'var(--ink-2)', margin: 0 }}>
          {t('When your period comes, tap “My period started”. Your rhythm will start building up here.',
             'Reglin geldiğinde “Reglim başladı”ya dokun. Ritmin burada birikmeye başlar.')}
        </p>
      ) : (<>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>{t('Next period, roughly', 'Sonraki regl, yaklaşık')}</div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 24, letterSpacing: '-0.01em', marginBottom: 6 }}>
          {fmt(tah.enErken)} – {fmt(tah.enGec)}
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.5, margin: '0 0 14px' }}>
          {tah.kaynak === 'gozlem'
            ? t(`Based on your last cycles: ${tah.min}–${tah.max} days.`, `Son döngülerine göre: ${tah.min}–${tah.max} gün.`)
            : t(`Not many records yet — in the first years ${tah.min}–${tah.max} days is typical, so this is a wide guess.`,
                `Henüz az kayıt var — ilk yıllarda ${tah.min}–${tah.max} gün tipiktir, bu yüzden geniş bir tahmin.`)}
        </p>
        {tah.uzunAra ? (
          <div style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--accent-soft)', marginBottom: 14 }}>
            <p style={{ fontSize: 12.5, color: 'var(--ink)', lineHeight: 1.5, margin: '0 0 8px' }}>
              {t(`It has been ${tah.gecenGun} days since your last period. When it has been more than 3 months, it is good to talk to a trusted adult or a doctor.`,
                 `Son reglinden bu yana ${tah.gecenGun} gün geçti. 3 aydan uzun sürdüğünde güvendiğin bir yetişkinle ya da doktorla konuşmak iyi olur.`)}
            </p>
            <button onClick={onYardim} style={{ padding: 0, border: 'none', background: 'none', cursor: 'pointer',
              fontSize: 12.5, fontWeight: 600, color: 'var(--accent)', fontFamily: 'var(--sans)' }}>
              {t('When to ask for help →', 'Ne zaman yardım istemeli →')}
            </button>
          </div>
        ) : tah.aralikGecti ? (
          <p style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.5, margin: '0 0 14px', fontStyle: 'italic', fontFamily: 'var(--serif)' }}>
            {t('The guessed window has passed — in the first years this is very common.',
               'Tahmini aralık geçti — ilk yıllarda bu çok yaygındır.')}
          </p>
        ) : null}
        <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)', letterSpacing: '0.04em', marginBottom: 6 }}>
          {t('PAST PERIODS', 'GEÇMİŞ REGLLER')}
        </div>
        {liste.map(({ b, uz: g }) => (
          <div key={b} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13,
            padding: '6px 0', borderBottom: '1px solid var(--line-soft)' }}>
            <span>{fmt(b)}</span>
            <span style={{ color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 12 }}>
              {g != null ? t(`${g} days`, `${g} gün`) : '—'}
            </span>
          </div>
        ))}
      </>)}
    </Card>
  );
}

/* Son yedi günün duyguları. Duygular yalnızca bugün için giriliyordu ve
   geriye dönük hiçbir yerde görünmüyordu; örüntü ancak yan yana görünce
   fark ediliyor. */
function SonGunlerDuygu({ lunara }) {
  const lang = useLang();
  const log = lunara.symptomLog || {};
  const gunler = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(TODAY_DATE); d.setDate(d.getDate() - i);
    const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    const kayit = log[key] || {};
    gunler.push({
      key,
      etiket: i === 0 ? t('Today', 'Bugün') : i === 1 ? t('Yesterday', 'Dün')
        : d.toLocaleDateString(lang === 'tr' ? 'tr' : 'en', { weekday: 'short', day: 'numeric' }),
      duygular: FEEL_CHIPS.filter(c => (kayit[c.key] || 0) > 0),
    });
  }
  const hicYok = gunler.every(g => g.duygular.length === 0);

  return (
    <Card>
      <div className="eyebrow" style={{ marginBottom: 12 }}>{t('Your last 7 days', 'Son 7 günün')}</div>
      {hicYok ? (
        <p style={{ fontFamily: 'var(--serif)', fontSize: 15, lineHeight: 1.55, color: 'var(--ink-2)', margin: 0 }}>
          {t('Pick how you feel each day above — after a few days your pattern shows up here.',
             'Her gün yukarıdan nasıl hissettiğini seç — birkaç gün sonra düzenin burada görünmeye başlar.')}
        </p>
      ) : gunler.map(g => (
        <div key={g.key} style={{ display: 'grid', gridTemplateColumns: '72px 1fr', gap: 10, alignItems: 'center',
          padding: '6px 0', borderBottom: '1px solid var(--line-soft)' }}>
          <span style={{ fontSize: 11.5, fontFamily: 'var(--mono)', color: 'var(--muted)' }}>{g.etiket}</span>
          <span style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {g.duygular.length === 0
              ? <span style={{ fontSize: 11.5, color: 'var(--muted-2)' }}>—</span>
              : g.duygular.map(c => (
                <span key={c.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5,
                  padding: '3px 8px', borderRadius: 999, background: 'var(--bone)', color: 'var(--ink-2)' }}>
                  <Icon d={c.icon} size={11}/> {t(c.en, c.tr)}
                </span>
              ))}
          </span>
        </div>
      ))}
    </Card>
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
  // Gün yoksa (çapa kurulmamış) halka boş kalır, ortada bekleme yazısı
  const bekliyor = day == null;
  const frac = bekliyor ? 0 : Math.min(1, (day - 1) / approxLen);
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--card)" strokeWidth="14" opacity="0.7"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--accent)" strokeWidth="14"
          strokeDasharray={`${frac * c} ${c}`} strokeLinecap="round" opacity="0.85"/>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        {bekliyor ? (
          <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, lineHeight: 1.3,
            color: 'var(--ink-2)', textAlign: 'center', maxWidth: size - 56 }}>
            {t('Waiting for your first period', 'İlk reglini bekliyorsun')}
          </span>
        ) : (<>
          <span className="eyebrow" style={{ fontSize: 9.5 }}>{t('DAY', 'GÜN')}</span>
          <span style={{ fontFamily: 'var(--serif)', fontSize: 46, lineHeight: 0.9, letterSpacing: '-0.03em' }}>{day}</span>
        </>)}
      </div>
    </div>
  );
}

export { MENARCHE_PHASES, FEEL_CHIPS, LEARN_CARDS, MenarcheHome, CycleAwarenessDial };
