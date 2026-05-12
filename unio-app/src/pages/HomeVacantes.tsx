import { assetUrl } from '../utils/assets';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Check,
  LogOut,
} from 'lucide-react';
import { type Vacante } from '../data/mock';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { useAuth } from '../context/AuthContext';
import { useVacantes } from '../hooks/useVacantes';
import { usePipeline } from '../context/PipelineContext';

const statusLabel: Record<Vacante['status'], string> = {
  activa: 'Activa',
  en_pausa: 'En Pausa',
  cerrada: 'Cerrada',
};

const priorityLabel: Record<Vacante['priority'], string> = {
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
};

/** Cambiar a `true` cuando exista el flujo de alta de vacante. */
const NUEVA_VACANTE_UI_ENABLED = true;

export default function HomeVacantes() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { vacantes, loading, error, logoUrl, companyName } = useVacantes();
  const { setCompanyLogoUrl, setCompanyName } = usePipeline();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (logoUrl) setCompanyLogoUrl(logoUrl);
    if (companyName) setCompanyName(companyName);
  }, [logoUrl, companyName, setCompanyLogoUrl, setCompanyName]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | Vacante['status']>('all');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'recientes' | 'antiguos'>('recientes');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Vacante['priority']>('all');

  const toggleRow = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
    setSelectAll(next.size === vacantes.length);
  };

  const toggleAll = () => {
    if (selectAll) {
      setSelected(new Set());
      setSelectAll(false);
    } else {
      setSelected(new Set(vacantes.map((v) => v.id)));
      setSelectAll(true);
    }
  };

  const counts = {
    all: vacantes.length,
    activa: vacantes.filter((v) => v.status === 'activa').length,
    en_pausa: vacantes.filter((v) => v.status === 'en_pausa').length,
    cerrada: vacantes.filter((v) => v.status === 'cerrada').length,
  };

  const filterCards = [
    {
      key: 'all' as const,
      value: counts.all,
      label: 'Vacantes',
      sublabel: '',
      accentColor: 'var(--color-brand-accent)',
      selectedBg: 'var(--color-secondary-50)',
    },
    {
      key: 'activa' as const,
      value: counts.activa,
      label: 'Activas',
      sublabel: `${Math.round((counts.activa / counts.all) * 100)}% del total`,
      accentColor: 'var(--color-positive-500)',
      selectedBg: '#edfaf3',
    },
    {
      key: 'en_pausa' as const,
      value: counts.en_pausa,
      label: 'En pausa',
      sublabel: `${Math.round((counts.en_pausa / counts.all) * 100)}% del total`,
      accentColor: 'var(--color-warning-500)',
      selectedBg: '#fffbeb',
    },
    {
      key: 'cerrada' as const,
      value: counts.cerrada,
      label: 'Cerradas',
      sublabel: `${Math.round((counts.cerrada / counts.all) * 100)}% del total`,
      accentColor: 'var(--color-neutral-400)',
      selectedBg: 'var(--color-surface-subtle)',
    },
  ];

  const filteredVacantes = vacantes
    .filter((v) => statusFilter === 'all' || v.status === statusFilter)
    .filter((v) => priorityFilter === 'all' || v.priority === priorityFilter)
    .filter((v) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        v.title.toLowerCase().includes(q) ||
        v.area.some((a) => a.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      const parse = (d: string) => {
        const [day, mon, year] = d.split(' ');
        const months: Record<string, number> = {
          Ene: 0, Feb: 1, Mar: 2, Abr: 3, May: 4, Jun: 5,
          Jul: 6, Ago: 7, Sep: 8, Oct: 9, Nov: 10, Dic: 11,
        };
        return new Date(Number(year), months[mon] ?? 0, Number(day)).getTime();
      };
      return sortOrder === 'recientes'
        ? parse(b.fecha) - parse(a.fecha)
        : parse(a.fecha) - parse(b.fecha);
    });

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'transparent',
        fontFamily: 'var(--font-display)',
      }}
    >
      {/* Navbar */}
      <header
        style={{
          background: '#ffffff',
          borderBottom: '1px solid var(--color-border-default)',
          padding: '0 40px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}
      >
        {/* Left: Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img src={logoUrl || assetUrl('/logo-comfandi.webp')} alt={companyName || 'Comfandi'} style={{ maxHeight: '52px', maxWidth: '200px', width: 'auto', height: 'auto', objectFit: 'contain' }} />
          <div style={{ width: '1px', height: '32px', background: 'var(--color-border-default)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
            <span>Powered by</span>
            <img src={assetUrl('/logo-unio.png')} alt="Unio" style={{ height: '14px', width: 'auto' }} />
          </div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {NUEVA_VACANTE_UI_ENABLED ? (
            <Button variant="primary" size="md" onClick={() => navigate('/vacante/nueva')}>
              <Plus size={16} />
              Crear Vacante
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="md"
            onClick={() => { logout(); navigate('/auth'); }}
            style={{ color: 'var(--color-text-muted)', gap: '6px' }}
          >
            <LogOut size={15} />
            Salir
          </Button>
        </div>
      </header>

      <div style={{ padding: '24px 40px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Filters */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
          }}
        >
          {/* Left: search */}
          <div style={{ position: 'relative' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-placeholder)',
              }}
            />
            <input
              type="text"
              placeholder="Buscar por vacante o área..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                height: '44px',
                padding: '0 16px 0 38px',
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-md)',
                background: '#ffffff',
                fontFamily: 'var(--font-display)',
                fontSize: '14px',
                color: 'var(--color-text-primary)',
                width: '280px',
                outline: 'none',
              }}
            />
          </div>

          {/* Right: sort + priority */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'recientes' | 'antiguos')}
              style={{
                height: '44px',
                padding: '0 36px 0 12px',
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-md)',
                background: '#ffffff',
                fontFamily: 'var(--font-display)',
                fontSize: '14px',
                color: 'var(--color-text-primary)',
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2368686a' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 10px center',
              }}
            >
              <option value="recientes">Ordenar: Más recientes</option>
              <option value="antiguos">Más antiguos</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as 'all' | Vacante['priority'])}
              style={{
                height: '44px',
                padding: '0 36px 0 12px',
                border: priorityFilter !== 'all'
                  ? '1px solid var(--color-brand-accent)'
                  : '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-md)',
                background: priorityFilter !== 'all' ? 'var(--color-secondary-50)' : '#ffffff',
                fontFamily: 'var(--font-display)',
                fontSize: '14px',
                color: priorityFilter !== 'all'
                  ? 'var(--color-brand-accent)'
                  : 'var(--color-text-primary)',
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2368686a' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 10px center',
              }}
            >
              <option value="all">Prioridad: Todas</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>
        </div>

        {/* Filter cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ background: '#ffffff', borderRadius: 'var(--radius-lg)', padding: '24px', border: '1px solid var(--color-border-default)', borderLeft: '4px solid #e4e4e4' }}>
                  <Skeleton height={36} width={60} borderRadius={6} style={{ marginBottom: '10px' }} />
                  <Skeleton height={14} width="55%" />
                </div>
              ))
            : filterCards.map((card) => {
            const isSelected = statusFilter === card.key;
            const isHovered = hoveredCard === card.key;
            return (
              <div
                key={card.key}
                onClick={() => setStatusFilter(card.key)}
                onMouseEnter={() => setHoveredCard(card.key)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  background: isSelected
                    ? card.selectedBg
                    : isHovered
                    ? 'var(--color-surface-subtle)'
                    : '#ffffff',
                  borderRadius: 'var(--radius-lg)',
                  padding: '24px',
                  borderTop: isSelected
                    ? `1.5px solid ${card.accentColor}`
                    : '1px solid var(--color-border-default)',
                  borderRight: isSelected
                    ? `1.5px solid ${card.accentColor}`
                    : '1px solid var(--color-border-default)',
                  borderBottom: isSelected
                    ? `1.5px solid ${card.accentColor}`
                    : '1px solid var(--color-border-default)',
                  borderLeft: `4px solid ${card.accentColor}`,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
                  userSelect: 'none',
                  boxShadow: isSelected ? `0 0 0 3px ${card.accentColor}22` : 'none',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    fontSize: '36px',
                    color: isSelected ? card.accentColor : 'var(--color-brand-primary)',
                    lineHeight: 1,
                    marginBottom: '6px',
                    transition: 'color 0.15s ease',
                  }}
                >
                  {card.value}
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: isSelected ? card.accentColor : 'var(--color-text-muted)',
                    transition: 'color 0.15s ease',
                  }}
                >
                  {card.label}
                </div>
                {card.sublabel && (
                  <div style={{ fontSize: '12px', color: 'var(--color-text-placeholder)', marginTop: '2px' }}>
                    {card.sublabel}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Table */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-default)',
            overflow: 'hidden',
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '40px 100px 1fr 180px 90px 1fr 70px 70px 120px',
              padding: '0 20px',
              height: '48px',
              alignItems: 'center',
              background: 'var(--color-surface-subtle)',
              borderBottom: '1px solid var(--color-border-default)',
            }}
          >
            {/* Select all */}
            <div
              onClick={toggleAll}
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '4px',
                border: selectAll ? '2px solid var(--color-brand-accent)' : '1.5px solid var(--color-neutral-300)',
                background: selectAll ? 'var(--color-brand-accent)' : '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {selectAll && <Check size={10} color="white" />}
            </div>
            {['Estado', 'Vacante', 'Area', 'Prioridad', 'Progreso', 'Total', 'Activos', 'Fecha'].map((h) => (
              <div
                key={h}
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {h}
              </div>
            ))}
          </div>

          {/* Table rows */}
          {loading && (
            <>
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 100px 1fr 180px 90px 1fr 70px 70px 120px',
                    padding: '0 20px',
                    height: '60px',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--color-border-default)',
                    gap: '0',
                  }}
                >
                  <Skeleton width={18} height={18} borderRadius={4} />
                  <Skeleton width={72} height={22} borderRadius={20} />
                  <Skeleton width="75%" height={14} />
                  <Skeleton width={110} height={12} />
                  <Skeleton width={52} height={22} borderRadius={20} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Skeleton width={90} height={6} borderRadius={3} />
                    <Skeleton width={40} height={12} />
                  </div>
                  <Skeleton width={28} height={14} />
                  <Skeleton width={28} height={14} />
                  <Skeleton width={80} height={12} />
                </div>
              ))}
            </>
          )}
          {error && (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-negative-600)', fontSize: '14px' }}>
              {error}
            </div>
          )}
          {!loading && !error && filteredVacantes.map((v) => (
            <TableRow
              key={v.id}
              vacante={v}
              selected={selected.has(v.id)}
              onSelect={toggleRow}
              onClick={() => {
                const navJobId = v.jobId ?? v.id;
                const base = `/pipeline/${navJobId}`;
                navigate(v.processId ? `${base}/process/${v.processId}` : base);
              }}
            />
          ))}

          {/* Pagination */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderTop: '1px solid var(--color-border-default)',
            }}
          >
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
              Mostrando {filteredVacantes.length} de {vacantes.length} vacantes
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Button variant="ghost" size="sm">
                <ChevronLeft size={14} />
                Anterior
              </Button>
              {[1, 2, 3].map((p) => (
                <button
                  key={p}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-sm)',
                    border: p === currentPage ? 'none' : '1px solid var(--color-border-default)',
                    background: p === currentPage ? 'var(--color-brand-primary)' : 'transparent',
                    color: p === currentPage ? '#ffffff' : 'var(--color-text-muted)',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  {p}
                </button>
              ))}
              <Button variant="ghost" size="sm">
                Siguiente
                <ChevronRight size={14} />
              </Button>
            </div>
            <select
              style={{
                height: '36px',
                padding: '0 28px 0 10px',
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-display)',
                fontSize: '13px',
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2368686a' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 8px center',
              }}
            >
              <option>20 por página</option>
              <option>50 por página</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Table Row ────────────────────────────────────────────────────────────────

