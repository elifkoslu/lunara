import React from 'react';
import { t, useLang } from './i18n';
import { SEED_CYCLE, SeedCycle } from './nourish';
import { pregnancyWeek, trimesterOf } from './pregnancy';
import { ScreenHead } from './screens';
import { Card, ICONS, Icon } from './shared';

/* nourish-stages.jsx — Lunara · evreye özel Beslenme & hareket içeriği
   Gebelik (trimester) ve Gebe kalma (TTC) için döngü-fazı yerine evreye
   uygun rehber. Renkler var(--accent) üzerinden evre tonunu izler.
   nourish.jsx, pregnancy.jsx (pregnancyWeek/trimesterOf), i18n sonrası yüklenir. */
/* eslint-disable */

// Pregnancy guide by trimester (1/2/3)
const PREG_NOURISH = {
  1: {
    move: { hEn: 'Gentle & steady', hTr: 'Nazik & istikrarlı',
      items: [
        { en: 'Walking', tr: 'Yürüyüş', bEn: '20–30 min most days, easy pace.', bTr: 'Çoğu gün 20–30 dk, rahat tempo.' },
        { en: 'Prenatal yoga', tr: 'Gebelik yogası', bEn: 'Eases nausea and tension.', bTr: 'Bulantı ve gerginliği azaltır.' },
        { en: 'Pelvic floor (Kegels)', tr: 'Pelvik taban (Kegel)', bEn: 'Start the habit early.', bTr: 'Alışkanlığa erken başla.' },
      ],
      avoidEn: 'Avoid contact sports, overheating (hot yoga/saunas) and fall-risk activities.',
      avoidTr: 'Temas sporları, aşırı ısınma (sıcak yoga/sauna) ve düşme riski olan aktivitelerden kaçın.' },
    eat: { hEn: 'Folate & easing nausea', hTr: 'Folat & bulantıyı hafifletme',
      items: [
        { en: 'Folate-rich foods', tr: 'Folattan zengin besinler', bEn: 'Leafy greens, lentils + your folic acid.', bTr: 'Yeşil yapraklılar, mercimek + folik asidin.' },
        { en: 'Small frequent meals', tr: 'Az ve sık öğün', bEn: 'Crackers, ginger help morning sickness.', bTr: 'Kraker, zencefil sabah bulantısına iyi gelir.' },
        { en: 'Hydration', tr: 'Bol sıvı', bEn: 'Water and broths, sip often.', bTr: 'Su ve çorba, sık sık yudumla.' },
      ],
      noteEn: 'Avoid raw/undercooked meat & eggs, unpasteurised dairy, high-mercury fish and alcohol.',
      noteTr: 'Çiğ/az pişmiş et ve yumurta, pastörize olmayan süt, yüksek cıvalı balık ve alkolden kaçın.' },
  },
  2: {
    move: { hEn: 'Build strength', hTr: 'Güçlen',
      items: [
        { en: 'Walking & swimming', tr: 'Yürüyüş & yüzme', bEn: 'Low-impact, great for circulation.', bTr: 'Düşük etkili, dolaşıma çok iyi.' },
        { en: 'Prenatal strength', tr: 'Gebelik kuvvet', bEn: 'Light weights, focus on posture.', bTr: 'Hafif ağırlık, duruşa odaklan.' },
        { en: 'Pelvic floor', tr: 'Pelvik taban', bEn: 'Daily — supports later birth.', bTr: 'Her gün — doğuma destek olur.' },
      ],
      avoidEn: 'Avoid exercises lying flat on your back and anything with a fall risk.',
      avoidTr: 'Sırtüstü düz yatarak yapılan egzersizlerden ve düşme riski olanlardan kaçın.' },
    eat: { hEn: 'Calcium, iron & DHA', hTr: 'Kalsiyum, demir & DHA',
      items: [
        { en: 'Calcium + vitamin D', tr: 'Kalsiyum + D vitamini', bEn: 'Dairy, fortified foods for baby’s bones.', bTr: 'Süt ürünleri, zenginleştirilmiş besinler — bebeğin kemikleri.' },
        { en: 'Iron + vitamin C', tr: 'Demir + C vitamini', bEn: 'Red meat/lentils with citrus to absorb.', bTr: 'Kırmızı et/mercimek + narenciye ile emilim.' },
        { en: 'Omega-3 (DHA)', tr: 'Omega-3 (DHA)', bEn: 'Low-mercury fish supports brain growth.', bTr: 'Düşük cıvalı balık beyin gelişimini destekler.' },
      ],
      noteEn: 'Keep food-safety habits and limit caffeine to about one cup a day.',
      noteTr: 'Gıda güvenliği alışkanlıklarını sürdür; kafeini günde ~bir fincanla sınırla.' },
  },
  3: {
    move: { hEn: 'Stay mobile, rest more', hTr: 'Hareketli kal, çok dinlen',
      items: [
        { en: 'Walking', tr: 'Yürüyüş', bEn: 'Shorter, frequent walks.', bTr: 'Daha kısa, sık yürüyüşler.' },
        { en: 'Prenatal yoga & stretching', tr: 'Gebelik yogası & esneme', bEn: 'Hips and breathing for birth prep.', bTr: 'Kalça ve nefes — doğuma hazırlık.' },
        { en: 'Pelvic floor + perineal prep', tr: 'Pelvik taban + perine hazırlığı', bEn: 'As advised by your midwife.', bTr: 'Ebenin önerisine göre.' },
      ],
      avoidEn: 'Avoid high intensity, lying flat for long, and overdoing it — rest is part of the plan.',
      avoidTr: 'Yüksek yoğunluk, uzun süre düz yatma ve aşırıya kaçmaktan kaçın — dinlenmek de plandandır.' },
    eat: { hEn: 'Iron, protein & comfort', hTr: 'Demir, protein & rahatlık',
      items: [
        { en: 'Iron-rich foods', tr: 'Demirden zengin besinler', bEn: 'Supports you for birth and recovery.', bTr: 'Doğum ve toparlanma için seni destekler.' },
        { en: 'Smaller, frequent meals', tr: 'Az ve sık öğün', bEn: 'Eases reflux as space gets tight.', bTr: 'Yer daraldıkça reflüyü hafifletir.' },
        { en: 'Protein + fibre + water', tr: 'Protein + lif + su', bEn: 'Steadies energy and digestion.', bTr: 'Enerjiyi ve sindirimi dengeler.' },
      ],
      noteEn: 'Continue food-safety habits; ask your doctor before any new supplement.',
      noteTr: 'Gıda güvenliğini sürdür; yeni takviye öncesi doktoruna sor.' },
  },
};

