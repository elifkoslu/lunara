import React from 'react';
import { I18N, t, useLang } from './i18n';
import { Btn, ScreenHead, wrap } from './screens';
import { Card, ICONS, Icon, PROGRAM } from './shared';
import { STAGES, stageName } from './stages';

/* profile.jsx — Lunara profil & ayarlar ekranı */
/* eslint-disable */

function ProfileScreen({ lunara, api, onNav, onOpenPrivacy }) {
  const p = lunara.profile;
  const [draft, setDraft] = React.useState(p);
  const [editing, setEditing] = React.useState(false);
  const [showPrivacy, setShowPrivacy] = React.useState(false);
  const lang = useLang();
  const openPrivacy = onOpenPrivacy || (() => setShowPrivacy(true));

  // keep draft in sync if profile changes elsewhere
  React.useEffect(() => { setDraft(lunara.profile); }, [lunara.profile]);

  const save = () => { api.updateProfile(draft); setEditing(false); };
  const cancel = () => { setDraft(p); setEditing(false); };

  const fieldWrap = wrap; // shared screen padding

  return (
    <div style={fieldWrap}>
      <ScreenHead eyebrow={t('ACCOUNT', 'HESAP')} title={t('Profile & settings', 'Profil & ayarlar')} />

      <div className="mb-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
        {/* ── Identity card ── */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'var(--accent-soft)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--serif)', fontStyle: 'var(--display-italic)', fontSize: 30, color: 'var(--ink)',
            }}>{(p.name || '·').charAt(0).toLocaleLowerCase(lang === 'tr' ? 'tr' : 'en')}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 26, letterSpacing: '-0.01em' }}>{p.name}</div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
                {STAGES[lunara.stage] ? `${STAGES[lunara.stage].note} · ${stageName(lunara.stage)}` : ''}
              </div>
            </div>
            {!editing && (
              <Btn onClick={() => setEditing(true)}>{t('Edit', 'Düzenle')}</Btn>
            )}
          </div>

          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field label={t('Name', 'Ad')} value={draft.name}
                onChange={v => setDraft({ ...draft, name: v })}/>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label={t('Age', 'Yaş')} value={String(draft.age ?? '')} type="number"
                  onChange={v => setDraft({ ...draft, age: v.replace(/\D/g, '') })}/>
                <Field label={t('Email', 'E-posta')} value={draft.email || ''} type="email"
                  onChange={v => setDraft({ ...draft, email: v })}/>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <Btn primary onClick={save}>{t('Save changes', 'Değişiklikleri kaydet')}</Btn>
                <Btn onClick={cancel}>{t('Cancel', 'İptal')}</Btn>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <InfoRow label={t('Age', 'Yaş')} value={p.age ? `${p.age}` : '—'}/>
              <InfoRow label={t('Email', 'E-posta')} value={p.email || '—'}/>
              <InfoRow label={t('Life stage', 'Yaşam evresi')}
                value={`${STAGES[lunara.stage] ? STAGES[lunara.stage].note + ' · ' : ''}${stageName(lunara.stage)}`}
                action={t('Change', 'Değiştir')}
                onAction={() => { api.setOnboarded(false); onNav('onboarding'); }} />
              <InfoRow label={t('Program', 'Program')} value={t(PROGRAM.name, PROGRAM.nameTr)} last/>
            </div>
          )}
        </Card>

        {/* ── Right column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Language */}
          <Card>
            <div className="eyebrow" style={{ marginBottom: 14 }}>{t('Language', 'Dil')}</div>
            <div style={{ display: 'flex', gap: 10 }}>
              {[{ k: 'en', label: 'English' }, { k: 'tr', label: 'Türkçe' }].map(o => {
                const on = o.k === lang;
                return (
                  <button key={o.k} onClick={() => I18N.set(o.k)}
                    style={{
                      flex: 1, padding: '12px 0', borderRadius: 12,
                      fontSize: 14, fontWeight: on ? 700 : 500, cursor: 'pointer',
                      background: on ? 'var(--ink)' : 'var(--bone)',
                      color: on ? 'var(--ivory)' : 'var(--ink-2)',
                      boxShadow: on ? 'none' : 'inset 0 0 0 1px var(--line-soft)',
                      transition: 'all 140ms ease',
                    }}>{o.label}</button>
                );
              })}
            </div>
          </Card>

          {/* Notifications */}
          <Card>
            <div className="eyebrow" style={{ marginBottom: 8 }}>{t('Notifications', 'Bildirimler')}</div>
            <Toggle label={t('Dose reminders', 'Doz hatırlatıcıları')}
              sub={t('Nudge me when a dose is due', 'Doz zamanı geldiğinde uyar')}
              on={p.reminders} onToggle={() => toggleNotifications('reminders', !p.reminders, api)}/>
            <Toggle label={t('Cycle & phase alerts', 'Döngü & faz uyarıları')}
              sub={t('Period, fertile window, phase shifts', 'Regl, doğurgan pencere, faz geçişleri')}
              on={p.cycleAlerts} onToggle={() => api.updateProfile({ cycleAlerts: !p.cycleAlerts })}/>
            <Toggle label={t('Lab reminders', 'Tahlil hatırlatıcıları')}
              sub={t('Upcoming blood draws', 'Yaklaşan kan tahlilleri')}
              on={p.labReminders} onToggle={() => api.updateProfile({ labReminders: !p.labReminders })}/>
            <Toggle label={t('Email updates', 'E-posta güncellemeleri')}
              sub={t('Weekly summary from your care team', 'Destek ekibinden haftalık özet')}
              on={p.emailUpdates} onToggle={() => api.updateProfile({ emailUpdates: !p.emailUpdates })} last/>
          </Card>

          {/* Data & account */}
          <Card>
            <div className="eyebrow" style={{ marginBottom: 12 }}>{t('Data & account', 'Veri & hesap')}</div>
            <ActionRow icon={ICONS.vial} label={t('Export my data', 'Verilerimi dışa aktar')}
              onClick={() => exportData(lunara)}/>
            <ActionRow icon={ICONS.book} label={t('Privacy & terms', 'Gizlilik & koşullar')} onClick={openPrivacy}/>
            <ActionRow icon={ICONS.arrow} label={t('Sign out', 'Çıkış yap')} danger onClick={() => {}} last/>
          </Card>
        </div>
      </div>

      <div style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--muted-2)', fontFamily: 'var(--mono)', letterSpacing: '0.04em', marginTop: 4 }}>
        LUNARA · v1.0 · {t('your data stays on this device', 'verilerin bu cihazda kalır')}
      </div>

      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)}/>}
    </div>
  );
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span className="eyebrow">{label}</span>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        style={{
          border: '1px solid var(--line)', borderRadius: 10, padding: '11px 13px',
          fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--ink)',
          background: 'var(--ivory)', outline: 'none', width: '100%', boxSizing: 'border-box',
        }}/>
    </label>
  );
}

