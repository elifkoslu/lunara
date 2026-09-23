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
/* Menarş metinleri — 11–15 yaş için.

   Üslup: abla gibi konuşan, kısa cümleli, samimi. Başlıklar kızın kendine
   soracağı sorular. Zorlama argo yok — bu yaş, yetişkinin "gençler gibi
   konuşmaya çalışmasını" hemen sezer. Her kart kısa ve yeterli: bir
   bakışta okunacak kadar.

   Rakamlar ve güvenlik eşikleri önceki metinlerle aynı (21–45 gün, 7 gün,
   15–16 yaş, 3 ay, pedi saatte bir değiştirmek). Ağrı eşiği "okula
   gidemeyecek kadar" olarak somutlaştı — ergenlerde değerlendirme için
   kullanılan ölçüt bu. İlaç önerisi yok. */

const MENARCHE_PHASES = {
  menstrual:  { en: 'Period days', tr: 'Regl günlerin',
    bodyEn: 'Your uterus is renewing its lining — that’s your period. Cramps or tiredness can happen. Something warm, water and rest help.',
    bodyTr: 'Rahmin iç duvarını yeniliyor, regl bu. Kramp ya da yorgunluk olabilir. Sıcak bir şey, su ve biraz dinlenmek iyi gelir.' },
  follicular: { en: 'Energy’s rising', tr: 'Enerji yükseliyor',
    bodyEn: 'Your body is getting ready for a new month. Most people feel better these days.',
    bodyTr: 'Bedenin yeni aya hazırlanıyor. Çoğu kişi bu günlerde kendini daha iyi hisseder.' },
  ovulation:  { en: 'Right in the middle', tr: 'Tam ortası',
    bodyEn: 'An egg may be released. You might notice clear, slippery discharge — that’s normal.',
    bodyTr: 'Bir yumurta serbest kalabilir. Berrak, kaygan bir akıntı görebilirsin, bu normal.' },
  luteal:     { en: 'Slow-down days', tr: 'Yavaşlama günleri',
    bodyEn: 'Before your period you might feel touchy, hungry or tired. That’s hormones, not you.',
    bodyTr: 'Reglden önce daha alıngan, aç ya da yorgun olabilirsin. Sebebi hormonlar, sen değilsin.' },
};

const FEEL_CHIPS = [
  { key: 'happy',  en: 'Good',           tr: 'İyiyim',        icon: ICONS.spark },
  { key: 'tired',  en: 'Tired',          tr: 'Yorgunum',      icon: ICONS.moon },
  { key: 'cramps', en: 'Cramps',         tr: 'Krampım var',   icon: ICONS.flame },
  { key: 'sad',    en: 'Low',            tr: 'Moralim bozuk', icon: ICONS.drop },
  { key: 'energy', en: 'Full of energy', tr: 'Enerji doluyum', icon: ICONS.pulse },
];

