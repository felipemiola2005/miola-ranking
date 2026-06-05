import { useState, useEffect, useCallback } from "react";

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
  { id: 18, name: "Leticia", unit: "Monte Castelo", pin: "1827", avatar: null },
  { id: 19, name: "Denilson", unit: "Monte Castelo", pin: "5364", avatar: null },
  { id: 20, name: "Leonardo", unit: "Monte Libano", pin: "8741", avatar: null },
  { id: 21, name: "Eduardo", unit: "Monte Libano", pin: "3058", avatar: null },
  { id: 22, name: "Henrique", unit: "Monte Libano", pin: "6915", avatar: null },
  { id: 23, name: "Bruno Cezar", unit: "Caranda Bosque", pin: "4283", avatar: null },
  { id: 24, name: "Pedro", unit: "Caranda Bosque", pin: "7596", avatar: null },
];

const PLANS = [
  { name: "Plano Prata Corte", value: 69.90 },
  { name: "Plano Prata Barba", value: 79.90 },
  { name: "Plano Prata Corte e Barba", value: 119.90 },
  { name: "Plano Ouro Corte", value: 84.90 },
  { name: "Plano Ouro Barba", value: 89.90 },
  { name: "Plano Ouro Corte e Barba", value: 149.90 },
];

const UNITS = ["Tijuca","Coophavila","Aero Rancho","Orla Morena","Monte Castelo","Monte Libano","Caranda Bosque"];
const ORIGINS = ["Indicacao","Fachada","Anuncio Pago"];

const getCurrentMonthKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
};

