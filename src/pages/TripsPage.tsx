import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../router/RouterContext';
import { mockStore, Trip } from '../data/mockStore';
import { useDemoState } from '../context/DemoContext';
import { EmptyState, LoadingState, ErrorState } from '../components/common/FeedbackStates';
import {
  MapPin,
  Calendar,
  Search,
  Plus,
  Trash2,
  ExternalLink,
  Sparkles,
  CloudSun,
  AlertTriangle,
  X,
  CheckCircle2,
} from 'lucide-react';

export const TripsPage: React.FC = () => {
  const { navigate } = useRouter();
  const { demoState } = useDemoState();
  const [trips, setTrips] = useState<Trip[]>(mockStore.getTrips());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'saved' | 'draft'>('all');
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    return mockStore.subscribe(() => {
      setTrips(mockStore.getTrips());
    });
  }, []);

  if (demoState === 'loading') {
    return <LoadingState message="Carregando biblioteca de viagens salvas..." />;
  }

  if (demoState === 'error') {
    return (
      <ErrorState
        title="Falha ao listar viagens"
        message="Não foi possível sincronizar suas viagens salvas com a nuvem."
      />
    );
  }

  const filteredTrips = trips.filter((t) => {
    const matchText =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchText && matchStatus;
  });

  const showEmpty = demoState === 'empty' || filteredTrips.length === 0;

  const confirmDelete = () => {
    if (tripToDelete) {
      mockStore.deleteTrip(tripToDelete.id);
      setTripToDelete(null);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white text-xs font-bold rounded-2xl shadow-xl animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          Viagem excluída com sucesso!
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Minhas Viagens
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Acesse, edite ou exporte seus roteiros gerados pelo assistente inteligente.
          </p>
        </div>

        <Link
          to="/explore"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 hover:scale-[1.02] active:scale-98 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Novo Roteiro
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por cidade ou título..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 self-center sm:self-auto">
          {(['all', 'saved', 'draft'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {st === 'all' ? 'Todas' : st === 'saved' ? 'Salvas' : 'Rascunhos'}
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      {showEmpty ? (
        <EmptyState
          icon={MapPin}
          title="Nenhuma viagem encontrada"
          description={
            searchQuery
              ? 'Nenhum roteiro corresponde aos termos da busca.'
              : 'Você ainda não possui viagens cadastradas nesta categoria.'
          }
          actionText={searchQuery ? 'Limpar Busca' : 'Criar Roteiro Agora'}
          onAction={() => {
            if (searchQuery) setSearchQuery('');
            else navigate('/explore');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => (
            <div
              key={trip.id}
              className="group rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-800 transition-all flex flex-col justify-between overflow-hidden"
            >
              {/* Cover Image */}
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <img
                  src={trip.coverImage}
                  alt={trip.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                <div className="absolute top-3 left-3">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-md ${
                      trip.status === 'saved'
                        ? 'bg-emerald-500/90 text-white'
                        : 'bg-amber-500/90 text-white'
                    }`}
                  >
                    {trip.status === 'saved' ? 'Salvo' : 'Rascunho'}
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setTripToDelete(trip);
                    }}
                    className="p-2 rounded-full bg-slate-900/70 hover:bg-rose-600 text-white backdrop-blur-sm transition-all"
                    title="Excluir viagem"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[11px] font-medium text-slate-200 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-indigo-400" />
                    {trip.destination}, {trip.country}
                  </span>
                  <h3 className="text-base font-extrabold line-clamp-1">{trip.title}</h3>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    {trip.startDate} até {trip.endDate} ({trip.durationDays} dias)
                  </p>

                  <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <CloudSun className="w-3.5 h-3.5 text-amber-500" />
                    {trip.weatherSummary.mainCondition} (~{trip.weatherSummary.avgTemp}°C)
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400">
                    {trip.itinerary.length} dias detalhados
                  </span>
                  <Link
                    to={`/trips/${trip.id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
                  >
                    Abrir Roteiro
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {tripToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Excluir Viagem?</h3>
              <p className="text-xs text-slate-500">
                Tem certeza que deseja remover o roteiro "{tripToDelete.title}"? Esta ação é irreversível.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setTripToDelete(null)}
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
