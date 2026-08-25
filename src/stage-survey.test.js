import { describe, expect, it } from 'vitest';
import { evreOner, sonrakiSoru } from './stage-survey.js';
import { STAGES } from './stages.jsx';

/* Anket, kişiden kendi durumunu yedi kategoriden birine çevirmesini istemek
   yerine birkaç somut soru sorup kategoriyi kendisi çıkarıyor.

   Buradaki testler iki şeyi koruyor: doğru evreye gitmesi, ve bir sağlık
   uygulamasının yapmaması gereken iddiaları yapmaması. */

const yok = { durum: 'hicbiri' };

describe('evreOner — açık durumlar', () => {
  it('gebelik her şeyi geçersiz kılar', () => {
    // Gebe biri aynı zamanda düzensiz döngü de bildirmiş olabilir; gebelik önce gelir
    expect(evreOner({ durum: 'gebe', adet: 'duzensiz', yasAraligi: '45-55' }).stage).toBe('pregnancy');
  });

  it('son bir yılda doğum → doğum sonrası', () => {
    expect(evreOner({ durum: 'dogum' }).stage).toBe('postpartum');
  });

  it('yeni başlamış döngüler → ilk dönemler', () => {
    expect(evreOner({ ...yok, adet: 'yeni' }).stage).toBe('menarche');
  });

  it('düzenli döngü + gebe kalma isteği → hazırlık', () => {
    expect(evreOner({ ...yok, adet: 'duzenli', deniyor: true }).stage).toBe('ttc');
  });

  it('düzenli döngü, gebelik planı yok → döngü takibi', () => {
    expect(evreOner({ ...yok, adet: 'duzenli', deniyor: false }).stage).toBe('cycle');
  });
});

describe('evreOner — perimenopoz', () => {
  it('40 üstü düzensizleşen döngü → perimenopoz', () => {
    for (const yas of ['40-45', '45-55', 'ust55']) {
      expect(evreOner({ ...yok, adet: 'duzensiz', yasAraligi: yas, belirtiler: [] }).stage).toBe('perimeno');
    }
  });

  it('belirtiler gerekçeye eklenir ama şart değildir', () => {
    const belirtili = evreOner({ ...yok, adet: 'duzensiz', yasAraligi: '45-55', belirtiler: ['sicak', 'uyku'] });
    expect(belirtili.gerekce).toContain('belirtiler');
    const belirtisiz = evreOner({ ...yok, adet: 'duzensiz', yasAraligi: '45-55', belirtiler: [] });
    expect(belirtisiz.stage).toBe('perimeno');
    expect(belirtisiz.gerekce).not.toContain('belirtiler');
  });

  it('perimenopoz sonucu Womentum yönlendirmesi taşır', () => {
    expect(evreOner({ ...yok, adet: 'duzensiz', yasAraligi: '45-55', belirtiler: ['sicak'] }).womentum).toBe(true);
    expect(evreOner({ ...yok, adet: 'duzenli', deniyor: false }).womentum).toBe(false);
  });
});

describe('evreOner — yapmaması gerekenler', () => {
  /* Menopozun klinik tanımı 12 ay adetsizlik. Ama hormonal spiral, doğum
     kontrolü, rahim ameliyatı ve emzirme de kanamayı keser. Bu ayrım
     olmadan uygulama emziren 32 yaşındaki birine "menopozdasın" derdi. */
  it('kanamayı baskılayan bir durum varken menopoz demez', () => {
    for (const engel of ['spiral', 'dogumKontrol', 'ameliyat', 'emzirme']) {
      const s = evreOner({ ...yok, adet: 'yok12', engeller: [engel], yasAraligi: 'alt40' });
      expect(s.stage).not.toBe('menopause');
      expect(s.not).toBe('engelVarAdetYok');
    }
  });

  /* 40 altında erken yumurtalık yetmezliği gerçek bir durum, ama teşhisi
     bu uygulamanın işi değil — etiket yapıştırmak yerine hekime yönlendirir. */
  it('40 altında perimenopoz ya da menopoz etiketi yapıştırmaz', () => {
    const duzensiz = evreOner({ ...yok, adet: 'duzensiz', yasAraligi: 'alt40', belirtiler: ['sicak', 'geceTer'] });
    expect(duzensiz.stage).toBe('cycle');
    expect(duzensiz.not).toBe('kirkAltiDuzensiz');

    const adetYok = evreOner({ ...yok, adet: 'yok12', engeller: [], yasAraligi: 'alt40' });
    expect(adetYok.stage).not.toBe('menopause');
    expect(adetYok.not).toBe('kirkAltiAdetYok');
  });

  it('cevap eksikse evre uydurmaz', () => {
    expect(evreOner({}).stage).toBe(null);
    expect(evreOner({ durum: 'hicbiri' }).stage).toBe(null);
    expect(evreOner(null).stage).toBe(null);
  });

  it('tanınmayan belirti ve engelleri yok sayar', () => {
    const s = evreOner({ ...yok, adet: 'yok12', engeller: ['uydurma'], yasAraligi: 'ust55' });
    expect(s.stage).toBe('menopause');   // geçersiz engel sayılmaz
  });
});

