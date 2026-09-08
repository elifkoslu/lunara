import React from 'react';
import { t } from './i18n';
import { TODAY_KEY } from './shared';

/* stage-date.jsx — evrenin dayandığı tarihi girme alanı.

   Gebelik ekranı tahmini doğum tarihinden, doğum sonrası ekranı doğum
   tarihinden, menopoz ekranı son adet tarihinden hesap yapıyor. Bu üç
   alan başlangıç durumunda sabit örnek değerlerle geliyordu
   ('2026-10-08', '2026-06-04', '2024-03-01') ve hiçbirini yazan bir
   ekran yoktu: kullanıcı kendi tarihini giremiyor, ekranlar ve hekime
   giden özet uydurma bir tarih üzerinden konuşuyordu.

   Tarih yoksa alan kendini öne çıkarır (hesaplar zaten kurulamaz);
   varsa tek satırlık sade bir düzenleme alanı olarak durur. */
function StageDateField({ label, hint, value, onChange, max = TODAY_KEY, min }) {
  const bos = !value;
  return (
    <div style={{
      padding: bos ? '16px 18px' : '12px 16px',
      borderRadius: 'var(--r-md)',
      background: bos ? 'var(--accent-soft)' : 'var(--bone)',
      boxShadow: bos ? 'none' : 'inset 0 0 0 1px var(--line-soft)',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div>
        <div className="eyebrow">{label}</div>
        {bos && hint && (
          <p style={{ fontSize: 12, color: 'var(--ink-2)', margin: '6px 0 0', lineHeight: 1.5 }}>{hint}</p>
        )}
      </div>
      <input type="date" value={value || ''} max={max} min={min}
        onChange={e => onChange(e.target.value || null)}
        aria-label={label}
        style={{
          border: '1px solid var(--line)', borderRadius: 10, padding: '11px 13px',
          fontFamily: 'var(--sans)', fontSize: 15, color: 'var(--ink)',
          background: 'var(--card)', outline: 'none', width: '100%', boxSizing: 'border-box',
        }}/>
    </div>
  );
}

export { StageDateField };