const TTC_NOURISH = {
  move: { hEn: 'Moderate & regular', hTr: 'Ölçülü & düzenli',
    items: [
      { en: 'Walking & light cardio', tr: 'Yürüyüş & hafif kardiyo', bEn: '30 min most days supports ovulation.', bTr: 'Çoğu gün 30 dk ovülasyonu destekler.' },
      { en: 'Strength training', tr: 'Kuvvet antrenmanı', bEn: '2–3× a week, moderate.', bTr: 'Haftada 2–3, orta yoğunluk.' },
      { en: 'Yoga & stress relief', tr: 'Yoga & stres azaltma', bEn: 'Lower stress helps a regular cycle.', bTr: 'Düşük stres düzenli döngüye yardım eder.' },
    ],
    avoidEn: 'Avoid over-training — very intense exercise can disrupt ovulation.',
    avoidTr: 'Aşırı antrenmandan kaçın — çok yoğun egzersiz ovülasyonu bozabilir.' },
  eat: { hEn: 'Fertility-supporting plate', hTr: 'Doğurganlığı destekleyen tabak',
    items: [
      { en: 'Folic acid early', tr: 'Erkenden folik asit', bEn: '400–800 mcg before conceiving.', bTr: 'Gebe kalmadan önce 400–800 mcg.' },
      { en: 'Whole grains & healthy fats', tr: 'Tam tahıl & sağlıklı yağlar', bEn: 'Olive oil, nuts, avocado.', bTr: 'Zeytinyağı, kuruyemiş, avokado.' },
      { en: 'Plant + lean protein, iron', tr: 'Bitkisel + yağsız protein, demir', bEn: 'Lentils, fish, leafy greens.', bTr: 'Mercimek, balık, yeşil yapraklılar.' },
    ],
    noteEn: 'Limit trans fats, excess caffeine and alcohol while trying.',
    noteTr: 'Denerken trans yağ, fazla kafein ve alkolü sınırla.' },
};

