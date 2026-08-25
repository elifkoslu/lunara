/* stage-survey.js — "hangi dönemdesin" anketinin karar mantığı.

   Yedi seçenekli bir liste, kişiden kendi durumunu bir kategoriye çevirmesini
   istiyordu. Asıl iş bu: birkaç somut soru sorup kategoriyi biz çıkarıyoruz.

   Karar mantığı UI'dan ayrı tutuldu ki test edilebilsin. Sıra rastgele değil:
   gebelik ve doğum sonrası diğer her şeyi geçersiz kılar, o yüzden ilk sırada.

   ÖNEMLİ: bu bir teşhis değil. Sonuç "cevapların en çok şuna uyuyor" diye
   sunuluyor, gerekçesiyle, ve her zaman değiştirilebiliyor. */

// Kanamayı baskılayabilen durumlar — bunlar varken adet yokluğu menopoz demek değil
const KANAMA_ENGELI = ['spiral', 'dogumKontrol', 'ameliyat', 'emzirme'];

const YAS_ARALIKLARI = ['alt40', '40-45', '45-55', 'ust55'];

// Perimenopoza işaret eden belirtiler (vazomotor + ilişkili)
const PERI_BELIRTI = ['sicak', 'geceTer', 'uyku', 'kuruluk', 'ruhHali'];

function kirkUstu(yasAraligi) {
  return yasAraligi != null && yasAraligi !== 'alt40';
}

/* Cevaplardan evre önerisi üretir.
   → { stage, gerekce: string[], not: string|null, womentum: boolean }
   gerekce: kullanıcıya gösterilecek "neden bu" maddeleri (çeviri anahtarı değil,
   doğrudan cevaplardan türeyen kısa ifadeler — UI onları yerelleştirir).
   not: dikkat çekilmesi gereken bir durum varsa (hekime danışma vb.)
   womentum: perimenopoz + hormon tedavisi odaklı diğer uygulamaya yönlendirme */
function evreOner(c) {
  const cevap = c || {};
  const belirtiler = (cevap.belirtiler || []).filter(b => PERI_BELIRTI.indexOf(b) !== -1);
  const engeller = (cevap.engeller || []).filter(e => KANAMA_ENGELI.indexOf(e) !== -1);

  // 1. Gebelik ve doğum sonrası her şeyi geçersiz kılar
  if (cevap.durum === 'gebe') {
    return { stage: 'pregnancy', gerekce: ['gebe'], not: null, womentum: false };
  }
  if (cevap.durum === 'dogum') {
    return { stage: 'postpartum', gerekce: ['sonBirYilDogum'], not: null, womentum: false };
  }

  // 2. Henüz başlamamış ya da yeni başlamış döngüler
  if (cevap.adet === 'yeni') {
    return { stage: 'menarche', gerekce: ['yeniAdet'], not: null, womentum: false };
  }

  // 3. Düzenli döngü → niyet belirleyici
  if (cevap.adet === 'duzenli') {
    return cevap.deniyor
      ? { stage: 'ttc', gerekce: ['duzenliAdet', 'gebeKalmakIstiyor'], not: null, womentum: false }
      : { stage: 'cycle', gerekce: ['duzenliAdet'], not: null, womentum: false };
  }

  // 4. Düzensizleşmiş döngü
  if (cevap.adet === 'duzensiz') {
    if (!kirkUstu(cevap.yasAraligi)) {
      /* 40 altında düzensizlik perimenopoz demek değil; erken yumurtalık
         yetmezliği gerçek bir durum ama teşhisi bu uygulamanın işi değil. */
      return {
        stage: 'cycle',
        gerekce: ['duzensizAdet', 'kirkAlti'],
        not: 'kirkAltiDuzensiz',
        womentum: false,
      };
    }
    const gerekce = ['duzensizAdet', 'yas' + cevap.yasAraligi];
    if (belirtiler.length) gerekce.push('belirtiler');
    return { stage: 'perimeno', gerekce, not: null, womentum: true };
  }

  // 5. 12 aydan uzun süredir adet yok
  if (cevap.adet === 'yok12') {
    if (engeller.length) {
      /* Hormonal spiral, doğum kontrolü, rahim ameliyatı ve emzirme kanamayı
         keser. Bu soru olmadan uygulama emziren birine "menopozdasın" derdi. */
      return {
        stage: belirtiler.length && kirkUstu(cevap.yasAraligi) ? 'perimeno' : 'cycle',
        gerekce: ['adetYok', 'kanamaEngeli'],
        not: 'engelVarAdetYok',
        womentum: belirtiler.length > 0 && kirkUstu(cevap.yasAraligi),
      };
    }
    if (!kirkUstu(cevap.yasAraligi)) {
      return {
        stage: 'cycle',
        gerekce: ['adetYok', 'kirkAlti'],
        not: 'kirkAltiAdetYok',
        womentum: false,
      };
    }
    return { stage: 'menopause', gerekce: ['adetYok12Ay'], not: null, womentum: false };
  }

  // Cevap eksikse hiçbir şey uydurma — kişi kendi seçsin
  return { stage: null, gerekce: [], not: null, womentum: false };
}

/* Bir sonraki soruyu belirler; cevaplandıkça akış dallanır.
   → soru anahtarı ya da null (anket bitti) */
function sonrakiSoru(c) {
  const cevap = c || {};
  if (cevap.durum == null) return 'durum';
  if (cevap.durum !== 'hicbiri') return null;          // gebelik / doğum sonrası → bitti
  if (cevap.adet == null) return 'adet';
  if (cevap.adet === 'yeni') return null;
  if (cevap.adet === 'duzenli') return cevap.deniyor == null ? 'deniyor' : null;
  if (cevap.adet === 'duzensiz') {
    if (cevap.yasAraligi == null) return 'yas';
    if (cevap.belirtiler == null) return 'belirtiler';
    return null;
  }
  if (cevap.adet === 'yok12') {
    if (cevap.engeller == null) return 'engeller';
    if (cevap.yasAraligi == null) return 'yas';
    return null;
  }
  return null;
}

export { evreOner, sonrakiSoru, KANAMA_ENGELI, PERI_BELIRTI, YAS_ARALIKLARI };