describe('evreOner — çıktı sözleşmesi', () => {
  it('her sonuç uygulamada var olan bir evreye işaret eder', () => {
    const hepsi = [
      { durum: 'gebe' }, { durum: 'dogum' },
      { ...yok, adet: 'yeni' },
      { ...yok, adet: 'duzenli', deniyor: true }, { ...yok, adet: 'duzenli', deniyor: false },
      { ...yok, adet: 'duzensiz', yasAraligi: '45-55', belirtiler: [] },
      { ...yok, adet: 'duzensiz', yasAraligi: 'alt40', belirtiler: [] },
      { ...yok, adet: 'yok12', engeller: [], yasAraligi: 'ust55' },
      { ...yok, adet: 'yok12', engeller: ['spiral'], yasAraligi: '45-55' },
    ];
    for (const c of hepsi) {
      const s = evreOner(c);
      expect(Object.keys(STAGES)).toContain(s.stage);
      expect(Array.isArray(s.gerekce)).toBe(true);
      expect(s.gerekce.length).toBeGreaterThan(0);
    }
  });
});

describe('sonrakiSoru — akış', () => {
  it('gebelik ve doğum tek soruda biter', () => {
    expect(sonrakiSoru({})).toBe('durum');
    expect(sonrakiSoru({ durum: 'gebe' })).toBe(null);
    expect(sonrakiSoru({ durum: 'dogum' })).toBe(null);
  });

  it('düzenli döngü iki soruda, niyetle biter', () => {
    expect(sonrakiSoru(yok)).toBe('adet');
    expect(sonrakiSoru({ ...yok, adet: 'duzenli' })).toBe('deniyor');
    expect(sonrakiSoru({ ...yok, adet: 'duzenli', deniyor: false })).toBe(null);
  });

  it('düzensiz yolda yaş ve belirti sorulur', () => {
    expect(sonrakiSoru({ ...yok, adet: 'duzensiz' })).toBe('yas');
    expect(sonrakiSoru({ ...yok, adet: 'duzensiz', yasAraligi: '45-55' })).toBe('belirtiler');
    expect(sonrakiSoru({ ...yok, adet: 'duzensiz', yasAraligi: '45-55', belirtiler: [] })).toBe(null);
  });

  it('adet yok yolunda önce engel sorulur — menopoz demeden önce', () => {
    expect(sonrakiSoru({ ...yok, adet: 'yok12' })).toBe('engeller');
    expect(sonrakiSoru({ ...yok, adet: 'yok12', engeller: [] })).toBe('yas');
    expect(sonrakiSoru({ ...yok, adet: 'yok12', engeller: [], yasAraligi: 'ust55' })).toBe(null);
  });

  it('anket bittiğinde evre her zaman belirlenmiş olur', () => {
    const yollar = [
      { durum: 'gebe' },
      { ...yok, adet: 'yeni' },
      { ...yok, adet: 'duzenli', deniyor: true },
      { ...yok, adet: 'duzensiz', yasAraligi: '45-55', belirtiler: ['sicak'] },
      { ...yok, adet: 'yok12', engeller: [], yasAraligi: 'ust55' },
    ];
    for (const c of yollar) {
      expect(sonrakiSoru(c)).toBe(null);
      expect(evreOner(c).stage).toBeTruthy();
    }
  });
});
