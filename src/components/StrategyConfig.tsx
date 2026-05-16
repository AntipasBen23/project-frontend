"use client";

import { useState } from "react";

interface StrategyConfigProps {
  activeStrategy: string;
}

export default function StrategyConfig({ activeStrategy }: StrategyConfigProps) {
  const [rsiPeriod, setRsiPeriod] = useState(14);
  const [shortMA, setShortMA] = useState(9);
  const [longMA, setLongMA] = useState(21);
  const [bbPeriod, setBbPeriod] = useState(20);
  const [bbStd, setBbStd] = useState(2.0);
  const [fastEMA, setFastEMA] = useState(9);
  const [slowEMA, setSlowEMA] = useState(21);
  const [applied, setApplied] = useState(false);

  function handleApply() {
    setApplied(true);
    setTimeout(() => setApplied(false), 2000);
  }

  return (
    <div className="card">
      <div className="label" style={{ marginBottom: "0.75rem" }}>Strategy Config</div>

      {activeStrategy === "RSI_MA" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          <ConfigInput label="RSI Period" value={rsiPeriod} onChange={setRsiPeriod} />
          <ConfigInput label="Short MA" value={shortMA} onChange={setShortMA} />
          <ConfigInput label="Long MA" value={longMA} onChange={setLongMA} />
        </div>
      )}

      {activeStrategy === "BOLLINGER" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          <ConfigInput label="Period" value={bbPeriod} onChange={setBbPeriod} />
          <ConfigInput label="Std Dev Mult" value={bbStd} onChange={setBbStd} step={0.1} />
        </div>
      )}

      {activeStrategy === "EMA" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          <ConfigInput label="Fast EMA" value={fastEMA} onChange={setFastEMA} />
          <ConfigInput label="Slow EMA" value={slowEMA} onChange={setSlowEMA} />
        </div>
      )}

      <button
        className="btn btn-ghost"
        style={{ width: "100%", marginTop: "0.75rem", justifyContent: "center" }}
        onClick={handleApply}
      >
        {applied ? "✓ Applied" : "Apply Config"}
      </button>
    </div>
  );
}

function ConfigInput({ label, value, onChange, step = 1 }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  return (
    <div>
      <div className="label" style={{ marginBottom: "0.25rem" }}>{label}</div>
      <input
        type="number"
        className="input"
        value={value}
        step={step}
        min={1}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ fontSize: "0.85rem" }}
      />
    </div>
  );
}
