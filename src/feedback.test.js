import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { GERI_BILDIRIM_ADRESI, MAKS_UZUNLUK, geriBildirimBaglantisi } from './feedback.jsx';

/* Geri bildirim sunucusuz: e-posta uygulaması hazır metinle açılıyor,
   kullanıcı kendisi gönderiyor. Sağlık kaydı metne girmemeli. */
const temel = { tur: 'sorun', metin: 'Takvim açılmıyor', stage: 'perimeno', lang: 'tr', genislik: 375, tarayici: 'Test/1.0' };
const coz = (url) => {
  const u = new URL(url);
  return { adres: u.pathname, konu: u.searchParams.get('subject'), govde: u.searchParams.get('body') };
};

describe('geri bildirim bağlantısı', () => {
  it('adres, konu ve metin', () => {
    const { adres, konu, govde } = coz(geriBildirimBaglantisi(temel));
    expect(adres).toBe(GERI_BILDIRIM_ADRESI);
    expect(konu).toBe('Lunara — sorun bildirimi');
    expect(govde.startsWith('Takvim açılmıyor\n\n—\nLunara ')).toBe(true);
    expect(govde).toMatch(/ · perimeno · tr · 375px · Test\/1\.0$/);
  });

  it('öneri konusu ve İngilizce', () => {
    expect(coz(geriBildirimBaglantisi({ ...temel, tur: 'oneri' })).konu).toBe('Lunara — öneri');
    expect(coz(geriBildirimBaglantisi({ ...temel, tur: 'oneri', lang: 'en' })).konu).toBe('Lunara — suggestion');
  });

  it('& ve satır sonu gibi karakterler bağlantıyı bozmuyor', () => {
    const metin = 'a & b?\nsubject=x #1 %20';
    expect(coz(geriBildirimBaglantisi({ ...temel, metin })).govde.startsWith(metin + '\n')).toBe(true);
  });

  it('uzun metin kısaltılıyor', () => {
    const { govde } = coz(geriBildirimBaglantisi({ ...temel, metin: 'x'.repeat(5000) }));
    expect(govde.split('\n')[0]).toHaveLength(MAKS_UZUNLUK);
  });

  it('kart yalnızca yazılanı ve teknik satırı kullanıyor — kayıtlara dokunmuyor', () => {
    const kaynak = readFileSync(new URL('./feedback.jsx', import.meta.url), 'utf8');
    expect(kaynak).not.toMatch(/symptomLog|periodDays|labPanels|doseLog|regimen|profile\./);
    expect(kaynak).not.toMatch(/fetch\(|XMLHttpRequest|sendBeacon/);
  });

  it('Profil ekranında', () => {
    expect(readFileSync(new URL('./profile.jsx', import.meta.url), 'utf8')).toMatch(/<FeedbackCard lunara=\{lunara\}\/>/);
  });
});
