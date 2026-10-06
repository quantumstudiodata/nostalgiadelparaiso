"use client";

import { useState } from "react";

type Day = { date: string; label: string; short: string; sessions: number };

/** Sessions per day: single-hue bars with a tooltip on hover or tap. */
export function SessionsChart({ days }: { days: Day[] }) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(1, ...days.map((d) => d.sessions));
  const step = Math.pow(10, Math.floor(Math.log10(max)));
  const top = Math.ceil(max / step) * step;
  const ticks = [top, top / 2, 0];
  const labelEvery = Math.ceil(days.length / 7);
  const shown = active === null ? null : days[active];

  return (
    <div>
      <div className="h-6 text-[13px] text-neutral-700" aria-live="polite">
        {shown ? (
          <>
            <strong className="text-ink">{shown.sessions}</strong> {shown.sessions === 1 ? "sesión" : "sesiones"} · {shown.label}
          </>
        ) : (
          <span className="text-neutral-500">Pasa el cursor o toca una barra para ver el día.</span>
        )}
      </div>
      <div className="mt-2 flex gap-2">
        <div className="flex flex-col justify-between h-[200px] text-[11px] text-neutral-500 text-right w-7 shrink-0 -my-1.5">
          {ticks.map((t) => (
            <span key={t}>{Number.isInteger(t) ? t : t.toFixed(1)}</span>
          ))}
        </div>
        <div className="flex-1 min-w-0">
          <div className="relative h-[200px] border-b border-neutral-300" onMouseLeave={() => setActive(null)}>
            <div className="absolute inset-x-0 top-0 border-t border-neutral-100" />
            <div className="absolute inset-x-0 top-1/2 border-t border-neutral-100" />
            <div className="absolute inset-0 flex items-end gap-[2px]">
              {days.map((d, i) => (
                <button
                  key={d.date}
                  type="button"
                  aria-label={`${d.label}: ${d.sessions} sesiones`}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  className="flex-1 h-full flex items-end group"
                >
                  <span
                    className={`w-full rounded-t-[4px] transition-colors ${active === i ? "bg-ink" : "bg-slate group-hover:bg-ink"}`}
                    style={{ height: d.sessions ? `${Math.max(2, (d.sessions / top) * 100)}%` : 0 }}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-[2px] mt-1.5 text-[11px] text-neutral-500">
            {days.map((d, i) => (
              <span key={d.date} className="flex-1 min-w-0 text-center whitespace-nowrap overflow-visible">
                {i % labelEvery === 0 ? d.short : ""}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
