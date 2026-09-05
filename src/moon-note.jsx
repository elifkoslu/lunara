import { t } from './i18n';

/* moon-note.jsx — ay kartındaki metinlerin kaynağı.

   Kart eskiden "Fiziksel" başlığı altında ayın evresine bakıp
   "enerji en düşük seviyede", "güç ve dayanıklılık yükselir",
   "uyku hafifleyebilir" diyordu. Bunların dayanağı yok: ay evresiyle
   döngü ya da genel fizyoloji arasında güvenilir bir bağ gösterilmedi.
   Clue'nun 1,5 milyon döngülük analizi korelasyon bulmadı;
   Helfrich-Förster ve ark. (Science Advances, 2021) bazı kadınlarda
   zayıf ve aralıklı bir örtüşme buldu ama bulgu tutarsızdı.

   Kartın altındaki "tıbbi değildir" notu yetmiyordu — alev ikonlu
   "Fiziksel" başlığı iddiayı fizyoloji diye sunuyordu.

   Artık iki katman ayrı: "Bedeninde" kullanıcının kendi döngü gününden
   gelir ve doğrudur; "Gelenekte" ayın evresine bağlıdır ve gelenek
   olarak etiketlenir. */

const GELENEK = {
  'New':             ['The sky is dark. Tradition reads this as a turning inward — rest, and quietly setting intentions.',
                      'Gökyüzü karanlık. Gelenek bu evreyi içe dönüş olarak okur: dinlenme ve sessizce niyet kurma zamanı.'],
  'Waxing crescent': ['The first sliver of light. Traditionally the phase of beginnings — what has just been set in motion.',
                      'İlk ışık göründü. Gelenekte başlangıçların evresi: yeni kurulmuş olan şeyin evresi.'],
  'First quarter':   ['Half lit and growing. Traditionally the phase of deciding and pushing through resistance.',
                      'Ay yarısına geldi ve büyüyor. Gelenekte karar verme ve direnci aşma evresi.'],
  'Waxing gibbous':  ['Almost full. Traditionally the phase of refining — adjusting what is nearly ready.',
                      'Dolunaya az kaldı. Gelenekte olgunlaştırma evresi: neredeyse hazır olanı ince ayarlama.'],
  'Full':            ['The brightest night. Traditionally the peak — visibility, fullness, and spilling over.',
                      'En parlak gece. Gelenekte doruk evresi: görünürlük, dolgunluk ve taşma.'],
  'Waning gibbous':  ['The light begins to withdraw. Traditionally the phase of sharing what was gathered.',
                      'Işık çekilmeye başladı. Gelenekte toplananı paylaşma ve aktarma evresi.'],
  'Last quarter':    ['Half lit and shrinking. Traditionally the phase of letting go and simplifying.',
                      'Ay yarısına indi ve küçülüyor. Gelenekte bırakma ve sadeleşme evresi.'],
  'Waning crescent': ['The last light. Traditionally the phase of rest and closing — making room for what comes next.',
                      'Son ışık. Gelenekte dinlenme ve kapanış evresi: sıradakine yer açma.'],
};

/* Döngü fazının gerçek fizyolojisi — ayla değil, kullanıcının kendi
   döngü günüyle ilgili. Doğru olabilecek tek katman bu. */
const BEDEN = {
  menstrual:  ['Estrogen and progesterone are at their lowest and the uterine lining is shedding. Low energy in these days follows that drop.',
               'Östrojen ve progesteron en düşük seviyede, rahim iç zarı dökülüyor. Bu günlerdeki düşük enerji o inişin sonucu.'],
  follicular: ['Estrogen is climbing as a follicle matures. For many people energy and mood rise along with it.',
               'Bir folikül olgunlaşırken östrojen yükseliyor. Çoğu kişide enerji ve ruh hali bu yükselişe eşlik eder.'],
  ovulation:  ['LH peaks and estrogen is at its highest. Body temperature ticks up slightly just after release.',
               'LH tepe yapıyor, östrojen en yüksek noktasında. Yumurtlamadan hemen sonra vücut ısısı hafifçe yükselir.'],
  luteal:     ['Progesterone rises and then falls toward the end. Tension, bloating and broken sleep in the last days track that fall.',
               'Progesteron yükseliyor, sonlara doğru düşüyor. Son günlerdeki gerginlik, şişkinlik ve bölünen uyku o düşüşle birlikte gider.'],
};

/* Faz yoksa (döngü çapası kurulmamışsa) beden katmanı hiç kurulmaz —
   uydurmak yerine susar, labNote'taki ilkeyle aynı. */
function moonNote(moonName, phaseKey) {
  const g = GELENEK[moonName];
  const b = phaseKey && BEDEN[phaseKey];
  return {
    gelenek: g ? t(g[0], g[1]) : '',
    beden: b ? t(b[0], b[1]) : '',
  };
}

export { moonNote, GELENEK, BEDEN };
