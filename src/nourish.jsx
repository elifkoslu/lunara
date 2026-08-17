import React from 'react';
import { tx } from './dict';
import { I18N, t } from './i18n';
import { NourishGuideCard, PERIMENO_NOURISH, StageNourishView } from './nourish-stages';
import { PHASE_TINT, ScreenHead, cycleDayFrom, cycleLenOf, phaseLabel, phaseOf, phaseRange } from './screens';
import { WaterCard } from './water';
import { Card, ICONS, Icon, TODAY_DATE, TODAY_KEY, getTodayKey } from './shared';

/* nourish.jsx — Lunara · phase-based movement & nutrition guidance
   Reads the current cycle phase and tailors recommendations.
   Depends on screens.jsx (cycleDayFrom, phaseOf, PHASE_TINT). */
/* eslint-disable */

const PHASE_GUIDE = {
  menstrual: {
    label: 'Menstrual',
    range: 'Days 1–5',
    energy: 'Low',
    tagline: 'Rest is productive. Hormones are at their floor — meet the body gently.',
    move: {
      headline: 'Restorative & gentle',
      session: '20–35 min · RPE 2–3 / 10',
      items: [
        { name: 'Walking', detail: '20–30 min, easy pace, outdoors if you can', icon: 'walk',
          plan: { meta: '25 min · easy', steps: [
            { phase: 'Walk', spec: '20–30 min', sub: 'Conversational pace, nose-breathing' },
            { phase: 'Optional add-on', spec: '5 min', sub: 'Gentle uphill or stairs if energy allows' },
          ] } },
        { name: 'Yin / restorative yoga', detail: 'Hip openers, supported forward folds', icon: 'yoga',
          plan: { meta: '20 min · 4 holds', steps: [
            { phase: 'Reclined butterfly', spec: '3 min hold', sub: 'Pillow under knees' },
            { phase: 'Supported forward fold', spec: '3 min', sub: 'Bolster on thighs' },
            { phase: 'Child’s pose', spec: '2 min', sub: 'Wide knees, breathe into low back' },
            { phase: 'Legs up the wall', spec: '5 min', sub: 'Eases cramps & swelling' },
          ] } },
        { name: 'Mobility & stretching', detail: 'Loosen lower back and pelvis', icon: 'stretch',
          plan: { meta: '10 min · 5 moves', steps: [
            { phase: 'Cat–cow', spec: '10 reps', sub: 'Slow, with breath' },
            { phase: 'Hip circles', spec: '8 each way', sub: 'Standing or all-fours' },
            { phase: 'Pelvic tilts', spec: '12 reps', sub: 'Releases low back' },
            { phase: 'Figure-4 stretch', spec: '45 s each side', sub: 'Glutes & piriformis' },
          ] } },
      ],
      avoid: 'Skip heavy lifting and HIIT if you feel depleted — they can raise cortisol now.',
    },
    eat: {
      headline: 'Replenish iron & warmth',
      items: [
        { name: 'Iron-rich foods', detail: 'Lentils, grass-fed red meat, spinach', tag: 'IRON' },
        { name: 'Warm, cooked meals', detail: 'Soups, stews, ginger, bone broth', tag: 'WARMTH' },
        { name: 'Vitamin C pairing', detail: 'Citrus or peppers to absorb iron', tag: 'ABSORB' },
        { name: 'Magnesium', detail: 'Dark chocolate, pumpkin seeds — eases cramps', tag: 'MG' },
      ],
      note: 'For PCOS: keep blood sugar steady — pair any carbs with protein and fat.',
    },
  },
  follicular: {
    label: 'Follicular',
    range: 'Days 6–13',
    energy: 'Rising',
    tagline: 'Estrogen climbs — energy, mood, and coordination rise with it. Build and try new things.',
    move: {
      headline: 'Build & challenge',
      session: '40–55 min · RPE 6–7 / 10',
      items: [
        { name: 'Strength training', detail: 'Progressive overload — muscle responds well now', icon: 'lift',
          plan: { meta: '45 min · 4 lifts', steps: [
            { phase: 'Warm-up', spec: '6 min', sub: 'Bike + banded glute work' },
            { phase: 'Goblet squat', spec: '4 × 8–10', sub: '90 s rest, add load weekly' },
            { phase: 'Romanian deadlift', spec: '4 × 8', sub: 'Hinge, controlled tempo' },
            { phase: 'Bench / push-up', spec: '3 × 10', sub: 'Full range' },
            { phase: 'Row', spec: '3 × 12', sub: 'Squeeze shoulder blades' },
          ] } },
        { name: 'Cardio & dance', detail: 'Higher intensity feels easier', icon: 'run',
          plan: { meta: '30 min · intervals', steps: [
            { phase: 'Warm-up', spec: '5 min', sub: 'Build to moderate' },
            { phase: 'Intervals', spec: '8 × (1 min hard / 1 min easy)', sub: 'RPE 7 on hard' },
            { phase: 'Cool-down', spec: '5 min', sub: 'Easy pace + breathe' },
          ] } },
        { name: 'Try something new', detail: 'Skill-learning peaks with rising estrogen', icon: 'spark',
          plan: { meta: '45 min · skill', steps: [
            { phase: 'Pick a class', spec: '1 session', sub: 'Climbing, boxing, dance — coordination is high now' },
            { phase: 'Focus', spec: 'technique', sub: 'Estrogen aids motor learning this week' },
          ] } },
      ],
      avoid: 'A good window to push — just keep recovery and sleep on track.',
    },
    eat: {
      headline: 'Fresh, light & fermented',
      items: [
        { name: 'Lean proteins', detail: 'Eggs, chicken, fish to fuel building', tag: 'PROTEIN' },
        { name: 'Fermented foods', detail: 'Sauerkraut, kimchi, yogurt — gut + estrogen', tag: 'GUT' },
        { name: 'Light fresh produce', detail: 'Sprouts, leafy greens, berries', tag: 'FRESH' },
        { name: 'Complex carbs', detail: 'Oats, quinoa for steady energy', tag: 'CARB' },
      ],
      note: 'For PCOS: prioritise low-glycaemic carbs to keep insulin even as appetite returns.',
    },
  },
  ovulation: {
    label: 'Ovulation',
    range: 'Days 14–18',
    energy: 'Peak',
    tagline: 'The high point — strength, confidence, and verbal recall peak. Use the momentum.',
    move: {
      headline: 'Peak performance',
      session: '35–50 min · RPE 8–9 / 10',
      items: [
        { name: 'HIIT & sprints', detail: 'Power output is at its highest', icon: 'run',
          plan: { meta: '25 min · sprints', steps: [
            { phase: 'Warm-up', spec: '8 min', sub: 'Thorough — joints are laxer now' },
            { phase: 'Sprints', spec: '6 × 20 s all-out', sub: '90 s walk between' },
            { phase: 'Cool-down', spec: '5 min', sub: 'Easy + mobility' },
          ] } },
        { name: 'Heavy strength', detail: 'Go for PRs — but warm up well', icon: 'lift',
          plan: { meta: '50 min · strength', steps: [
            { phase: 'Warm-up', spec: '10 min', sub: 'Ramp-up sets, light → heavy' },
            { phase: 'Squat or deadlift', spec: '5 × 3–5', sub: 'Heavy, 2–3 min rest — PR window' },
            { phase: 'Press', spec: '4 × 5', sub: 'Strict form' },
            { phase: 'Accessory', spec: '3 × 8', sub: 'Lunges, pull-ups' },
          ] } },
        { name: 'Group classes', detail: 'Sociability peaks — lean into it', icon: 'spark',
          plan: { meta: '45 min · class', steps: [
            { phase: 'Spin / bootcamp', spec: '1 session', sub: 'Push intensity — recovery is good now' },
            { phase: 'Warm-up', spec: 'don’t skip', sub: 'Protect knees & ankles' },
          ] } },
      ],
      avoid: 'Joints are slightly laxer near ovulation — warm up thoroughly to protect knees.',
    },
    eat: {
      headline: 'Anti-inflammatory & fibre',
      items: [
        { name: 'Colourful vegetables', detail: 'Cruciferous: broccoli, cauliflower — clears estrogen', tag: 'FIBRE' },
        { name: 'Antioxidants', detail: 'Berries, leafy greens, turmeric', tag: 'ANTIOX' },
        { name: 'Light proteins', detail: 'Fish, tofu — easier digestion at peak', tag: 'PROTEIN' },
        { name: 'Hydration + electrolytes', detail: 'You sweat more at this intensity', tag: 'HYDRATE' },
      ],
      note: 'For PCOS: cruciferous veg supports estrogen metabolism — aim for a serving daily.',
    },
  },
  luteal: {
    label: 'Luteal',
    range: 'Days 19–32',
    energy: 'Winding down',
    tagline: 'Progesterone rises, then both hormones fall. Appetite and cravings climb — be kind and steady.',
    move: {
      headline: 'Steady & grounding',
      session: '30–45 min · RPE 4–6 / 10',
      items: [
        { name: 'Pilates & barre', detail: 'Controlled strength without the spike', icon: 'yoga',
          plan: { meta: '35 min · 4 blocks', steps: [
            { phase: 'Core series', spec: '3 × 12', sub: 'Dead bugs, bird-dogs' },
            { phase: 'Glute bridges', spec: '3 × 15', sub: 'Slow tempo' },
            { phase: 'Standing barre', spec: '2 × 20', sub: 'Small pulses, legs' },
            { phase: 'Stretch', spec: '5 min', sub: 'Hip flexors & hamstrings' },
          ] } },
        { name: 'Moderate strength', detail: 'Keep lifting, lower the volume', icon: 'lift',
          plan: { meta: '40 min · lighter', steps: [
            { phase: 'Warm-up', spec: '6 min', sub: 'Easy cardio + mobility' },
            { phase: 'Squat', spec: '3 × 10', sub: '~70% of peak-week load' },
            { phase: 'Hinge', spec: '3 × 10', sub: 'Controlled' },
            { phase: 'Upper body', spec: '2 × 12', sub: 'Push + pull' },
          ] } },
        { name: 'Longer walks / hikes', detail: 'Zone-2 cardio supports mood', icon: 'walk',
          plan: { meta: '45 min · zone 2', steps: [
            { phase: 'Steady walk / hike', spec: '40–45 min', sub: 'Can hold a conversation' },
            { phase: 'Optional incline', spec: 'rolling hills', sub: 'Lifts mood, gentle on cortisol' },
          ] } },
      ],
      avoid: 'Late luteal: swap HIIT for steady work — recovery slows and cortisol is sensitive.',
    },
    eat: {
      headline: 'Stabilise blood sugar & mood',
      items: [
        { name: 'Complex carbs', detail: 'Sweet potato, squash, brown rice — curbs cravings', tag: 'CARB' },
        { name: 'Magnesium & B6', detail: 'Leafy greens, bananas — eases PMS', tag: 'PMS' },
        { name: 'Healthy fats', detail: 'Avocado, nuts, olive oil for satiety', tag: 'FAT' },
        { name: 'Limit caffeine & salt', detail: 'Eases bloating and tender breasts', tag: 'EASE' },
      ],
      note: 'For PCOS: this is the highest-craving phase — front-load protein and fibre to blunt insulin swings.',
    },
  },
};

