import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../router/RouterContext';
import { mockStore, Trip, Activity, DayPlan } from '../data/mockStore';
import { useDemoState } from '../context/DemoContext';
import { EmptyState, LoadingState, ErrorState } from '../components/common/FeedbackStates';
import {
  MapPin,
  Calendar,
  CloudSun,
  Edit3,
  Trash2,
  Plus,
  Save,
  CheckCircle2,
  Umbrella,
  Clock,
  Sparkles,
  Share2,
  ArrowLeft,
  X,
} from 'lucide-react';

export const TripDetailsPage: React.FC = () => {
  const { match, navigate } = useRouter();
  const { demoState } = useDemoState();
  const tripId = match.params.id;

  const [trip, setTrip] = useState<Trip | undefined>(() => mockStore.getTripById(tripId));
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(1);
  const [editingActivity, setEditingActivity] = useState<{
    dayIndex: number;
    activity: Activity;
  } | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('11:00');
  const [newPeriod, setNewPeriod] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [newDescription, setNewDescription] = useState('');
  const [showToast, setShowToast] = useState('');

  useEffect(() => {
    return mockStore.subscribe(() => {
      const current = mockStore.getTripById(tripId);
      setTrip(current);
    });
  }, [tripId]);

  if (demoState === 'loading') {
    return <LoadingState message="Carregando detalhes e itinerário do roteiro..." />;
  }

  if (demoState === 'error') {
    return (
      <ErrorState
        title="Falha ao carregar roteiro"
        message="Não foi possível sincronizar o itinerário desta viagem."
      />
    );
  }

  if (demoState === 'empty' || !trip) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <EmptyState
          icon={MapPin}
          title="Roteiro não encontrado"
          description="A viagem selecionada não existe ou foi removida."
          actionText="Voltar para Minhas Viagens"
          onAction={() => navigate('/trips')}
        />
      </div>
    );
  }

  const currentDay = trip.itinerary.find((d) => d.dayIndex === selectedDayIndex) || trip.itinerary[0];

  const handleSaveTripStatus = () => {
    mockStore.updateTrip(trip.id, { status: 'saved' });
    setShowToast('Roteiro salvo com sucesso no seu perfil!');
    setTimeout(() => setShowToast(''), 3000);
  };

  const handleDeleteActivity = (dayIndex: number, actId: string) => {
    mockStore.deleteActivity(trip.id, dayIndex, actId);
    setShowToast('Atividade removida.');
    setTimeout(() => setShowToast(''), 2500);
  };

  const handleSaveActivityEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingActivity) {
      mockStore.updateActivity(trip.id, editingActivity.dayIndex, editingActivity.activity.id, {
        title: editingActivity.activity.title,
        description: editingActivity.activity.description,
        time: editingActivity.activity.time,
      });
      setEditingActivity(null);
      setShowToast('Alterações da atividade salvas!');
      setTimeout(() => setShowToast(''), 2500);
    }
  };

  const handleAddManualActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newAct: Activity = {
      id: `act_manual_${Date.now()}`,
      period: newPeriod,
      time: newTime,
      title: newTitle.trim(),
      description: newDescription.trim() || 'Atividade personalizada adicionada manualmente.',
      category: 'lazer',
      estimatedCost: '$$',
      weatherTip: 'Atividade adicionada pelo viajante.',
      isCustom: true,
    };

    mockStore.addActivity(trip.id, selectedDayIndex, newAct);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewDescription('');
    setShowToast('Nova atividade inserida no itinerário!');
    setTimeout(() => setShowToast(''), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white text-xs font-bold rounded-2xl shadow-xl animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          {showToast}
        </div>
      )}

      {/* Top Navigation Back */}
      <div className="flex items-center justify-between">
        <Link
          to="/trips"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Viagens
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              setShowToast('Link copiado para a área de transferência!');
              setTimeout(() => setShowToast(''), 2500);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            Compartilhar
          </button>

          <button
            onClick={handleSaveTripStatus}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-600/20 transition-all active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            {trip.status === 'saved' ? 'Roteiro Salvo' : 'Salvar Roteiro'}
          </button>
        </div>
      </div>

      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <img
          src={trip.coverImage}
          alt={trip.title}
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent" />

        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-300">
              {trip.destination}, {trip.country}
            </span>
            <span
              className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                trip.status === 'saved'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {trip.status === 'saved' ? 'Status: Salvo' : 'Status: Rascunho / Em Revisão'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            {trip.title}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-400" />
              {trip.startDate} até {trip.endDate} ({trip.durationDays} dias)
            </span>
            <span className="flex items-center gap-1.5">
              <CloudSun className="w-4 h-4 text-amber-400" />
              Previsão Média: ~{trip.weatherSummary.avgTemp}°C
            </span>
          </p>
        </div>
      </div>

      {/* Weather Ribbon & Day Selector */}
      {trip.itinerary.length > 0 && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <CloudSun className="w-4 h-4 text-amber-500" />
              Previsão Diária & Seleção do Dia
            </span>
            <span>Filosofia: "IA propõe, o humano dispõe"</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {trip.itinerary.map((day) => {
              const isSelected = day.dayIndex === selectedDayIndex;
              return (
                <button
                  key={day.dayIndex}
                  onClick={() => setSelectedDayIndex(day.dayIndex)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold ${
                        isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      Dia {day.dayIndex}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">
                      {day.weather.tempMin}°C - {day.weather.tempMax}°C
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{day.weather.condition}</span>
                    {day.weather.rainProbability > 40 && (
                      <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-0.5">
                        <Umbrella className="w-3 h-3" /> {day.weather.rainProbability}%
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Activities Timeline for Selected Day */}
      {currentDay ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Programação do Dia {currentDay.dayIndex} ({currentDay.date})
              </h2>
              <p className="text-xs text-slate-500">
                Condição: {currentDay.weather.condition} • {currentDay.weather.tempMin}°C a {currentDay.weather.tempMax}°C
              </p>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar Atividade Manual
            </button>
          </div>

          {currentDay.activities.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
              Nenhuma atividade cadastrada para este dia. Clique no botão acima para adicionar.
            </div>
          ) : (
            <div className="space-y-4">
              {currentDay.activities.map((act) => (
                <div
                  key={act.id}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex flex-col items-center justify-center shrink-0 font-bold text-xs border border-indigo-100 dark:border-indigo-900">
                      <Clock className="w-3.5 h-3.5 mb-0.5" />
                      <span>{act.time}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {act.period === 'morning' ? 'Manhã' : act.period === 'afternoon' ? 'Tarde' : 'Noite'}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          Custo: {act.estimatedCost}
                        </span>
                        {act.isCustom && (
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                            Manual
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {act.title}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                        {act.description}
                      </p>

                      {act.weatherTip && (
                        <p className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg inline-block border border-amber-200/60 dark:border-amber-900/50 mt-1">
                          💡 {act.weatherTip}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions for human review */}
                  <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                    <button
                      onClick={() =>
                        setEditingActivity({
                          dayIndex: currentDay.dayIndex,
                          activity: { ...act },
                        })
                      }
                      className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                      title="Editar atividade"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteActivity(currentDay.dayIndex, act.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Excluir atividade do roteiro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 text-center text-xs text-slate-400">
          Nenhum itinerário gerado para esta viagem.
        </div>
      )}

      {/* Edit Activity Modal */}
      {editingActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Revisar / Editar Atividade
              </h3>
              <button
                onClick={() => setEditingActivity(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveActivityEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Horário
                </label>
                <input
                  type="text"
                  required
                  value={editingActivity.activity.time}
                  onChange={(e) =>
                    setEditingActivity({
                      ...editingActivity,
                      activity: { ...editingActivity.activity, time: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Título da Atração
                </label>
                <input
                  type="text"
                  required
                  value={editingActivity.activity.title}
                  onChange={(e) =>
                    setEditingActivity({
                      ...editingActivity,
                      activity: { ...editingActivity.activity, title: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Descrição Contextual
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingActivity.activity.description}
                  onChange={(e) =>
                    setEditingActivity({
                      ...editingActivity,
                      activity: { ...editingActivity.activity, description: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingActivity(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20"
                >
                  Salvar Modificação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Manual Activity Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Adicionar Parada Manual
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddManualActivity} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Turno
                  </label>
                  <select
                    value={newPeriod}
                    onChange={(e) => setNewPeriod(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="morning">Manhã</option>
                    <option value="afternoon">Tarde</option>
                    <option value="evening">Noite</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Horário Sugerido
                  </label>
                  <input
                    type="text"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="Ex: 15:30"
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nome do Local / Atividade
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Visita ao Mercado de Pulgas"
                  className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notas / Descrição
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Anotações pessoais, ingressos ou detalhes da visita..."
                  className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20"
                >
                  Inserir Atividade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
