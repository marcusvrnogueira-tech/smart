import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, Link } from '../router/RouterContext';
import { useAuth } from '../context/AuthContext';
import { useDemoState } from '../context/DemoContext';
import { EmptyState, LoadingState, ErrorState } from '../components/common/FeedbackStates';
import {
  availabilityRepository,
  calculateInclusiveDays,
  validateDateRange,
} from '../lib/firebase/firestore/availabilityRepository';
import { AvailabilityPeriod } from '../data/mockStore';
import {
  Calendar,
  Plus,
  Trash2,
  Edit3,
  ArrowRight,
  Sparkles,
  X,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
} from 'lucide-react';

export const AvailabilityPage: React.FC = () => {
  const { navigate } = useRouter();
  const { user } = useAuth();
  const { demoState } = useDemoState();

  // Estados locais da lista
  const [availabilities, setAvailabilities] = useState<AvailabilityPeriod[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal State (Criar / Editar)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [modalError, setModalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Overlap warning state
  const [overlapWarning, setOverlapWarning] = useState<string | null>(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Identidade segura da sessão (Zero-Trust: nunca confia no formulário)
  const currentUserId = user?.uid || 'usr_larissa_001';

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const items = await availabilityRepository.listUserAvailabilities(currentUserId);
      setAvailabilities(items);
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao carregar suas folgas.');
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Checagem reativa de overlap quando datas são modificadas no modal
  useEffect(() => {
    if (!startDate || !endDate) {
      setOverlapWarning(null);
      return;
    }

    try {
      validateDateRange(startDate, endDate);
      availabilityRepository
        .checkOverlap(currentUserId, startDate, endDate, editingId || undefined)
        .then((res) => {
          if (res.hasOverlap && res.conflictingPeriods.length > 0) {
            const first = res.conflictingPeriods[0];
            setOverlapWarning(
              `Este período coincide com a folga "${first.title}" (${first.startDate} a ${first.endDate}).`
            );
          } else {
            setOverlapWarning(null);
          }
        });
    } catch {
      setOverlapWarning(null);
    }
  }, [startDate, endDate, currentUserId, editingId]);

  const openCreateModal = () => {
    setEditingId(null);
    setTitle('');
    setStartDate('');
    setEndDate('');
    setNotes('');
    setModalError('');
    setOverlapWarning(null);
    setIsModalOpen(true);
  };

  const openEditModal = (av: AvailabilityPeriod) => {
    setEditingId(av.id);
    setTitle(av.title);
    setStartDate(av.startDate);
    setEndDate(av.endDate);
    setNotes(av.notes || '');
    setModalError('');
    setOverlapWarning(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    try {
      validateDateRange(startDate, endDate);
      setIsSubmitting(true);

      if (editingId) {
        // Atualização
        await availabilityRepository.updateAvailability(currentUserId, editingId, {
          title,
          startDate,
          endDate,
          notes,
        });
        showToast('Período de folga atualizado com sucesso!');
      } else {
        // Criação
        await availabilityRepository.createAvailability(currentUserId, {
          title,
          startDate,
          endDate,
          notes,
        });
        showToast('Novo período de folga cadastrado com sucesso!');
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setModalError(err.message || 'Erro ao salvar período de folga.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, itemTitle: string) => {
    const confirmDelete = window.confirm(
      `Deseja realmente remover o período de folga "${itemTitle}"?`
    );
    if (!confirmDelete) return;

    try {
      await availabilityRepository.deleteAvailability(currentUserId, id);
      showToast('Período de folga removido com sucesso!');
      await loadData();
    } catch (err: any) {
      alert(`Falha ao excluir: ${err.message}`);
    }
  };

  // Preview dinâmico de duração em dias
  let previewDuration: number | null = null;
  if (startDate && endDate) {
    try {
      validateDateRange(startDate, endDate);
      previewDuration = calculateInclusiveDays(startDate, endDate);
    } catch {
      previewDuration = null;
    }
  }

  // Feedback states via DemoContext ou requisição real
  if (demoState === 'loading' || isLoading) {
    return <LoadingState message="Carregando seus períodos de folga e feriados..." />;
  }

  if (demoState === 'error' || errorMessage) {
    return (
      <ErrorState
        title="Falha ao carregar calendário de folgas"
        message={errorMessage || 'Não foi possível consultar as datas salvas no servidor.'}
        onRetry={loadData}
      />
    );
  }

  const showEmpty = demoState === 'empty' || availabilities.length === 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white text-xs font-bold rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Períodos de Folga & Feriados
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Cadastre suas pontes e janelas livres para a IA sugerir roteiros perfeitamente dimensionados.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 hover:scale-[1.02] active:scale-98 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Adicionar Folga
        </button>
      </div>

      {showEmpty ? (
        <EmptyState
          icon={Calendar}
          title="Nenhuma folga cadastrada"
          description="Adicione seus feriados prolongados ou dias de descanso para planejar suas viagens com 1 clique."
          actionText="Cadastrar Primeira Folga"
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availabilities.map((av) => (
            <div
              key={av.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50">
                    {av.durationDays} {av.durationDays === 1 ? 'dia livre' : 'dias livres'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(av)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                      title="Editar folga"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(av.id, av.title)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Excluir folga"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white">{av.title}</h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  {av.startDate} até {av.endDate}
                </p>

                {av.notes && (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2 border border-slate-100 dark:border-slate-800">
                    <FileText className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <span>{av.notes}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Pronto para itinerário
                </span>
                <Link
                  to={`/explore?startDate=${av.startDate}&endDate=${av.endDate}&title=${encodeURIComponent(av.title)}`}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Planejar Viagem
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Adicionar / Editar Período */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                {editingId ? 'Editar Período de Folga' : 'Nova Janela de Folga'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200/50 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{modalError}</span>
              </div>
            )}

            {overlapWarning && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 text-xs border border-amber-200/50 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                <div>
                  <span className="font-bold block">Conflito de Período Detectado:</span>
                  <span>{overlapWarning} Você pode salvar mesmo assim se desejar manter registros separados.</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nome / Ocasião
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Feriado Tiradentes Prolongado"
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Data Início *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Data Fim *
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {previewDuration !== null && (
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center justify-between border border-indigo-100 dark:border-indigo-900/40">
                  <span>Duração inclusiva calculada:</span>
                  <span className="font-bold">{previewDuration} {previewDuration === 1 ? 'dia' : 'dias'}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Observações / Notas (opcional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Quero focar em gastronomia e passeios ao ar livre."
                  className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingId ? 'Atualizar Folga' : 'Salvar Período'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
