import { useState, useMemo, useCallback, useEffect, useRef } from 'react';

/* ── Helpers ── */
const fEUR = (v: number | string) => {
  if (v == null || isNaN(v as number) || !isFinite(v as number)) return '–';
  return (v as number).toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
};
const fNum = (v: number | string, d = 0) => {
  if (v == null || isNaN(v as number) || !isFinite(v as number)) return '–';
  return (v as number).toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d });
};

const DEFAULTS = {
  CH: 90, M: 5, tF: 120, L: 1, CW: 30, tpipe: 72,
  n: 20, tr: 15, R: 2, CR: 35, p: 3, alpha: 0.30, tn: 12,
  CNP: 0, CL: 0, CSE_var: 9950, CSE_fix: 7000, model: 'einfach' as 'einfach' | 'detailliert',
};

type State = typeof DEFAULTS;

/* ── Animated number ── */
function AnimNum({ value, format = 'eur' }: { value: number | string; format?: 'eur' | 'num' | 'raw' }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(value);
  useEffect(() => {
    if (ref.current && prev.current !== value) {
      ref.current.style.transition = 'none';
      ref.current.style.transform = 'translateY(6px)';
      ref.current.style.opacity = '0.3';
      requestAnimationFrame(() => {
        if (ref.current) {
          ref.current.style.transition = 'all .35s cubic-bezier(.22,1,.36,1)';
          ref.current.style.transform = 'translateY(0)';
          ref.current.style.opacity = '1';
        }
      });
    }
    prev.current = value;
  }, [value]);
  const display = format === 'eur' ? fEUR(value as number) : (typeof value === 'string' ? value : fNum(value));
  return <span ref={ref} style={{ display: 'inline-block' }}>{display}</span>;
}

/* ── Input Row ── */
function Input({ label, help, value, onChange, min, max, step = 1, unit, decimals = 0 }: {
  label: string; help?: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step?: number; unit?: string; decimals?: number;
}) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  const clamp = (raw: string) => {
    const n = parseFloat(raw);
    if (!isNaN(n)) onChange(Math.min(max, Math.max(min, n)));
  };
  return (
    <div className="input-row">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 1 }}>
        <span className="input-label">{label}</span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <input type="number" min={min} max={max} step={step}
            value={decimals > 0 ? value.toFixed(decimals) : value}
            onChange={(e) => clamp(e.target.value)}
            className="num-input"
          />
          {unit && <span style={{ fontSize: 13, color: '#5f6378', fontStyle: 'italic' }}>{unit}</span>}
        </div>
      </div>
      {help && <div style={{ fontSize: 13, color: '#5f6378', marginBottom: 5, lineHeight: 1.35 }}>{help}</div>}
      <div style={{ position: 'relative', height: 6, background: '#dfe1e8', marginTop: 2 }}>
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #EE7711, #f59542)', transition: 'width .15s' }} />
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="range-input"
          style={{ position: 'absolute', top: -6, left: 0, width: '100%', height: 18 }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#7d8194', marginTop: 3 }}>
        <span>{decimals > 0 ? min.toFixed(decimals).replace('.', ',') : min.toLocaleString('de-DE')} {unit}</span>
        <span>{decimals > 0 ? max.toFixed(decimals).replace('.', ',') : max.toLocaleString('de-DE')} {unit}</span>
      </div>
    </div>
  );
}

/* ── Section ── */
function Section({ step, title, children, info, defaultOpen = false }: {
  step?: string; title: string; children: React.ReactNode; info?: string; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="section-card" style={{ animationDelay: step ? `${(parseInt(step) - 1) * 0.06}s` : '0s' }}>
      <div onClick={() => setOpen(!open)} className="section-header">
        {step && <span className="step-num">{step}</span>}
        <div style={{ flex: 1 }}>
          <div className="section-title">{title}</div>
          {info && !open && <div style={{ fontSize: 13, color: '#5f6378', marginTop: 2 }}>{info}</div>}
        </div>
        <span style={{
          fontSize: 18, color: '#5f6378', transition: 'transform .3s',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block',
        }}>⌃</span>
      </div>
      <div style={{
        maxHeight: open ? 2000 : 0, overflow: 'hidden',
        transition: 'max-height .4s cubic-bezier(.22,1,.36,1)',
      }}>
        <div style={{ padding: '20px 24px 24px' }}>{children}</div>
      </div>
    </div>
  );
}

