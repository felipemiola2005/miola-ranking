import { useState, useEffect, useCallback } from "react";

// ============================================================
// DATA
// ============================================================
const ADMIN_PIN = "2005";

const BARBERS_INITIAL = [
  { id: 1, name: "Guilherme", unit: "Tijuca", pin: "3847", avatar: null },
  { id: 2, name: "Belo", unit: "Tijuca", pin: "5219", avatar: null },
  { id: 3, name: "Ildon", unit: "Tijuca", pin: "7463", avatar: null },
  { id: 4, name: "Gabriel", unit: "Tijuca", pin: "2981", avatar: null },
  { id: 5, name: "Bruno Ximenes", unit: "Coophavila", pin: "6134", avatar: null },
  { id: 6, name: "Marcio", unit: "Coophavila", pin: "4872", avatar: null },
  { id: 7, name: "Igor", unit: "Coophavila", pin: "9356", avatar: null },
  { id: 8, name: "Leo", unit: "Coophavila", pin: "1748", avatar: null },
  { id: 9, name: "Arthur", unit: "Aero Rancho", pin: "8523", avatar: null },
  { id: 10, name: "Deyvid", unit: "Aero Rancho", pin: "3691", avatar: null },
  { id: 11, name: "Daniel", unit: "Aero Rancho", pin: "7214", avatar: null },
  { id: 12, name: "Mateus", unit: "Aero Rancho", pin: "5037", avatar: null },
  { id: 13, name: "Alexandre", unit: "Orla Morena", pin: "9182", avatar: null },
  { id: 14, name: "Samuel", unit: "Orla Morena", pin: "4629", avatar: null },
  { id: 15, name: "Victor", unit: "Orla Morena", pin: "7341", avatar: null },
  { id: 16, name: "Byanca", unit: "Orla Morena", pin: "2856", avatar: null },
  { id: 17, name: "Matheus", unit: "Monte Castelo", pin: "6493", avatar: null },
  { id: 18, name: "Letícia", unit: "Monte Castelo", pin: "1827", avatar: null },
  { id: 19, name: "Denilson", unit: "Monte Castelo", pin: "5364", avatar: null },
  { id: 20, name: "Leonardo", unit: "Monte Líbano", pin: "8741", avatar: null },
  { id: 21, name: "Eduardo", unit: "Monte Líbano", pin: "3058", avatar: null },
  { id: 22, name: "Henrique", unit: "Monte Líbano", pin: "6915", avatar: null },
  { id: 23, name: "Bruno Cezar", unit: "Carandá Bosque", pin: "4283", avatar: null },
  { id: 24, name: "Pedro", unit: "Carandá Bosque", pin: "7596", avatar: null },
];

const PLANS = [
  { name: "Plano Prata Corte", value: 69.90 },
  { name: "Plano Prata Barba", value: 79.90 },
  { name: "Plano Prata Corte e Barba", value: 119.90 },
  { name: "Plano Ouro Corte", value: 84.90 },
  { name: "Plano Ouro Barba", value: 89.90 },
  { name: "Plano Ouro Corte e Barba", value: 149.90 },
];

const UNITS = ["Tijuca", "Coophavila", "Aero Rancho", "Orla Morena", "Monte Castelo", "Monte Líbano", "Carandá Bosque"];
const ORIGINS = ["Indicação", "Fachada", "Anúncio Pago"];

const getCurrentMonthKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const getMonthLabel = (key) => {
  const [year, month] = key.split("-");
  const months = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  return `${months[parseInt(month) - 1]} ${year}`;
};

// ============================================================
// STORAGE HELPERS
// ============================================================
const STORAGE_KEYS = {
  sales: "miola_sales",
  barbers: "miola_barbers",
};

async function loadFromStorage(key, fallback) {
  try {
    const result = await window.storage.get(key, true);
    return result ? JSON.parse(result.value) : fallback;
  } catch {
    return fallback;
  }
}

async function saveToStorage(key, data) {
  try {
    await window.storage.set(key, JSON.stringify(data), true);
  } catch (e) {
    console.error("Storage error", e);
  }
}

// ============================================================
// UTILS
// ============================================================
const fmtCurrency = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function filterSalesByPeriod(sales, startDate, endDate) {
  const s = new Date(startDate + "T00:00:00");
  const e = new Date(endDate + "T23:59:59");
  return sales.filter(sale => {
    const d = new Date(sale.date);
    return d >= s && d <= e;
  });
}

function getMonthSales(sales, monthKey) {
  return sales.filter(s => s.date.startsWith(monthKey));
}

function computeRanking(sales, barbers) {
  const map = {};
  barbers.forEach(b => {
    map[b.id] = { barber: b, count: 0, revenue: 0 };
  });
  sales.forEach(s => {
    if (map[s.barberId]) {
      map[s.barberId].count += 1;
      map[s.barberId].revenue += s.planValue;
    }
  });
  return Object.values(map)
    .sort((a, b) => b.count - a.count || b.revenue - a.revenue);
}

// ============================================================
// COMPONENTS
// ============================================================

