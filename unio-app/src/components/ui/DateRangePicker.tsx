import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface Preset {
  label: string;
  getRange: () => DateRange;
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const DAYS_ES = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function isBetween(d: Date, start: Date, end: Date) {
  const t = d.getTime();
  return t > Math.min(start.getTime(), end.getTime()) &&
         t < Math.max(start.getTime(), end.getTime());
}
function formatDate(d: Date) {
  const day = String(d.getDate()).padStart(2, '0');
  const mon = MONTHS_ES[d.getMonth()].slice(0, 3);
  const yr = String(d.getFullYear()).slice(2);
  return `${day} ${mon} ${yr}`;
}

// Build a 6×7 grid (Mon–Sun) for a given display month.
// Returns array of { date, currentMonth }
function buildCalendar(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  // Mon=0 … Sun=6
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const cells: { date: Date; currentMonth: boolean }[] = [];

  for (let i = startOffset - 1; i >= 0; i--) {
    cells.push({
      date: new Date(year, month - 1, daysInPrev - i),
      currentMonth: false,
    });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), currentMonth: true });
  }
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ date: new Date(year, month + 1, d), currentMonth: false });
  }
  return cells;
}

// ─── Component ────────────────────────────────────────────────────────────────

export interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export default function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const today = new Date();

  const PRESETS: Preset[] = [
    {
      label: 'Mes completo',
      getRange: () => ({ start: startOfMonth(today), end: endOfMonth(today) }),
    },
    {
      label: 'Mes anterior',
      getRange: () => {
        const d = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        return { start: startOfMonth(d), end: endOfMonth(d) };
      },
    },
    {
      label: 'Último trimestre',
      getRange: () => ({
        start: new Date(today.getFullYear(), today.getMonth() - 2, 1),
        end: endOfMonth(today),
      }),
    },
    {
      label: 'Último semestre',
      getRange: () => ({
        start: new Date(today.getFullYear(), today.getMonth() - 5, 1),
        end: endOfMonth(today),
      }),
    },
    {
      label: 'Este año',
      getRange: () => ({
        start: new Date(today.getFullYear(), 0, 1),
        end: new Date(today.getFullYear(), 11, 31),
      }),
    },
  ];

  const [open, setOpen] = useState(false);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  // 'start' → next click sets start, 'end' → next click sets end
  const [phase, setPhase] = useState<'start' | 'end'>('start');
  const [displayMonth, setDisplayMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        // Reset partial selection
        if (phase === 'end' && !value.end) {
          onChange({ start: null, end: null });
          setPhase('start');
        }
      }
    }
    document.addEventListener('mousedown', onOutsideClick);
    return () => document.removeEventListener('mousedown', onOutsideClick);
  }, [phase, value.end, onChange]);

  // Trigger button label
  const buttonLabel = (() => {
    if (!value.start) return 'Seleccionar período';
    for (const p of PRESETS) {
      const r = p.getRange();
      if (
        value.start && value.end && r.start && r.end &&
        isSameDay(value.start, r.start) &&
        isSameDay(value.end, r.end)
      ) return p.label;
    }
    if (value.start && value.end) {
      return `${formatDate(value.start)} – ${formatDate(value.end)}`;
    }
    return formatDate(value.start);
  })();

  function handlePreset(p: Preset) {
    const r = p.getRange();
    onChange(r);
    setPhase('start');
    setOpen(false);
  }

  function handleDayClick(date: Date) {
    if (phase === 'start') {
      onChange({ start: date, end: null });
      setPhase('end');
    } else {
      // Ensure start ≤ end
      const [s, e] =
        value.start && date < value.start
          ? [date, value.start]
          : [value.start, date];
      onChange({ start: s, end: e });
      setPhase('start');
      setOpen(false);
    }
  }

  function handleReset() {
    onChange({ start: null, end: null });
    setPhase('start');
    setOpen(false);
  }

  const cells = buildCalendar(displayMonth.getFullYear(), displayMonth.getMonth());

  function prevMonth() {
    setDisplayMonth(
      (m) => new Date(m.getFullYear(), m.getMonth() - 1, 1)
    );
  }
  function nextMonth() {
    setDisplayMonth(
      (m) => new Date(m.getFullYear(), m.getMonth() + 1, 1)
    );
  }

  // Determine which preset is currently active
  const activePreset = PRESETS.find((p) => {
    if (!value.start || !value.end) return false;
    const r = p.getRange();
    return r.start && r.end && isSameDay(value.start, r.start) && isSameDay(value.end, r.end);
  });

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          height: '38px',
          padding: '0 12px',
          border: open
            ? '1px solid var(--color-brand-accent)'
            : '1px solid var(--color-border-default)',
          borderRadius: 'var(--radius-sm)',
          background: open ? 'var(--color-secondary-50)' : '#ffffff',
          fontFamily: 'var(--font-display)',
          fontSize: '13px',
          color: value.start
            ? 'var(--color-text-primary)'
            : 'var(--color-text-placeholder)',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          minWidth: '180px',
          justifyContent: 'space-between',
          transition: 'all 0.15s ease',
        }}
      >
        <span>{buttonLabel}</span>
        <ChevronDown
          size={14}
          style={{
            color: 'var(--color-text-muted)',
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.15s ease',
          }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            zIndex: 100,
            background: '#ffffff',
            border: '1px solid var(--color-border-default)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            display: 'flex',
            overflow: 'hidden',
            minWidth: '500px',
          }}
        >
          {/* Left: presets */}
          <div
            style={{
              width: '160px',
              borderRight: '1px solid var(--color-border-default)',
              padding: '8px 0',
              flexShrink: 0,
            }}
          >
            {PRESETS.map((p) => {
              const isActive = activePreset?.label === p.label;
              return (
                <button
                  key={p.label}
                  onClick={() => handlePreset(p)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '9px 16px',
                    textAlign: 'left',
                    background: isActive ? 'var(--color-secondary-50)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-display)',
                    fontSize: '13px',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive
                      ? 'var(--color-secondary-600)'
                      : 'var(--color-text-primary)',
                    transition: 'background 0.12s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive)
                      (e.currentTarget as HTMLButtonElement).style.background =
                        'var(--color-surface-subtle)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive)
                      (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  }}
                >
                  {p.label}
                </button>
              );
            })}

            {/* Divider + Reset */}
            <div
              style={{
                margin: '8px 0',
                borderTop: '1px solid var(--color-border-default)',
              }}
            />
            <button
              onClick={handleReset}
              style={{
                display: 'block',
                width: '100%',
                padding: '9px 16px',
                textAlign: 'left',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-display)',
                fontSize: '13px',
                color: 'var(--color-brand-accent)',
                fontWeight: 500,
                transition: 'background 0.12s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  'var(--color-surface-subtle)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              }}
            >
              Restablecer
            </button>
          </div>

          {/* Right: calendar */}
          <div style={{ padding: '16px', flexShrink: 0 }}>
            {/* Month header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
              }}
            >
              <button
                onClick={prevMonth}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: '6px',
                  padding: '4px 6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <ChevronLeft size={14} color="var(--color-text-muted)" />
              </button>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '13px',
                  color: 'var(--color-text-primary)',
                }}
              >
                {MONTHS_ES[displayMonth.getMonth()]} {displayMonth.getFullYear()}
              </span>
              <button
                onClick={nextMonth}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: '6px',
                  padding: '4px 6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <ChevronRight size={14} color="var(--color-text-muted)" />
              </button>
            </div>

            {/* Day-of-week headers */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 34px)',
                marginBottom: '4px',
              }}
            >
              {DAYS_ES.map((d) => (
                <div
                  key={d}
                  style={{
                    textAlign: 'center',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--color-text-muted)',
                    padding: '0 0 4px',
                  }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 34px)',
                rowGap: '2px',
              }}
            >
              {cells.map((cell, i) => {
                const { date, currentMonth } = cell;
                const isStart = value.start && isSameDay(date, value.start);
                const isEnd = value.end && isSameDay(date, value.end);
                const isToday = isSameDay(date, today);

                // Range highlight: between start and hover (while selecting) or between start and end
                const rangeEnd = phase === 'end' && hoverDate ? hoverDate : value.end;
                const inRange =
                  value.start && rangeEnd
                    ? isBetween(date, value.start, rangeEnd)
                    : false;

                const isSelected = isStart || isEnd;

                return (
                  <div
                    key={i}
                    onClick={() => currentMonth && handleDayClick(date)}
                    onMouseEnter={() => setHoverDate(date)}
                    onMouseLeave={() => setHoverDate(null)}
                    style={{
                      width: '34px',
                      height: '34px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: isSelected ? '50%' : '0',
                      background: isSelected
                        ? 'var(--color-brand-accent)'
                        : inRange
                        ? 'var(--color-secondary-100)'
                        : 'transparent',
                      cursor: currentMonth ? 'pointer' : 'default',
                      fontSize: '13px',
                      fontFamily: 'var(--font-display)',
                      fontWeight: isSelected || isToday ? 700 : 400,
                      color: isSelected
                        ? '#ffffff'
                        : !currentMonth
                        ? 'var(--color-neutral-300)'
                        : isToday
                        ? 'var(--color-brand-accent)'
                        : 'var(--color-text-primary)',
                      transition: 'background 0.1s ease',
                      userSelect: 'none',
                      outline: isToday && !isSelected
                        ? '1px solid var(--color-brand-accent)'
                        : 'none',
                      outlineOffset: '-1px',
                    }}
                    onMouseOver={(e) => {
                      if (currentMonth && !isSelected) {
                        (e.currentTarget as HTMLDivElement).style.background = inRange
                          ? 'var(--color-secondary-200)'
                          : 'var(--color-surface-subtle)';
                        (e.currentTarget as HTMLDivElement).style.borderRadius = '50%';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (currentMonth && !isSelected) {
                        (e.currentTarget as HTMLDivElement).style.background = inRange
                          ? 'var(--color-secondary-100)'
                          : 'transparent';
                        (e.currentTarget as HTMLDivElement).style.borderRadius = inRange ? '0' : '50%';
                      }
                    }}
                  >
                    {date.getDate()}
                  </div>
                );
              })}
            </div>

            {/* Hint */}
            <div
              style={{
                marginTop: '12px',
                fontSize: '11px',
                color: 'var(--color-text-muted)',
                textAlign: 'center',
              }}
            >
              {phase === 'start'
                ? 'Selecciona fecha de inicio'
                : 'Selecciona fecha de fin'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