/* ── Result Strip ── */
function ResultStrip({ label, value, unit, color, strong }: {
  label: string; value: string | number; unit?: string; color?: string; strong?: boolean;
}) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '9px 0', borderBottom: '1px solid #ecedf2',
    }}>
      <span style={{ fontSize: 14, color: strong ? '#32285B' : '#6b6f82', fontWeight: strong ? 600 : 400 }}>{label}</span>
      <span style={{ fontFamily: "'Antonio', sans-serif", fontSize: strong ? 18 : 16, fontWeight: 700, color: color || '#32285B' }}>
        {value} {unit || ''}
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN
   ══════════════════════════════════════════════ */
export default function ScanExpressCalculator() {
  const [v, setV] = useState<State>(DEFAULTS);
  const s = useCallback((k: keyof State) => (val: any) => setV((prev) => ({ ...prev, [k]: val })), []);

  const c = useMemo(() => {
    const tI = v.R * 60;
    const q = (3600 / v.tF) * v.L;
    const T = (v.n * tI * v.L) / 3600;
    const t_spaet = v.tpipe;
    const N_spaet = v.alpha * q * t_spaet;
    const t_frueh = T + (v.L * v.n * tI) / 3600 + v.tr / 60;
    const N_frueh = v.alpha * q * t_frueh;
    const deltaN = Math.max(N_spaet - N_frueh, 0);
    const Mf = 1 + v.M / 100;
    const S1 = v.CH * Mf + v.CW - v.CR;
    const S2 = S1 + v.CNP;
    const Sx = v.model === 'einfach' ? S1 : S2;
    const V_evt = deltaN * Sx + (v.model === 'detailliert' ? v.CL : 0);
    const CSE = v.CSE_fix + v.tn * v.CSE_var;
    const V = v.p * V_evt - CSE;
    const p_min = V_evt > 0 ? CSE / V_evt : Infinity;
    return { tI, q, T, t_spaet, N_spaet, t_frueh, N_frueh, deltaN, Sx, V_evt, CSE, V, p_min };
  }, [v]);

  const positive = c.V >= 0;
  const accentColor = positive ? '#8EBFD6' : '#EE7711';

  return (
    <div style={{
      fontFamily: "'PT Sans', system-ui, sans-serif",
      background: '#f0f1f5', color: '#32285B',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 24px 48px' }}>

        {/* HERO Result */}
        <div style={{
          background: 'linear-gradient(135deg, #3a3068 0%, #453b78 40%, #332960 100%)',
          padding: '32px 28px 28px', marginBottom: 16,
          boxShadow: '0 8px 32px rgba(50,40,91,.2), inset 0 1px 0 rgba(255,255,255,.08)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, right: 0, width: 200, height: '100%',
            background: 'linear-gradient(135deg, transparent 40%, rgba(238,119,17,.08) 100%)',
            pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 12, height: 12, background: accentColor,
                boxShadow: `0 0 12px ${accentColor}, 0 0 24px ${accentColor}40`,
              }} />
              <span style={{
                fontFamily: "'Antonio', sans-serif", fontSize: 16, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: 2, color: accentColor,
              }}>
                {positive ? 'Wirtschaftlich vorteilhaft' : 'Noch nicht wirtschaftlich'}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 24 }}>
              <div>
                <div style={{ fontSize: 12, color: '#d6d2ea', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>Erwarteter Nutzen</div>
                <div style={{ fontFamily: "'Antonio', sans-serif", fontSize: 40, fontWeight: 700, color: accentColor, lineHeight: 1 }}>
                  <AnimNum value={c.V} />
                </div>
                <div style={{ fontSize: 12, color: '#d6d2ea', marginTop: 4 }}>im Einsatzzeitraum ({v.tn} Wo.)</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#d6d2ea', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>Nutzen je Störereignis</div>
                <div style={{ fontFamily: "'Antonio', sans-serif", fontSize: 26, fontWeight: 700, color: '#f0eff5', lineHeight: 1 }}>
                  <AnimNum value={c.V_evt} />
                </div>
                <div style={{ fontSize: 12, color: '#d6d2ea', marginTop: 4 }}>{fNum(c.deltaN)} Teile × {fEUR(c.Sx)}/Teil</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#d6d2ea', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>Break-even ab</div>
                <div style={{ fontFamily: "'Antonio', sans-serif", fontSize: 26, fontWeight: 700, color: '#f0eff5', lineHeight: 1 }}>
                  <AnimNum value={c.p_min === Infinity ? '–' : `${fNum(c.p_min, 1)} Störfällen`} format="raw" />
                </div>
                <div style={{ fontSize: 12, color: '#d6d2ea', marginTop: 4 }}>bei SE-Kosten von {fEUR(c.CSE)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* MENGENVERGLEICH */}
        <div className="section-card" style={{ padding: '22px 24px', marginBottom: 16 }}>
          <div style={{ fontFamily: "'Antonio', sans-serif", fontSize: 17, textTransform: 'uppercase', letterSpacing: 1.5, color: '#32285B', marginBottom: 16, fontWeight: 700 }}>
            Betroffene Teile je Störereignis — Vergleich
          </div>
          {[
            { label: 'Ohne SE (späte Entdeckung)', val: c.N_spaet, time: c.t_spaet, color: '#EE7711', grad: 'linear-gradient(90deg, #EE7711, #f59542)' },
            { label: 'Mit SE (frühe Entdeckung)', val: c.N_frueh, time: c.t_frueh, color: '#8EBFD6', grad: 'linear-gradient(90deg, #6dafc8, #8EBFD6)' },
          ].map((bar) => {
            const maxV = Math.max(c.N_spaet, 1);
            const w = Math.min((bar.val / maxV) * 100, 100);
            return (
              <div key={bar.label} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 5 }}>
                  <span style={{ color: '#32285B', fontWeight: 500 }}>{bar.label}</span>
                  <span style={{ fontWeight: 700, color: bar.color, fontFamily: "'Antonio', sans-serif", fontSize: 16 }}>
                    {fNum(bar.val)} Teile <span style={{ fontWeight: 400, color: '#5f6378', fontSize: 12 }}>nach {fNum(bar.time, 1)} h</span>
                  </span>
                </div>
                <div style={{ height: 14, background: '#ecedf2', position: 'relative', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', background: bar.grad, width: `${w}%`,
                    transition: 'width .5s cubic-bezier(.22,1,.36,1)',
                    boxShadow: `0 0 12px ${bar.color}30`,
                  }} />
                </div>
              </div>
            );
          })}
          <div style={{ textAlign: 'center', marginTop: 12, padding: '12px 0 4px', borderTop: '2px solid #32285B' }}>
            <span style={{ fontSize: 14, color: '#6b6f82' }}>Vermiedene fehlerhafte Teile: </span>
            <span style={{ fontFamily: "'Antonio', sans-serif", fontSize: 32, fontWeight: 700, color: '#EE7711' }}>
              <AnimNum value={c.deltaN} format="num" />
            </span>
          </div>
        </div>

        {/* SCHRITT 1 */}
        <Section step="1" title="Ihre Fertigung" info={`Ausstoß: ${fNum(c.q)} Teile/h`}>
          <div className="info-box">
            Beschreiben Sie hier Ihre Fertigungslinie: Wie schnell wird produziert und was kostet ein Teil?
            Diese Werte bestimmen, wie viele Teile pro Stunde betroffen sein können.
          </div>
          <Input label="Taktzeit je Fertigungslinie" unit="s/Teil"
            help="Wie viele Sekunden liegen zwischen zwei fertigen Teilen auf einer Linie?"
            value={v.tF} onChange={s('tF')} min={30} max={240} step={5} />
          <Input label="Anzahl paralleler Linien" unit="Linien"
            help="Wie viele gleichartige Fertigungslinien laufen parallel?"
            value={v.L} onChange={s('L')} min={1} max={10} />
          <ResultStrip label="→ Gesamtausstoß Ihrer Fertigung" value={fNum(c.q)} unit="Teile/h" color="#EE7711" strong />
          <div style={{ height: 14 }} />
          <Input label="Herstellkosten je Teil" unit="€/Teil"
            help="Interne Kosten je Teil bis zur Auslieferung an die nächste Prozessstufe."
            value={v.CH} onChange={s('CH')} min={30} max={2000} step={10} />
          <Input label="Marge bei Verkauf" unit="%"
            help="Aufschlag bei Weitergabe an den internen/externen Kunden."
            value={v.M} onChange={s('M')} min={3} max={15} step={0.5} decimals={1} />
        </Section>

        {/* SCHRITT 2 */}
        <Section step="2" title="Das Problemszenario" info={`Ohne SE: ${fNum(c.N_spaet)} betroffene Teile`}>
          <div className="info-box">
            Stellen Sie sich vor, ein Prozessfehler tritt auf (z.B. Werkzeugverschleiß, Prozessdrift, Materialfehler).
            Wie lange dauert es normalerweise, bis das Problem erkannt wird?
          </div>
          <Input label="Pipeline-Tiefe bis zur späten Entdeckung" unit="Stunden"
            help="Wie viele Stunden vergehen vom Fehler bis zur Entdeckung ohne SE?"
            value={v.tpipe} onChange={s('tpipe')} min={10} max={240} step={2} />
          <Input label="Zusätzliche Wertschöpfung bis Entdeckung" unit="€/Teil"
            help="Welche weiteren Kosten entstehen je Teil bis zur Entdeckung? (Bearbeitung, Montage, …)"
            value={v.CW} onChange={s('CW')} min={10} max={2000} step={10} />
          <Input label="Ausschussquote bei einem Störereignis" unit=""
            help="Welcher Anteil der produzierten Teile ist tatsächlich fehlerhaft? (0,05 = 5 %)"
            value={v.alpha} onChange={s('alpha')} min={0.01} max={0.6} step={0.01} decimals={2} />
          <Input label="Restwert / Recyclingwert je Teil" unit="€/Teil"
            help="Welchen Wert hat ein verschrottetes Teil noch? (Schrottwert, Materialrückgewinnung)"
            value={v.CR} onChange={s('CR')} min={0} max={80} />
          <ResultStrip label="→ Betroffene fehlerhafte Teile ohne SE" value={fNum(c.N_spaet)} unit="Teile" color="#EE7711" strong />
        </Section>

        {/* SCHRITT 3 */}
        <Section step="3" title="SE-Stichprobenprüfung" info={`Prüfintervall: ${fNum(c.T, 1)} h · Entdeckung nach ${fNum(c.t_frueh, 1)} h`}>
          <div className="info-box">
            Wie wird der SE eingesetzt? Die Stichprobenparameter bestimmen, wie schnell ein Fehler erkannt wird.
          </div>
          <Input label="Zu prüfende Bereiche am Bauteil (ROI)" unit="Bereiche"
            help="Anzahl der Messbereiche je Teil – je Bereich ca. 60 s Prüfzeit."
            value={v.R} onChange={s('R')} min={1} max={4} />
          <ResultStrip label="→ Prüfzeit je Teil" value={c.tI} unit="Sekunden" />
          <div style={{ height: 10 }} />
          <Input label="Stichprobenumfang je Linie" unit="Teile"
            help="Wie viele aufeinanderfolgende Teile werden pro Linie und Zyklus geprüft?"
            value={v.n} onChange={s('n')} min={10} max={30} />
          <Input label="Reaktionszeit nach Alarm" unit="min"
            help="Wie schnell kann die Fertigung nach einem SE-Alarm gestoppt werden?"
            value={v.tr} onChange={s('tr')} min={0} max={60} step={5} />
          <div style={{ borderTop: '1px solid #ecedf2', paddingTop: 8, marginTop: 4 }}>
            <ResultStrip label="→ Prüfintervall (Abstand zwischen Zyklen)" value={fNum(c.T, 2)} unit="h" />
            <ResultStrip label="→ Zeit bis zur frühen Entdeckung (worst case)" value={fNum(c.t_frueh, 2)} unit="h" color="#8EBFD6" strong />
            <ResultStrip label="→ Betroffene fehlerhafte Teile mit SE" value={fNum(c.N_frueh)} unit="Teile" color="#8EBFD6" strong />
          </div>
        </Section>

        {/* SCHRITT 4 */}
        <Section step="4" title="Einsatzplanung & Kosten" info={`${v.tn} Wochen · ${v.p} Störereignisse · ${fEUR(c.CSE)} Kosten`}>
          <div className="info-box">
            Wie lange soll der SE eingesetzt werden und mit wie vielen Störereignissen rechnen Sie?
            Die SE-Kosten werden automatisch aus Mietdauer und Fixkosten berechnet.
          </div>
          <Input label="Geplanter Einsatzzeitraum" unit="Wochen"
            help="Wie lange soll der SE gemietet / eingesetzt werden?"
            value={v.tn} onChange={s('tn')} min={1} max={16} />
          <Input label="Erwartete Störereignisse im Zeitraum" unit="Ereignisse"
            help="Wie viele relevante Qualitätsabweichungen erwarten Sie realistisch?"
            value={v.p} onChange={s('p')} min={1} max={20} />
          <div style={{ borderTop: '1px solid #ecedf2', paddingTop: 8, marginTop: 4 }}>
            <ResultStrip label="SE-Kosten pro Woche (Miete, Bedienung, Cloud)" value={fEUR(v.CSE_var)} />
            <ResultStrip label="Fixkosten einmalig (Mobilisierung, Vorrichtung)" value={fEUR(v.CSE_fix)} />
            <ResultStrip label="→ SE-Gesamtkosten" value={fEUR(c.CSE)} color="#EE7711" strong />
          </div>
        </Section>

        {/* ERWEITERTE OPTIONEN */}
        <Section title="Erweiterte Optionen" defaultOpen={false}
          info={v.model === 'detailliert' ? 'Detailliertes Schadensmodell aktiv' : 'Einfaches Schadensmodell aktiv'}>
          <div style={{ marginBottom: 20 }}>
            <div className="input-label" style={{ marginBottom: 8 }}>Schadensmodell wählen</div>
            <div style={{ fontSize: 14, color: '#6b6f82', marginBottom: 12, lineHeight: 1.45 }}>
              <strong>Einfach:</strong> Herstellkosten × (1 + Marge) + Folgewertschöpfung − Restwert.<br />
              <strong>Detailliert:</strong> Zusätzlich Nachprüfungskosten pro Teil und Lieferfolgekosten pro Ereignis.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[['einfach', 'Einfach'], ['detailliert', 'Detailliert']].map(([key, label]) => (
                <button key={key} onClick={() => s('model')(key as State['model'])} className="model-btn"
                  style={{
                    background: v.model === key ? 'linear-gradient(135deg, #EE7711, #f59542)' : 'transparent',
                    color: v.model === key ? '#fff' : '#32285B',
                    borderColor: v.model === key ? '#EE7711' : '#ccc',
                    boxShadow: v.model === key ? '0 3px 12px rgba(238,119,17,.3)' : 'none',
                  }}>{label}</button>
              ))}
            </div>
          </div>

          {v.model === 'detailliert' && (
            <div style={{ borderTop: '1px solid #ecedf2', paddingTop: 16, marginTop: 4 }}>
              <Input label="Nachprüfungskosten je Teil" unit="€/Teil"
                help="Kosten für 100%-Sperrung oder Nachprüfung bereits produzierter Teile nach Alarm."
                value={v.CNP} onChange={s('CNP')} min={0} max={200} step={5} />
              <Input label="Liefer- / Stillstandsfolgekosten" unit="€/Ereignis"
                help="Pauschaler Zusatzschaden bei später Entdeckung (Bandstillstand, Sonderfracht, …)."
                value={v.CL} onChange={s('CL')} min={0} max={100000} step={1000} />
            </div>
          )}

          <div style={{ borderTop: '1px solid #ecedf2', paddingTop: 16, marginTop: 12 }}>
            <div className="input-label" style={{ marginBottom: 12 }}>SE-Kosten anpassen</div>
            <Input label="Wöchentliche SE-Kosten" unit="€/Woche"
              help="Variable Kosten: Miete, Bedienung, Cloud-Anbindung."
              value={v.CSE_var} onChange={s('CSE_var')} min={5000} max={20000} step={250} />
            <Input label="Einmalige Fixkosten" unit="€"
              help="Mobilisierung, Vorrichtungsbau, Inbetriebnahme."
              value={v.CSE_fix} onChange={s('CSE_fix')} min={0} max={20000} step={500} />
          </div>
        </Section>

        {/* DETAILTABELLE */}
        <Section title="Alle Berechnungsergebnisse im Detail" defaultOpen={false}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, border: 'none' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #32285B', border: 'none' }}>
                {['Kenngröße', 'Wert', 'Bedeutung'].map((h, i) => (
                  <th key={h} style={{
                    textAlign: i === 1 ? 'right' : 'left',
                    padding: i === 2 ? '10px 0 10px 16px' : '10px 0',
                    fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5,
                    color: '#5f6378', fontFamily: "'Antonio', sans-serif",
                    border: 'none', borderBottom: '2px solid #32285B', background: 'transparent',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {([
                [<>q</>, `${fNum(c.q)} Teile/h`, 'Gesamtausstoß der Fertigung'],
                [<>t<sub>I</sub></>, `${c.tI} s`, 'Prüfzeit des SE je Teil'],
                [<>T</>, `${fNum(c.T, 2)} h`, 'Prüfintervall'],
                [<>t<sub>spät</sub></>, `${fNum(c.t_spaet)} h`, 'Zeit bis späte Entdeckung'],
                [<>N<sub>spät</sub></>, `${fNum(c.N_spaet)} Teile`, 'Betroffene Teile ohne SE'],
                [<>t<sub>früh</sub></>, `${fNum(c.t_frueh, 2)} h`, 'Zeit bis frühe Entdeckung'],
                [<>N<sub>früh</sub></>, `${fNum(c.N_frueh)} Teile`, 'Betroffene Teile mit SE'],
                [<>ΔN</>, `${fNum(c.deltaN)} Teile`, 'Vermiedene fehlerhafte Teile'],
                [<>S<sub>{v.model === 'einfach' ? '1' : '2'}</sub></>, fEUR(c.Sx), 'Wirtschaftlicher Schaden je Teil'],
                [<>V<sub>Ereignis</sub></>, fEUR(c.V_evt), 'Eingespartes Geld pro Störereignis'],
                [<>C<sub>SE</sub></>, fEUR(c.CSE), 'SE-Gesamtkosten'],
                [<>V</>, fEUR(c.V), 'Erwarteter Gesamtnutzen'],
                [<>p<sub>min</sub></>, c.p_min === Infinity ? '–' : fNum(c.p_min, 1), 'Break-even: Mindestanzahl Störereignisse'],
              ] as const).map(([sym, val, desc], i) => (
                <tr key={i} style={{ border: 'none', borderBottom: '1px solid #ecedf2' }}>
                  <td style={{ padding: '9px 0', fontFamily: "'Antonio', sans-serif", color: '#EE7711', fontSize: 14, fontWeight: 700, border: 'none', borderBottom: '1px solid #ecedf2', background: 'transparent' }}>{sym}</td>
                  <td style={{ padding: '9px 0', textAlign: 'right', fontFamily: "'Antonio', sans-serif", fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', border: 'none', borderBottom: '1px solid #ecedf2', background: 'transparent' }}>{val}</td>
                  <td style={{ padding: '9px 0 9px 16px', color: '#5f6378', fontSize: 13, border: 'none', borderBottom: '1px solid #ecedf2', background: 'transparent' }}>{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 16, fontSize: 11, color: '#5f6378', lineHeight: 1.5, borderTop: '1px solid #ecedf2', paddingTop: 12 }}>
            <strong style={{ color: '#32285B' }}>Formeln:</strong>{' '}
            q = 3600/t<sub>F</sub> · L &nbsp;|&nbsp;
            N<sub>spät</sub> = α · q · t<sub>pipe</sub> &nbsp;|&nbsp;
            t<sub>früh</sub> = T + (L·n·t<sub>I</sub>)/3600 + t<sub>r</sub>/60 &nbsp;|&nbsp;
            ΔN = N<sub>spät</sub> − N<sub>früh</sub> &nbsp;|&nbsp;
            S = C<sub>H</sub>·(1+M) + C<sub>W</sub> − C<sub>R</sub>{v.model === 'detailliert' && <span> + C<sub>NP</sub></span>} &nbsp;|&nbsp;
            V<sub>Ereignis</sub> = ΔN · S{v.model === 'detailliert' && <span> + C<sub>L</sub></span>} &nbsp;|&nbsp;
            V = p · V<sub>Ereignis</sub> − C<sub>SE</sub>
          </div>
        </Section>

        <div style={{ textAlign: 'center', fontSize: 13, color: '#5f6378', marginTop: 20, paddingTop: 14, lineHeight: 1.7 }}>
          Kernlogik: Je früher ein Problem erkannt wird, desto weniger Teile laufen in wertsteigernde Folgeschritte.
          <br />Geeignet für: Serienanlauf · Prozessdrift · Werkzeugverschleiß · Materialwechsel · Sonderlagen
        </div>
      </div>
    </div>
  );
}
