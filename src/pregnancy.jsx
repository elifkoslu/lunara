import React from 'react';
import { t, useLang } from './i18n';
import { Btn, wrap } from './screens';
import { Card, ICONS, Icon, TODAY_DATE, TODAY_KEY } from './shared';
import { StageDateField } from './stage-date';
import { StageBadge } from './stages';

/* pregnancy.jsx — Lunara · Gebelik (Fa) ana ekranı
   Hafta hafta takip: bebek + anne, tekme sayacı, kilo, randevular.
   screens.jsx (Btn), shared.jsx, stages.jsx (StageBadge), i18n sonrası yüklenir. */
/* eslint-disable */

// Hafta hafta kilometre taşları (2 haftada bir) — boyut karşılaştırması +
// gelişim + "neler gelişiyor" vurguları (hiEn/hiTr) + anne notu
const WEEK_MILESTONES = [
  { w: 4,  fEn: 'a poppy seed', fTr: 'bir haşhaş tohumu', len: 0.4, wt: 1,
    devEn: 'The neural tube and a tiny heart begin to form.', devTr: 'Sinir tüpü ve minik bir kalp oluşmaya başlıyor.',
    hiEn: ['Neural tube closing', 'Placenta starting to form'], hiTr: ['Nöral tüp kapanıyor', 'Plasenta oluşmaya başlıyor'],
    youEn: 'You might just be noticing a missed period.', youTr: 'Belki de yeni adet gecikmesini fark ediyorsun.' },
  { w: 6,  fEn: 'a lentil', fTr: 'bir mercimek', len: 0.6, wt: 1,
    devEn: 'The heart starts beating and basic features appear.', devTr: 'Kalp atmaya başlıyor, temel hatlar beliriyor.',
    hiEn: ['Heartbeat begins', 'Arm & leg buds appear'], hiTr: ['Kalp atışı başlıyor', 'Kol ve bacak tomurcukları beliriyor'],
    youEn: 'Morning sickness may begin.', youTr: 'Sabah bulantısı başlayabilir.' },
  { w: 8,  fEn: 'a raspberry', fTr: 'bir ahududu', len: 1.6, wt: 1,
    devEn: 'Tiny limbs are forming and the heart is beating fast.', devTr: 'Minik kollar bacaklar oluşuyor, kalp hızla atıyor.',
    hiEn: ['Fingers & toes forming', 'Brain growing rapidly'], hiTr: ['Parmaklar oluşuyor', 'Beyin hızla büyüyor'],
    youEn: 'Nausea and tiredness are common now.', youTr: 'Bulantı ve yorgunluk bu dönemde sık.' },
  { w: 10, fEn: 'a strawberry', fTr: 'bir çilek', len: 3.1, wt: 4,
    devEn: 'Vital organs are in place and starting to function.', devTr: 'Hayati organlar yerleşti ve çalışmaya başlıyor.',
    hiEn: ['Nails & hair forming', 'Joints can bend'], hiTr: ['Tırnak ve saç oluşuyor', 'Eklemler bükülebiliyor'],
    youEn: 'Your waistband may start feeling snug.', youTr: 'Beline giysiler dar gelmeye başlayabilir.' },
  { w: 12, fEn: 'a lime', fTr: 'bir misket limonu', len: 5.4, wt: 14,
    devEn: 'Reflexes develop; fingers can open and close.', devTr: 'Refleksler gelişiyor; parmaklar açılıp kapanabiliyor.',
    hiEn: ['Reflexes developing', 'Kidneys make urine'], hiTr: ['Refleksler gelişiyor', 'Böbrekler idrar üretiyor'],
    youEn: 'The first trimester is ending — energy often returns.', youTr: 'İlk trimester bitiyor — enerji çoğu zaman geri gelir.' },
  { w: 14, fEn: 'a lemon', fTr: 'bir limon', len: 8.7, wt: 43,
    devEn: 'Baby can squint, frown and make expressions.', devTr: 'Bebek gözlerini kısabiliyor, yüz ifadeleri yapabiliyor.',
    hiEn: ['Facial muscles working', 'Fine hair (lanugo) appears'], hiTr: ['Yüz kasları çalışıyor', 'İnce tüyler (lanugo) beliriyor'],
    youEn: 'You may feel more like yourself again.', youTr: 'Kendini yeniden daha iyi hissedebilirsin.' },
  { w: 16, fEn: 'an avocado', fTr: 'bir avokado', len: 11.6, wt: 100,
    devEn: 'Baby can make expressions and hear muffled sounds.', devTr: 'Bebek yüz ifadeleri yapabiliyor, boğuk sesleri duyabiliyor.',
    hiEn: ['Can hear muffled sounds', 'Eyes & ears in place'], hiTr: ['Boğuk sesleri duyabiliyor', 'Göz ve kulaklar yerleşti'],
    youEn: 'You may start to feel flutters soon.', youTr: 'Yakında ilk kıpırtıları hissedebilirsin.' },
  { w: 18, fEn: 'a bell pepper', fTr: 'bir biber', len: 14.2, wt: 190,
    devEn: 'Baby is moving, yawning and even hiccuping.', devTr: 'Bebek hareket ediyor, esniyor, hatta hıçkırıyor.',
    hiEn: ['Ears stand out', 'Nerves gaining myelin'], hiTr: ['Kulaklar belirginleşiyor', 'Sinirler miyelinle kaplanıyor'],
    youEn: 'You may feel the first kicks.', youTr: 'İlk tekmeleri hissedebilirsin.' },
  { w: 20, fEn: 'a banana', fTr: 'bir muz', len: 16.4, wt: 300,
    devEn: 'Halfway there — baby is swallowing and growing hair.', devTr: 'Yolun yarısı — bebek yutkunuyor ve saçları çıkıyor.',
    hiEn: ['Halfway point', 'Taste buds forming'], hiTr: ['Yolun yarısı', 'Tat tomurcukları oluşuyor'],
    youEn: 'The anatomy scan usually happens around now.', youTr: 'Ayrıntılı ultrason genelde bu sıralarda yapılır.' },
  { w: 22, fEn: 'a papaya', fTr: 'bir papaya', len: 27.8, wt: 430,
    devEn: 'Senses sharpen — baby can feel touch and hear better.', devTr: 'Duyular keskinleşiyor — bebek dokunuşu hissedip daha iyi duyuyor.',
    hiEn: ['Sense of touch developing', 'Eyebrows forming'], hiTr: ['Dokunma duyusu gelişiyor', 'Kaşlar oluşuyor'],
    youEn: 'Your bump is now clearly showing.', youTr: 'Karnın artık belirgin şekilde görünüyor.' },
  { w: 24, fEn: 'an ear of corn', fTr: 'bir mısır koçanı', len: 30, wt: 600,
    devEn: 'Lungs are developing and baby responds to your voice.', devTr: 'Akciğerler gelişiyor; bebek sesine tepki veriyor.',
    hiEn: ['Lungs developing', 'Responds to sound'], hiTr: ['Akciğerler gelişiyor', 'Sese tepki veriyor'],
    youEn: 'Kicks are stronger and more regular now.', youTr: 'Tekmeler artık daha güçlü ve düzenli.' },
  { w: 26, fEn: 'a head of lettuce', fTr: 'bir marul', len: 35.6, wt: 760,
    devEn: 'Eyes begin to open and baby takes practice breaths.', devTr: 'Gözler açılmaya başlıyor; bebek nefes provası yapıyor.',
    hiEn: ['Eyes opening', 'Brain activity increases'], hiTr: ['Gözler açılıyor', 'Beyin etkinliği artıyor'],
    youEn: 'You might notice Braxton Hicks tightenings.', youTr: 'Braxton Hicks kasılmalarını fark edebilirsin.' },
  { w: 28, fEn: 'an eggplant', fTr: 'bir patlıcan', len: 37.6, wt: 1000,
    devEn: 'Eyes can open; baby has sleep–wake rhythms.', devTr: 'Gözler açılabiliyor; bebeğin uyku–uyanıklık ritmi var.',
    hiEn: ['Sleep–wake cycles', 'Can blink'], hiTr: ['Uyku–uyanıklık döngüsü', 'Göz kırpabiliyor'],
    youEn: 'Third trimester — count kicks daily from now.', youTr: 'Üçüncü trimester — artık her gün tekme say.' },
  { w: 30, fEn: 'a cabbage', fTr: 'bir lahana', len: 39.9, wt: 1300,
    devEn: "Baby's brain and eyesight keep maturing fast.", devTr: 'Bebeğin beyni ve görüşü hızla olgunlaşıyor.',
    hiEn: ['Rapid brain growth', 'Bone marrow makes blood'], hiTr: ['Hızlı beyin gelişimi', 'Kemik iliği kan üretiyor'],
    youEn: 'Heartburn and shortness of breath are common.', youTr: 'Mide yanması ve nefes darlığı yaygın.' },
  { w: 32, fEn: 'a squash', fTr: 'bir kabak', len: 42.4, wt: 1700,
    devEn: 'Baby is practising breathing and gaining fat.', devTr: 'Bebek nefes provası yapıyor ve yağ depoluyor.',
    hiEn: ['Practising breathing', 'Toenails fully formed'], hiTr: ['Nefes provası yapıyor', 'Ayak tırnakları tamam'],
    youEn: 'You may feel more breathless and tired.', youTr: 'Daha çok nefes darlığı ve yorgunluk hissedebilirsin.' },
  { w: 34, fEn: 'a cantaloupe', fTr: 'bir kavun', len: 45, wt: 2100,
    devEn: 'The central nervous system and lungs keep maturing.', devTr: 'Merkezi sinir sistemi ve akciğerler olgunlaşmayı sürdürüyor.',
    hiEn: ['Lungs nearly ready', 'Protective vernix thickens'], hiTr: ['Akciğerler neredeyse hazır', 'Koruyucu verniks kalınlaşıyor'],
    youEn: 'Watch for swelling; rest your legs often.', youTr: 'Ödeme dikkat; bacaklarını sık dinlendir.' },
  { w: 36, fEn: 'a honeydew melon', fTr: 'bir bal kavunu', len: 47.4, wt: 2600,
    devEn: 'Baby is settling head-down, getting ready.', devTr: 'Bebek baş aşağı yerleşiyor, hazırlanıyor.',
    hiEn: ['Often turns head-down', 'Skin smoothing out'], hiTr: ['Genelde baş aşağı dönüyor', 'Cilt pürüzsüzleşiyor'],
    youEn: 'Weekly check-ups usually begin around now.', youTr: 'Haftalık kontroller genelde bu sıralarda başlar.' },
  { w: 38, fEn: 'a pumpkin', fTr: 'bir bal kabağı', len: 49.8, wt: 3100,
    devEn: 'Organs are ready; baby is mostly adding weight.', devTr: 'Organlar hazır; bebek artık çoğunlukla kilo alıyor.',
    hiEn: ['Full-term soon', 'Firm grasp reflex'], hiTr: ['Miada az kaldı', 'Güçlü kavrama refleksi'],
    youEn: 'Pack your hospital bag if you haven’t.', youTr: 'Hastane çantanı henüz hazırlamadıysan hazırla.' },
  { w: 40, fEn: 'a watermelon', fTr: 'bir karpuz', len: 51.2, wt: 3400,
    devEn: 'Full term — baby is ready to meet you.', devTr: 'Miadında — bebek seninle tanışmaya hazır.',
    hiEn: ['Ready to be born', 'Lungs fully mature'], hiTr: ['Doğmaya hazır', 'Akciğerler tam olgun'],
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
  const p = lunara.pregnancy || {};

  /* Tarih girilmeden hafta, trimester ve kalan gün hesaplanamaz. Eskiden
     dueDate sabit bir örnek tarihti, o yüzden bu durum hiç oluşmuyordu ve
     ekran herkese aynı "24. hafta"yı gösteriyordu. */
  if (!p.dueDate) {
    return (
      <div style={{ padding: '18px 36px 48px', display: 'flex', flexDirection: 'column', gap: 22 }}>
        <Card>
          <StageDateField
            label={t('Due date', 'Tahmini doğum tarihi')}
            hint={t('Your weeks, trimester and the nutrition guidance all follow from this date.',
                    'Gebelik haftan, trimesterin ve beslenme önerileri bu tarihten çıkıyor.')}
            value={null} max={undefined}
            onChange={(iso) => api && api.setDueDate(iso)}/>
        </Card>
      </div>
    );
  }

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

      {/* Week-by-week explorer */}
      <WeekExplorer currentWeek={week}/>

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
          <KickHistory kicks={p.kicks}/>
        </Card>

        {/* Weight */}
        <Card>
          <div className="eyebrow" style={{ marginBottom: 14 }}>{t('Weight', 'Kilo')}</div>
          {/* Kilo eskiden sabit 68 ile başlıyordu, yani adımlayıcı hep bir
              sayı buluyordu. Örnek değer kaldırıldı: kullanıcı kendi
              başlangıç kilosunu girene kadar adımlayacak bir şey yok. */}
          {p.weightKg == null ? (
            <input type="number" step="0.1" min="20" max="300" inputMode="decimal"
              aria-label={t('Weight in kg', 'Kilo (kg)')}
              placeholder={t('Enter your weight (kg)', 'Kilonu gir (kg)')}
              onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) api.logWeight(+v.toFixed(1)); }}
              style={{
                border: '1px solid var(--line)', borderRadius: 10, padding: '12px 14px',
                fontFamily: 'var(--sans)', fontSize: 15, color: 'var(--ink)',
                background: 'var(--card)', outline: 'none', width: '100%', boxSizing: 'border-box',
              }}/>
          ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={() => api.logWeight(+(p.weightKg - 0.1).toFixed(1))} style={stepperBtn}>−</button>
            <div style={{ textAlign: 'center', minWidth: 110 }}>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 40, letterSpacing: '-0.02em' }}>{p.weightKg.toFixed(1)}</span>
              <span style={{ fontSize: 14, color: 'var(--muted)', marginLeft: 4 }}>kg</span>
            </div>
            <button onClick={() => api.logWeight(+(p.weightKg + 0.1).toFixed(1))} style={stepperBtn}>+</button>
          </div>
          )}
          <p style={{ fontSize: 12.8, color: 'var(--muted)', lineHeight: 1.5, margin: '16px 0 0' }}>
            {t('Gradual, steady gain is healthy. Your doctor tracks the right range for you.',
               'Kademeli ve istikrarlı artış sağlıklıdır. Sana uygun aralığı doktorun izler.')}
          </p>
        </Card>
      </div>

      {/* Check-up rhythm — general guidance (appointment tracking ships later) */}
      <Card>
        <div className="eyebrow" style={{ marginBottom: 14 }}>{t('Check-up rhythm', 'Kontrol düzeni')}</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {[
            { tag: t('TO W28', 'H28’E DEK'), en: 'A check-up about every 4 weeks', tr: 'Yaklaşık 4 haftada bir kontrol' },
            { tag: t('W28–36', 'H28–36'), en: 'Every 2 weeks as you approach the third trimester’s end', tr: 'Üçüncü trimester ilerledikçe 2 haftada bir' },
            { tag: t('FROM W36', 'H36’DAN'), en: 'Weekly visits until birth', tr: 'Doğuma dek haftalık kontroller' },
          ].map((a, i, arr) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '84px 1fr', gap: 12, alignItems: 'center', padding: '12px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--line-soft)' : 'none' }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.04em', color: 'var(--accent)' }}>{a.tag}</span>
              <span style={{ fontSize: 13.5, color: 'var(--ink)', fontWeight: 500 }}>{t(a.en, a.tr)}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, margin: '12px 0 0', fontStyle: 'italic' }}>
          {t('A general rhythm — your clinician sets your actual schedule.',
             'Genel bir düzendir — gerçek programını hekimin belirler.')}
        </p>
      </Card>

      {/* Tarih girildikten sonra da düzeltilebilsin */}
      <Card>
        <StageDateField
          label={t('Due date', 'Tahmini doğum tarihi')}
          value={p.dueDate} max={undefined}
          onChange={(iso) => api && api.setDueDate(iso)}/>
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

