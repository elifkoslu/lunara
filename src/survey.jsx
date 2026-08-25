import React from 'react';
import { I18N, t } from './i18n';
import { evreOner, sonrakiSoru } from './stage-survey.js';
import { Card, ICONS, Icon } from './shared';
import { STAGES } from './stages';

/* survey.jsx — "hangi dönemdesin" anketinin ekranı.
   Karar mantığı stage-survey.js'te ve testli; burası yalnızca sunum.

   Yedi seçenekli liste, kişiden kendi durumunu bir kategoriye çevirmesini
   istiyordu. Burada somut sorular soruyoruz: gebe misin, adet görüyor musun,
   yaş aralığın. Kategoriye çevirmeyi uygulama yapıyor.

   Çoğu yol 2–3 soruda bitiyor: gebelik tek soru, düzenli döngü iki. */
/* eslint-disable */

/* Perimenopoz çıkanları yönlendireceğimiz uygulamanın adresi.
   BOŞ BIRAKILIRSA yönlendirme bağlantısı gösterilmez, yalnızca öneri metni
   çıkar — çalışmayan bir bağlantı göstermektense hiç göstermemek iyi. */
const WOMENTUM_URL = '';

const SORULAR = {
  durum: {
    en: 'Are you pregnant now, or did you give birth in the last year?',
    tr: 'Şu an gebe misin, ya da son bir yılda doğum yaptın mı?',
    alan: 'durum',
    secenekler: [
      { v: 'gebe',    en: 'I’m pregnant',                    tr: 'Gebeyim' },
      { v: 'dogum',   en: 'I gave birth in the last year',   tr: 'Son bir yılda doğum yaptım' },
      { v: 'hicbiri', en: 'Neither',                         tr: 'İkisi de değil' },
    ],
  },
  adet: {
    en: 'How are your periods these days?',
    tr: 'Adet durumun bugünlerde nasıl?',
    alan: 'adet',
    secenekler: [
      { v: 'duzenli',  en: 'Fairly regular — I can roughly predict them',
                       tr: 'Düzenli sayılır — aşağı yukarı tahmin edebiliyorum' },
      { v: 'duzensiz', en: 'They used to be regular, lately they’ve become irregular',
                       tr: 'Eskiden düzenliydi, son zamanlarda düzensizleşti' },
      { v: 'yok12',    en: 'I haven’t had one for more than 12 months',
                       tr: '12 aydan uzun süredir hiç görmüyorum' },
      { v: 'yeni',     en: 'They haven’t started yet, or started in the last couple of years',
                       tr: 'Henüz başlamadı ya da son birkaç yılda başladı' },
    ],
  },
  deniyor: {
    en: 'Are you trying to conceive, or planning to soon?',
    tr: 'Gebe kalmayı deniyor ya da yakında planlıyor musun?',
    alan: 'deniyor',
    secenekler: [
      { v: true,  en: 'Yes', tr: 'Evet' },
      { v: false, en: 'No',  tr: 'Hayır' },
    ],
  },
  yas: {
    en: 'Which age range are you in?',
    tr: 'Hangi yaş aralığındasın?',
    // Kesin yaş yerine aralık: karar için yeterli, daha az mahrem.
    alan: 'yasAraligi',
    secenekler: [
      { v: 'alt40', en: 'Under 40', tr: '40 altı' },
      { v: '40-45', en: '40–45',    tr: '40–45' },
      { v: '45-55', en: '45–55',    tr: '45–55' },
      { v: 'ust55', en: 'Over 55',  tr: '55 üstü' },
    ],
  },
  belirtiler: {
    en: 'Do you have any of these?',
    tr: 'Bunlardan hangileri var?',
    alan: 'belirtiler',
    coklu: true,
    secenekler: [
      { v: 'sicak',   en: 'Hot flushes',        tr: 'Sıcak basması' },
      { v: 'geceTer', en: 'Night sweats',       tr: 'Gece terlemesi' },
      { v: 'uyku',    en: 'Broken sleep',       tr: 'Bölünen uyku' },
      { v: 'kuruluk', en: 'Vaginal dryness',    tr: 'Vajinal kuruluk' },
      { v: 'ruhHali', en: 'Mood swings',        tr: 'Ruh hali dalgalanması' },
    ],
  },
  engeller: {
    // Bu soru olmadan uygulama emziren birine "menopozdasın" derdi.
    en: 'Could any of these be why your periods stopped?',
    tr: 'Adetinin kesilmesinin sebebi bunlardan biri olabilir mi?',
    alan: 'engeller',
    coklu: true,
    secenekler: [
      { v: 'spiral',      en: 'Hormonal IUD',              tr: 'Hormonlu spiral' },
      { v: 'dogumKontrol',en: 'Hormonal contraception',    tr: 'Hormonal doğum kontrolü' },
      { v: 'ameliyat',    en: 'Uterine surgery',           tr: 'Rahim ameliyatı' },
      { v: 'emzirme',     en: 'Breastfeeding',             tr: 'Emzirme' },
    ],
  },
};

