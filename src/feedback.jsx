import React from 'react';
import { t, useLang } from './i18n';
import { Btn } from './screens';
import { Card } from './shared';

/* feedback.jsx — "Sorun bildir ya da öneride bulun"

   Lunara'nın sunucusu yok ve hiçbir yere veri göndermiyor; bildirim de bu
   kuralı bozmuyor. "Gönder" telefonun e-posta uygulamasını konu ve metin
   hazır halde açıyor, göndermeyi kullanıcı kendisi onaylıyor. Metne yalnızca
   kullanıcının yazdığı ile hatayı anlamaya yetecek teknik satır ekleniyor
   (sürüm, evre, dil, ekran, tarayıcı) — sağlık kaydı eklenmiyor ve
   kullanıcı e-postada her şeyi gönderilmeden önce görüyor. */

const GERI_BILDIRIM_ADRESI = 'elfkoslu@gmail.com';
// mailto bağlantıları bazı e-posta uygulamalarında ~2000 karakterde kesiliyor.
const MAKS_UZUNLUK = 1500;
const SURUM = typeof __LUNARA_SURUM__ !== 'undefined' ? __LUNARA_SURUM__ : 'dev';

function teknikSatir({ stage, lang, genislik, tarayici }) {
  return `Lunara ${SURUM} · ${stage || '?'} · ${lang} · ${genislik}px · ${tarayici}`;
}

function geriBildirimBaglantisi({ tur, metin, stage, lang, genislik, tarayici }) {
  const konu = tur === 'oneri'
    ? (lang === 'tr' ? 'Lunara — öneri' : 'Lunara — suggestion')
    : (lang === 'tr' ? 'Lunara — sorun bildirimi' : 'Lunara — problem report');
  const govde = String(metin || '').trim().slice(0, MAKS_UZUNLUK)
    + '\n\n—\n' + teknikSatir({ stage, lang, genislik, tarayici });
  return `mailto:${GERI_BILDIRIM_ADRESI}?subject=${encodeURIComponent(konu)}&body=${encodeURIComponent(govde)}`;
}

function FeedbackCard({ lunara }) {
  const lang = useLang();
  const [tur, setTur] = React.useState('sorun'); // sorun | oneri
  const [metin, setMetin] = React.useState('');
  const [acildi, setAcildi] = React.useState(false);
  const bos = !metin.trim();

  const gonder = () => {
    if (bos) return;
    window.location.href = geriBildirimBaglantisi({
      tur, metin, lang,
      stage: lunara && lunara.stage,
      genislik: window.innerWidth,
      tarayici: navigator.userAgent,
    });
    setAcildi(true);
  };

  return (
    <Card>
      <div className="eyebrow" style={{ marginBottom: 12 }}>{t('Report a problem or wish', 'Sorun bildir ya da öneride bulun')}</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {[{ k: 'sorun', en: 'Problem', tr: 'Sorun' }, { k: 'oneri', en: 'Wish / idea', tr: 'Öneri' }].map(o => {
          const on = o.k === tur;
          return (
            <button key={o.k} onClick={() => setTur(o.k)} aria-pressed={on} style={{
              flex: 1, padding: '10px 0', borderRadius: 12, fontSize: 13.5, fontWeight: on ? 700 : 500, cursor: 'pointer',
              background: on ? 'var(--ink)' : 'var(--bone)', color: on ? 'var(--ivory)' : 'var(--ink-2)',
              boxShadow: on ? 'none' : 'inset 0 0 0 1px var(--line-soft)',
            }}>{t(o.en, o.tr)}</button>
          );
        })}
      </div>
      <textarea value={metin} onChange={e => { setMetin(e.target.value.slice(0, MAKS_UZUNLUK)); setAcildi(false); }}
        aria-label={t('Report a problem or wish', 'Sorun bildir ya da öneride bulun')}
        placeholder={tur === 'oneri'
          ? t('What would make Lunara more useful for you?', 'Lunara’yı senin için daha yararlı ne yapardı?')
          : t('What happened, on which screen? What did you expect instead?', 'Ne oldu, hangi ekranda? Bunun yerine ne bekliyordun?')}
        style={{
          width: '100%', minHeight: 96, resize: 'vertical',
          border: '1px solid var(--line)', borderRadius: 12, padding: 12,
          fontFamily: 'var(--sans)', fontSize: 13.5, color: 'var(--ink)',
          background: 'var(--ivory)', outline: 'none', boxSizing: 'border-box',
        }}/>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, gap: 12 }}>
        <span style={{ fontSize: 11, color: 'var(--muted-2)', fontFamily: 'var(--mono)' }}>{metin.length}/{MAKS_UZUNLUK}</span>
        <Btn primary disabled={bos} onClick={gonder}>{t('Send by email', 'E-postayla gönder')}</Btn>
      </div>
      <p style={{ fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.5, margin: '12px 0 0' }}>
        {t('Your email app opens with the message ready; you send it yourself. Only what you write and the app version, life stage, language and browser are included — none of your health entries.',
           'E-posta uygulaman mesaj hazır halde açılır, göndermeyi sen yaparsın. Yalnızca yazdığın metin ile uygulama sürümü, yaşam evresi, dil ve tarayıcı bilgisi eklenir — sağlık kayıtların eklenmez.')}
      </p>
      {acildi && (
        <p style={{ fontSize: 11.5, color: 'var(--ink-2)', lineHeight: 1.5, margin: '8px 0 0' }}>
          {t('If no email app opened, write to ', 'E-posta uygulaması açılmadıysa şu adrese yazabilirsin: ')}
          <span style={{ fontFamily: 'var(--mono)', userSelect: 'all' }}>{GERI_BILDIRIM_ADRESI}</span>
        </p>
      )}
    </Card>
  );
}

export { FeedbackCard, geriBildirimBaglantisi, GERI_BILDIRIM_ADRESI, MAKS_UZUNLUK };
