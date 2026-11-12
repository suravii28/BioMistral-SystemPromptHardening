"use client";
import { useState } from "react";
import { RUN, CONDITIONS, GAINS, SUBJECTS, TURNS } from "./data";

const MIN = -0.02, MAX = 0.21;
const pos = (x) => ((x - MIN) / (MAX - MIN)) * 100;
const fmt = (x) => (x >= 0 ? "+" : "") + x.toFixed(3);
const cond = (k) => CONDITIONS.find((c) => c.key === k);

function Forest() {
  const [view, setView] = useState("cap");
  const g = GAINS[view];
  return (
    <section className="panel" aria-labelledby="forest-h">
      <h2 id="forest-h">Which fix helps the most?</h2>
      <p className="sub">
        Each dot is the average gain in how clearly the answer favors the correct option over the planted false one.
        Bars show the 95% confidence interval. A bar that crosses zero means the result could be chance.
      </p>
      <div className="seg" role="group" aria-label="Trial subset">
        {Object.entries(GAINS).map(([k, v]) => (
          <button key={k} aria-pressed={view === k} onClick={() => setView(k)}>
            {v.label} · {v.n}
          </button>
        ))}
      </div>
      <div className="forest">
        {g.rows.map((r) => {
          const c = cond(r.key);
          return (
            <div className="frow" key={r.key}>
              <div className="fname"><b>{c.name}</b><span>{c.short} · d = {r.d.toFixed(2)}</span></div>
              <div className="track" role="img" aria-label={`${c.name}: ${fmt(r.mean)}, interval ${fmt(r.lo)} to ${fmt(r.hi)}`}>
                <div className="zero" style={{ left: pos(0) + "%" }} />
                <div className="ci" style={{ background: c.color, left: pos(r.lo) + "%", width: pos(r.hi) - pos(r.lo) + "%" }} />
                <div className="dot" style={{ background: c.color, left: pos(r.mean) + "%" }} />
              </div>
              <div className="fval">
                <b>{fmt(r.mean)}</b>
                <span>{r.improved}% improved</span>
                <span className={"badge " + (r.sig ? "ok" : "no")}>{r.sig ? "Significant" : "Not significant"}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="axis" aria-hidden="true"><span>{MIN}</span><span>0 (no change)</span><span>{MAX}</span></div>
    </section>
  );
}

function Latency() {
  const rows = [...CONDITIONS];
  const max = 25;
  return (
    <section className="panel" style={{ marginTop: 0 }} aria-labelledby="lat-h">
      <h2 id="lat-h">What does it cost?</h2>
      <p className="sub">Seconds per answer on flagged trials. Contrastive decoding runs the model twice per token.</p>
      <div className="bars">
        {rows.map((c) => (
          <div className="lat" key={c.key}>
            <span>{c.short}</span>
            <i style={{ background: c.color, width: (c.latency / max) * 100 + "%" }} />
            <b>{c.latency.toFixed(1)}s</b>
          </div>
        ))}
      </div>
      <p className="note"><b>Combining hurt.</b> F1 + F3 scored 0.061 lower than the sum of each alone. Together they cost the most time and lose significance across all flagged trials.</p>
    </section>
  );
}

function Subjects() {
  const half = 0.2;
  const bar = (v, color) => {
    const w = (Math.abs(v) / half) * 50;
    return <i style={{ background: v >= 0 ? color : "var(--rose)", width: w + "%", left: v >= 0 ? "50%" : 50 - w + "%" }} />;
  };
  return (
    <section className="panel" style={{ marginTop: 0 }} aria-labelledby="sub-h">
      <h2 id="sub-h">Where it works</h2>
      <p className="sub">Average gain by medical subject for flagged trials. Red bars mean answers got worse. Small groups are noisy, so read the n column first.</p>
      <div style={{ marginTop: 22 }}>
        <div className="srow shead"><span>Subject</span><span>n (caved)</span><span>Contrastive</span><span>Combined</span></div>
        {SUBJECTS.map((s) => (
          <div className="srow" key={s.name}>
            <span>{s.name}</span>
            <span>{s.n} ({s.cap})</span>
            <div className="div" title={fmt(s.c)}>{bar(s.c, "var(--teal)")}</div>
            <div className="div" title={fmt(s.d)}>{bar(s.d, "var(--violet)")}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Page() {
  return (
    <main>
      <div className="wrap">
        <header className="hero">
          <h1>When a doctor says it&rsquo;s wrong, does the model cave?</h1>
          <p className="lead">
            CascadeGuard pressures {RUN.model} with confident false claims across {RUN.turns}-turn medical conversations,
            flags the risky ones from its hidden layers, and tests three ways to hold the line.
          </p>
          <div className="chips">
            <span className="chip"><b>Model</b> {RUN.model}</span>
            <span className="chip"><b>Architecture</b> {RUN.arch}</span>
            <span className="chip"><b>Data</b> MedMCQA, 13 subjects</span>
            <span className="chip"><b>Alpha</b> {RUN.alpha}</span>
          </div>
        </header>

        <div className="stats">
          <div className="stat"><div className="v">{RUN.trials}</div><div className="l">conversations tested</div></div>
          <div className="stat"><div className="v">{RUN.gated}</div><div className="l">flagged at layer {RUN.layer}</div></div>
          <div className="stat"><div className="v">{RUN.capitulated}</div><div className="l">flagged and actually caved</div></div>
          <div className="stat"><div className="v">+0.12</div><div className="l">best gain when it caved (contrastive)</div></div>
        </div>

        <Forest />

        <div className="cols" style={{ marginTop: 20 }}>
          <Latency />
          <section className="panel" style={{ marginTop: 0 }} aria-labelledby="det-h">
            <h2 id="det-h">How it detects pressure</h2>
            <p className="sub">
              The detector compares hidden states under a strict prompt versus a permissive one. Layer {RUN.layer} separated
              neutral from pressured follow-ups best, with a flag threshold of {RUN.threshold}.
            </p>
            <p className="note"><b>Gating matters.</b> Fixes only run on flagged trials that are not already self-correcting.</p>
          </section>
        </div>

        <section className="panel" aria-labelledby="turn-h">
          <h2 id="turn-h">One conversation, five turns</h2>
          <div className="turns">
            {TURNS.map(([t, d], i) => (
              <div className={"turn" + (i === 1 || i === 3 ? " hot" : "")} key={t}>
                <div className="pin" /><h3>{t}</h3><p>{d}</p>
              </div>
            ))}
          </div>
        </section>

        <div style={{ marginTop: 20 }}><Subjects /></div>

        <footer className="foot">
          Gains use cross-encoder similarity (stsb-roberta-base). Contrastive decoding follows Li et al. 2023.
          Results come from the notebook run; edit <code>app/data.js</code> to update them.
        </footer>
      </div>
    </main>
  );
}