const POSTPARTUM_NOURISH = {
  move: { hEn: 'Gentle recovery', hTr: 'Nazik iyileşme',
    items: [
      { en: 'Short, slow walks', tr: 'Kısa, yavaş yürüyüşler', bEn: 'Start gently and build up as you heal.', bTr: 'Nazik başla, iyileştikçe artır.' },
      { en: 'Pelvic floor & breathing', tr: 'Pelvik taban & nefes', bEn: 'Reconnect the core gently, no strain.', bTr: 'Karnı nazikçe yeniden bağla, zorlama.' },
      { en: 'Posture & stretching', tr: 'Duruş & esneme', bEn: 'Eases feeding-related neck and back tension.', bTr: 'Beslemeye bağlı boyun/sırt gerginliğini azaltır.' },
    ],
    avoidEn: 'Avoid high-impact exercise and hard core work until your clinician clears you (around 6 weeks).',
    avoidTr: 'Hekimin onaylayana kadar (yaklaşık 6 hafta) yüksek etkili egzersiz ve ağır karın çalışmasından kaçın.' },
  eat: { hEn: 'Heal & nourish', hTr: 'İyileş & beslen',
    items: [
      { en: 'Iron & protein', tr: 'Demir & protein', bEn: 'Replace blood loss and repair tissue.', bTr: 'Kan kaybını yerine koyar, dokuyu onarır.' },
      { en: 'Fluids (more if nursing)', tr: 'Bol sıvı (emziriyorsan daha çok)', bEn: 'Keep a water bottle by the feeding chair.', bTr: 'Besleme koltuğunun yanına bir matara koy.' },
      { en: 'Fibre + healthy fats', tr: 'Lif + sağlıklı yağlar', bEn: 'Eases constipation; supports milk and mood.', bTr: 'Kabızlığı hafifletir; sütü ve ruh halini destekler.' },
    ],
    noteEn: 'If breastfeeding, you need extra calories and fluids — eat regularly, even one-handed snacks count.',
    noteTr: 'Emziriyorsan ekstra kalori ve sıvıya ihtiyacın var — düzenli ye, tek elle atıştırmalıklar bile sayılır.' },
};

// Tek-rehberli evreler için başlık + içerik
const MENO_NOURISH = {
  move: { hEn: 'Strong & steady', hTr: 'Güçlü & istikrarlı',
    items: [
      { en: 'Strength training', tr: 'Kuvvet antrenmanı', bEn: '2–3× a week protects bone and muscle.', bTr: 'Haftada 2–3 kez kemik ve kası korur.' },
      { en: 'Weight-bearing cardio', tr: 'Ağırlık taşıyan kardiyo', bEn: 'Brisk walking supports heart and bones.', bTr: 'Tempolu yürüyüş kalbi ve kemikleri destekler.' },
      { en: 'Balance & yoga', tr: 'Denge & yoga', bEn: 'Reduces fall risk and eases stiffness.', bTr: 'Düşme riskini azaltır, tutukluğu hafifletir.' },
    ],
    avoidEn: 'Don’t skip resistance work — it’s the strongest protector of bone after menopause.',
    avoidTr: 'Direnç çalışmasını atlama — menopoz sonrası kemiğin en güçlü koruyucusudur.' },
  eat: { hEn: 'Bone & heart plate', hTr: 'Kemik & kalp tabağı',
    items: [
      { en: 'Calcium + vitamin D', tr: 'Kalsiyum + D vitamini', bEn: 'Dairy, greens, fortified foods for bone.', bTr: 'Süt, yeşillik, zenginleştirilmiş besinler — kemik.' },
      { en: 'Protein at each meal', tr: 'Her öğünde protein', bEn: 'Preserves muscle as metabolism shifts.', bTr: 'Metabolizma değişirken kası korur.' },
      { en: 'Fibre & healthy fats', tr: 'Lif & sağlıklı yağlar', bEn: 'Whole grains, olive oil, fish for the heart.', bTr: 'Tam tahıl, zeytinyağı, balık — kalp için.' },
    ],
    noteEn: 'Limit alcohol, caffeine and spicy food if they trigger hot flushes.',
    noteTr: 'Sıcak basmasını tetikliyorsa alkol, kafein ve baharatlı yiyeceği sınırla.' },
};

