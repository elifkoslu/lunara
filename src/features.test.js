import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { KAPALI_BOLUMLER, bolumAcik } from './features.js';
import { mobileNav } from './mobile.jsx';
import { navItemsFor } from './shared.jsx';
import { STAGES } from './stages.jsx';
import { summaryText } from './doctor-summary.jsx';

/* Hareket, Beslenme, Tahliller ve Destek ekibi şimdilik kapalı. Kodları
   duruyor; features.js'teki listeden çıkarınca geri geliyorlar. */
const kaynak = (f) => readFileSync(new URL('./' + f, import.meta.url), 'utf8');

describe('kapalı bölümler', () => {
  it('liste', () => {
    expect(KAPALI_BOLUMLER).toEqual(['move', 'nourish', 'labs', 'care']);
    for (const k of KAPALI_BOLUMLER) expect(bolumAcik(k)).toBe(false);
    for (const k of ['home', 'symptoms', 'cycle', 'doses', 'profile']) expect(bolumAcik(k)).toBe(true);
  });

  it('hiçbir evrenin menüsünde (masaüstü ve mobil) görünmüyor', () => {
    for (const evre of Object.keys(STAGES)) {
      const masaustu = navItemsFor(evre).map(i => i.k);
      const { tabs, more } = mobileNav(evre);
      const mobil = tabs.concat(more).map(i => i.k);
      for (const k of KAPALI_BOLUMLER) {
        expect(masaustu).not.toContain(k);
        expect(mobil).not.toContain(k);
      }
      expect(mobil).toContain('profile');
    }
  });

  it('evre tanımları değişmedi — açınca eski yerlerine dönüyorlar', () => {
    expect(STAGES.perimeno.nav).toEqual(['home', 'symptoms', 'doses', 'cycle', 'move', 'nourish', 'labs', 'care']);
  });

  it('doktora özet Destek ekibi kapalıyken de açılabiliyor', () => {
    // Tek giriş CareScreen'deydi; bölüm kapanınca özet ulaşılmaz olmuştu.
    const profil = kaynak('profile.jsx');
    expect(profil).toMatch(/<DoctorSummaryCard lunara=\{lunara\}\/>/);
    expect(profil).toMatch(/<DoctorSummary lunara=\{lunara\}/);
  });

  it('tahliller kapalıyken özette boş tahlil başlığı yok, eski panel varsa görünüyor', () => {
    const bos = summaryText({ stage: 'cycle', symptomLog: {}, periodDays: {} });
    expect(bos).not.toMatch(/SON TAHLİLLER|LATEST LABS/);
    const panelli = summaryText({ stage: 'cycle', symptomLog: {}, periodDays: {},
      labPanels: [{ date: '2026-10-01', readings: [{ name: 'Ferritin', value: 40, unit: 'ng/mL' }] }] });
    expect(panelli).toMatch(/SON TAHLİLLER|LATEST LABS/);
    expect(panelli).toMatch(/Ferritin/);
  });

  it('doğrudan açılmaya çalışılırsa Bugün ekranı', () => {
    expect(kaynak('App.jsx')).toMatch(/switch \(bolumAcik\(active\) \? active : 'home'\)/);
  });

  it('ana sayfa kartları ve iç bağlantılar da kapalı', () => {
    const ed = kaynak('editorial.jsx');
    expect(ed).toMatch(/bolumAcik\('move'\) && <TodayWorkoutCard/);
    expect(ed).toMatch(/bolumAcik\('labs'\) && lunara && \(lunara\.labPanels/);
    expect(ed).toMatch(/hasDoses && bolumAcik\('labs'\) \? 'labs' : 'cycle'/);
    expect(kaynak('postpartum.jsx').match(/bolumAcik\('care'\) && \(/g)).toHaveLength(2);
  });
});
