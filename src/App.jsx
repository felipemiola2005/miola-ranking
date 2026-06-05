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

async function loadFromStorage(key, fallback) {
  try {
    const result = await window.storage.get(key);
    return result ? JSON.parse(result.value) : fallback;
  } catch { return fallback; }
}

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