interface TableRowProps {
  vacante: Vacante;
  selected: boolean;
  onSelect: (id: string) => void;
  onClick: () => void;
}

function TableRow({ vacante, selected, onSelect, onClick }: TableRowProps) {
  const progressColor =
    vacante.progressPct >= 80
      ? 'var(--color-positive-500)'
      : vacante.progressPct >= 40
      ? 'var(--color-brand-accent)'
      : 'var(--color-neutral-300)';

  return (
    <div
      onClick={onClick}
      style={{
        display: 'grid',
        gridTemplateColumns: '40px 100px 1fr 180px 90px 1fr 70px 70px 120px',
        padding: '14px 20px',
        minHeight: '60px',
        alignItems: 'center',
        borderBottom: '1px solid var(--color-border-default)',
        cursor: 'pointer',
        background: selected ? 'var(--color-secondary-50)' : '#ffffff',
        transition: 'background 0.1s ease',
      }}
      onMouseEnter={(e) => {
        if (!selected) e.currentTarget.style.background = 'var(--color-surface-subtle)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = selected ? 'var(--color-secondary-50)' : '#ffffff';
      }}
    >
      {/* Checkbox */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          onSelect(vacante.id);
        }}
        style={{
          width: '18px',
          height: '18px',
          borderRadius: '4px',
          border: selected ? '2px solid var(--color-brand-accent)' : '1.5px solid var(--color-neutral-300)',
          background: selected ? 'var(--color-brand-accent)' : '#ffffff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {selected && <Check size={10} color="white" />}
      </div>

      {/* Status */}
      <div style={{ display: 'flex' }}>
        <Badge variant={vacante.status} small>
          {statusLabel[vacante.status]}
        </Badge>
      </div>

      {/* Title */}
      <div
        style={{
          fontWeight: 600,
          fontSize: '14px',
          color: 'var(--color-text-primary)',
          paddingRight: '12px',
          lineHeight: '1.35',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {vacante.title}
      </div>

      {/* Area */}
      <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: '1.4', paddingRight: '8px' }}>
        {vacante.area.join(' • ')}
      </div>

      {/* Priority */}
      <div style={{ display: 'flex' }}>
        <Badge variant={vacante.priority} small>
          {priorityLabel[vacante.priority]}
        </Badge>
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            flex: 1,
            height: '6px',
            background: '#e6e6e6',
            borderRadius: '3px',
            overflow: 'hidden',
            maxWidth: '100px',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${vacante.progressPct}%`,
              background: progressColor,
              borderRadius: '3px',
            }}
          />
        </div>
        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
          {vacante.progressLabel}
        </span>
      </div>

      {/* Total */}
      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
        {vacante.total}
      </div>

      {/* Activos */}
      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
        {vacante.activos}
      </div>

      {/* Fecha */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          color: 'var(--color-text-muted)',
        }}
      >
        <Calendar size={12} />
        {vacante.fecha}
      </div>
    </div>
  );
}