const MENARCHE_NOURISH = {
  move: { hEn: 'Gentle & fun', hTr: 'Nazik & keyifli',
    items: [
      { en: 'Move in a way you enjoy', tr: 'Sevdiğin şekilde hareket et', bEn: 'Walking, cycling, dancing, any sport you like.', bTr: 'Yürüyüş, bisiklet, dans, sevdiğin herhangi bir spor.' },
      { en: 'Stretch & relax', tr: 'Esne & gevşe', bEn: 'Easy stretches help cramps and tension.', bTr: 'Hafif esnemeler kramp ve gerginliğe iyi gelir.' },
      { en: 'Rest when tired', tr: 'Yorgunken dinlen', bEn: 'Especially on your period — listen to your body.', bTr: 'Özellikle reglinde — bedenini dinle.' },
    ],
    avoidEn: 'There’s no need to push hard or follow any plan — moving should feel good, not like a chore.',
    avoidTr: 'Kendini zorlaman ya da bir plana uyman gerekmez — hareket bir yük değil, keyif olmalı.' },
  eat: { hEn: 'Balanced & iron', hTr: 'Dengeli & demir',
    items: [
      { en: 'Iron-rich foods', tr: 'Demirden zengin besinler', bEn: 'Red meat, beans, spinach — helpful around your period.', bTr: 'Kırmızı et, kuru baklagiller, ıspanak — regl döneminde faydalı.' },
      { en: 'Calcium for growing bones', tr: 'Büyüyen kemikler için kalsiyum', bEn: 'Milk, yogurt, cheese or fortified options.', bTr: 'Süt, yoğurt, peynir ya da zenginleştirilmiş seçenekler.' },
      { en: 'Regular meals + water', tr: 'Düzenli öğün + su', bEn: 'Don’t skip breakfast; steady energy helps mood.', bTr: 'Kahvaltıyı atlama; dengeli enerji ruh halini destekler.' },
    ],
    noteEn: 'No diets needed — variety and regular meals are what a growing body needs most.',
    noteTr: 'Diyete gerek yok — büyüyen bir bedenin en çok ihtiyacı çeşitlilik ve düzenli öğünler.' },
};

// Tek-rehberli evreler için başlık + içerik
const SINGLE_NOURISH = {
  menarche:   { guide: MENARCHE_NOURISH,   eyebrowEn: 'FIRST CYCLES · MOVEMENT & FOOD',       eyebrowTr: 'İLK DÖNEMLER · HAREKET & BESLENME', tagEn: 'Gentle habits', tagTr: 'Nazik alışkanlıklar' },
  ttc:        { guide: TTC_NOURISH,        eyebrowEn: 'PREPARING · MOVEMENT & FOOD', eyebrowTr: 'HAZIRLIK · HAREKET & BESLENME', tagEn: 'Fertility support', tagTr: 'Doğurganlık desteği' },
  postpartum: { guide: POSTPARTUM_NOURISH, eyebrowEn: 'POSTPARTUM · MOVEMENT & FOOD',          eyebrowTr: 'DOĞUM SONRASI · HAREKET & BESLENME', tagEn: 'Recovery support', tagTr: 'İyileşme desteği' },
  menopause:  { guide: MENO_NOURISH,       eyebrowEn: 'MENOPAUSE · MOVEMENT & FOOD',           eyebrowTr: 'MENOPOZ · HAREKET & BESLENME', tagEn: 'Bone & heart', tagTr: 'Kemik & kalp' },
};