const getMonthLabel = (key) => {
  const [year, month] = key.split("-");
  const months = ["Janeiro","Fevereiro","Marco","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  return `${months[parseInt(month)-1]} ${year}`;
};

const STORAGE_KEYS = { sales: "miola_sales", barbers: "miola_barbers" };

async function saveToStorage(key, data) {
  try { await window.storage.set(key, JSON.stringify(data)); } catch {}
}

const fmtCurrency = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function filterSalesByPeriod(sales, startDate, endDate) {
  const s = new Date(startDate + "T00:00:00");
  const e = new Date(endDate + "T23:59:59");
  return sales.filter(sale => { const d = new Date(sale.date); return d >= s && d <= e; });
}

function getMonthSales(sales, monthKey) {
  return sales.filter(s => s.date.startsWith(monthKey));
}

function computeRanking(sales, barbers) {
  const map = {};
  barbers.forEach(b => { map[b.id] = { barber: b, count: 0, revenue: 0 }; });
  sales.forEach(s => { if (map[s.barberId]) { map[s.barberId].count += 1; map[s.barberId].revenue += s.planValue; } });
  return Object.values(map).sort((a, b) => b.count - a.count || b.revenue - a.revenue);
}
function PinPad({ onSubmit }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handleDigit = (d) => { if (pin.length < 4) setPin(p => p + d); };
  const handleDelete = () => setPin(p => p.slice(0, -1));

  useEffect(() => {
    if (pin.length === 4) {
      const ok = onSubmit(pin);
      if (!ok) {
        setError(true);
        setTimeout(() => { setError(false); setPin(""); }, 700);
      }
    }
  }, [pin]);

  return (
    <div style={S.pinWrap}>
      <div style={S.pinCard}>
        <div style={S.pinLogo}>
          <div style={{ fontSize: 40, color: "#FFD700" }}>✂</div>
          <div style={{ fontFamily: "Oswald,sans-serif", fontWeight: 700, fontSize: 22, color: "#FFD700", letterSpacing: 2 }}>BARBEARIA MIOLA</div>
          <div style={{ fontSize: 11, color: "#666", letterSpacing: 2, fontFamily: "Oswald,sans-serif" }}>MODELAMOS O SEU ESTILO!</div>
        </div>
        <div style={{ fontFamily: "Oswald,sans-serif", fontSize: 17, color: "#fff", textAlign: "center", marginBottom: 6 }}>Digite seu PIN</div>
        <div style={{ fontSize: 12, color: "#666", textAlign: "center", marginBottom: 24 }}>Acesso restrito aos barbeiros Miola</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 28 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${error ? "#f44" : "#FFD700"}`, background: i < pin.length ? (error ? "#f44" : "#FFD700") : "transparent", transition: "all 0.15s" }} />
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((k, i) => (
            <button key={i} style={{ background: k===""?"transparent":"rgba(255,255,255,0.06)", border: k===""?"none":"1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontSize: 22, fontFamily: "Oswald,sans-serif", fontWeight: 600, padding: "16px 0", cursor: k===""?"default":"pointer" }}
              onClick={() => k==="⌫" ? handleDelete() : k!=="" ? handleDigit(k) : null}>{k}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Avatar({ barber, size = 44 }) {
  const initials = barber.name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();
  const cols = ["#8B0000","#A00000","#6B0000","#700010","#900020"];
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: barber.avatar ? `url(${barber.avatar}) center/cover` : cols[barber.id % cols.length], display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Oswald,sans-serif", fontWeight: 700, fontSize: size*0.35, color: "#FFD700", border: "2px solid #FFD700", flexShrink: 0 }}>
      {!barber.avatar && initials}
    </div>
  );
}

function Medal({ pos }) {
  if (pos === 1) return <span style={{ fontSize: 22 }}>🥇</span>;
  if (pos === 2) return <span style={{ fontSize: 22 }}>🥈</span>;
  if (pos === 3) return <span style={{ fontSize: 22 }}>🥉</span>;
  return <span style={{ fontFamily: "Oswald,sans-serif", fontWeight: 700, color: "#aaa", fontSize: 15, minWidth: 28, textAlign: "center" }}>#{pos}</span>;
}

function Podium({ top3 }) {
  if (!top3.length) return null;
  const order = [top3[1], top3[0], top3[2]].filter(Boolean);
  const heights = [80, 110, 60];
  const positions = [2, 1, 3];
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 12, marginBottom: 24, padding: "16px 0 0" }}>
      {order.map((entry, i) => {
        const pos = positions[i]; const h = heights[i];
        return (
          <div key={entry.barber.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <Avatar barber={entry.barber} size={pos===1?62:50} />
            <div style={{ fontFamily: "Oswald,sans-serif", fontWeight: 700, color: "#fff", fontSize: pos===1?14:12, textAlign: "center", maxWidth: 80 }}>{entry.barber.name}</div>
            <div style={{ color: "#FFD700", fontFamily: "Oswald,sans-serif", fontSize: 12 }}>{entry.count} assin.</div>
            <div style={{ width: pos===1?88:72, height: h, background: pos===1?"linear-gradient(180deg,#FFD700,#B8860B)":pos===2?"linear-gradient(180deg,#C0C0C0,#888)":"linear-gradient(180deg,#CD7F32,#8B4513)", borderRadius: "6px 6px 0 0", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Oswald,sans-serif", fontWeight: 900, fontSize: 26, color: "#fff" }}>{pos}</div>
          </div>
        );
      })}
    </div>
  );
}

function RankingRow({ entry, pos, isAdmin, onDelete, currentSales }) {
  const [expanded, setExpanded] = useState(false);
  const barberSales = currentSales.filter(s => s.barberId === entry.barber.id);
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${pos<=3?"rgba(255,215,0,0.2)":"rgba(255,255,255,0.06)"}`, borderRadius: 12, marginBottom: 8, overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", cursor: "pointer", gap: 8 }} onClick={() => setExpanded(e => !e)}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
          <Medal pos={pos} />
          <Avatar barber={entry.barber} size={38} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "Oswald,sans-serif", fontSize: 14, fontWeight: 600, color: "#eee", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.barber.name}</div>
            <div style={{ fontSize: 11, color: "#666" }}>{entry.barber.unit}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "Oswald,sans-serif", fontSize: 18, fontWeight: 700, color: "#FFD700" }}>{entry.count} <span style={{ fontSize: 11, color: "#aaa" }}>assin.</span></div>
            <div style={{ fontSize: 11, color: "#888" }}>{fmtCurrency(entry.revenue)}</div>
          </div>
          <span style={{ color: "#555", fontSize: 11 }}>{expanded ? "▲" : "▼"}</span>
        </div>
      </div>
      {expanded && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "10px 14px" }}>
          {barberSales.length === 0 ? <div style={{ color: "#555", fontSize: 13 }}>Nenhuma venda no periodo.</div> :
            barberSales.map(sale => (
              <div key={sale.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div>
                  <div style={{ fontWeight: 600, color: "#eee", fontSize: 13 }}>{sale.clientName}</div>
                  <div style={{ color: "#aaa", fontSize: 12 }}>{sale.plan} · {sale.origin}</div>
                  <div style={{ color: "#555", fontSize: 11 }}>{new Date(sale.date).toLocaleDateString("pt-BR")}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 13 }}>{fmtCurrency(sale.planValue)}</div>
                  {isAdmin && <button style={{ background: "rgba(139,0,0,0.5)", color: "#f88", border: "none", borderRadius: 6, width: 26, height: 26, fontSize: 12, cursor: "pointer" }} onClick={() => onDelete(sale.id)}>✕</button>}
                </div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}
function SaleModal({ barber, onSave, onClose }) {
  const [step, setStep] = useState(1);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [planIdx, setPlanIdx] = useState(0);
  const [origin, setOrigin] = useState(ORIGINS[0]);
  const [saving, setSaving] = useState(false);
  const plan = PLANS[planIdx];

  const handleConfirm = async () => {
    setSaving(true);
    await onSave({ id: Date.now().toString(), barberId: barber.id, barberName: barber.name, unit: barber.unit, clientName, clientPhone, plan: plan.name, planValue: plan.value, origin, date: new Date().toISOString(), monthKey: getCurrentMonthKey() });
    setSaving(false); onClose();
  };

  return (
    <div style={S.overlay}>
      <div style={S.modal}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontFamily: "Oswald,sans-serif", fontSize: 20, color: "#FFD700", fontWeight: 700 }}>{step===1?"Nova Assinatura":"Confirmar Venda"}</div>
          <button style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "none", borderRadius: "50%", width: 30, height: 30, fontSize: 14, cursor: "pointer" }} onClick={onClose}>✕</button>
        </div>
        {step===1 ? (
          <>
            <div style={S.fg}><label style={S.lbl}>Barbeiro</label><div style={{ background: "rgba(255,215,0,0.07)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 10, color: "#FFD700", padding: "12px 14px", fontSize: 14, fontFamily: "Oswald,sans-serif" }}>{barber.name} — {barber.unit}</div></div>
            <div style={S.fg}><label style={S.lbl}>Nome do Cliente *</label><input style={S.input} value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Nome completo" /></div>
            <div style={S.fg}><label style={S.lbl}>Telefone *</label><input style={S.input} value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="(67) 99999-9999" type="tel" /></div>
            <div style={S.fg}><label style={S.lbl}>Plano *</label>
              <select style={S.select} value={planIdx} onChange={e => setPlanIdx(Number(e.target.value))}>
                {PLANS.map((p,i) => <option key={i} value={i}>{p.name} — {fmtCurrency(p.value)}</option>)}
              </select>
            </div>
            <div style={S.fg}><label style={S.lbl}>Como o cliente chegou? *</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {ORIGINS.map(o => <button key={o} style={{ background: origin===o?"#8B0000":"rgba(255,255,255,0.05)", border: `1px solid ${origin===o?"#FFD700":"rgba(255,255,255,0.1)"}`, color: origin===o?"#FFD700":"#888", borderRadius: 20, padding: "8px 14px", fontSize: 13, cursor: "pointer", fontFamily: "Oswald,sans-serif" }} onClick={() => setOrigin(o)}>{o}</button>)}
              </div>
            </div>
            <button style={{ ...S.btn, opacity: (!clientName||!clientPhone)?0.4:1 }} disabled={!clientName||!clientPhone} onClick={() => setStep(2)}>Revisar Venda →</button>
          </>
        ) : (
          <>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,215,0,0.15)", borderRadius: 12, padding: 16 }}>
              {[["Barbeiro",barber.name],["Unidade",barber.unit],["Cliente",clientName],["Telefone",clientPhone],["Plano",plan.name],["Valor",fmtCurrency(plan.value)],["Origem",origin]].map(([l,v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ color: "#666", fontSize: 13 }}>{l}</span>
                  <span style={{ color: l==="Valor"?"#FFD700":"#eee", fontWeight: l==="Valor"?700:600, fontSize: 13 }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button style={{ flex: 1, background: "rgba(255,255,255,0.07)", color: "#aaa", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 14, fontSize: 15, fontFamily: "Oswald,sans-serif", cursor: "pointer" }} onClick={() => setStep(1)}>← Voltar</button>
              <button style={S.btn} onClick={handleConfirm} disabled={saving}>{saving?"Salvando...":"✓ Confirmar Venda"}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function AddBarberModal({ onSave, onClose }) {
  const [name, setName] = useState(""); const [unit, setUnit] = useState(UNITS[0]); const [pin, setPin] = useState("");
  return (
    <div style={S.overlay}><div style={S.modal}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontFamily: "Oswald,sans-serif", fontSize: 20, color: "#FFD700", fontWeight: 700 }}>Cadastrar Barbeiro</div>
        <button style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "none", borderRadius: "50%", width: 30, height: 30, fontSize: 14, cursor: "pointer" }} onClick={onClose}>✕</button>
      </div>
      <div style={S.fg}><label style={S.lbl}>Nome *</label><input style={S.input} value={name} onChange={e => setName(e.target.value)} placeholder="Nome do barbeiro" /></div>
      <div style={S.fg}><label style={S.lbl}>Unidade *</label><select style={S.select} value={unit} onChange={e => setUnit(e.target.value)}>{UNITS.map(u => <option key={u} value={u}>{u}</option>)}</select></div>
      <div style={S.fg}><label style={S.lbl}>PIN (4 digitos) *</label><input style={S.input} value={pin} onChange={e => setPin(e.target.value.replace(/\D/g,"").slice(0,4))} placeholder="0000" maxLength={4} /></div>
      <button style={{ ...S.btn, opacity: (!name||pin.length!==4)?0.4:1 }} disabled={!name||pin.length!==4} onClick={() => { onSave({ name, unit, pin }); onClose(); }}>Cadastrar</button>
    </div></div>
  );
}

function DonutChart({ data }) {
  const total = data.reduce((s,d) => s+d.value, 0);
  if (total===0) return <div style={{ color: "#555", textAlign: "center", padding: 20 }}>Sem dados ainda.</div>;
  const colors = ["#FFD700","#8B0000","#e0e0e0"];
  let cum=0; const size=160; const r=60; const cx=80; const cy=80;
  const slices = data.map((d,i) => {
    const pct=d.value/total; const start=cum; cum+=pct;
    const a1=start*2*Math.PI-Math.PI/2; const a2=cum*2*Math.PI-Math.PI/2;
    return { path: `M${cx} ${cy} L${cx+r*Math.cos(a1)} ${cy+r*Math.sin(a1)} A${r} ${r} 0 ${pct>0.5?1:0} 1 ${cx+r*Math.cos(a2)} ${cy+r*Math.sin(a2)} Z`, color: colors[i%colors.length], label: d.label, value: d.value, pct: Math.round(pct*100) };
  });
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <svg width={size} height={size}>{slices.map((s,i) => <path key={i} d={s.path} fill={s.color} />)}<circle cx={cx} cy={cy} r={r*0.55} fill="#1a0a0a" /><text x={cx} y={cy-5} textAnchor="middle" fill="#FFD700" fontSize={22} fontWeight={700} fontFamily="Oswald">{total}</text><text x={cx} y={cy+14} textAnchor="middle" fill="#aaa" fontSize={10} fontFamily="Oswald">VENDAS</text></svg>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
        {slices.map((s,i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 12, height: 12, borderRadius: 3, background: s.color }} /><span style={{ color: "#ccc", fontSize: 13 }}>{s.label}</span></div><span style={{ color: "#FFD700", fontWeight: 700, fontSize: 13 }}>{s.value} ({s.pct}%)</span></div>)}
      </div>
    </div>
  );
}
export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [sales, setSales] = useState([]);
  const [barbers, setBarbers] = useState(BARBERS_INITIAL);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("geral");
  const [selectedUnit, setSelectedUnit] = useState(UNITS[0]);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showAddBarber, setShowAddBarber] = useState(false);
  const [filterMode, setFilterMode] = useState("month");
  const [filterMonth, setFilterMonth] = useState(getCurrentMonthKey());
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");
  const [toast, setToast] = useState(null);
  const [showAdminDelete, setShowAdminDelete] = useState(false);
  const [adminDeletePin, setAdminDeletePin] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  useEffect(() => {
    const unsub1 = window.storage.subscribeToChanges(STORAGE_KEYS.sales, (val) => {
      try { setSales(JSON.parse(val)); } catch {}
    });
    const unsub2 = window.storage.subscribeToChanges(STORAGE_KEYS.barbers, (val) => {
      try { setBarbers(JSON.parse(val)); } catch {}
    });
    (async () => {
      const s = await window.storage.get(STORAGE_KEYS.sales);
      const b = await window.storage.get(STORAGE_KEYS.barbers);
      if (s) try { setSales(JSON.parse(s.value)); } catch {}
      if (b) try { setBarbers(JSON.parse(b.value)); } catch {}
      setLoaded(true);
    })();
    return () => { unsub1?.(); unsub2?.(); };
  }, []);

  const showToast = (msg, type="success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const handleLogin = (pin) => {
    if (pin === ADMIN_PIN) { setCurrentUser({ isAdmin: true }); return true; }
    const barber = barbers.find(b => b.pin === pin);
    if (barber) { setCurrentUser({ barber }); return true; }
    return false;
  };

  const filteredSales = useCallback(() => {
    if (filterMode==="month") return getMonthSales(sales, filterMonth);
    if (!filterStart||!filterEnd) return [];
    return filterSalesByPeriod(sales, filterStart, filterEnd);
  }, [sales, filterMode, filterMonth, filterStart, filterEnd])();

  const globalRanking = computeRanking(filteredSales, barbers);
  const unitRanking = computeRanking(filteredSales.filter(s => s.unit===selectedUnit), barbers.filter(b => b.unit===selectedUnit));
  const allMonths = [...new Set(sales.map(s => s.monthKey))].sort().reverse();
  const historyMonths = allMonths.filter(m => m!==getCurrentMonthKey());

  const handleSaveSale = async (sale) => {
    const updated = [...sales, sale];
    setSales(updated); await saveToStorage(STORAGE_KEYS.sales, updated);
    showToast("Venda registrada! 🎉");
  };

  const requestDelete = (id) => { setPendingDeleteId(id); setAdminDeletePin(""); setShowAdminDelete(true); };

  const confirmDelete = () => {
    if (adminDeletePin!=="excluir") { showToast("Senha incorreta!", "error"); return; }
    const updated = sales.filter(s => s.id!==pendingDeleteId);
    setSales(updated); saveToStorage(STORAGE_KEYS.sales, updated);
    setShowAdminDelete(false); setPendingDeleteId(null); setAdminDeletePin(""); showToast("Venda excluida.");
  };

  const handleAddBarber = async ({ name, unit, pin }) => {
    const nb = { id: Date.now(), name, unit, pin, avatar: null };
    const updated = [...barbers, nb]; setBarbers(updated); await saveToStorage(STORAGE_KEYS.barbers, updated);
    showToast(`Barbeiro ${name} cadastrado!`);
  };

  const handleDeleteBarber = async (id) => {
    const updated = barbers.filter(b => b.id!==id); setBarbers(updated); await saveToStorage(STORAGE_KEYS.barbers, updated);
    showToast("Barbeiro removido.");
  };

  const originStats = ["Indicacao","Fachada","Anuncio Pago"].map(o => ({ label: o, value: filteredSales.filter(s => s.origin===o).length }));
  const unitSummary = UNITS.map(u => { const us=filteredSales.filter(s => s.unit===u); return { unit: u, count: us.length, revenue: us.reduce((a,s) => a+s.planValue,0) }; }).sort((a,b) => b.count-a.count);

  const isAdmin = currentUser?.isAdmin;
  const currentBarber = currentUser?.barber;

  if (!loaded) return <div style={{ background: "#0d0202", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ color: "#FFD700", fontFamily: "Oswald,sans-serif", fontSize: 20 }}>Carregando...</div></div>;
  if (!currentUser) return <PinPad onSubmit={handleLogin} />;

  const tabs = [
    { key: "geral", label: "🏆 Geral" },
    { key: "unit", label: "📍 Unidade" },
    { key: "history", label: "📅 Historico" },
    ...(!isAdmin?[{ key: "mysales", label: "📋 Minhas Vendas" }]:[]),
    ...(isAdmin?[{ key: "admin", label: "⚙️ Admin" }]:[]),
  ];

  return (
    <div style={{ background: "#0d0202", minHeight: "100vh", fontFamily: "Lato,sans-serif", color: "#fff", maxWidth: 480, margin: "0 auto" }}>
      <div style={{ background: "linear-gradient(180deg,#3a0000,#1a0303)", borderBottom: "2px solid #FFD700", padding: "14px 16px 10px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22, color: "#FFD700" }}>✂</span>
            <div>
              <div style={{ fontFamily: "Oswald,sans-serif", fontWeight: 700, fontSize: 16, color: "#FFD700", letterSpacing: 1 }}>BARBEARIA MIOLA</div>
              <div style={{ fontFamily: "Oswald,sans-serif", fontSize: 9, color: "#aaa", letterSpacing: 1 }}>RANKING DE ASSINATURAS</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {!isAdmin && currentBarber && <button style={{ background: "#FFD700", color: "#0d0202", border: "none", borderRadius: 8, padding: "7px 14px", fontFamily: "Oswald,sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }} onClick={() => setShowSaleModal(true)}>+ Venda</button>}
            <button style={{ background: "transparent", color: "#666", border: "1px solid #333", borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer" }} onClick={() => setCurrentUser(null)}>Sair</button>
          </div>
        </div>
        <div style={{ color: "#aaa", fontSize: 12, marginTop: 6 }}>{isAdmin?"👑 Modo Administrador":`Ola, ${currentBarber?.name} — ${currentBarber?.unit}`}</div>
      </div>

      <div style={{ background: "#150404", padding: "10px 16px", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", borderBottom: "1px solid #2a0a0a" }}>
        <div style={{ display: "flex", background: "#0d0202", borderRadius: 8, overflow: "hidden", border: "1px solid #2a0a0a" }}>
          {["month","custom"].map(m => <button key={m} style={{ background: filterMode===m?"#8B0000":"transparent", color: filterMode===m?"#FFD700":"#666", border: "none", padding: "6px 12px", fontSize: 12, cursor: "pointer", fontFamily: "Oswald,sans-serif" }} onClick={() => setFilterMode(m)}>{m==="month"?"Por Mes":"Periodo"}</button>)}
        </div>
        {filterMode==="month" ? (
          <select style={{ background: "#1a0505", color: "#eee", border: "1px solid #333", borderRadius: 8, padding: "6px 10px", fontSize: 12, flex: 1 }} value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
            <option value={getCurrentMonthKey()}>{getMonthLabel(getCurrentMonthKey())} (atual)</option>
            {historyMonths.map(m => <option key={m} value={m}>{getMonthLabel(m)}</option>)}
          </select>
        ) : (
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input type="date" style={{ background: "#1a0505", color: "#eee", border: "1px solid #333", borderRadius: 8, padding: "6px 8px", fontSize: 12, width: 130 }} value={filterStart} onChange={e => setFilterStart(e.target.value)} />
            <span style={{ color: "#555" }}>ate</span>
            <input type="date" style={{ background: "#1a0505", color: "#eee", border: "1px solid #333", borderRadius: 8, padding: "6px 8px", fontSize: 12, width: 130 }} value={filterEnd} onChange={e => setFilterEnd(e.target.value)} />
          </div>
        )}
      </div>

      <div style={{ display: "flex", background: "#0d0202", borderBottom: "1px solid #2a0a0a", overflowX: "auto" }}>
        {tabs.map(t => <button key={t.key} style={{ background: "transparent", color: activeTab===t.key?"#FFD700":"#666", border: "none", borderBottom: `3px solid ${activeTab===t.key?"#FFD700":"transparent"}`, padding: "12px 14px", fontSize: 12, fontFamily: "Oswald,sans-serif", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }} onClick={() => setActiveTab(t.key)}>{t.label}</button>)}
      </div>

      <div style={{ padding: 16, paddingBottom: 48 }}>
        {activeTab==="geral" && <div><Podium top3={globalRanking.slice(0,3)} /><div style={S.secTitle}>Ranking Geral — {filterMode==="month"?getMonthLabel(filterMonth):"Periodo"}</div>{globalRanking.map((entry,i) => <RankingRow key={entry.barber.id} entry={entry} pos={i+1} isAdmin={isAdmin} onDelete={requestDelete} currentSales={filteredSales} />)}</div>}
        {activeTab==="unit" && <div><div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>{UNITS.map(u => <button key={u} style={{ background: selectedUnit===u?"#8B0000":"rgba(255,255,255,0.04)", color: selectedUnit===u?"#FFD700":"#888", border: `1px solid ${selectedUnit===u?"#FFD700":"#2a0a0a"}`, borderRadius: 20, padding: "6px 12px", fontSize: 12, cursor: "pointer", fontFamily: "Oswald,sans-serif" }} onClick={() => setSelectedUnit(u)}>{u}</button>)}</div><div style={S.secTitle}>Ranking — {selectedUnit}</div>{unitRanking.map((entry,i) => <RankingRow key={entry.barber.id} entry={entry} pos={i+1} isAdmin={isAdmin} onDelete={requestDelete} currentSales={filteredSales} />)}</div>}
        {activeTab==="history" && <div><div style={S.secTitle}>Historico de Meses</div>{historyMonths.length===0&&<div style={{ color: "#555", textAlign: "center", padding: 32 }}>Nenhum historico disponivel ainda.</div>}{historyMonths.map(m => { const ms=getMonthSales(sales,m); const top=computeRanking(ms,barbers).filter(e=>e.count>0).slice(0,3); return <div key={m} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 16, marginBottom: 12 }}><div style={{ fontFamily: "Oswald,sans-serif", fontSize: 17, color: "#FFD700", fontWeight: 700, marginBottom: 4 }}>{getMonthLabel(m)}</div><div style={{ color: "#aaa", fontSize: 13, marginBottom: 8 }}>{ms.length} vendas · {fmtCurrency(ms.reduce((a,s)=>a+s.planValue,0))}</div>{top.map((entry,i)=><div key={entry.barber.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}><Medal pos={i+1}/><span style={{ color: "#eee", fontSize: 14 }}>{entry.barber.name}</span><span style={{ color: "#FFD700", fontSize: 13, marginLeft: "auto" }}>{entry.count} assin. · {fmtCurrency(entry.revenue)}</span></div>)}</div>; })}</div>}
        {activeTab==="mysales"&&currentBarber&&(()=>{const mySales=filteredSales.filter(s=>s.barberId===currentBarber.id);const total=mySales.reduce((a,s)=>a+s.planValue,0);return <div><div style={S.secTitle}>Minhas Vendas</div><div style={{ display: "flex", gap: 12, marginBottom: 16 }}>{[["Assinaturas",mySales.length],["Faturado",fmtCurrency(total)]].map(([l,v])=><div key={l} style={{ flex: 1, background: "rgba(255,215,0,0.07)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 12, padding: "14px 12px", textAlign: "center" }}><div style={{ fontFamily: "Oswald,sans-serif", fontSize: 22, fontWeight: 700, color: "#FFD700" }}>{v}</div><div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{l}</div></div>)}</div>{mySales.length===0?<div style={{ color: "#555", textAlign: "center", padding: 32 }}>Nenhuma venda no periodo.</div>:mySales.sort((a,b)=>new Date(b.date)-new Date(a.date)).map(sale=><div key={sale.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}><div><div style={{ fontWeight: 600, color: "#eee", fontSize: 14 }}>{sale.clientName}</div><div style={{ color: "#aaa", fontSize: 12 }}>{sale.plan}</div><div style={{ color: "#666", fontSize: 11 }}>{sale.origin} · {new Date(sale.date).toLocaleDateString("pt-BR")}</div></div><div style={{ color: "#FFD700", fontWeight: 700 }}>{fmtCurrency(sale.planValue)}</div></div>)}</div>;})()}
        {activeTab==="admin"&&isAdmin&&<div><div style={{ ...S.adminBox, marginBottom: 20 }}><div style={S.secTitle}>📊 Origem das Vendas</div><DonutChart data={originStats}/></div><div style={{ ...S.adminBox, marginBottom: 20 }}><div style={S.secTitle}>💰 Resumo por Unidade</div>{unitSummary.map(u=><div key={u.unit} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}><div><div style={{ color: "#eee", fontWeight: 600, fontSize: 14 }}>{u.unit}</div><div style={{ color: "#888", fontSize: 12 }}>{u.count} assinaturas</div></div><div style={{ color: "#FFD700", fontWeight: 700, fontSize: 15 }}>{fmtCurrency(u.revenue)}</div></div>)}</div><div style={S.adminBox}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}><div style={S.secTitle}>👤 Barbeiros</div><button style={{ background: "#FFD700", color: "#0d0202", border: "none", borderRadius: 8, padding: "7px 14px", fontFamily: "Oswald,sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }} onClick={()=>setShowAddBarber(true)}>+ Novo</button></div>{barbers.map(b=><div key={b.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}><Avatar barber={b} size={34}/><div style={{ flex: 1 }}><div style={{ color: "#eee", fontSize: 14, fontWeight: 600 }}>{b.name}</div><div style={{ color: "#888", fontSize: 12 }}>{b.unit} · PIN: {b.pin}</div></div><button style={{ background: "rgba(139,0,0,0.5)", color: "#f88", border: "none", borderRadius: 6, width: 26, height: 26, fontSize: 12, cursor: "pointer" }} onClick={()=>handleDeleteBarber(b.id)}>✕</button></div>)}</div></div>}
      </div>

      {showSaleModal&&currentBarber&&<SaleModal barber={currentBarber} onSave={handleSaveSale} onClose={()=>setShowSaleModal(false)}/>}
      {showAddBarber&&<AddBarberModal onSave={handleAddBarber} onClose={()=>setShowAddBarber(false)}/>}

      {showAdminDelete&&<div style={S.overlay}><div style={S.modal}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}><div style={{ fontFamily: "Oswald,sans-serif", fontSize: 20, color: "#FFD700", fontWeight: 700 }}>Confirmar Exclusao</div><button style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "none", borderRadius: "50%", width: 30, height: 30, fontSize: 14, cursor: "pointer" }} onClick={()=>setShowAdminDelete(false)}>✕</button></div><div style={{ color: "#aaa", fontSize: 14, marginBottom: 16 }}>Digite a senha de exclusao para confirmar:</div><input style={S.input} type="password" value={adminDeletePin} onChange={e=>setAdminDeletePin(e.target.value)} placeholder="Senha"/><div style={{ display: "flex", gap: 10, marginTop: 16 }}><button style={{ flex: 1, background: "rgba(255,255,255,0.07)", color: "#aaa", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 14, fontSize: 15, fontFamily: "Oswald,sans-serif", cursor: "pointer" }} onClick={()=>setShowAdminDelete(false)}>Cancelar</button><button style={{ ...S.btn, background: "#8B0000" }} onClick={confirmDelete}>Excluir</button></div></div></div>}

      {toast&&<div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: toast.type==="error"?"#8B0000":"#FFD700", color: toast.type==="error"?"#fff":"#0d0202", fontFamily: "Oswald,sans-serif", fontWeight: 700, fontSize: 14, padding: "12px 24px", borderRadius: 50, zIndex: 300, whiteSpace: "nowrap", boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>{toast.msg}</div>}
    </div>
  );
}

const S = {
  pinWrap: { background: "linear-gradient(160deg,#0d0202,#1a0505)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 },
  pinCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,215,0,0.15)", borderRadius: 20, padding: "32px 24px", width: "100%", maxWidth: 340 },
  pinLogo: { display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28, gap: 6 },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 200 },
  modal: { background: "#1a0505", border: "1px solid rgba(255,215,0,0.2)", borderRadius: "20px 20px 0 0", padding: "24px 20px 32px", width: "100%", maxWidth: 480, maxHeight: "92vh", overflowY: "auto" },
  fg: { marginBottom: 16 },
  lbl: { display: "block", color: "#aaa", fontSize: 12, marginBottom: 6, fontFamily: "Oswald,sans-serif", letterSpacing: 0.5, textTransform: "uppercase" },
  input: { width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, color: "#fff", padding: "12px 14px", fontSize: 15, boxSizing: "border-box", outline: "none" },
  select: { width: "100%", background: "#0d0202", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, color: "#fff", padding: "12px 14px", fontSize: 15, boxSizing: "border-box", outline: "none" },
  btn: { flex: 1, width: "100%", background: "#FFD700", color: "#0d0202", border: "none", borderRadius: 12, padding: 15, fontSize: 16, fontFamily: "Oswald,sans-serif", fontWeight: 700, cursor: "pointer", letterSpacing: 1 },
  secTitle: { fontFamily: "Oswald,sans-serif", fontSize: 14, color: "#FFD700", letterSpacing: 1, marginBottom: 12, marginTop: 4, textTransform: "uppercase" },
  adminBox: { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 16 },
};
