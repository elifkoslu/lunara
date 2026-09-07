import React from 'react';
import { t } from './i18n';
import { ICONS, Icon, Logo, navItemsFor } from './shared';
import { useIsMobile } from './use-mobile';

/* mobile.jsx — Lunara responsive mobile shell (bottom tabs + sheet) */
/* eslint-disable */


/* Bölüm künyesi. Hangi bölümün görüneceğine burası değil, evrenin kendi
   listesi (navItemsFor) karar verir — burada yalnızca ikon ve etiket durur. */
const NAV_META = {
  home:     { icon: ICONS.home,  en: 'Today',     tr: 'Bugün',      subEn: 'Your day at a glance',    subTr: 'Günün özeti' },
  symptoms: { icon: ICONS.pulse, en: 'Symptoms',  tr: 'Belirtiler', subEn: 'Log how you feel',        subTr: 'Nasıl hissettiğini kaydet' },
  cycle:    { icon: ICONS.moon,  en: 'Cycle',     tr: 'Döngü',      subEn: 'Calendar & phases',       subTr: 'Takvim & fazlar' },
  doses:    { icon: ICONS.pill,  en: 'Doses',     tr: 'Dozlar',     subEn: 'Today’s regimen',         subTr: 'Bugünün rejimi' },
  move:     { icon: ICONS.pulse, en: 'Move',      tr: 'Hareket',    subEn: 'Movement for your phase', subTr: 'Fazına göre hareket' },
  nourish:  { icon: ICONS.leaf,  en: 'Nutrition', tr: 'Beslenme',   subEn: 'Cycle-phase eating',      subTr: 'Döngü fazına göre beslenme' },
  labs:     { icon: ICONS.vial,  en: 'Labs',      tr: 'Tahliller',  subEn: 'Results & trends',        subTr: 'Sonuçlar & eğilimler' },
  care:     { icon: ICONS.chat,  en: 'Care team', tr: 'Destek ekibi', subEn: 'Message & consults',    subTr: 'Mesaj & randevular' },
  profile:  { icon: ICONS.cog,   en: 'Profile & settings', tr: 'Profil & ayarlar', subEn: 'Account, language, alerts', subTr: 'Hesap, dil, uyarılar' },
};

/* Alt barda dört yer var; oraya günlük dokunulan bölümler çıkmalı. Bu sıra,
   evrenin bölüm listesini yeniden dizmek için kullanılıyor: Belirtiler her
   evrede var ve Bugün ekranının birincil butonu oraya gidiyor, o yüzden ayda
   bir açılan Hareket/Beslenme gibi referans ekranlarının önünde. */
const MOBILE_PRIORITY = ['home', 'symptoms', 'cycle', 'doses', 'move', 'nourish', 'labs', 'care'];
const BAR_SLOTS = 4;

/* Evrenin bölümlerini bara ve "Daha" sayfasına dağıtır.
   Eskiden bar sabitti: döngü takibi yapan biri de gebe biri de telefonda aynı
   dokuz bölümü görüyordu — kendi evresinde tanımlı olmayan Dozlar ve Tahliller
   dahil. navItemsFor masaüstü yan menüde zaten kullanılıyordu, mobil onu
   atlıyordu; tek fark buydu. */
function mobileNav(stage) {
  const keys = navItemsFor(stage).map(i => i.k).filter(k => NAV_META[k]);
  const sirali = MOBILE_PRIORITY.filter(k => keys.indexOf(k) !== -1)
    .concat(keys.filter(k => MOBILE_PRIORITY.indexOf(k) === -1));
  const al = k => ({ k, ...NAV_META[k] });
  return {
    tabs: sirali.slice(0, BAR_SLOTS).map(al),
    // Profil hiçbir evrenin bölüm listesinde yok ama her zaman erişilebilmeli
    more: sirali.slice(BAR_SLOTS).map(al).concat([al('profile')]),
  };
}

const ICON_DOTS = 'M5 12h.01M12 12h.01M19 12h.01';