function InfoRow({ label, value, last, action, onAction }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '13px 0', borderBottom: last ? 'none' : '1px solid var(--line-soft)',
    }}>
      <span style={{ fontSize: 13, color: 'var(--muted)' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 13.5, color: 'var(--ink)', fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{value}</span>
        {action && <button onClick={onAction} style={{
          fontSize: 12, color: 'var(--accent)', fontWeight: 600, cursor: 'pointer',
          padding: '4px 10px', borderRadius: 999, background: 'var(--accent-soft)',
        }}>{action}</button>}
      </div>
    </div>
  );
}

function Toggle({ label, sub, on, onToggle, last }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '13px 0', borderBottom: last ? 'none' : '1px solid var(--line-soft)',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--ink)' }}>{label}</div>
        {sub && <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 1 }}>{sub}</div>}
      </div>
      <button onClick={onToggle} aria-pressed={on} style={{
        width: 44, height: 26, borderRadius: 999, flexShrink: 0, cursor: 'pointer',
        background: on ? 'var(--accent)' : 'var(--line)',
        position: 'relative', transition: 'background 180ms ease',
      }}>
        <span style={{
          position: 'absolute', top: 3, left: on ? 21 : 3,
          width: 20, height: 20, borderRadius: '50%', background: 'var(--card)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 180ms ease',
        }}/>
      </button>
    </div>
  );
}