// Small glyphs for movement items
const MOVE_ICON = {
  walk: 'M13 4a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM11 9l-2 4 2 2v5M11 9l3 1 2 3M11 9l-3 2',
  run: 'M13 4a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM9 21l3-5-2-3 4-2 2 3 2 1M10 13l-1-3 4-1',
  lift: 'M4 9v6M7 7v10M17 7v10M20 9v6M7 12h10',
  yoga: 'M12 4a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM12 8v6M12 14l-5 5M12 14l5 5M7 11h10',
  stretch: 'M12 4a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM12 8v5l4 3M12 13l-4 3M9 20h6',
  spark: 'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6',
};

/* kind: 'move' → Movement screen · 'eat' → Nutrition screen.
   Split into two screens so each has room for stage-appropriate depth. */
function NourishScreen({ lunara, api, kind = 'eat' }) {
  /* Su her yaşam evresinde anlamlı — gebelikte ve doğum sonrasında belki daha
     da fazla. Bu yüzden kart, evreye özel görünüme erken dönülse de çiziliyor.
     Kendi tarih seçicisini taşıyor: bu ekranda paylaşacağı bir yemek günlüğü yok. */
  const [suGun, setSuGun] = React.useState(getTodayKey());
  const suKarti = (kind === 'eat' && api)
    ? <WaterCard lunara={lunara} api={api} dateKey={suGun} setDateKey={setSuGun}/>
    : null;

  if (typeof StageNourishView !== 'undefined' && (lunara.stage === 'menarche' || lunara.stage === 'pregnancy' || lunara.stage === 'ttc' || lunara.stage === 'postpartum' || lunara.stage === 'menopause'))
    return (
      <>
        {suKarti && <div style={{ padding: '18px 36px 0' }}>{suKarti}</div>}
        <StageNourishView stageKey={lunara.stage} lunara={lunara} kind={kind}/>
      </>
    );
  const isPerimeno = lunara.stage === 'perimeno';
  const today = TODAY_DATE;
  const day = cycleDayFrom(lunara.periodStart, today, cycleLenOf(lunara));
  // Çapa yoksa "şimdi buradasın" işareti konmaz; içerik yine gezilebilir olsun
  // diye seçili faz menstrüelden başlar.
  const livePh = phaseOf(day, cycleLenOf(lunara));
  const live = livePh ? livePh.key : null;
  const cycleLength = cycleLenOf(lunara);
  const [sel, setSel] = React.useState(live || 'menstrual');
  const g = PHASE_GUIDE[sel];
  const tint = PHASE_TINT[sel];
  const [openPlan, setOpenPlan] = React.useState(0);

  // reset expanded plan when switching phase
  React.useEffect(() => { setOpenPlan(0); }, [sel]);

  return (
    <div style={{ padding: '18px 36px 48px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <ScreenHead
        eyebrow={kind === 'move'
          ? t(`CYCLE DAY ${day} · MOVEMENT`, `DÖNGÜ GÜNÜ ${day} · HAREKET`)
          : t(`CYCLE DAY ${day} · NUTRITION`, `DÖNGÜ GÜNÜ ${day} · BESLENME`)}
        title={kind === 'move' ? t('Movement', 'Hareket') : t('Nutrition', 'Beslenme')}
        right={<span style={{ fontSize: 12.5, color: 'var(--muted)', fontStyle: 'italic', fontFamily: 'var(--serif)' }}>
          {t('Tuned to your', 'Senin')} {phaseLabel(phaseOf(day, cycleLenOf(lunara))).toLocaleLowerCase(I18N.lang==='tr'?'tr':'en')} {t('phase', 'fazına göre')}
        </span>} />

      {suKarti}

      {/* In perimenopause the stage-level needs come first; cycle-phase
          guidance still follows because many are still cycling. */}
      {isPerimeno && (
        <>
          <NourishGuideCard kind={kind} g={kind === 'move' ? PERIMENO_NOURISH.move : PERIMENO_NOURISH.eat}/>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '8px 0 -4px' }}>
            <div style={{ height: 1, flex: 1, background: 'var(--line-soft)' }}/>
            <span className="eyebrow" style={{ color: 'var(--muted-2)' }}>{t('If you’re cycling · day ' + day, 'Döngün varsa · ' + day + '. gün')}</span>
            <div style={{ height: 1, flex: 1, background: 'var(--line-soft)' }}/>
          </div>
        </>
      )}

      <ReferansBolum
        ozet={t(`Today: ${tx(g[kind === 'move' ? 'move' : 'eat'].headline)}.`, `Bugün: ${tx(g[kind === 'move' ? 'move' : 'eat'].headline)}.`)}
        acKapaEtiketi={t('See the full phase guide', 'Tüm faz rehberini gör')}>
        {/* Phase selector */}
        <div className="mb-phasesel" style={{ display: 'flex', gap: 10 }}>
          {Object.entries(PHASE_GUIDE).map(([k, p]) => {
            const on = k === sel;
            const isLive = k === live;
            return (
              <button key={k} onClick={() => setSel(k)}
                style={{
                  flex: 1, textAlign: 'left', cursor: 'pointer',
                  padding: '14px 16px', borderRadius: 14,
                  background: on ? 'var(--card)' : 'var(--bone)',
                  boxShadow: on ? 'var(--shadow-soft)' : 'none',
                  border: `1px solid ${on ? 'var(--line)' : 'transparent'}`,
                  borderTop: `3px solid ${on ? PHASE_TINT[k] : 'transparent'}`,
                  transition: 'all 160ms ease',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: PHASE_TINT[k] }}/>
                  <span style={{ fontSize: 13.5, fontWeight: on ? 700 : 500, color: on ? 'var(--ink)' : 'var(--ink-2)' }}>{tx(p.label)}</span>
                  {isLive && <span style={{ fontSize: 9, fontFamily: 'var(--mono)', letterSpacing: '0.08em', color: 'var(--accent)', marginLeft: 'auto' }}>● {t('NOW','ŞİMDİ')}</span>}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{phaseRange(k, cycleLength)} · {tx(p.energy)} {t('energy','enerji')}</div>
              </button>
            );
          })}
        </div>

        {/* Phase intro band */}
        <Card pad={0} style={{ overflow: 'hidden', display: 'grid', gridTemplateColumns: 'auto 1fr' }}>
          <div style={{ width: 8, background: tint }}/>
          <div style={{ padding: '22px 28px' }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>{tx(g.label)} · {phaseRange(sel, cycleLength)}</div>
            <p style={{ fontFamily: 'var(--serif)', fontSize: 21, lineHeight: 1.4, margin: 0, color: 'var(--ink)', textWrap: 'pretty', fontStyle: 'italic' }}>
              {tx(g.tagline)}
            </p>
          </div>
        </Card>

        {/* One column — Movement or Nutrition depending on the screen */}
        <div>
          {kind === 'move' && (
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--bone)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon d={ICONS.pulse} size={16} stroke="var(--accent)"/>
              </span>
              <div className="eyebrow">{t('Movement','Hareket')}</div>
            </div>
            <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 23, margin: '6px 0 4px', letterSpacing: '-0.01em' }}>{tx(g.move.headline)}</h3>
            {g.move.session && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 16 }}>
                <Icon d={ICONS.clock} size={13} stroke="var(--muted)"/>
                <span style={{ fontSize: 11.5, color: 'var(--muted)', fontFamily: 'var(--mono)', letterSpacing: '0.03em' }}>{tx(g.move.session)}</span>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {g.move.items.map((it, i) => {
                const open = openPlan === i;
                return (
                  <div key={i} style={{ borderBottom: i < g.move.items.length - 1 ? '1px solid var(--line-soft)' : 'none' }}>
                    <button onClick={() => setOpenPlan(open ? -1 : i)}
                      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0', width: '100%', textAlign: 'left', background: 'transparent', cursor: 'pointer' }}>
                      <span style={{ width: 40, height: 40, borderRadius: 12, background: tint + '33', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon d={MOVE_ICON[it.icon]} size={19} stroke="var(--ink)" sw={1.5}/>
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)' }}>{tx(it.name)}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.4 }}>{tx(it.detail)}</div>
                      </div>
                      {it.plan && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                          <span style={{ fontSize: 10.5, color: 'var(--accent)', fontFamily: 'var(--mono)', letterSpacing: '0.03em' }}>{tx(it.plan.meta)}</span>
                          <Icon d={open ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'} size={15} stroke="var(--muted)"/>
                        </div>
                      )}
                    </button>
                    {it.plan && open && (
                      <div className="fade-up" style={{ padding: '4px 0 16px 54px', display: 'flex', flexDirection: 'column', gap: 0 }}>
                        {it.plan.steps.map((s, j) => (
                          <div key={j} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'baseline', padding: '9px 0', borderBottom: j < it.plan.steps.length - 1 ? '1px solid var(--line-soft)' : 'none' }}>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{tx(s.phase)}</div>
                              <div style={{ fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.4 }}>{tx(s.sub)}</div>
                            </div>
                            <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-2)', background: 'var(--bone)', padding: '4px 9px', borderRadius: 7, whiteSpace: 'nowrap' }}>{tx(s.spec)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: 12, background: 'var(--bone)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Icon d={ICONS.spark} size={15} stroke="var(--accent)" sw={1.6}/>
              <span style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.5 }}>{tx(g.move.avoid)}</span>
            </div>
          </Card>
          )}

          {kind === 'eat' && (
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--bone)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon d={ICONS.leaf} size={16} stroke="var(--accent)"/>
              </span>
              <div className="eyebrow">{t('Nutrition','Beslenme')}</div>
            </div>
            <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 23, margin: '6px 0 18px', letterSpacing: '-0.01em' }}>{tx(g.eat.headline)}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {g.eat.items.map((it, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <span style={{ fontSize: 9, fontFamily: 'var(--mono)', letterSpacing: '0.04em', color: 'var(--ink-2)', background: tint + '33', padding: '4px 7px', borderRadius: 6, minWidth: 52, textAlign: 'center', marginTop: 1 }}>{it.tag}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{tx(it.name)}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.4 }}>{tx(it.detail)}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, padding: '12px 14px', borderRadius: 12, background: 'var(--accent-soft)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Icon d={ICONS.drop} size={15} stroke="var(--ink-2)" sw={1.6}/>
              <span style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.5 }}>{tx(g.eat.note)}</span>
            </div>

            {/* Seed cycling — part of nutrition */}
            <SeedCycle phaseKey={sel} liveKey={live} tint={tint}/>
          </Card>
          )}
        </div>
      </ReferansBolum>


      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', color: 'var(--muted-2)', fontSize: 11.5 }}>
        <Icon d={ICONS.heart} size={13} stroke="var(--muted-2)"/>
        <span style={{ fontStyle: 'italic', fontFamily: 'var(--serif)' }}>{t('General guidance, not medical advice. Your care team tailors this to you.', 'Genel rehberlik, tıbbi tavsiye değildir. Bakım ekibin bunu sana göre uyarlar.')}</span>
      </div>
    </div>
  );
}



