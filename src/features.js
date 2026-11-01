/* features.js — geçici olarak kapatılan bölümler.

   Buradaki bölümler menüde (masaüstü yan menü, mobil alt bar ve "Daha"),
   ana sayfa kartlarında ve ekranlar arası bağlantılarda görünmüyor; doğrudan
   açılmaya çalışılırsa Bugün ekranı gösteriliyor. Kodları ve kayıtlı
   verileri (egzersiz işaretleri, tahlil panelleri) olduğu gibi duruyor;
   yedeğe girmeye ve doktor özetinde görünmeye devam ediyor.

   Yeniden açmak için bölümü bu listeden çıkarmak yeterli. */
const KAPALI_BOLUMLER = ['move', 'nourish', 'labs', 'care'];

function bolumAcik(k) {
  return KAPALI_BOLUMLER.indexOf(k) === -1;
}

export { KAPALI_BOLUMLER, bolumAcik };