const LEARN_CARDS = [
  { tagEn: 'BASICS', tagTr: 'BAŞLANGIÇ',
    titleEn: 'What’s a cycle?', titleTr: 'Döngü ne demek?',
    teaserEn: 'Every month your body gets ready, then resets.',
    teaserTr: 'Bedenin her ay hazırlanıp sıfırlanıyor. Olay bu.',
    bodyEn: [
      'A cycle is the time from the first day of one period to the first day of the next.',
      'In the first years it can be anywhere from 21 to 45 days. Being different each month is totally normal.',
    ],
    bodyTr: [
      'Döngü, bir reglin ilk gününden bir sonrakinin ilk gününe kadar geçen süre.',
      'İlk yıllarda 21 ile 45 gün arasında değişebilir. Her ay farklı olması tamamen normal.',
    ] },
  { tagEn: 'IS IT NORMAL?', tagTr: 'NORMAL Mİ?',
    titleEn: 'Is this normal?', titleTr: 'Bu normal mi?',
    teaserEn: 'Most likely, yes.',
    teaserTr: 'Büyük ihtimalle evet.',
    bodyEn: ['In the first years, all of these are common:'],
    bodyTr: ['İlk yıllarda bunların hepsi olağan:'],
    bulletsEn: ['A cycle that’s 25 days one month and 40 the next', 'Light spotting', 'White or clear discharge', 'Cramps and bloating', 'Mood that changes out of nowhere'],
    bulletsTr: ['Bir ay 25, öbür ay 40 gün süren döngü', 'Hafif lekelenme', 'Beyaz ya da berrak akıntı', 'Kramp ve şişkinlik', 'Birden değişen ruh hali'],
    footEn: 'Your hormones are still settling in. Don’t stress about it.',
    footTr: 'Hormonların hâlâ yerine oturuyor. Kafana takma.' },
  { tagEn: 'PRODUCTS', tagTr: 'ÜRÜNLER',
    titleEn: 'Pad or tampon?', titleTr: 'Ped mi, tampon mu?',
    teaserEn: 'Whatever’s comfy. No right or wrong.',
    teaserTr: 'Hangisi rahatsa o. Doğrusu yanlışı yok.',
    bodyEn: ['Pads are the easiest way to start. Try the others when you feel ready — no rush.'],
    bodyTr: ['Başlamak için en kolayı ped. Diğerlerini hazır hissettiğinde denersin, acele yok.'],
    bulletsEn: ['Pad: sticks to your underwear, change every 4–6 hours', 'Tampon: goes inside, change every 4–8 hours, never leave it in overnight', 'Cup: wash and reuse'],
    bulletsTr: ['Ped: iç çamaşırına yapışır, 4–6 saatte bir değiştir', 'Tampon: içeriden kullanılır, 4–8 saatte bir değiştir, gece takılı bırakma', 'Regl kabı: yıkanıp tekrar kullanılır'] },
  { tagEn: 'CRAMPS', tagTr: 'KRAMP',
    titleEn: 'Cramps? Try this.', titleTr: 'Kramp girdi, ne yapsam?',
    teaserEn: 'Warmth, movement and water usually help.',
    teaserTr: 'Sıcaklık, hareket ve su genelde iş görür.',
    bodyEn: ['Try these:'],
    bodyTr: ['Bunları dene:'],
    bulletsEn: ['A hot water bottle on your tummy, or a warm shower', 'A short walk or some gentle stretching', 'Plenty of water, and don’t skip meals'],
    bulletsTr: ['Karnına sıcak su torbası ya da ılık bir duş', 'Kısa bir yürüyüş ya da hafif esneme', 'Bol su, öğün atlamamak'],
    footEn: 'If the pain keeps you home from school, tell an adult. A doctor can find what works for you.',
    footTr: 'Ağrı yüzünden okula gidemiyorsan bir büyüğüne söyle. Doktor sana uygun bir çözüm bulabilir.' },
  { tagEn: 'TRACKING', tagTr: 'TAKİP',
    titleEn: 'Why keep track?', titleTr: 'Neden not almalı?',
    teaserEn: 'So you can guess when your period’s coming.',
    teaserTr: 'Reglinin ne zaman geleceğini tahmin edebilmek için.',
    bodyEn: [
      'On the day your period starts, tap “My period started”. Lunara counts the rest.',
      'After a few months you’ll roughly know when the next one is due. No more surprises.',
    ],
    bodyTr: [
      'Reglin başladığı gün “Reglim başladı”ya dokun, gerisini Lunara sayar.',
      'Birkaç ay sonra bir sonrakini aşağı yukarı bilirsin. Hazırlıksız yakalanmazsın.',
    ] },
  /* tagEn 'ASK' değişmemeli: ritim kartındaki "3 aydan uzun" uyarısı bu
     kartı tagEn ile buluyor. */
  { tagEn: 'ASK', tagTr: 'YARDIM',
    titleEn: 'When to tell an adult?', titleTr: 'Ne zaman bir büyüğe söylemeli?',
    teaserEn: 'Always tell someone if this happens.',
    teaserTr: 'Şu durumlarda mutlaka anlat.',
    bodyEn: ['If any of these happen, tell an adult you trust or a doctor:'],
    bodyTr: ['Bunlardan biri olursa güvendiğin bir yetişkine ya da doktora söyle:'],
    bulletsEn: [
      'Bleeding so heavy you change a pad every hour',
      'A period that lasts more than 7 days',
      'Pain so bad you can’t go to school',
      'No period at all by age 15–16',
      'Your period not coming for more than 3 months (when not pregnant)',
    ],
    bulletsTr: [
      'Pedi saatte bir değiştirecek kadar çok kanama',
      '7 günden uzun süren regl',
      'Okula gidemeyeceğin kadar ağrı',
      '15–16 yaşına kadar hiç regl olmamak',
      'Reglin 3 aydan uzun süre gelmemesi (gebelik dışında)',
    ],
    footEn: 'Asking for help is nothing to be embarrassed about.',
    footTr: 'Yardım istemek utanılacak bir şey değil.' },
  { tagEn: 'BODY', tagTr: 'BEDEN',
    titleEn: 'What’s happening to my body?', titleTr: 'Bedenimde neler oluyor?',
    teaserEn: 'Puberty can feel weird — everyone goes through it.',
    teaserTr: 'Ergenlik garip gelebilir, ama herkes yaşıyor.',
    bodyEn: [
      'Puberty usually starts between 8 and 13. Starting before or after your friends is normal.',
      'Your first period usually comes about two years after your breasts start to grow. A few months before, you may see white discharge — your body is getting ready.',
    ],
    bodyTr: [
      'Ergenlik genelde 8–13 yaş arasında başlar. Arkadaşlarından önce ya da sonra başlaman normal.',
      'İlk regl çoğu zaman göğüsler gelişmeye başladıktan iki yıl kadar sonra gelir. Ondan birkaç ay önce beyaz bir akıntı görebilirsin, bedenin hazırlanıyor demek.',
    ],
    bulletsEn: ['You grow taller fast', 'Hair appears under your arms and between your legs', 'Sweat smells different, and spots can show up'],
    bulletsTr: ['Boyun hızla uzar', 'Koltuk altında ve bacak arasında tüy çıkar', 'Terinin kokusu değişir, sivilce çıkabilir'] },
  { tagEn: 'BE READY', tagTr: 'HAZIRLIK',
    titleEn: 'Your secret bag kit', titleTr: 'Çantandaki gizli kit',
    teaserEn: 'A tiny pouch saves a big panic.',
    teaserTr: 'Küçük bir kese, büyük bir panikten kurtarır.',
    bodyEn: ['Your first period can come without warning, and it’s usually light — sometimes just a brown mark. Keep these in your bag:'],
    bodyTr: ['İlk regl habersiz gelir ve genelde az olur, bazen sadece kahverengi bir leke gibi görünür. Çantanda şunlar olsun:'],
    bulletsEn: ['A few pads', 'Spare underwear', 'Wet wipes and a small bag'],
    bulletsTr: ['Birkaç ped', 'Yedek iç çamaşırı', 'Islak mendil ve küçük bir poşet'],
    footEn: 'Caught out at school? Tell a teacher or the school nurse. It happens all the time.',
    footTr: 'Okulda hazırlıksız mı yakalandın? Öğretmenine ya da okul hemşiresine söyle. Çok sık olur.' },
  { tagEn: 'MOVE', tagTr: 'HAREKET',
    titleEn: 'Sport on my period?', titleTr: 'Regldeyken spor olur mu?',
    teaserEn: 'Yes! It can even help with cramps.',
    teaserTr: 'Olur! Krampa iyi bile gelebilir.',
    bodyEn: [
      'PE, dance, running — all fine. Gentle movement can ease cramps.',
      'For swimming you need a tampon or a cup, because pads don’t work in water. If you’re really tired, slow down and listen to your body.',
    ],
    bodyTr: [
      'Beden eğitimi, dans, koşu, hepsi serbest. Hafif hareket krampları azaltabilir.',
      'Yüzmek için tampon ya da regl kabı gerekir, çünkü ped suda işe yaramaz. Çok yorgunsan yavaşla, bedenini dinle.',
    ] },
  { tagEn: 'FACTS', tagTr: 'GERÇEKLER',
    titleEn: 'Don’t believe everything', titleTr: 'Duyduğun her şeye inanma',
    teaserEn: 'Five period myths.',
    teaserTr: 'Regl hakkında beş yanlış bilgi.',
    bodyEn: ['None of these are true:'],
    bodyTr: ['Hepsi yanlış:'],
    bulletsEn: [
      '“No showers on your period.” You can — it even helps.',
      '“Every cycle is 28 days.” Nope, 21–45 days is normal.',
      '“No sport on your period.” You can do sport.',
      '“Period blood is dirty.” It isn’t — it means your body is working well.',
      '“Everyone can tell.” Nobody knows unless you tell them.',
    ],
    bulletsTr: [
      '“Regldeyken duş alınmaz.” Alınır, hatta iyi gelir.',
      '“Herkesin döngüsü 28 gün.” Değil, 21–45 gün arası normal.',
      '“Regldeyken spor yapılmaz.” Yapılır.',
      '“Regl kanı kirlidir.” Değil, bedenin sağlıklı çalışıyor demek.',
      '“Regl olduğunu herkes anlar.” Sen söylemedikçe kimse bilmez.',
    ],
    footEn: 'Something on your mind? Just ask.',
    footTr: 'Aklına takılan bir şey mi var? Sor, çekinme.' },
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
              {t(<>Hey {lunara.profile.name}! Your body is finding its <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>rhythm</em>.</>,
                 <>Selam {lunara.profile.name}! Bedenin kendi <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>ritmini</em> buluyor.</>)}
            </h2>
            <p style={{ fontFamily: 'var(--serif)', fontSize: 16, lineHeight: 1.55, color: 'var(--ink-2)', margin: 0 }}>
              {t('No tests here. Lunara helps you understand your body, at your own pace.',
                 'Burada sınav yok. Lunara, bedeninde neler olduğunu kendi hızında anlaman için burada.')}
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
              : t('When your period starts, tap the button below and this page will follow your month with you.',
                  'Reglin başlayınca aşağıdaki düğmeye dokun, bu sayfa ayını seninle takip etsin.')}
          </p>
          {justStarted ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--signal-good)', fontStyle: 'italic', fontFamily: 'var(--serif)' }}>
              <Icon d={ICONS.check} size={14} stroke="var(--signal-good)" sw={2}/> {t('Saved ✓', 'Kaydettim ✓')}
            </span>
          ) : confirming ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>{t('Did your period start today?', 'Reglin bugün mü başladı?')}</span>
              <Btn primary onClick={handlePeriodStart}>{t('Yes', 'Evet')}</Btn>
              <Btn onClick={() => setConfirming(false)}>{t('Not yet', 'Vazgeç')}</Btn>
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
            {t('You can pick more than one. No wrong answers.',
               'Birden fazla seçebilirsin. Yanlış cevap yok.')}
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
          {t('Everyone’s rhythm is different. Yours is just right for you.',
             'Herkesin ritmi farklı. Seninki de tam sana göre.')}
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
          {t('When your period comes, tap “My period started”. In a few months you’ll see your rhythm here.',
             'Reglin gelince “Reglim başladı”ya dokun. Birkaç ay sonra ritmini burada görürsün.')}
        </p>
      ) : (<>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>{t('Your next period, most likely', 'Sonraki reglin büyük ihtimalle')}</div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 24, letterSpacing: '-0.01em', marginBottom: 6 }}>
          {fmt(tah.enErken)} – {fmt(tah.enGec)}
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.5, margin: '0 0 14px' }}>
          {tah.kaynak === 'gozlem'
            ? t(`Your last cycles were ${tah.min}–${tah.max} days, so this is based on that.`, `Son döngülerin ${tah.min}–${tah.max} gün sürdü, tahmin buna göre.`)
            : t(`Not many records yet. In the first years a cycle can be ${tah.min}–${tah.max} days, so the window is wide.`,
                `Henüz az kayıt var. İlk yıllarda döngü ${tah.min}–${tah.max} gün arası değişebildiği için aralık geniş.`)}
        </p>
        {tah.uzunAra ? (
          <div style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--accent-soft)', marginBottom: 14 }}>
            <p style={{ fontSize: 12.5, color: 'var(--ink)', lineHeight: 1.5, margin: '0 0 8px' }}>
              {t(`It’s been ${tah.gecenGun} days since your last period. If it’s been more than 3 months, tell an adult you trust.`,
                 `Son reglinden bu yana ${tah.gecenGun} gün geçti. 3 aydan uzun olduysa güvendiğin bir yetişkine söyle.`)}
            </p>
            <button onClick={onYardim} style={{ padding: 0, border: 'none', background: 'none', cursor: 'pointer',
              fontSize: 12.5, fontWeight: 600, color: 'var(--accent)', fontFamily: 'var(--sans)' }}>
              {t('When to tell an adult? →', 'Ne zaman bir büyüğe söylemeli? →')}
            </button>
          </div>
        ) : tah.aralikGecti ? (
          <p style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.5, margin: '0 0 14px', fontStyle: 'italic', fontFamily: 'var(--serif)' }}>
            {t('Guess was off? Don’t worry, that happens a lot in the first years.',
               'Tahmin tutmadı mı? Dert etme, ilk yıllarda çok sık olur.')}
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
          {t('Pick how you feel each day above. After a few days your pattern shows up here.',
             'Her gün yukarıdan nasıl hissettiğini seç. Birkaç gün sonra düzenin burada görünür.')}
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
            {t('The count starts with your period', 'Sayaç reglinle başlar')}
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