/* ── Seed cycling: flax+pumpkin (first half) · sesame+sunflower (second half) ── */
const SEED_CYCLE = {
  first: {
    label: 'First half · menstrual + follicular',
    when: 'Days 1–14 (your menstrual & follicular phases)',
    why: 'Lignans in flax gently bind excess estrogen; zinc in pumpkin seeds supports the follicular build toward ovulation.',
    seeds: [
      { name: 'Flaxseed', dose: '1 tbsp ground, daily', note: 'Lignans → estrogen balance', hue: 'oklch(0.62 0.07 70)' },
      { name: 'Pumpkin seeds', dose: '1 tbsp, daily', note: 'Zinc → follicle & progesterone prep', hue: 'oklch(0.55 0.08 145)' },
    ],
  },
  second: {
    label: 'Second half · ovulation + luteal',
    when: 'Days 15–28+ (your ovulation & luteal phases)',
    why: 'Lignans in sesame and vitamin E in sunflower support progesterone through the luteal phase.',
    seeds: [
      { name: 'Sesame seeds', dose: '1 tbsp, daily', note: 'Lignans + zinc → progesterone', hue: 'oklch(0.60 0.04 60)' },
      { name: 'Sunflower seeds', dose: '1 tbsp, daily', note: 'Vitamin E + selenium → luteal support', hue: 'oklch(0.72 0.10 85)' },
    ],
  },
};

