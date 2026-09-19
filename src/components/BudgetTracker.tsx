import React, { useState } from 'react';
import { Wallet, PieChart, TrendingUp, CheckCircle, AlertTriangle, Plus, Tag } from 'lucide-react';
import { Trip, BudgetItem } from '../types';

interface BudgetTrackerProps {
  trip: Trip;
  onAddExpense: (item: Omit<BudgetItem, 'id'>) => void;
}

export const BudgetTracker: React.FC<BudgetTrackerProps> = ({
  trip,
  onAddExpense,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState<BudgetItem['category']>('food');
  const [newExpensePaid, setNewExpensePaid] = useState(true);

  const totalBudget = trip.budgetTotal;
  const totalSpent = trip.budgetItems.reduce((acc, curr) => acc + curr.amount, 0);
  const remaining = totalBudget - totalSpent;
  const percentage = Math.min(100, Math.round((totalSpent / totalBudget) * 100));
  const isOverBudget = totalSpent > totalBudget;
  const isWarning = percentage > 85;

  const categoryTotals = trip.budgetItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount;
    return acc;
  }, {} as Record<string, number>);

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseName || !newExpenseAmount) return;

    onAddExpense({
      name: newExpenseName,
      amount: parseFloat(newExpenseAmount),
      category: newExpenseCategory,
      paid: newExpensePaid,
      date: 'Hoje',
    });

    setNewExpenseName('');
    setNewExpenseAmount('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
              <span>{trip.flag} {trip.destination}</span>
              <span>•</span>
              <span>Planejamento Financeiro</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Controle de Orçamento & Gastos
            </h2>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Despesa</span>
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/70">
            <span className="text-xs font-semibold text-slate-500">Orçamento Total</span>
            <p className="text-xl font-extrabold text-slate-900 mt-1">
              {trip.currency} {totalBudget.toLocaleString()}
            </p>
          </div>

          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/70">
            <span className="text-xs font-semibold text-slate-500">Total Consumido</span>
            <p className="text-xl font-extrabold text-blue-600 mt-1">
              {trip.currency} {totalSpent.toLocaleString()}
            </p>
          </div>

          <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200/70">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-800">Saldo Disponível</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/60 text-emerald-800">
                {100 - percentage}% livre
              </span>
            </div>
            <p className="text-xl font-extrabold text-emerald-700 mt-1">
              {trip.currency} {remaining.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Dual-toned Segmented Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-600">
              Progresso do Orçamento ({percentage}%)
            </span>
            {isWarning && (
              <span className="text-amber-600 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Limite de 85% atingido!
              </span>
            )}
          </div>
          <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden p-0.5 border border-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOverBudget
                  ? 'bg-red-500'
                  : isWarning
                  ? 'bg-amber-500'
                  : 'bg-gradient-to-r from-blue-600 to-sky-400'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Breakdown & Recent Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Categories */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-blue-600" />
            <span>Divisão por Categoria</span>
          </h3>

          <div className="space-y-3">
            {[
              { key: 'accommodation', label: 'Hospedagem & Hotéis', color: 'bg-indigo-500' },
              { key: 'transport', label: 'Transporte & Transfers', color: 'bg-blue-500' },
              { key: 'activities', label: 'Passeios & Experiências', color: 'bg-emerald-500' },
              { key: 'food', label: 'Gastronomia & Restaurantes', color: 'bg-amber-500' },
              { key: 'shopping', label: 'Compras & Souvenirs', color: 'bg-purple-500' },
            ].map((cat) => {
              const amount = categoryTotals[cat.key] || 0;
              const catPercent = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;
              return (
                <div key={cat.key} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700">{cat.label}</span>
                    <span className="font-bold text-slate-900">
                      {trip.currency} {amount.toLocaleString()} ({catPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full ${cat.color} rounded-full`}
                      style={{ width: `${catPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expenses List */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span>Transações & Reservas Registradas</span>
          </h3>

          <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto pr-1">
            {trip.budgetItems.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold">
                    <Tag className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800">{item.name}</h4>
                    <span className="text-[10px] text-slate-400 capitalize">{item.category} • {item.date}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                    {trip.currency} {item.amount.toLocaleString()}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${
                    item.paid ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {item.paid ? 'Pago' : 'Pendente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Registrar Nova Despesa</h3>
            <form onSubmit={handleCreateExpense} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Aluguel de scooter, Almoço na Marina"
                  value={newExpenseName}
                  onChange={(e) => setNewExpenseName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Valor ({trip.currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="120"
                    value={newExpenseAmount}
                    onChange={(e) => setNewExpenseAmount(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Categoria
                  </label>
                  <select
                    value={newExpenseCategory}
                    onChange={(e) => setNewExpenseCategory(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="accommodation">Hospedagem</option>
                    <option value="transport">Transporte</option>
                    <option value="activities">Passeios</option>
                    <option value="food">Alimentação</option>
                    <option value="shopping">Compras</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="expense-paid"
                  checked={newExpensePaid}
                  onChange={(e) => setNewExpensePaid(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="expense-paid" className="text-xs text-slate-700 font-medium">
                  Já foi pago? (marcar como confirmado)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                >
                  Salvar Despesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
