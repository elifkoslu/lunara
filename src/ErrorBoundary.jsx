import React from 'react';
import { t } from './i18n';

/* Top-level error boundary — a runtime error must never leave the user
   staring at a blank screen. Data lives in localStorage, so a reload is safe. */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    try { console.error('[Lunara] render error:', error, info); } catch (e) {}
  }
  render() {
    if (!this.state.error) return this.props.children;
    const msg = String((this.state.error && this.state.error.message) || '');
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--ivory, #FBF6EB)', padding: 24,
        fontFamily: "var(--sans, 'Manrope', system-ui, sans-serif)",
      }}>
        <div style={{ maxWidth: 420, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>🌙</div>
          <div style={{ fontFamily: "var(--serif, Georgia, serif)", fontSize: 28, color: 'var(--ink, #2A1810)', marginBottom: 10, letterSpacing: '-0.01em' }}>
            {t('Something went wrong', 'Bir şeyler ters gitti')}
          </div>
          <p style={{ fontSize: 14, color: 'var(--muted, #876A55)', lineHeight: 1.6, margin: '0 0 22px' }}>
            {t('Your data is safe on this device. Reloading usually fixes this.',
               'Verilerin bu cihazda güvende. Yeniden yüklemek genellikle sorunu çözer.')}
          </p>
          <button onClick={() => window.location.reload()} style={{
            padding: '13px 30px', borderRadius: 999, border: 'none', cursor: 'pointer',
            background: 'var(--ink, #2A1810)', color: 'var(--ivory, #FBF6EB)',
            fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
          }}>
            {t('Reload Lunara', 'Lunara’yı yeniden yükle')}
          </button>
          {msg && (
            <div style={{ marginTop: 18, fontFamily: "var(--mono, ui-monospace, monospace)", fontSize: 11, color: 'var(--muted-2, #A89178)', wordBreak: 'break-word' }}>
              {msg}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