function SeedCycle({ phaseKey, liveKey, tint }) {
  const half = (phaseKey === 'menstrual' || phaseKey === 'follicular') ? 'first' : 'second';
  const g = SEED_CYCLE[half];
  const liveHalf = (liveKey === 'menstrual' || liveKey === 'follicular') ? 'first' : 'second';
  return (
    <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--line-soft)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--bone)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon d={ICONS.leaf} size={16} stroke="var(--accent)"/>
          </span>
          <div className="eyebrow">{t('Seed cycling','Tohum döngüsü')}</div>
        </div>
        {half === liveHalf && <span style={{ fontSize: 9, fontFamily: 'var(--mono)', letterSpacing: '0.08em', color: 'var(--accent)' }}>● {t('NOW','ŞİMDİ')}</span>}
      </div>
      <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 23, margin: '8px 0 4px', letterSpacing: '-0.01em' }}>{tx(g.label)}</h3>
      <div style={{ fontSize: 11.5, color: 'var(--muted)', fontFamily: 'var(--mono)', marginBottom: 16 }}>{tx(g.when)}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
        {g.seeds.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, background: 'var(--bone)' }}>
            <span style={{ width: 38, height: 38, borderRadius: '50%', background: s.hue, flexShrink: 0, boxShadow: 'inset 0 0 0 1px rgba(42,24,16,0.12)' }}/>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontFamily: 'var(--serif)', fontSize: 17 }}>{tx(s.name)}</span>
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-2)', fontFamily: 'var(--mono)' }}>{tx(s.dose)}</div>
              <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>{tx(s.note)}</div>
            </div>
          </div>
        ))}
      </div>
      <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14.5, lineHeight: 1.55, color: 'var(--ink-2)', margin: 0 }}>{tx(g.why)}</p>
      {/* whole-cycle timeline */}
      <div style={{ display: 'flex', gap: 6, marginTop: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ height: 6, borderRadius: 6, background: half === 'first' ? 'var(--accent)' : 'var(--line)' }}/>
          <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)', marginTop: 6 }}>{t('FLAX + PUMPKIN · D1–14', 'KETEN + KABAK · G1–14')}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ height: 6, borderRadius: 6, background: half === 'second' ? 'var(--accent)' : 'var(--line)' }}/>
          <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)', marginTop: 6, textAlign: 'right' }}>{t('SESAME + SUNFLOWER · D15+', 'SUSAM + AY ÇEK. · G15+')}</div>
        </div>
      </div>
    </div>
  );
}
/* Referans içeriği için katlanır kabuk. Beslenme ekranı telefonda dokuz kart
   ve 251 kelimeyle açılıyordu, Hareket 369 kelimeyle. İkisi de ayda bir
   okunacak içerik; her gün açılan ekranın onları bir makale gibi karşılaması
   gerekmiyor. Artık tek satırlık bir özetle açılıp istendiğinde genişliyorlar. */