function NourishGuideCard({ kind, g }) {
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--bone)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon d={kind === 'move' ? ICONS.pulse : ICONS.leaf} size={16} stroke="var(--accent)"/>
        </span>
        <div className="eyebrow">{kind === 'move' ? t('Movement', 'Hareket') : t('Nutrition', 'Beslenme')}</div>
      </div>
      <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 23, margin: '6px 0 16px', letterSpacing: '-0.01em' }}>{t(g.hEn, g.hTr)}</h3>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {g.items.map((it, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: i < g.items.length - 1 ? '1px solid var(--line-soft)' : 'none' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', marginTop: 7, flexShrink: 0 }}/>
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)' }}>{t(it.en, it.tr)}</div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.45 }}>{t(it.bEn, it.bTr)}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: 12, background: kind === 'move' ? 'var(--bone)' : 'var(--accent-soft)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <Icon d={kind === 'move' ? ICONS.spark : ICONS.drop} size={15} stroke="var(--ink-2)" sw={1.6}/>
        <span style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.5 }}>{kind === 'move' ? t(g.avoidEn, g.avoidTr) : t(g.noteEn, g.noteTr)}</span>
      </div>
    </Card>
  );
}

function StageNourishView({ stageKey, lunara }) {
  useLang();
  if (stageKey === 'pregnancy') {
    const { week } = pregnancyWeek(lunara.pregnancy.dueDate);
    const tri = trimesterOf(week);
    const [sel, setSel] = React.useState(tri);
    const g = PREG_NOURISH[sel];
    const triLabel = n => t(['', 'First', 'Second', 'Third'][n] + ' trimester', ['', 'Birinci', 'İkinci', 'Üçüncü'][n] + ' trimester');
    return (
      <div style={{ padding: '18px 36px 48px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <ScreenHead eyebrow={t(`WEEK ${week} · MOVEMENT & FOOD`, `${week}. HAFTA · HAREKET & BESLENME`)} title={t('Nourish & move', 'Beslenme ve hareket')}
          right={<span style={{ fontSize: 12.5, color: 'var(--muted)', fontStyle: 'italic', fontFamily: 'var(--serif)' }}>{triLabel(tri)}</span>} />
        {/* Trimester selector */}
        <div className="mb-phasesel" style={{ display: 'flex', gap: 10 }}>
          {[1, 2, 3].map(n => {
            const on = sel === n;
            return (
              <button key={n} onClick={() => setSel(n)} style={{
                flex: 1, padding: '12px 10px', borderRadius: 14, textAlign: 'left', cursor: 'pointer',
                background: on ? 'var(--card)' : 'var(--bone)',
                boxShadow: on ? 'var(--shadow-soft)' : 'none',
                border: `1px solid ${on ? 'var(--line)' : 'transparent'}`,
                borderTop: `3px solid ${on ? 'var(--accent)' : 'transparent'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 13.5, fontWeight: on ? 700 : 500, color: on ? 'var(--ink)' : 'var(--ink-2)' }}>{triLabel(n)}</span>
                  {n === tri && <span style={{ fontSize: 9, fontFamily: 'var(--mono)', letterSpacing: '0.08em', color: 'var(--accent)', marginLeft: 'auto' }}>● {t('NOW', 'ŞİMDİ')}</span>}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{t('weeks', 'hafta')} {n === 1 ? '1–13' : n === 2 ? '14–27' : '28–40'}</div>
              </button>
            );
          })}
        </div>
        <div className="mb-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <NourishGuideCard kind="move" g={g.move}/>
          <NourishGuideCard kind="eat" g={g.eat}/>
        </div>
        <NourishFooter/>
      </div>
    );
  }
  // Tek-rehberli evreler (TTC, postpartum)
  const cfg = SINGLE_NOURISH[stageKey] || SINGLE_NOURISH.ttc;
  const g = cfg.guide;
  return (
    <div style={{ padding: '18px 36px 48px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <ScreenHead eyebrow={t(cfg.eyebrowEn, cfg.eyebrowTr)} title={t('Nourish & move', 'Beslenme ve hareket')}
        right={<span style={{ fontSize: 12.5, color: 'var(--muted)', fontStyle: 'italic', fontFamily: 'var(--serif)' }}>{t(cfg.tagEn, cfg.tagTr)}</span>} />
      <div className="mb-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <NourishGuideCard kind="move" g={g.move}/>
        <NourishGuideCard kind="eat" g={g.eat}/>
      </div>
      <StageSeedCycle stageKey={stageKey}/>
      <NourishFooter/>
    </div>
  );
}

function NourishFooter() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', color: 'var(--muted-2)', fontSize: 11.5 }}>
      <Icon d={ICONS.heart} size={13} stroke="var(--muted-2)"/>
      <span style={{ fontStyle: 'italic', fontFamily: 'var(--serif)' }}>{t('General guidance, not medical advice. Your care team tailors this to you.', 'Genel rehberlik, tıbbi tavsiye değildir. Destek ekibin bunu sana göre uyarlar.')}</span>
    </div>
  );
}

/* ── Tohum döngüsü — tüm evreler için (SeedCycle + SEED_CYCLE nourish.jsx'ten gelir) ── */
function StageSeedCycle({ stageKey }) {
  // Gebelik ve doğum sonrasında 28-günlük sinyal olmadığından "her gün" notu eklenir
  const hasActiveCycle = stageKey === 'menarche' || stageKey === 'cycle' || stageKey === 'ttc' || stageKey === 'perimeno';
  // Seçim yapılabilir yarı: tüm evreler "ikinci yarı" ile başlatılır (progesterone vurgusu)
  const [half, setHalf] = React.useState('second');
  if (typeof SEED_CYCLE === 'undefined') return null;
  const g = SEED_CYCLE[half];
  return (
    <div style={{ borderTop: '1px solid var(--line-soft)', paddingTop: 22 }}>
      {/* Başlık */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--bone)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
            <Icon d={ICONS.leaf} size={16} stroke="var(--accent)"/>
          </span>
          <div className="eyebrow">{t('Seed cycling', 'Tohum döngüsü')}</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['first', 'second'].map(h => {
            const on = h === half;
            return (
              <button key={h} onClick={() => setHalf(h)}
                style={{
                  padding: '6px 12px', borderRadius: 999, fontSize: 11.5, cursor: 'pointer',
                  background: on ? 'var(--ink)' : 'var(--bone)',
                  color: on ? 'var(--ivory)' : 'var(--ink-2)',
                  boxShadow: on ? 'none' : 'inset 0 0 0 1px var(--line-soft)',
                  fontFamily: 'var(--mono)', letterSpacing: '0.04em',
                  transition: 'all 140ms ease',
                }}>
                {h === 'first' ? t('1–14', '1–14') : t('15+', '15+')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Neden */}
      <p style={{ fontFamily: 'var(--serif)', fontSize: 15.5, lineHeight: 1.5, color: 'var(--ink-2)', margin: '0 0 16px', textWrap: 'pretty' }}>
        {t(g.why, g.whyTr || g.why)}
      </p>

      {/* Tohumlar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: hasActiveCycle ? 14 : 0 }}>
        {g.seeds.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, background: 'var(--bone)', boxShadow: 'inset 0 0 0 1px var(--line-soft)' }}>
            <span style={{ width: 38, height: 38, borderRadius: '50%', background: s.hue, flexShrink: 0, boxShadow: 'inset 0 0 0 1px rgba(42,24,16,0.12)' }}/>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{t(s.name, s.nameTr || s.name)}</span>
              <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>{t(s.dose, s.doseTr || s.dose)}</span>
              <span style={{ fontSize: 11, color: 'var(--muted-2)', fontStyle: 'italic', fontFamily: 'var(--serif)' }}>{t(s.note, s.noteTr || s.note)}</span>
            </div>
          </div>
        ))}
      </div>

      {!hasActiveCycle && (
        <p style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic', fontFamily: 'var(--serif)', margin: '8px 0 0', lineHeight: 1.5 }}>
          {t("During this stage cycle-based rotation isn't tracked — you can still enjoy both sets daily for their nutritional benefits.",
             'Bu evrede döngü temelli rotasyon takip edilmez — yine de her iki grubu besin faydaları için her gün tüketebilirsin.')}
        </p>
      )}
    </div>
  );
}

export { PREG_NOURISH, TTC_NOURISH, POSTPARTUM_NOURISH, MENO_NOURISH, MENARCHE_NOURISH, SINGLE_NOURISH, NourishGuideCard, StageNourishView, NourishFooter, StageSeedCycle };