// Sonuç ekranındaki "neden bu" maddeleri
const GEREKCE = {
  gebe:              { en: 'you’re pregnant', tr: 'gebesin' },
  sonBirYilDogum:    { en: 'you gave birth in the last year', tr: 'son bir yılda doğum yaptın' },
  yeniAdet:          { en: 'your cycles are new', tr: 'döngülerin yeni başladı' },
  duzenliAdet:       { en: 'regular cycles', tr: 'düzenli döngü' },
  gebeKalmakIstiyor: { en: 'you’re trying to conceive', tr: 'gebe kalmayı deniyorsun' },
  duzensizAdet:      { en: 'cycles that have become irregular', tr: 'düzensizleşen döngü' },
  belirtiler:        { en: 'the symptoms you marked', tr: 'işaretlediğin belirtiler' },
  kirkAlti:          { en: 'you’re under 40', tr: '40 yaşın altındasın' },
  adetYok:           { en: 'no periods', tr: 'adet görmüyorsun' },
  adetYok12Ay:       { en: 'no periods for over 12 months', tr: '12 aydan uzun süredir adet yok' },
  kanamaEngeli:      { en: 'something that can stop bleeding', tr: 'kanamayı kesebilecek bir durum' },
  'yas40-45':        { en: 'age 40–45', tr: '40–45 yaş' },
  'yas45-55':        { en: 'age 45–55', tr: '45–55 yaş' },
  yasust55:          { en: 'age over 55', tr: '55 üstü yaş' },
};

// Dikkat çekilmesi gereken durumlar
const NOTLAR = {
  kirkAltiDuzensiz: {
    en: 'Under 40, irregular cycles have many possible causes — thyroid, PCOS, stress, medication. This is worth raising with a clinician rather than assuming perimenopause.',
    tr: '40 yaşın altında düzensiz döngünün pek çok sebebi olabilir — tiroid, PKOS, stres, ilaçlar. Bunu perimenopoz varsaymak yerine bir hekime danışmakta fayda var.',
  },
  kirkAltiAdetYok: {
    en: 'Under 40, periods stopping for a year is not usually menopause and is worth investigating with a clinician.',
    tr: '40 yaşın altında adetin bir yıl kesilmesi genellikle menopoz değildir; bir hekimle araştırmakta fayda var.',
  },
  engelVarAdetYok: {
    en: 'A hormonal IUD, contraception, uterine surgery or breastfeeding can stop bleeding on their own — that is not the same as menopause.',
    tr: 'Hormonlu spiral, doğum kontrolü, rahim ameliyatı ya da emzirme kanamayı kendi başına kesebilir — bu menopozla aynı şey değildir.',
  },
};

const tx = (o) => (o ? t(o.en, o.tr) : '');

function StageSurvey({ onSecildi, onElleSec }) {
  const [cevaplar, setCevaplar] = React.useState({});
  const [gecmis, setGecmis] = React.useState([]);
  const [coklu, setCoklu] = React.useState([]);

  const anahtar = sonrakiSoru(cevaplar);
  const sonuc = anahtar == null ? evreOner(cevaplar) : null;

  const cevapla = (alan, deger) => {
    setGecmis(g => g.concat([cevaplar]));
    setCevaplar(c => ({ ...c, [alan]: deger }));
    setCoklu([]);
  };
  const geri = () => {
    if (!gecmis.length) return;
    setCevaplar(gecmis[gecmis.length - 1]);
    setGecmis(g => g.slice(0, -1));
    setCoklu([]);
  };

  if (sonuc && sonuc.stage) return (
    <SonucEkrani sonuc={sonuc} onBasla={() => onSecildi(sonuc.stage, cevaplar)} onGeri={geri} onElleSec={onElleSec}/>
  );

  const soru = SORULAR[anahtar];
  if (!soru) return null;

  const adim = gecmis.length + 1;

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 12 }}>
        <span className="eyebrow">{t(`Question ${adim}`, `${adim}. soru`)}</span>
        {gecmis.length > 0 && (
          <button onClick={geri} style={{
            fontSize: 12, color: 'var(--muted)', background: 'transparent', border: 'none',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, padding: 0,
          }}>‹ {t('Back', 'Geri')}</button>
        )}
      </div>

      <h2 className="serif-display" style={{
        fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 25, lineHeight: 1.25,
        margin: '0 0 20px', letterSpacing: '-0.015em', textWrap: 'pretty',
      }}>{tx(soru)}</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {soru.secenekler.map(s => {
          const secili = soru.coklu && coklu.indexOf(s.v) !== -1;
          return (
            <button key={String(s.v)}
              onClick={() => soru.coklu
                ? setCoklu(c => c.indexOf(s.v) !== -1 ? c.filter(x => x !== s.v) : c.concat([s.v]))
                : cevapla(soru.alan, s.v)}
              aria-pressed={soru.coklu ? secili : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left',
                padding: '15px 17px', borderRadius: 14, cursor: 'pointer', border: 'none',
                background: secili ? 'var(--accent-soft)' : 'var(--bone)',
                boxShadow: secili ? 'inset 0 0 0 1.5px var(--accent)' : 'inset 0 0 0 1px var(--line-soft)',
                fontSize: 14.5, color: 'var(--ink)', fontFamily: 'var(--sans)', lineHeight: 1.4,
              }}>
              {soru.coklu && (
                <span style={{
                  width: 19, height: 19, borderRadius: 6, flexShrink: 0,
                  background: secili ? 'var(--accent)' : 'transparent',
                  boxShadow: secili ? 'none' : 'inset 0 0 0 1.5px var(--line)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{secili && <Icon d={ICONS.check} size={12} stroke="var(--ivory)" sw={2.5}/>}</span>
              )}
              {tx(s)}
            </button>
          );
        })}
      </div>

      {soru.coklu && (
        <button onClick={() => cevapla(soru.alan, coklu)} style={{
          marginTop: 16, width: '100%', padding: '14px', borderRadius: 999, border: 'none',
          background: 'var(--ink)', color: 'var(--ivory)', fontSize: 14, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'var(--sans)',
        }}>
          {coklu.length === 0 ? t('None of these', 'Hiçbiri') : t('Continue', 'Devam')}
        </button>
      )}

      {onElleSec && (
        <button onClick={onElleSec} style={{
          marginTop: 18, fontSize: 12, color: 'var(--muted-2)', background: 'transparent',
          border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--sans)',
        }}>{t('I know where I am — let me choose', 'Nerede olduğumu biliyorum, kendim seçeyim')}</button>
      )}
    </Card>
  );
}