function ReferansBolum({ ozet, acKapaEtiketi, children }) {
  const [acik, setAcik] = React.useState(false);
  return (
    <div>
      <button onClick={() => setAcik(v => !v)} aria-expanded={acik}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 14, padding: '15px 18px', borderRadius: 'var(--r-md)', cursor: 'pointer',
          background: 'var(--bone)', border: 'none', textAlign: 'left',
        }}>
        <span style={{ fontFamily: 'var(--serif)', fontSize: 16, lineHeight: 1.45, color: 'var(--ink)' }}>{ozet}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', whiteSpace: 'nowrap', fontFamily: 'var(--sans)' }}>
          {acik ? t('Hide', 'Gizle') : acKapaEtiketi}
        </span>
      </button>
      {acik && <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 20 }}>{children}</div>}
    </div>
  );
}

function TodayWorkoutCard({ lunara, api, onNav }) {
  const today = TODAY_DATE;
  const day = cycleDayFrom(lunara.periodStart, today, cycleLenOf(lunara));
  const ph = phaseOf(day, cycleLenOf(lunara));
  // Faz bilinmiyorsa genel bir öneri gösterilir ama "şu fazdasın" denmez
  const phKey = ph ? ph.key : 'follicular';
  const g = PHASE_GUIDE[phKey];
  const tint = PHASE_TINT[phKey];
  const primary = g.move.items[0];
  const steps = primary.plan ? primary.plan.steps : [];
  const log = lunara.workoutLog[TODAY_KEY] || {};
  const doneCount = steps.filter((_, i) => log[i]).length;
  const allDone = steps.length > 0 && doneCount === steps.length;

  return (
    <Card style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 4 }}>{t("Today's movement", 'Bugünün hareketi')}{ph ? <> · {phaseLabel(ph).toLocaleLowerCase(I18N.lang==='tr'?'tr':'en')} {t('phase','fazı')}</> : null}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 22, letterSpacing: '-0.01em' }}>{tx(primary.name)}</span>
            {primary.plan && <span style={{ fontSize: 11.5, color: 'var(--accent)', fontFamily: 'var(--mono)' }}>{tx(primary.plan.meta)}</span>}
          </div>
        </div>
        <span style={{ width: 44, height: 44, borderRadius: 13, background: tint + '33', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon d={MOVE_ICON[primary.icon]} size={21} stroke="var(--ink)" sw={1.5}/>
        </span>
      </div>

      {/* progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1, height: 6, borderRadius: 6, background: 'var(--line-soft)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${steps.length ? (doneCount/steps.length)*100 : 0}%`, background: 'var(--accent)', borderRadius: 6, transition: 'width 220ms ease' }}/>
        </div>
        <span style={{ fontSize: 11.5, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{doneCount}/{steps.length}</span>
      </div>

      {/* steps — checkable */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {steps.map((s, i) => {
          const on = !!log[i];
          return (
            <button key={i} onClick={() => api.toggleWorkoutStep(TODAY_KEY, i)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', width: '100%', textAlign: 'left', background: 'transparent', cursor: 'pointer', borderBottom: i < steps.length - 1 ? '1px solid var(--line-soft)' : 'none' }}>
              <span style={{
                width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                background: on ? 'var(--accent)' : 'transparent',
                boxShadow: on ? 'none' : 'inset 0 0 0 1.5px var(--line)',
                color: 'var(--ivory)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 140ms ease',
              }}>
                {on && <Icon d={ICONS.check} size={13} sw={2.5}/>}
              </span>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: on ? 'var(--muted)' : 'var(--ink)', textDecoration: on ? 'line-through' : 'none' }}>{tx(s.phase)}</span>
                <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 8 }}>{tx(s.sub)}</span>
              </div>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--ink-2)', background: 'var(--bone)', padding: '4px 9px', borderRadius: 7, whiteSpace: 'nowrap' }}>{tx(s.spec)}</span>
            </button>
          );
        })}
      </div>

      {/* footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--line-soft)' }}>
        <button onClick={() => api.setWorkoutAll(TODAY_KEY, steps.map((_, i) => i), !allDone)}
          style={{
            padding: '10px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600,
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: allDone ? 'var(--accent-soft)' : 'var(--ink)',
            color: allDone ? 'var(--ink)' : 'var(--ivory)', cursor: 'pointer',
          }}>
          <Icon d={ICONS.check} size={14} sw={2}/> {allDone ? t('Completed today','Bugün tamamlandı') : t('Mark all complete','Tümünü tamamla')}
        </button>
        {onNav && (
          <button onClick={() => onNav('nourish')} style={{ fontSize: 12.5, color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
            {t('Full plan','Tam plan')} <Icon d={ICONS.arrow} size={12}/>
          </button>
        )}
      </div>
    </Card>
  );
}

export { PHASE_GUIDE, MOVE_ICON, NourishScreen, SEED_CYCLE, SeedCycle, TodayWorkoutCard };
