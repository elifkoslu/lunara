/* menarche-phases.js — menarş evre metinleri, yaprak modül.

   menarche.jsx'teydi. Döngü ekranı (screens.jsx) da bu metinleri ay
   kartında "Bedeninde" katmanı için kullanıyor; menarche.jsx ise
   screens.jsx'e bağlı olduğu için oradan almak döngüsel bağımlılık
   kurardı — use-mobile.js'teki tuzağın aynısı. Hiçbir şeyi içe
   aktarmayan bir dosyada durunca halka kapanmıyor. */

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

export { MENARCHE_PHASES };
