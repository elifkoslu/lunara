import { describe, it, expect } from 'vitest';
import { ttcCycle, ttcStatus } from './ttc.jsx';

/* Gebe kalma ekranının tek işlevi doğurgan pencereyi doğru göstermek.
   Eskiden bu pencere 32 günlük sabit bir döngüye çakılıydı (ovülasyon 18,
   pencere 13–18); 28 günlük bir döngüde beş gün geç gösteriyordu. */

describe('ttcCycle — pencere kullanıcının döngüsünden türer', () => {
  it('ovülasyon luteal-14 kuralıyla yerleşir', () => {
    expect(ttcCycle(28).ov).toBe(14);
    expect(ttcCycle(32).ov).toBe(18);
    expect(ttcCycle(26).ov).toBe(12);
    expect(ttcCycle(35).ov).toBe(21);
  });

  it('doğurgan pencere ovülasyonda biter ve 6 gün sürer', () => {
    for (const L of [26, 28, 32, 35]) {
      const c = ttcCycle(L);
      expect(c.fertileEnd, `döngü ${L}`).toBe(c.ov);
      expect(c.fertileEnd - c.fertileStart + 1, `döngü ${L}`).toBe(6);
    }
  });

  it('pencere döngü içinde kalır', () => {
    for (const L of [15, 20, 28, 60]) {
      const c = ttcCycle(L);
      expect(c.fertileStart, `döngü ${L}`).toBeGreaterThanOrEqual(1);
      expect(c.fertileEnd, `döngü ${L}`).toBeLessThanOrEqual(L);
    }
  });

  it('döngü uzunluğu verilmezse 28 varsayar', () => {
    expect(ttcCycle().ov).toBe(14);
    expect(ttcCycle(null).ov).toBe(14);
  });

  it('saçma değerleri makul sınırlara çeker', () => {
    expect(ttcCycle(2).L).toBe(15);
    expect(ttcCycle(500).L).toBe(60);
  });
});

describe('ttcStatus — günün durumu', () => {
  /* REGRESYON: 28 günlük döngüde 14. gün ovülasyon günüdür.
     Sabit tabloda 18. gün deniyordu, yani kullanıcı zamanlamayı kaçırırdı. */
  it('28 günlük döngüde 14. gün ovülasyondur', () => {
    const st = ttcStatus(14, 28);
    expect(st.ovulation).toBe(true);
    expect(st.fertile).toBe(true);
    expect(st.toOv).toBe(0);
  });

  it('32 günlük döngüde 14. gün henüz ovülasyon değildir', () => {
    const st = ttcStatus(14, 32);
    expect(st.ovulation).toBe(false);
    expect(st.toOv).toBe(4);
  });

  it('zirve, ovülasyon ve bir önceki gündür', () => {
    for (const L of [26, 28, 32]) {
      const ov = ttcCycle(L).ov;
      expect(ttcStatus(ov, L).peak, `döngü ${L}`).toBe(true);
      expect(ttcStatus(ov - 1, L).peak, `döngü ${L}`).toBe(true);
      expect(ttcStatus(ov - 2, L).peak, `döngü ${L}`).toBe(false);
      expect(ttcStatus(ov + 1, L).peak, `döngü ${L}`).toBe(false);
    }
  });

  it('pencere dışındaki günler doğurgan sayılmaz', () => {
    expect(ttcStatus(2, 28).fertile).toBe(false);    // adet günleri
    expect(ttcStatus(25, 28).fertile).toBe(false);   // luteal faz
  });

  it('ovülasyondan sonra geri sayım negatife döner', () => {
    expect(ttcStatus(20, 28).toOv).toBeLessThan(0);
  });
});
