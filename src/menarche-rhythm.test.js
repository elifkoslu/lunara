import { describe, expect, it } from 'vitest';
import {
  GOZLEM_ESIGI, TIPIK_MAX, TIPIK_MIN, UZUN_ARA_GUN,
  donguUzunluklari, reglBaslangiclari, sonrakiReglTahmini,
} from './menarche-rhythm.js';
import { sonKanamaBasi } from './shared.jsx';

const isaretle = (...gunler) => Object.fromEntries(gunler.map(g => [g, true]));

describe('reglBaslangiclari', () => {
  it('boş kayıtta boş dizi', () => {
    expect(reglBaslangiclari({})).toEqual([]);
    expect(reglBaslangiclari(undefined)).toEqual([]);
  });

  it('ardışık günleri tek regl sayar', () => {
    const p = isaretle('2026-06-01', '2026-06-02', '2026-06-03', '2026-07-02', '2026-07-03');
    expect(reglBaslangiclari(p)).toEqual(['2026-06-01', '2026-07-02']);
  });

  it('son başlangıç, döngü çapasıyla (sonKanamaBasi) aynı', () => {
    /* Farklı gruplama kuralı seçilseydi geçmişteki "son regl" ile
       uygulamanın döngü çapası iki ayrı tarih gösterirdi. */
    const p = isaretle('2026-06-01', '2026-06-02', '2026-07-02', '2026-07-03', '2026-07-05');
    const b = reglBaslangiclari(p);
    expect(b[b.length - 1]).toBe(sonKanamaBasi(p));
  });

  it('yoğunluk sayısıyla işaretlenmiş günleri de sayar, sıfırı saymaz', () => {
    expect(reglBaslangiclari({ '2026-06-01': 2, '2026-06-20': 0 })).toEqual(['2026-06-01']);
  });
});

describe('donguUzunluklari', () => {
  it('başlangıçlar arası gün farkı', () => {
    expect(donguUzunluklari(['2026-06-01', '2026-07-02', '2026-08-05'])).toEqual([31, 34]);
  });
  it('tek başlangıçta döngü yok', () => {
    expect(donguUzunluklari(['2026-06-01'])).toEqual([]);
  });
});

describe('sonrakiReglTahmini', () => {
  it('hiç regl yokken tahmin yapmaz', () => {
    expect(sonrakiReglTahmini([], '2026-09-23')).toBe(null);
  });

  it('az kayıtla tipik ilk-yıl aralığını kullanır ve bunu söyler', () => {
    const t = sonrakiReglTahmini(['2026-09-01'], '2026-09-10');
    expect(t.kaynak).toBe('tipik');
    expect([t.min, t.max]).toEqual([TIPIK_MIN, TIPIK_MAX]);
    expect(t.enErken).toBe('2026-09-22');
    expect(t.enGec).toBe('2026-10-16');
  });

  it(`${GOZLEM_ESIGI} döngü gözlenince kişiye özel aralığa geçer`, () => {
    // 30, 36, 33 günlük döngüler
    const b = ['2026-03-01', '2026-03-31', '2026-05-06', '2026-06-08'];
    const t = sonrakiReglTahmini(b, '2026-06-20');
    expect(t.kaynak).toBe('gozlem');
    expect([t.min, t.max]).toEqual([30, 36]);
  });

  it(`${GOZLEM_ESIGI - 1} döngüyle henüz kişiye özel aralık iddia etmez`, () => {
    const b = ['2026-03-01', '2026-03-31', '2026-05-06'];
    expect(sonrakiReglTahmini(b, '2026-05-20').kaynak).toBe('tipik');
  });

  it('aralık geçince bunu işaretler', () => {
    const t = sonrakiReglTahmini(['2026-06-01'], '2026-07-20');   // 49 gün > 45
    expect(t.aralikGecti).toBe(true);
    expect(t.uzunAra).toBe(false);
  });

  it(`${UZUN_ARA_GUN} günü aşınca yardım kartına yönlendirecek işareti verir`, () => {
    const t = sonrakiReglTahmini(['2026-05-01'], '2026-08-15');   // 106 gün
    expect(t.uzunAra).toBe(true);
  });
});
