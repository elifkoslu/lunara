import { describe, expect, it } from 'vitest';
import { BAR_SLOTS, NAV_META, mobileNav } from './mobile.jsx';
import { STAGES, STAGE_ORDER } from './stages.jsx';
import { navItemsFor } from './shared.jsx';

/* REGRESYON: mobil alt bar sabit bir listeydi ve navItemsFor'u hiç kullanmıyordu.
   Sonuç: telefonda her evre aynı dokuz bölümü görüyordu — kendi evresinde
   tanımlı olmayanlar dahil. Masaüstü yan menü doğru davranıyordu; iki
   navigasyon birbirinden ayrışmıştı. */

const evreler = STAGE_ORDER || Object.keys(STAGES);

describe('mobileNav', () => {
  it('yalnızca evrenin kendi bölümlerini gösterir', () => {
    for (const evre of evreler) {
      const izinli = navItemsFor(evre).map(i => i.k);
      const { tabs, more } = mobileNav(evre);
      for (const tb of tabs) expect(izinli).toContain(tb.k);
      // profil her evrede erişilebilir olmalı, o yüzden listeden muaf
      for (const m of more) if (m.k !== 'profile') expect(izinli).toContain(m.k);
    }
  });

  it('evrenin hiçbir bölümünü düşürmez', () => {
    for (const evre of evreler) {
      const izinli = navItemsFor(evre).map(i => i.k).filter(k => NAV_META[k]);
      const { tabs, more } = mobileNav(evre);
      const gosterilen = tabs.concat(more).map(i => i.k);
      for (const k of izinli) expect(gosterilen).toContain(k);
    }
  });

  it('aynı bölümü hem barda hem Daha içinde göstermez', () => {
    for (const evre of evreler) {
      const { tabs, more } = mobileNav(evre);
      const hepsi = tabs.concat(more).map(i => i.k);
      expect(new Set(hepsi).size).toBe(hepsi.length);
    }
  });

  it('profili her zaman Daha içine koyar, bara çıkarmaz', () => {
    for (const evre of evreler) {
      const { tabs, more } = mobileNav(evre);
      expect(more.map(i => i.k)).toContain('profile');
      expect(tabs.map(i => i.k)).not.toContain('profile');
    }
  });

  /* Bugün ekranının birincil butonu Belirtiler'e gidiyor. O bölüm "Daha"nın
     içinde kalırsa günlük ana eylem iki dokunuş derinde olur — raporun 03. bulgusu. */
  it('Bugün ve Belirtiler bara çıkar', () => {
    for (const evre of evreler) {
      const izinli = navItemsFor(evre).map(i => i.k);
      const barda = mobileNav(evre).tabs.map(i => i.k);
      expect(barda[0]).toBe('home');
      if (izinli.indexOf('symptoms') !== -1) expect(barda).toContain('symptoms');
    }
  });

  it('bar dolduğunda taşanlar Daha içine iner', () => {
    const { tabs, more } = mobileNav('perimeno');   // en kalabalık evre
    expect(tabs).toHaveLength(BAR_SLOTS);
    // bölüm sayısı features.js'teki kapalı listeye göre değişiyor; Profil her zaman Daha'da
    expect(more.map(i => i.k)).toEqual(navItemsFor('perimeno').map(i => i.k).slice(BAR_SLOTS).concat(['profile']));
  });

  it('bilinmeyen evrede çökmez, tam listeye düşer', () => {
    const { tabs, more } = mobileNav(undefined);
    expect(tabs).toHaveLength(BAR_SLOTS);
    expect(more.map(i => i.k)).toContain('profile');
  });

  it('her gösterilen bölümün ikonu ve iki dilde etiketi vardır', () => {
    for (const evre of evreler) {
      const { tabs, more } = mobileNav(evre);
      for (const i of tabs.concat(more)) {
        expect(i.icon).toBeTruthy();
        expect(i.en).toBeTruthy();
        expect(i.tr).toBeTruthy();
      }
    }
  });
});