// Browse baby development week by week. Defaults to the current week.
function WeekExplorer({ currentWeek }) {
  const lang = useLang();
  const cur = milestoneFor(currentWeek).w;
  const [sel, setSel] = React.useState(cur);
  React.useEffect(() => { setSel(milestoneFor(currentWeek).w); }, [currentWeek]);
  const m = WEEK_MILESTONES.find(x => x.w === sel) || WEEK_MILESTONES[0];
  const wt = m.wt >= 1000 ? (m.wt / 1000).toFixed(1) + ' kg' : m.wt + ' g';

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
        <div className="eyebrow">{t('Week by week', 'Hafta hafta gelişim')}</div>
        <span style={{ fontSize: 10.5, color: 'var(--muted-2)', fontFamily: 'var(--mono)' }}>{t('This week', 'Bu hafta')} · {currentWeek}</span>
      </div>

      {/* week selector */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '2px 0 12px' }}>
        {WEEK_MILESTONES.map(x => {
          const on = x.w === sel;
          const here = x.w === cur;
          return (
            <button key={x.w} onClick={() => setSel(x.w)} style={{
              flex: '0 0 auto', minWidth: 46, padding: '8px 0', borderRadius: 10, cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              background: on ? 'var(--accent)' : 'var(--bone)', color: on ? 'var(--ivory)' : 'var(--muted)',
              boxShadow: on ? 'none' : (here ? 'inset 0 0 0 1.5px var(--accent)' : 'inset 0 0 0 1px var(--line-soft)'),
            }}>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 16, lineHeight: 1 }}>{x.w}</span>
              <span style={{ fontSize: 8.5, fontFamily: 'var(--mono)', letterSpacing: '0.04em', opacity: 0.85 }}>{here ? t('NOW', 'ŞİMDİ') : t('WK', 'HF')}</span>
            </button>
          );
        })}
      </div>

      {/* selected week detail */}
      <div className="mb-stack" style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 20, alignItems: 'start', marginTop: 6 }}>
        <div style={{ background: 'linear-gradient(155deg, var(--accent-soft) 0%, var(--card) 80%)', borderRadius: 'var(--r-md)', padding: '20px 14px', textAlign: 'center' }}>
          <span className="eyebrow" style={{ fontSize: 9 }}>{t('WEEK', 'HAFTA')}</span>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 44, lineHeight: 1, margin: '2px 0 8px' }}>{m.w}</div>
          <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--accent)', lineHeight: 1.3 }}>{t(m.fEn, m.fTr)}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)', marginTop: 8 }}>{m.len} cm · {wt}</div>
        </div>
        <div>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 16, lineHeight: 1.55, color: 'var(--ink-2)', margin: '0 0 14px' }}>{t(m.devEn, m.devTr)}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            {(lang === 'tr' ? m.hiTr : m.hiEn).map((h, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }}/>
                <span style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>{h}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start', padding: '12px 14px', borderRadius: 'var(--r-md)', background: 'var(--bone)' }}>
            <span style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }}><Icon d={ICONS.heart} size={15}/></span>
            <div>
              <div className="eyebrow" style={{ fontSize: 9, marginBottom: 3 }}>{t('You this week', 'Bu hafta sen')}</div>
              <p style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.5, margin: 0 }}>{t(m.youEn, m.youTr)}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Last 14 days of daily kick counts as small bars.
function KickHistory({ kicks }) {
  const lang = useLang();
  const today = new Date(TODAY_DATE);
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    days.push({ key, count: kicks[key] || 0, isToday: i === 0, dom: d.getDate() });
  }
  const max = Math.max(1, ...days.map(d => d.count));
  const activeDays = days.filter(d => d.count > 0).length;

  return (
    <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--line-soft)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <span className="eyebrow">{t('Last 14 days', 'Son 14 gün')}</span>
        <span style={{ fontSize: 10.5, color: 'var(--muted-2)', fontFamily: 'var(--mono)' }}>{activeDays} {t('days logged', 'gün kayıtlı')}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 62 }}>
        {days.map(d => {
          const h = d.count === 0 ? 3 : Math.max(7, Math.round((d.count / max) * 58));
          return (
            <div key={d.key} title={`${d.dom} · ${d.count} ${t('kicks', 'tekme')}`}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 5 }}>
              <div style={{ width: '100%', height: h, borderRadius: 4, background: d.count ? (d.isToday ? 'var(--accent)' : 'var(--accent-soft)') : 'var(--line-soft)' }}/>
              {d.isToday && <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--accent)' }}/>}
            </div>
          );
        })}
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