// PIN Pad
function PinPad({ onSubmit, title, subtitle }) {
  const [pin, setPin] = useState("");
  const [shake, setShake] = useState(false);

  const handleDigit = (d) => {
    if (pin.length < 4) setPin(p => p + d);
  };
  const handleDelete = () => setPin(p => p.slice(0, -1));

  useEffect(() => {
    if (pin.length === 4) {
      const ok = onSubmit(pin);
      if (!ok) {
        setShake(true);
        setTimeout(() => { setShake(false); setPin(""); }, 600);
      }
    }
  }, [pin]);

  return (
    <div style={styles.pinContainer}>
      <div style={styles.pinCard}>
        {/* Logo area */}
        <div style={styles.pinLogo}>
          <div style={styles.scissorIcon}>✂</div>
          <div style={styles.pinBrandName}>BARBEARIA MIOLA</div>
          <div style={styles.pinBrandSub}>MODELAMOS O SEU ESTILO!</div>
        </div>

        <div style={styles.pinTitle}>{title}</div>
        {subtitle && <div style={styles.pinSubtitle}>{subtitle}</div>}

        {/* Dots */}
        <div style={{ ...styles.pinDots, ...(shake ? styles.shake : {}) }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ ...styles.pinDot, ...(i < pin.length ? styles.pinDotFilled : {}) }} />
          ))}
        </div>

        {/* Keypad */}
        <div style={styles.keypad}>
          {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((k, i) => (
            <button
              key={i}
              style={{ ...styles.keyBtn, ...(k === "" ? styles.keyBtnEmpty : {}) }}
              onClick={() => k === "⌫" ? handleDelete() : k !== "" ? handleDigit(k) : null}
            >
              {k}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Avatar
function Avatar({ barber, size = 44 }) {
  const initials = barber.name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();
  const colors = ["#8B0000","#A00000","#6B0000","#700010","#900020"];
  const color = colors[barber.id % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: barber.avatar ? `url(${barber.avatar}) center/cover` : color,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Oswald', sans-serif", fontWeight: 700,
      fontSize: size * 0.35, color: "#FFD700",
      border: "2px solid #FFD700", flexShrink: 0,
    }}>
      {!barber.avatar && initials}
    </div>
  );
}

// Medal
function Medal({ pos }) {
  if (pos === 1) return <span style={{ fontSize: 22 }}>🥇</span>;
  if (pos === 2) return <span style={{ fontSize: 22 }}>🥈</span>;
  if (pos === 3) return <span style={{ fontSize: 22 }}>🥉</span>;
  return <span style={{ fontFamily: "'Oswald',sans-serif", fontWeight: 700, color: "#aaa", fontSize: 16, minWidth: 28, textAlign: "center" }}>#{pos}</span>;
}

// Trend arrow
function Trend({ prev, curr }) {
  if (prev === null || prev === undefined) return null;
  if (curr < prev) return <span style={{ color: "#4CAF50", fontSize: 14 }}>▲</span>;
  if (curr > prev) return <span style={{ color: "#f44336", fontSize: 14 }}>▼</span>;
  return <span style={{ color: "#888", fontSize: 14 }}>—</span>;
}

// Podium
function Podium({ top3 }) {
  if (top3.length < 1) return null;
  const order = [top3[1], top3[0], top3[2]].filter(Boolean);
  const heights = [80, 110, 60];
  const positions = [2, 1, 3];

  return (
    <div style={styles.podiumWrap}>
      {order.map((entry, i) => {
        const pos = positions[i];
        const h = heights[i];
        return (
          <div key={entry.barber.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <Avatar barber={entry.barber} size={pos === 1 ? 64 : 52} />
            <div style={{ fontFamily: "'Oswald',sans-serif", fontWeight: 700, color: "#fff", fontSize: pos === 1 ? 15 : 13, textAlign: "center" }}>
              {entry.barber.name}
            </div>
            <div style={{ color: "#FFD700", fontFamily: "'Oswald',sans-serif", fontSize: 13 }}>
              {entry.count} assin.
            </div>
            <div style={{
              width: pos === 1 ? 90 : 75,
              height: h,
              background: pos === 1
                ? "linear-gradient(180deg, #FFD700, #B8860B)"
                : pos === 2
                ? "linear-gradient(180deg, #C0C0C0, #888)"
                : "linear-gradient(180deg, #CD7F32, #8B4513)",
              borderRadius: "6px 6px 0 0",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Oswald',sans-serif", fontWeight: 900, fontSize: 28, color: "#fff",
            }}>
              {pos}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Ranking Row
function RankingRow({ entry, pos, prevPos, isAdmin, onDelete, currentSales }) {
  const [expanded, setExpanded] = useState(false);
  const barberSales = currentSales.filter(s => s.barberId === entry.barber.id);

  return (
    <div style={{ ...styles.rankRow, ...(pos <= 3 ? styles.rankRowTop : {}) }}>
      <div style={styles.rankRowMain} onClick={() => setExpanded(e => !e)}>
        <div style={styles.rankLeft}>
          <Medal pos={pos} />
          <Avatar barber={entry.barber} size={40} />
          <div>
            <div style={styles.rankName}>{entry.barber.name}</div>
            <div style={styles.rankUnit}>{entry.barber.unit}</div>
          </div>
        </div>
        <div style={styles.rankRight}>
          <Trend prev={prevPos} curr={pos} />
          <div style={{ textAlign: "right" }}>
            <div style={styles.rankCount}>{entry.count} <span style={{ fontSize: 11, color: "#aaa" }}>assin.</span></div>
            <div style={styles.rankRevenue}>{fmtCurrency(entry.revenue)}</div>
          </div>
          <span style={{ color: "#666", fontSize: 12 }}>{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {expanded && (
        <div style={styles.rankExpanded}>
          {barberSales.length === 0 ? (
            <div style={{ color: "#666", fontSize: 13, padding: "8px 0" }}>Nenhuma venda no período.</div>
          ) : (
            barberSales.map(sale => (
              <div key={sale.id} style={styles.saleItem}>
                <div>
                  <div style={{ fontWeight: 600, color: "#eee", fontSize: 13 }}>{sale.clientName}</div>
                  <div style={{ color: "#aaa", fontSize: 12 }}>{sale.plan} · {sale.origin}</div>
                  <div style={{ color: "#666", fontSize: 11 }}>{new Date(sale.date).toLocaleDateString("pt-BR")}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 13 }}>{fmtCurrency(sale.planValue)}</div>
                  {isAdmin && (
                    <button style={styles.deleteBtn} onClick={() => onDelete(sale.id)}>✕</button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Register Sale Modal
function RegisterSaleModal({ barber, onSave, onClose }) {
  const [step, setStep] = useState(1); // 1=form, 2=confirm
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [planIdx, setPlanIdx] = useState(0);
  const [origin, setOrigin] = useState(ORIGINS[0]);
  const [saving, setSaving] = useState(false);

  const plan = PLANS[planIdx];

  const handleConfirm = async () => {
    setSaving(true);
    const sale = {
      id: Date.now().toString(),
      barberId: barber.id,
      barberName: barber.name,
      unit: barber.unit,
      clientName,
      clientPhone,
      plan: plan.name,
      planValue: plan.value,
      origin,
      date: new Date().toISOString(),
      monthKey: getCurrentMonthKey(),
    };
    await onSave(sale);
    setSaving(false);
    onClose();
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <div style={styles.modalTitle}>{step === 1 ? "Nova Assinatura" : "Confirmar Venda"}</div>
          <button style={styles.modalClose} onClick={onClose}>✕</button>
        </div>

        {step === 1 ? (
          <>
            <div style={styles.formGroup}>
              <label style={styles.label}>Barbeiro</label>
              <div style={styles.readonlyField}>{barber.name} — {barber.unit}</div>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Nome do Cliente *</label>
              <input style={styles.input} value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Nome completo" />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Telefone do Cliente *</label>
              <input style={styles.input} value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="(67) 99999-9999" type="tel" />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Plano *</label>
              <select style={styles.select} value={planIdx} onChange={e => setPlanIdx(Number(e.target.value))}>
                {PLANS.map((p, i) => (
                  <option key={i} value={i}>{p.name} — {fmtCurrency(p.value)}</option>
                ))}
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Como o cliente chegou? *</label>
              <div style={styles.originBtns}>
                {ORIGINS.map(o => (
                  <button key={o} style={{ ...styles.originBtn, ...(origin === o ? styles.originBtnActive : {}) }} onClick={() => setOrigin(o)}>{o}</button>
                ))}
              </div>
            </div>
            <button
              style={{ ...styles.primaryBtn, ...((!clientName || !clientPhone) ? styles.btnDisabled : {}) }}
              disabled={!clientName || !clientPhone}
              onClick={() => setStep(2)}
            >
              Revisar Venda →
            </button>
          </>
        ) : (
          <>
            <div style={styles.confirmCard}>
              <div style={styles.confirmRow}><span style={styles.confirmLabel}>Barbeiro</span><span style={styles.confirmVal}>{barber.name}</span></div>
              <div style={styles.confirmRow}><span style={styles.confirmLabel}>Unidade</span><span style={styles.confirmVal}>{barber.unit}</span></div>
              <div style={styles.confirmRow}><span style={styles.confirmLabel}>Cliente</span><span style={styles.confirmVal}>{clientName}</span></div>
              <div style={styles.confirmRow}><span style={styles.confirmLabel}>Telefone</span><span style={styles.confirmVal}>{clientPhone}</span></div>
              <div style={styles.confirmRow}><span style={styles.confirmLabel}>Plano</span><span style={styles.confirmVal}>{plan.name}</span></div>
              <div style={styles.confirmRow}><span style={styles.confirmLabel}>Valor</span><span style={{ ...styles.confirmVal, color: "#FFD700", fontWeight: 700 }}>{fmtCurrency(plan.value)}</span></div>
              <div style={styles.confirmRow}><span style={styles.confirmLabel}>Origem</span><span style={styles.confirmVal}>{origin}</span></div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button style={styles.secondaryBtn} onClick={() => setStep(1)}>← Voltar</button>
              <button style={styles.primaryBtn} onClick={handleConfirm} disabled={saving}>
                {saving ? "Salvando..." : "✓ Confirmar Venda"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Admin: Add Barber Modal
function AddBarberModal({ onSave, onClose }) {
  const [name, setName] = useState("");
  const [unit, setUnit] = useState(UNITS[0]);
  const [pin, setPin] = useState("");

  const handleSave = () => {
    if (!name || pin.length !== 4) return;
    onSave({ name, unit, pin });
    onClose();
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <div style={styles.modalTitle}>Cadastrar Barbeiro</div>
          <button style={styles.modalClose} onClick={onClose}>✕</button>
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Nome *</label>
          <input style={styles.input} value={name} onChange={e => setName(e.target.value)} placeholder="Nome do barbeiro" />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Unidade *</label>
          <select style={styles.select} value={unit} onChange={e => setUnit(e.target.value)}>
            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>PIN (4 dígitos) *</label>
          <input style={styles.input} value={pin} onChange={e => setPin(e.target.value.replace(/\D/g,"").slice(0,4))} placeholder="0000" maxLength={4} />
        </div>
        <button style={{ ...styles.primaryBtn, ...(!name || pin.length !== 4 ? styles.btnDisabled : {}) }} disabled={!name || pin.length !== 4} onClick={handleSave}>
          Cadastrar
        </button>
      </div>
    </div>
  );
}

// Donut Chart
function DonutChart({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div style={{ color: "#666", textAlign: "center", padding: 20 }}>Sem dados</div>;

  const colors = ["#FFD700", "#8B0000", "#fff"];
  let cumulative = 0;
  const size = 160;
  const r = 60;
  const cx = size / 2;
  const cy = size / 2;

  const slices = data.map((d, i) => {
    const pct = d.value / total;
    const start = cumulative;
    cumulative += pct;
    const startAngle = start * 2 * Math.PI - Math.PI / 2;
    const endAngle = cumulative * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = pct > 0.5 ? 1 : 0;
    return {
      path: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`,
      color: colors[i % colors.length],
      label: d.label,
      value: d.value,
      pct: Math.round(pct * 100),
    };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <svg width={size} height={size}>
        {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} />)}
        <circle cx={cx} cy={cy} r={r * 0.55} fill="#1a0a0a" />
        <text x={cx} y={cy - 6} textAnchor="middle" fill="#FFD700" fontSize={22} fontWeight={700} fontFamily="Oswald">{total}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="#aaa" fontSize={10} fontFamily="Oswald">VENDAS</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: s.color, flexShrink: 0 }} />
              <span style={{ color: "#ccc", fontSize: 13 }}>{s.label}</span>
            </div>
            <span style={{ color: "#FFD700", fontWeight: 700, fontSize: 13 }}>{s.value} ({s.pct}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [sales, setSales] = useState([]);
  const [barbers, setBarbers] = useState(BARBERS_INITIAL);
  const [currentUser, setCurrentUser] = useState(null); // null | { barber } | { isAdmin: true }
  const [activeTab, setActiveTab] = useState("geral"); // geral | unit | history | mysales | admin
  const [selectedUnit, setSelectedUnit] = useState(UNITS[0]);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showAddBarber, setShowAddBarber] = useState(false);
  const [filterMode, setFilterMode] = useState("month"); // month | custom
  const [filterMonth, setFilterMonth] = useState(getCurrentMonthKey());
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");
  const [prevRanking, setPrevRanking] = useState({});
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [adminDeletePin, setAdminDeletePin] = useState("");
  const [showAdminDelete, setShowAdminDelete] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  // Load data
  useEffect(() => {
    (async () => {
      const savedSales = await loadFromStorage(STORAGE_KEYS.sales, []);
      const savedBarbers = await loadFromStorage(STORAGE_KEYS.barbers, BARBERS_INITIAL);
      setSales(savedSales);
      setBarbers(savedBarbers);
      setLoaded(true);
    })();
  }, []);

  // Poll for updates every 10s
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(async () => {
      const savedSales = await loadFromStorage(STORAGE_KEYS.sales, []);
      const savedBarbers = await loadFromStorage(STORAGE_KEYS.barbers, BARBERS_INITIAL);
      setSales(savedSales);
      setBarbers(savedBarbers);
    }, 10000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // PIN login
  const handleLogin = (pin) => {
    if (pin === ADMIN_PIN) {
      setCurrentUser({ isAdmin: true });
      return true;
    }
    const barber = barbers.find(b => b.pin === pin);
    if (barber) {
      setCurrentUser({ barber });
      return true;
    }
    return false;
  };

  // Get filtered sales
  const getFilteredSales = useCallback(() => {
    if (filterMode === "month") {
      return getMonthSales(sales, filterMonth);
    } else {
      if (!filterStart || !filterEnd) return [];
      return filterSalesByPeriod(sales, filterStart, filterEnd);
    }
  }, [sales, filterMode, filterMonth, filterStart, filterEnd]);

  const filteredSales = getFilteredSales();

  // Rankings
  const globalRanking = computeRanking(filteredSales, barbers);
  const unitRanking = computeRanking(
    filteredSales.filter(s => s.unit === selectedUnit),
    barbers.filter(b => b.unit === selectedUnit)
  );

  // History months
  const allMonths = [...new Set(sales.map(s => s.monthKey))].sort().reverse();
  const historyMonths = allMonths.filter(m => m !== getCurrentMonthKey());

  // Save sale
  const handleSaveSale = async (sale) => {
    const updated = [...sales, sale];
    setSales(updated);
    await saveToStorage(STORAGE_KEYS.sales, updated);
    showToast("Venda registrada com sucesso! 🎉");
  };

  // Delete sale
  const requestDelete = (saleId) => {
    setPendingDeleteId(saleId);
    setAdminDeletePin("");
    setShowAdminDelete(true);
  };

  const confirmDelete = () => {
    if (adminDeletePin !== "excluir") {
      showToast("Senha incorreta!", "error");
      return;
    }
    const updated = sales.filter(s => s.id !== pendingDeleteId);
    setSales(updated);
    saveToStorage(STORAGE_KEYS.sales, updated);
    setShowAdminDelete(false);
    setPendingDeleteId(null);
    setAdminDeletePin("");
    showToast("Venda excluída.");
  };

  // Add barber
  const handleAddBarber = async ({ name, unit, pin }) => {
    const newBarber = { id: Date.now(), name, unit, pin, avatar: null };
    const updated = [...barbers, newBarber];
    setBarbers(updated);
    await saveToStorage(STORAGE_KEYS.barbers, updated);
    showToast(`Barbeiro ${name} cadastrado!`);
  };

  // Delete barber
  const handleDeleteBarber = async (id) => {
    const updated = barbers.filter(b => b.id !== id);
    setBarbers(updated);
    await saveToStorage(STORAGE_KEYS.barbers, updated);
    showToast("Barbeiro removido.");
  };

  // Origin stats for admin
  const originStats = ORIGINS.map(o => ({
    label: o,
    value: filteredSales.filter(s => s.origin === o).length,
  }));

  // Unit financial summary for admin
  const unitSummary = UNITS.map(u => {
    const us = filteredSales.filter(s => s.unit === u);
    return { unit: u, count: us.length, revenue: us.reduce((a, s) => a + s.planValue, 0) };
  }).sort((a, b) => b.count - a.count);

  if (!loaded) {
    return (
      <div style={{ background: "#0d0202", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#FFD700", fontFamily: "Oswald", fontSize: 20 }}>Carregando...</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <PinPad
        title="Digite seu PIN"
        subtitle="Acesso restrito aos barbeiros Miola"
        onSubmit={handleLogin}
      />
    );
  }

  const isAdmin = currentUser.isAdmin;
  const currentBarber = currentUser.barber;

  // ---- RENDER ----
  return (
    <div style={styles.app}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <div style={styles.brandWrap}>
            <span style={styles.scissorSm}>✂</span>
            <div>
              <div style={styles.brandTitle}>BARBEARIA MIOLA</div>
              <div style={styles.brandSub}>RANKING DE ASSINATURAS</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {!isAdmin && currentBarber && (
              <button style={styles.newSaleBtn} onClick={() => setShowSaleModal(true)}>
                + Venda
              </button>
            )}
            <button style={styles.logoutBtn} onClick={() => setCurrentUser(null)}>Sair</button>
          </div>
        </div>
        {!isAdmin && currentBarber && (
          <div style={styles.welcomeBar}>
            Olá, <strong>{currentBarber.name}</strong> — {currentBarber.unit}
          </div>
        )}
        {isAdmin && (
          <div style={styles.welcomeBar}>
            👑 Modo Administrador
          </div>
        )}
      </div>

      {/* Filter bar */}
      <div style={styles.filterBar}>
        <div style={styles.filterToggle}>
          <button style={{ ...styles.filterBtn, ...(filterMode === "month" ? styles.filterBtnActive : {}) }} onClick={() => setFilterMode("month")}>Por Mês</button>
          <button style={{ ...styles.filterBtn, ...(filterMode === "custom" ? styles.filterBtnActive : {}) }} onClick={() => setFilterMode("custom")}>Período</button>
        </div>
        {filterMode === "month" ? (
          <select style={styles.filterSelect} value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
            <option value={getCurrentMonthKey()}>{getMonthLabel(getCurrentMonthKey())} (atual)</option>
            {historyMonths.map(m => <option key={m} value={m}>{getMonthLabel(m)}</option>)}
          </select>
        ) : (
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input type="date" style={styles.dateInput} value={filterStart} onChange={e => setFilterStart(e.target.value)} />
            <span style={{ color: "#666" }}>até</span>
            <input type="date" style={styles.dateInput} value={filterEnd} onChange={e => setFilterEnd(e.target.value)} />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {[
          { key: "geral", label: "🏆 Geral" },
          { key: "unit", label: "📍 Unidade" },
          { key: "history", label: "📅 Histórico" },
          ...(!isAdmin ? [{ key: "mysales", label: "📋 Minhas Vendas" }] : []),
          ...(isAdmin ? [{ key: "admin", label: "⚙️ Admin" }] : []),
        ].map(t => (
          <button key={t.key} style={{ ...styles.tab, ...(activeTab === t.key ? styles.tabActive : {}) }} onClick={() => setActiveTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={styles.content}>

        {/* GERAL */}
        {activeTab === "geral" && (
          <div>
            <Podium top3={globalRanking.slice(0, 3)} />
            <div style={styles.sectionTitle}>Ranking Geral — {filterMode === "month" ? getMonthLabel(filterMonth) : "Período"}</div>
            {globalRanking.filter(e => e.count > 0 || true).map((entry, i) => (
              <RankingRow
                key={entry.barber.id}
                entry={entry}
                pos={i + 1}
                prevPos={null}
                isAdmin={isAdmin}
                onDelete={requestDelete}
                currentSales={filteredSales}
              />
            ))}
          </div>
        )}

        {/* UNIDADE */}
        {activeTab === "unit" && (
          <div>
            <div style={styles.unitTabs}>
              {UNITS.map(u => (
                <button key={u} style={{ ...styles.unitTab, ...(selectedUnit === u ? styles.unitTabActive : {}) }} onClick={() => setSelectedUnit(u)}>
                  {u}
                </button>
              ))}
            </div>
            <div style={styles.sectionTitle}>Ranking — {selectedUnit}</div>
            {unitRanking.map((entry, i) => (
              <RankingRow
                key={entry.barber.id}
                entry={entry}
                pos={i + 1}
                prevPos={null}
                isAdmin={isAdmin}
                onDelete={requestDelete}
                currentSales={filteredSales}
              />
            ))}
          </div>
        )}

        {/* HISTÓRICO */}
        {activeTab === "history" && (
          <div>
            <div style={styles.sectionTitle}>Histórico de Meses</div>
            {historyMonths.length === 0 && (
              <div style={{ color: "#666", textAlign: "center", padding: 32 }}>Nenhum histórico disponível ainda.</div>
            )}
            {historyMonths.map(m => {
              const ms = getMonthSales(sales, m);
              const top = computeRanking(ms, barbers).filter(e => e.count > 0).slice(0, 3);
              return (
                <div key={m} style={styles.historyCard}>
                  <div style={styles.historyMonth}>{getMonthLabel(m)}</div>
                  <div style={{ color: "#aaa", fontSize: 13, marginBottom: 8 }}>
                    {ms.length} vendas · {fmtCurrency(ms.reduce((a, s) => a + s.planValue, 0))}
                  </div>
                  {top.map((entry, i) => (
                    <div key={entry.barber.id} style={styles.historyRow}>
                      <Medal pos={i + 1} />
                      <span style={{ color: "#eee", fontSize: 14 }}>{entry.barber.name}</span>
                      <span style={{ color: "#FFD700", fontSize: 13, marginLeft: "auto" }}>{entry.count} assin. · {fmtCurrency(entry.revenue)}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* MINHAS VENDAS */}
        {activeTab === "mysales" && currentBarber && (
          <div>
            <div style={styles.sectionTitle}>Minhas Vendas</div>
            {(() => {
              const mySales = filteredSales.filter(s => s.barberId === currentBarber.id);
              if (mySales.length === 0) return <div style={{ color: "#666", textAlign: "center", padding: 32 }}>Nenhuma venda no período.</div>;
              const total = mySales.reduce((a, s) => a + s.planValue, 0);
              return (
                <>
                  <div style={styles.mySummary}>
                    <div style={styles.mySummaryItem}>
                      <div style={styles.mySummaryVal}>{mySales.length}</div>
                      <div style={styles.mySummaryLabel}>Assinaturas</div>
                    </div>
                    <div style={styles.mySummaryItem}>
                      <div style={styles.mySummaryVal}>{fmtCurrency(total)}</div>
                      <div style={styles.mySummaryLabel}>Faturado</div>
                    </div>
                  </div>
                  {mySales.sort((a, b) => new Date(b.date) - new Date(a.date)).map(sale => (
                    <div key={sale.id} style={styles.saleItem}>
                      <div>
                        <div style={{ fontWeight: 600, color: "#eee", fontSize: 14 }}>{sale.clientName}</div>
                        <div style={{ color: "#aaa", fontSize: 12 }}>{sale.plan}</div>
                        <div style={{ color: "#888", fontSize: 11 }}>{sale.origin} · {new Date(sale.date).toLocaleDateString("pt-BR")}</div>
                      </div>
                      <div style={{ color: "#FFD700", fontWeight: 700 }}>{fmtCurrency(sale.planValue)}</div>
                    </div>
                  ))}
                </>
              );
            })()}
          </div>
        )}

        {/* ADMIN */}
        {activeTab === "admin" && isAdmin && (
          <div>
            {/* Origin chart */}
            <div style={styles.adminSection}>
              <div style={styles.sectionTitle}>📊 Origem das Vendas</div>
              <DonutChart data={originStats} />
            </div>

            {/* Unit financial summary */}
            <div style={styles.adminSection}>
              <div style={styles.sectionTitle}>💰 Resumo por Unidade</div>
              {unitSummary.map(u => (
                <div key={u.unit} style={styles.unitSummaryRow}>
                  <div>
                    <div style={{ color: "#eee", fontWeight: 600, fontSize: 14 }}>{u.unit}</div>
                    <div style={{ color: "#888", fontSize: 12 }}>{u.count} assinaturas</div>
                  </div>
                  <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 15 }}>{fmtCurrency(u.revenue)}</div>
                </div>
              ))}
            </div>

            {/* Barbers management */}
            <div style={styles.adminSection}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={styles.sectionTitle}>👤 Barbeiros</div>
                <button style={styles.newSaleBtn} onClick={() => setShowAddBarber(true)}>+ Novo</button>
              </div>
              {barbers.map(b => (
                <div key={b.id} style={styles.barberAdminRow}>
                  <Avatar barber={b} size={36} />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#eee", fontSize: 14, fontWeight: 600 }}>{b.name}</div>
                    <div style={{ color: "#888", fontSize: 12 }}>{b.unit} · PIN: {b.pin}</div>
                  </div>
                  <button style={styles.deleteBtn} onClick={() => handleDeleteBarber(b.id)}>✕</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showSaleModal && currentBarber && (
        <RegisterSaleModal barber={currentBarber} onSave={handleSaveSale} onClose={() => setShowSaleModal(false)} />
      )}

      {showAddBarber && (
        <AddBarberModal onSave={handleAddBarber} onClose={() => setShowAddBarber(false)} />
      )}

      {showAdminDelete && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>Confirmar Exclusão</div>
              <button style={styles.modalClose} onClick={() => setShowAdminDelete(false)}>✕</button>
            </div>
            <div style={{ color: "#aaa", fontSize: 14, marginBottom: 16 }}>
              Digite a senha de exclusão para confirmar:
            </div>
            <input
              style={styles.input}
              type="password"
              value={adminDeletePin}
              onChange={e => setAdminDeletePin(e.target.value)}
              placeholder="Senha"
            />
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button style={styles.secondaryBtn} onClick={() => setShowAdminDelete(false)}>Cancelar</button>
              <button style={{ ...styles.primaryBtn, background: "#8B0000" }} onClick={confirmDelete}>Excluir</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ ...styles.toast, ...(toast.type === "error" ? styles.toastError : {}) }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ============================================================
// STYLES
// ============================================================
const styles = {
  app: {
    background: "#0d0202",
    minHeight: "100vh",
    fontFamily: "'Lato', sans-serif",
    color: "#fff",
    maxWidth: 480,
    margin: "0 auto",
    position: "relative",
  },
  // PIN
  pinContainer: {
    background: "linear-gradient(160deg, #0d0202 0%, #1a0505 100%)",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  pinCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,215,0,0.15)",
    borderRadius: 20,
    padding: "32px 24px",
    width: "100%",
    maxWidth: 340,
  },
  pinLogo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 28,
    gap: 6,
  },
  scissorIcon: {
    fontSize: 36,
    color: "#FFD700",
  },
  pinBrandName: {
    fontFamily: "'Oswald', sans-serif",
    fontWeight: 700,
    fontSize: 22,
    color: "#FFD700",
    letterSpacing: 2,
  },
  pinBrandSub: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: 11,
    color: "#888",
    letterSpacing: 2,
  },
  pinTitle: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    marginBottom: 4,
  },
  pinSubtitle: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  pinDots: {
    display: "flex",
    justifyContent: "center",
    gap: 16,
    marginBottom: 28,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: "50%",
    border: "2px solid #FFD700",
    background: "transparent",
    transition: "background 0.15s",
  },
  pinDotFilled: {
    background: "#FFD700",
  },
  shake: {
    animation: "none",
    transform: "translateX(-8px)",
    transition: "transform 0.1s",
  },
  keypad: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 12,
  },
  keyBtn: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    color: "#fff",
    fontSize: 22,
    fontFamily: "'Oswald', sans-serif",
    fontWeight: 600,
    padding: "16px 0",
    cursor: "pointer",
    transition: "all 0.15s",
  },
  keyBtnEmpty: {
    background: "transparent",
    border: "none",
    cursor: "default",
  },
  // Header
  header: {
    background: "linear-gradient(180deg, #3a0000 0%, #1a0303 100%)",
    borderBottom: "2px solid #FFD700",
    padding: "14px 16px 10px",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  headerTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  scissorSm: {
    fontSize: 22,
    color: "#FFD700",
  },
  brandTitle: {
    fontFamily: "'Oswald', sans-serif",
    fontWeight: 700,
    fontSize: 16,
    color: "#FFD700",
    letterSpacing: 1,
  },
  brandSub: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: 9,
    color: "#aaa",
    letterSpacing: 1,
  },
  newSaleBtn: {
    background: "#FFD700",
    color: "#0d0202",
    border: "none",
    borderRadius: 8,
    padding: "7px 14px",
    fontFamily: "'Oswald', sans-serif",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
  },
  logoutBtn: {
    background: "transparent",
    color: "#666",
    border: "1px solid #333",
    borderRadius: 8,
    padding: "6px 12px",
    fontSize: 12,
    cursor: "pointer",
  },
  welcomeBar: {
    color: "#aaa",
    fontSize: 12,
    marginTop: 8,
  },
  // Filter
  filterBar: {
    background: "#150404",
    padding: "10px 16px",
    display: "flex",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
    borderBottom: "1px solid #2a0a0a",
  },
  filterToggle: {
    display: "flex",
    background: "#0d0202",
    borderRadius: 8,
    overflow: "hidden",
    border: "1px solid #2a0a0a",
  },
  filterBtn: {
    background: "transparent",
    color: "#666",
    border: "none",
    padding: "6px 12px",
    fontSize: 12,
    cursor: "pointer",
    fontFamily: "'Oswald', sans-serif",
  },
  filterBtnActive: {
    background: "#8B0000",
    color: "#FFD700",
  },
  filterSelect: {
    background: "#1a0505",
    color: "#eee",
    border: "1px solid #333",
    borderRadius: 8,
    padding: "6px 10px",
    fontSize: 12,
    flex: 1,
  },
  dateInput: {
    background: "#1a0505",
    color: "#eee",
    border: "1px solid #333",
    borderRadius: 8,
    padding: "6px 8px",
    fontSize: 12,
    width: 120,
  },
  // Tabs
  tabs: {
    display: "flex",
    background: "#0d0202",
    borderBottom: "1px solid #2a0a0a",
    overflowX: "auto",
  },
  tab: {
    background: "transparent",
    color: "#666",
    border: "none",
    borderBottom: "3px solid transparent",
    padding: "12px 14px",
    fontSize: 12,
    fontFamily: "'Oswald', sans-serif",
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
    letterSpacing: 0.5,
  },
  tabActive: {
    color: "#FFD700",
    borderBottomColor: "#FFD700",
  },
  // Content
  content: {
    padding: "16px",
    paddingBottom: 40,
  },
  sectionTitle: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: 15,
    color: "#FFD700",
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 4,
    textTransform: "uppercase",
  },
  // Podium
  podiumWrap: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-end",
    gap: 12,
    marginBottom: 24,
    padding: "16px 0 0",
  },
  // Ranking rows
  rankRow: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 12,
    marginBottom: 8,
    overflow: "hidden",
    transition: "all 0.2s",
  },
  rankRowTop: {
    border: "1px solid rgba(255,215,0,0.2)",
  },
  rankRowMain: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 14px",
    cursor: "pointer",
    gap: 8,
  },
  rankLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  rankName: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: 15,
    fontWeight: 600,
    color: "#eee",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  rankUnit: {
    fontSize: 11,
    color: "#666",
  },
  rankRight: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  rankCount: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: 18,
    fontWeight: 700,
    color: "#FFD700",
    textAlign: "right",
  },
  rankRevenue: {
    fontSize: 11,
    color: "#888",
    textAlign: "right",
  },
  rankExpanded: {
    borderTop: "1px solid rgba(255,255,255,0.06)",
    padding: "10px 14px",
  },
  saleItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
  },
  deleteBtn: {
    background: "rgba(139,0,0,0.5)",
    color: "#f88",
    border: "none",
    borderRadius: 6,
    width: 26,
    height: 26,
    fontSize: 12,
    cursor: "pointer",
    flexShrink: 0,
  },
  // Unit tabs
  unitTabs: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 16,
  },
  unitTab: {
    background: "rgba(255,255,255,0.04)",
    color: "#888",
    border: "1px solid #2a0a0a",
    borderRadius: 20,
    padding: "6px 12px",
    fontSize: 12,
    cursor: "pointer",
    fontFamily: "'Oswald', sans-serif",
  },
  unitTabActive: {
    background: "#8B0000",
    color: "#FFD700",
    borderColor: "#FFD700",
  },
  // History
  historyCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  historyMonth: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: 17,
    color: "#FFD700",
    fontWeight: 700,
    marginBottom: 4,
  },
  historyRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "6px 0",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
  },
  // My sales
  mySummary: {
    display: "flex",
    gap: 12,
    marginBottom: 16,
  },
  mySummaryItem: {
    flex: 1,
    background: "rgba(255,215,0,0.07)",
    border: "1px solid rgba(255,215,0,0.2)",
    borderRadius: 12,
    padding: "14px 12px",
    textAlign: "center",
  },
  mySummaryVal: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: 24,
    fontWeight: 700,
    color: "#FFD700",
  },
  mySummaryLabel: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
  },
  // Admin
  adminSection: {
    marginBottom: 24,
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 12,
    padding: 16,
  },
  unitSummaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  barberAdminRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 0",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  // Modal
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.85)",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    zIndex: 200,
    padding: "0",
  },
  modal: {
    background: "#1a0505",
    border: "1px solid rgba(255,215,0,0.2)",
    borderRadius: "20px 20px 0 0",
    padding: "24px 20px 32px",
    width: "100%",
    maxWidth: 480,
    maxHeight: "92vh",
    overflowY: "auto",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: 20,
    color: "#FFD700",
    fontWeight: 700,
  },
  modalClose: {
    background: "rgba(255,255,255,0.1)",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: 30,
    height: 30,
    fontSize: 14,
    cursor: "pointer",
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    display: "block",
    color: "#aaa",
    fontSize: 12,
    marginBottom: 6,
    fontFamily: "'Oswald', sans-serif",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  input: {
    width: "100%",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10,
    color: "#fff",
    padding: "12px 14px",
    fontSize: 15,
    boxSizing: "border-box",
    outline: "none",
  },
  select: {
    width: "100%",
    background: "#0d0202",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10,
    color: "#fff",
    padding: "12px 14px",
    fontSize: 15,
    boxSizing: "border-box",
    outline: "none",
  },
  readonlyField: {
    background: "rgba(255,215,0,0.07)",
    border: "1px solid rgba(255,215,0,0.2)",
    borderRadius: 10,
    color: "#FFD700",
    padding: "12px 14px",
    fontSize: 14,
    fontFamily: "'Oswald', sans-serif",
  },
  originBtns: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  originBtn: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#888",
    borderRadius: 20,
    padding: "8px 14px",
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "'Oswald', sans-serif",
  },
  originBtnActive: {
    background: "#8B0000",
    border: "1px solid #FFD700",
    color: "#FFD700",
  },
  primaryBtn: {
    width: "100%",
    background: "#FFD700",
    color: "#0d0202",
    border: "none",
    borderRadius: 12,
    padding: "15px",
    fontSize: 16,
    fontFamily: "'Oswald', sans-serif",
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: 1,
  },
  secondaryBtn: {
    flex: 1,
    background: "rgba(255,255,255,0.07)",
    color: "#aaa",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: "14px",
    fontSize: 15,
    fontFamily: "'Oswald', sans-serif",
    cursor: "pointer",
  },
  btnDisabled: {
    opacity: 0.4,
    cursor: "not-allowed",
  },
  confirmCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,215,0,0.15)",
    borderRadius: 12,
    padding: 16,
  },
  confirmRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  confirmLabel: {
    color: "#666",
    fontSize: 13,
  },
  confirmVal: {
    color: "#eee",
    fontSize: 13,
    fontWeight: 600,
    textAlign: "right",
    maxWidth: "60%",
  },
  // Toast
  toast: {
    position: "fixed",
    bottom: 24,
    left: "50%",
    transform: "translateX(-50%)",
    background: "#FFD700",
    color: "#0d0202",
    fontFamily: "'Oswald', sans-serif",
    fontWeight: 700,
    fontSize: 14,
    padding: "12px 24px",
    borderRadius: 50,
    zIndex: 300,
    whiteSpace: "nowrap",
    boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
  },
  toastError: {
    background: "#8B0000",
    color: "#fff",
  },
};
