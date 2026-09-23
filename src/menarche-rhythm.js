/* menarche-rhythm.js — ilk yılların ritmini kayıtlardan çıkarmak.

   Menarş ekranındaki okuma kartları "zamanla kendi ritmini tanırsın"
   diyordu ama ekranda ritmi gösteren hiçbir şey yoktu: "Reglim başladı"
   düğmesi yalnızca döngüyü 1. güne sıfırlıyordu, geçmiş regller ve
   aralarındaki süre hiçbir yerde görünmüyordu.

   Burada saf hesaplar duruyor; ekran bunları yalnızca çiziyor. */

const GUN = 86400000;

// İlk yıllarda sık görülen döngü aralığı (ACOG: ilk jinekolojik yıllarda
// 21–45 gün tipik). Yeterli kayıt yokken tahmin bu aralıkla yapılıyor.
const TIPIK_MIN = 21;
const TIPIK_MAX = 45;

// Tahmini ancak bu kadar döngü gözlemlendikten sonra kişiye özel yap.
// Bir-iki döngüden aralık çıkarmak, olmayan bir kesinlik iddia eder.
const GOZLEM_ESIGI = 3;

// Bu kadar gün regl görülmezse yardım kartına yönlendir. Okuma
// kartındaki "3 aydan uzun süre durması" maddesiyle aynı eşik.
const UZUN_ARA_GUN = 90;

function isoGun(iso) { return new Date(iso + 'T00:00:00'); }
function gunFarki(a, b) { return Math.round((isoGun(b) - isoGun(a)) / GUN); }
function isoEkle(iso, n) {
  const d = isoGun(iso); d.setDate(d.getDate() + n);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

/* Her reglin ilk günü, eskiden yeniye.

   Gruplama shared.jsx'teki sonKanamaBasi ile aynı: ardışık işaretli
   günler tek bir regldir. Farklı bir kural (örneğin araya bir boş gün
   girebilsin) seçilseydi, geçmişteki "son regl" ile döngü çapası iki
   ayrı tarih gösterebilirdi. */
function reglBaslangiclari(periodDays) {
  const gunler = Object.keys(periodDays || {}).filter(k => periodDays[k]).sort();
  const out = [];
  let onceki = null;
  for (const g of gunler) {
    if (!onceki || gunFarki(onceki, g) !== 1) out.push(g);
    onceki = g;
  }
  return out;
}

// Ardışık başlangıçlar arasındaki gün sayısı — döngü uzunlukları
function donguUzunluklari(baslangiclar) {
  const out = [];
  for (let i = 1; i < baslangiclar.length; i++) out.push(gunFarki(baslangiclar[i - 1], baslangiclar[i]));
  return out;
}

/* Sonraki reglin gelebileceği aralık.

   Tek bir tarih vermiyoruz: ilk yıllarda döngü aydan aya değişir ve tek
   tarih "gecikti mi?" kaygısı üretir. GOZLEM_ESIGI kadar döngü yoksa
   tipik 21–45 günlük aralık kullanılır; varsa gözlenen en kısa ve en
   uzun döngü. Kaynağı dönen nesne söylüyor, ekran bunu açıkça yazıyor. */
function sonrakiReglTahmini(baslangiclar, bugunIso) {
  if (!baslangiclar || !baslangiclar.length) return null;
  const son = baslangiclar[baslangiclar.length - 1];
  const uz = donguUzunluklari(baslangiclar);
  const gozlem = uz.length >= GOZLEM_ESIGI;
  const min = gozlem ? Math.min(...uz) : TIPIK_MIN;
  const max = gozlem ? Math.max(...uz) : TIPIK_MAX;
  const gecenGun = gunFarki(son, bugunIso);
  return {
    son,
    enErken: isoEkle(son, min),
    enGec: isoEkle(son, max),
    min, max,
    kaynak: gozlem ? 'gozlem' : 'tipik',
    gecenGun,
    aralikGecti: gecenGun > max,
    uzunAra: gecenGun > UZUN_ARA_GUN,
  };
}

export {
  reglBaslangiclari, donguUzunluklari, sonrakiReglTahmini,
  TIPIK_MIN, TIPIK_MAX, GOZLEM_ESIGI, UZUN_ARA_GUN,
};