/* Sonuç bir teşhis değil. "Cevapların en çok şuna uyuyor" diye sunuluyor,
   gerekçesiyle birlikte, ve her zaman değiştirilebiliyor. */
function SonucEkrani({ sonuc, onBasla, onGeri, onElleSec }) {
  const evre = STAGES[sonuc.stage] || {};
  const ad = t(evre.en || sonuc.stage, evre.tr || sonuc.stage);
  const gerekceler = sonuc.gerekce.map(g => tx(GEREKCE[g])).filter(Boolean);
  const not = sonuc.not ? NOTLAR[sonuc.not] : null;

  return (
    <Card>
      <div className="eyebrow" style={{ marginBottom: 10 }}>{t('Your answers suggest', 'Cevapların şuna uyuyor')}</div>
      <h2 className="serif-display" style={{
        fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 32, margin: '0 0 12px', letterSpacing: '-0.02em',
      }}>{ad}</h2>

      {gerekceler.length > 0 && (
        <p style={{ fontFamily: 'var(--serif)', fontSize: 15.5, lineHeight: 1.55, color: 'var(--ink-2)', margin: '0 0 16px' }}>
          {t('Because of: ', 'Şunlar için: ')}{gerekceler.join(t(', ', ', '))}.
        </p>
      )}

      {not && (
        <p style={{
          fontSize: 13, lineHeight: 1.55, color: 'var(--ink-2)', margin: '0 0 18px',
          padding: '13px 15px', borderRadius: 12, background: 'var(--bone)',
          borderLeft: '3px solid var(--accent)',
        }}>{tx(not)}</p>
      )}

      {sonuc.womentum && (
        <div style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--accent-soft)', marginBottom: 18 }}>
          <p style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--ink)', margin: 0 }}>
            {t('There is a companion app built just for this stage — Womentum, focused on perimenopause and hormone therapy. Lunara covers it too, so either works.',
               'Tam bu dönem için ayrı bir uygulama var — Womentum, perimenopoz ve hormon tedavisine odaklı. Lunara da bu dönemi kapsıyor, ikisi de olur.')}
          </p>
          {WOMENTUM_URL && (
            <a href={WOMENTUM_URL} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10,
              fontSize: 13, fontWeight: 600, color: 'var(--accent)', textDecoration: 'none',
            }}>{t('Open Womentum', 'Womentum’u aç')} <Icon d={ICONS.arrow} size={12}/></a>
          )}
        </div>
      )}

      <button onClick={onBasla} style={{
        width: '100%', padding: '14px', borderRadius: 999, border: 'none',
        background: 'var(--ink)', color: 'var(--ivory)', fontSize: 14.5, fontWeight: 600,
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        fontFamily: 'var(--sans)',
      }}>
        {t(`Start with ${ad}`, `${ad} ile başla`)} <Icon d={ICONS.arrow} size={15} sw={2}/>
      </button>

      <div style={{ display: 'flex', gap: 18, justifyContent: 'center', marginTop: 14, flexWrap: 'wrap' }}>
        <button onClick={onGeri} style={{
          fontSize: 12.5, color: 'var(--muted)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
        }}>{t('Change my answers', 'Cevaplarımı değiştir')}</button>
        {onElleSec && (
          <button onClick={onElleSec} style={{
            fontSize: 12.5, color: 'var(--muted)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
          }}>{t('Pick a different stage', 'Başka bir dönem seç')}</button>
        )}
      </div>
    </Card>
  );
}

export { StageSurvey, SonucEkrani, WOMENTUM_URL };