function ActionRow({ icon, label, onClick, danger, last }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left',
      padding: '13px 0', borderBottom: last ? 'none' : '1px solid var(--line-soft)',
      background: 'transparent', cursor: 'pointer',
      color: danger ? 'var(--signal-low)' : 'var(--ink)',
    }}>
      <span style={{
        width: 34, height: 34, borderRadius: 10, background: 'var(--bone)', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: danger ? 'var(--signal-low)' : 'var(--ink-2)',
      }}>
        <Icon d={icon} size={16}/>
      </span>
      <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500 }}>{label}</span>
      <Icon d={ICONS.arrow} size={14} stroke="var(--muted-2)"/>
    </button>
  );
}

// Bildirim izni iste + toggle'ı kaydet
async function toggleNotifications(key, value, api) {
  if (value && 'Notification' in window) {
    try {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') {
        // izin verilmedi — yine de tercihi kaydet ama bilgilendir
        api.updateProfile({ [key]: false });
        alert(I18N.lang === 'tr'
          ? 'Bildirim izni verilmedi. Telefon ayarlarından Lunara için bildirimlere izin verebilirsin.'
          : 'Notification permission denied. You can enable it for Lunara in your phone settings.');
        return;
      }
      // izin verildi — örnek bir doğrulama bildirimi gönder
      new Notification('Lunara', {
        body: I18N.lang === 'tr' ? 'Hatırlatıcılar açıldı 🌙' : 'Reminders are on 🌙',
        icon: 'icon-192.png',
      });
    } catch (e) {}
  }
  api.updateProfile({ [key]: value });
}