function MobileShell({ active, onNav, children, profile, stage }) {
  const [sheet, setSheet] = React.useState(false);
  const { tabs: TABS, more: MORE_ITEMS } = React.useMemo(() => mobileNav(stage), [stage]);
  const moreActive = MORE_ITEMS.some(m => m.k === active);
  const initial = (profile && profile.name) ? profile.name.charAt(0).toLocaleLowerCase('tr') : '·';

  return (
    <div className="lunara-mobile" style={{
      position: 'fixed', inset: 0,
      display: 'flex', flexDirection: 'column',
      background: 'var(--ivory)',
      fontFamily: 'var(--sans)', color: 'var(--ink)',
    }}>
      {/* Header */}
      <header style={{
        flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: 'calc(env(safe-area-inset-top) + 12px) 18px 12px',
        background: 'var(--bone)',
        borderBottom: '1px solid var(--line)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <Logo size={28}/>
          <span style={{ fontFamily: 'var(--serif)', fontSize: 23, fontStyle: 'var(--display-italic)', fontWeight: 500, letterSpacing: '0.01em' }}>Lunara</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button aria-label="Notifications" style={{
            width: 38, height: 38, borderRadius: 999, position: 'relative',
            background: 'var(--card)', boxShadow: 'inset 0 0 0 1px var(--line)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-2)',
          }}>
            <Icon d={ICONS.bell} size={16}/>
            <span style={{ position: 'absolute', top: 9, right: 10, width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }}/>
          </button>
          <button onClick={() => { onNav('profile'); setSheet(false); }} aria-label="Profile" style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'var(--accent-soft)', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--serif)', fontStyle: 'var(--display-italic)', fontSize: 17, color: 'var(--ink)',
            boxShadow: active === 'profile' ? '0 0 0 2px var(--accent)' : 'none',
          }}>{initial}</button>
        </div>
      </header>

      {/* Scrollable content */}
      <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch' }}>
        <div key={active} className="fade-up">{children}</div>
      </main>

      {/* Bottom tab bar */}
      <nav style={{
        flexShrink: 0,
        display: 'grid', gridTemplateColumns: `repeat(${TABS.length + 1}, 1fr)`,
        background: 'var(--card)',
        borderTop: '1px solid var(--line)',
        padding: '8px 6px calc(env(safe-area-inset-bottom) + 8px)',
      }}>
        {TABS.map(tb => <TabButton key={tb.k} icon={tb.icon} label={t(tb.en, tb.tr)} active={active === tb.k} onClick={() => { onNav(tb.k); setSheet(false); }}/>)}
        <TabButton icon={ICON_DOTS} label={t('More', 'Daha')} active={moreActive || sheet} onClick={() => setSheet(s => !s)}/>
      </nav>

      {/* More sheet */}
      {sheet && (
        <>
          <div onClick={() => setSheet(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(20,14,10,0.4)', zIndex: 50 }}/>
          <div className="sheet-up" style={{
            position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 51,
            background: 'var(--card)', borderTopLeftRadius: 22, borderTopRightRadius: 22,
            padding: '12px 16px calc(env(safe-area-inset-bottom) + 20px)',
            boxShadow: '0 -16px 40px -16px rgba(0,0,0,0.4)',
          }}>
            <div style={{ width: 38, height: 4, borderRadius: 4, background: 'var(--line)', margin: '4px auto 14px' }}/>
            <div className="eyebrow" style={{ padding: '0 6px 10px' }}>{t('More', 'Daha fazla')}</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {MORE_ITEMS.map((m, i) => (
                <button key={m.k} onClick={() => { onNav(m.k); setSheet(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 6px', textAlign: 'left',
                    borderBottom: i < MORE_ITEMS.length - 1 ? '1px solid var(--line-soft)' : 'none', background: 'transparent',
                  }}>
                  <span style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--bone)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: active === m.k ? 'var(--accent)' : 'var(--ink-2)' }}>
                    <Icon d={m.icon} size={19}/>
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{t(m.en, m.tr)}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{t(m.subEn, m.subTr)}</div>
                  </div>
                  <Icon d={ICONS.arrow} size={15} stroke="var(--muted-2)"/>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function TabButton({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      padding: '4px 0', background: 'transparent', cursor: 'pointer',
      color: active ? 'var(--accent)' : 'var(--muted)',
      transition: 'color 140ms ease',
    }}>
      <Icon d={icon} size={21} sw={active ? 2 : 1.5}/>
      <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, letterSpacing: '0.02em' }}>{label}</span>
    </button>
  );
}

export { useIsMobile, mobileNav, NAV_META, MOBILE_PRIORITY, BAR_SLOTS, ICON_DOTS, MobileShell, TabButton };