// Download the user's logged data as JSON
function exportData(lunara) {
  try {
    const blob = new Blob([JSON.stringify(lunara, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'lunara-data.json';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (e) {}
}

/* ── KVKK / Gizlilik & Koşullar Modalı ─────────────────────── */
function PrivacyModal({ onClose }) {
  useLang();
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(42,24,16,0.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--card)', borderRadius: 22,
        boxShadow: '0 24px 64px -20px rgba(0,0,0,0.4)',
        border: '1px solid var(--line-soft)',
        width: '100%', maxWidth: 620, maxHeight: '80vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 28px 16px', borderBottom: '1px solid var(--line-soft)' }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 4 }}>KVKK · {t('PRIVACY & TERMS', 'GİZLİLİK & KOŞULLAR')}</div>
            <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 24, margin: 0, letterSpacing: '-0.01em' }}>
              {t('Your data, your rights', 'Verilerin, haklarını')}
            </h2>
          </div>
          <button onClick={onClose} style={{
            width: 36, height: 36, borderRadius: '50%', background: 'var(--bone)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            color: 'var(--ink-2)', fontSize: 18, fontWeight: 300,
          }}>×</button>
        </div>

        {/* Content */}
        <div style={{ overflowY: 'auto', padding: '22px 28px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* KVKK vurgusu */}
          <div style={{ padding: '14px 18px', borderRadius: 12, background: 'var(--bone)', border: '1px solid var(--line-soft)' }}>
            <div className="eyebrow" style={{ marginBottom: 8, color: 'var(--accent)' }}>KVKK — 6698 SAYILI KANUN</div>
            <p style={{ fontFamily: 'var(--serif)', fontSize: 15, lineHeight: 1.55, color: 'var(--ink-2)', margin: 0 }}>
              {t(
                'Lunara processes your health data in accordance with Turkish Law No. 6698 on Protection of Personal Data (KVKK) and EU GDPR.',
                'Lunara, sağlık verilerini 6698 Sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve AB GDPR kapsamında işlemektedir.'
              )}
            </p>
          </div>

          <PrivSection title={t('What data we collect', 'Hangi verileri topluyoruz')} items={[
            t('Cycle and symptom logs you enter manually', 'Manuel girdiğin döngü ve belirti kayıtları'),
            t('Dose and supplement records', 'Doz ve takviye kayıtları'),
            t('Profile info (name, age — optional)', 'Profil bilgileri (isim, yaş — isteğe bağlı)'),
            t('Language and display preferences', 'Dil ve görüntüleme tercihleri'),
          ]}/>

          <PrivSection title={t('Where your data lives', 'Veriler nerede saklanır')} items={[
            t('All data is stored locally on your device only (localStorage)', 'Tüm veriler yalnızca cihazında saklanır (localStorage)'),
            t('Nothing is sent to our servers — we have no account system', 'Sunucularımıza hiçbir şey gönderilmez — hesap sistemimiz yoktur'),
            t('AI chat messages go to Anthropic\'s API only when you send a message; no logs are kept by Lunara', 'AI sohbet mesajları yalnızca mesaj gönderdiğinde Anthropic API\'ye iletilir; Lunara kayıt tutmaz'),
          ]}/>

          <PrivSection title={t('Your KVKK rights', 'KVKK kapsamındaki haklarınız')} items={[
            t('Right to know whether your data is processed (Article 11/a)', 'Verilerinin işlenip işlenmediğini öğrenme hakkı (Md. 11/a)'),
            t('Right to request information about processing (Article 11/b)', 'İşleme ile ilgili bilgi talep etme hakkı (Md. 11/b)'),
            t('Right to request erasure — use "Export & delete my data" in settings', 'Silinmesini talep etme hakkı — ayarlarda "Verilerimi dışa aktar" kullan'),
            t('Right to object to processing (Article 11/e)', 'İşlemeye itiraz etme hakkı (Md. 11/e)'),
          ]}/>

          <PrivSection title={t('Health data (special category)', 'Sağlık verileri (özel kategori)')} items={[
            t('Health and reproductive data is classified as "special category personal data" under KVKK Article 6', 'Sağlık ve üreme verileri KVKK Md. 6 uyarınca "özel nitelikli kişisel veri" sayılır'),
            t('Your explicit consent is required — by using Lunara you consent to local processing of your health data', 'Açık rızan gereklidir — Lunara\'yı kullanarak sağlık verilerinin yerel işlenmesine onay vermiş sayılırsın'),
            t('No data is shared with third parties', 'Hiçbir veri üçüncü taraflarla paylaşılmaz'),
          ]}/>

          <PrivSection title={t('Cookies & tracking', 'Çerezler & izleme')} items={[
            t('Lunara uses no cookies, no analytics, no advertising trackers', 'Lunara çerez, analitik veya reklam izleyici kullanmaz'),
            t('The only external connection is Google Fonts (font loading on first use)', 'Tek harici bağlantı ilk kullanımda yazı tipi yükleyen Google Fonts\'tur'),
          ]}/>

          <div style={{ paddingTop: 16, borderTop: '1px solid var(--line-soft)', fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.6, fontFamily: 'var(--serif)', fontStyle: 'italic' }}>
            {t(
              'Last updated: June 2026. This is a prototype application. For questions about your data, contact: privacy@lunara.app',
              'Son güncelleme: Haziran 2026. Bu bir prototip uygulamadır. Verileriniz hakkında sorularınız için: privacy@lunara.app'
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 28px', borderTop: '1px solid var(--line-soft)', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '11px 24px', borderRadius: 999,
            background: 'var(--ink)', color: 'var(--ivory)',
            fontSize: 13.5, fontWeight: 600, cursor: 'pointer', border: 'none',
          }}>{t('I understand', 'Anladım')}</button>
        </div>
      </div>
    </div>
  );
}

function PrivSection({ title, items }) {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>{title}</div>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((item, i) => (
          <li key={i} style={{ display: 'flex', gap: 10, fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.5 }}>
            <span style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }}>·</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export { ProfileScreen, Field, InfoRow, Toggle, ActionRow, toggleNotifications, exportData, PrivacyModal, PrivSection };
