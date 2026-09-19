import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDemoState } from '../context/DemoContext';
import { EmptyState, LoadingState, ErrorState } from '../components/common/FeedbackStates';
import {
  UserPreferences,
  TravelBudget,
  TravelPace,
  TransportMode,
  WeatherPreference,
} from '../data/mockStore';
import {
  VALID_STYLES,
  validatePreferences,
} from '../lib/firebase/firestore/userRepository';
import {
  User,
  Mail,
  MapPin,
  Sparkles,
  Check,
  Save,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  Gauge,
  Compass,
  Navigation,
  Sun,
  CloudSun,
  Snowflake,
  HelpCircle,
  Loader2,
  Footprints,
  Bus,
  Car,
  Bike,
} from 'lucide-react';

const TRANSPORT_OPTIONS: { id: TransportMode; label: string; icon: any }[] = [
  { id: 'caminhada', label: 'Caminhada a Pé', icon: Footprints },
  { id: 'transporte_publico', label: 'Metrô & Ônibus', icon: Bus },
  { id: 'carro_aplicativo', label: 'Carro / App / Táxi', icon: Car },
  { id: 'bicicleta', label: 'Bicicleta / Ciclovia', icon: Bike },
];

const WEATHER_OPTIONS: { id: WeatherPreference; label: string; icon: any; desc: string }[] = [
  { id: 'calor_sol', label: 'Calor & Sol', icon: Sun, desc: 'Dias ensolarados e praia' },
  { id: 'ameno_primavera', label: 'Ameno & Primavera', icon: CloudSun, desc: 'Clima fresco e agradável' },
  { id: 'frio_inverno', label: 'Frio de Inverno', icon: Snowflake, desc: 'Casacos, cafés e montanha' },
  { id: 'indiferente', label: 'Indiferente', icon: Compass, desc: 'Qualquer previsão climática' },
];

export const ProfilePage: React.FC = () => {
  const { user, updateUserPreferences, updateUserProfile } = useAuth();
  const { demoState } = useDemoState();

  // Dados cadastrais
  const [name, setName] = useState('');
  const [homeCity, setHomeCity] = useState('');

  // Preferências
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [budget, setBudget] = useState<TravelBudget>('moderado');
  const [pace, setPace] = useState<TravelPace>('moderado');
  const [transportation, setTransportation] = useState<TransportMode[]>(['caminhada', 'transporte_publico']);
  const [preferredWeather, setPreferredWeather] = useState<WeatherPreference>('ameno_primavera');
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(15);

  // Estados de feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Sincroniza dados com o usuário autenticado na sessão
  useEffect(() => {
    if (user) {
      setName(user.displayName || '');
      setHomeCity(user.homeCity || 'São Paulo, SP');
      if (user.preferences) {
        setSelectedStyles(user.preferences.styles || ['Gastronomia', 'Cultura']);
        setBudget(user.preferences.budget || 'moderado');
        setPace(user.preferences.pace || 'moderado');
        setTransportation(user.preferences.transportation || ['caminhada', 'transporte_publico']);
        setPreferredWeather(user.preferences.preferredWeather || 'ameno_primavera');
        setMaxDistanceKm(user.preferences.maxDistanceKm ?? 15);
      }
    }
  }, [user]);

  if (demoState === 'loading') {
    return <LoadingState message="Carregando perfil e preferências do viajante..." />;
  }

  if (demoState === 'error') {
    return (
      <ErrorState
        title="Falha ao carregar perfil"
        message="Não foi possível sincronizar suas preferências do usuário com a nuvem."
      />
    );
  }

  if (demoState === 'empty' || !user) {
    return (
      <EmptyState
        icon={User}
        title="Nenhum perfil ativo"
        description="Faça login para calibrar e visualizar suas preferências de viagem."
      />
    );
  }

  // Toggle de Seleção Múltipla de Estilos
  const toggleStyle = (style: string) => {
    setValidationError(null);
    if (selectedStyles.includes(style)) {
      if (selectedStyles.length <= 1) {
        setValidationError('Selecione ao menos um estilo de viagem favorito (CA-PREF-001).');
        return;
      }
      setSelectedStyles(selectedStyles.filter((s) => s !== style));
    } else {
      setSelectedStyles([...selectedStyles, style]);
    }
  };

  // Toggle de Seleção Múltipla de Transporte
  const toggleTransport = (mode: TransportMode) => {
    setValidationError(null);
    if (transportation.includes(mode)) {
      if (transportation.length <= 1) {
        setValidationError('Selecione ao menos um meio de transporte prioritário.');
        return;
      }
      setTransportation(transportation.filter((m) => m !== mode));
    } else {
      setTransportation([...transportation, mode]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const newPreferences: UserPreferences = {
      styles: selectedStyles,
      budget,
      pace,
      transportation,
      preferredWeather,
      maxDistanceKm,
    };

    try {
      validatePreferences(newPreferences);
      setIsSubmitting(true);

      // Salva preferências e dados cadastrais de forma atômica
      await updateUserPreferences(newPreferences);
      await updateUserProfile({
        displayName: name.trim(),
        homeCity: homeCity.trim(),
      });

      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3500);
    } catch (err: any) {
      setValidationError(err.message || 'Erro ao salvar preferências.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOnlyWalking = transportation.length === 1 && transportation[0] === 'caminhada';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white text-xs font-bold rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4" />
          Perfil e preferências salvos com sucesso!
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Perfil & Preferências de Viagem
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Personalize as instruções e estilos que a inteligência do Gemini usará para sugerir seus roteiros.
        </p>
      </div>

      {validationError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200/50 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{validationError}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Card 1: Identificação Básica */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <User className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Dados Cadastrais</h2>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <img
                src={
                  user.photoURL ||
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face'
                }
                alt={user.displayName}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-indigo-500/10"
              />
              <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold shadow-md uppercase">
                {user.role}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 w-full">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  E-mail (Identidade da Sessão)
                </label>
                <div className="flex items-center px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-100/70 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 select-none">
                  <Mail className="w-4 h-4 mr-2 text-slate-400" />
                  {user.email}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Cidade Base / Origem
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={homeCity}
                    onChange={(e) => setHomeCity(e.target.value)}
                    placeholder="Ex: São Paulo, SP"
                    className="w-full pl-10 pr-4 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Calibração da IA (Preferências de Viagem) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Preferências para o Gemini 2.5
            </h2>
          </div>

          {/* 1. Estilos e Interesses (Múltipla Seleção) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Seus Estilos Favoritos (Múltipla seleção - selecione pelo menos um) *
              </label>
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                {selectedStyles.length} selecionado{selectedStyles.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {VALID_STYLES.map((style) => {
                const isSelected = selectedStyles.includes(style);
                return (
                  <button
                    key={style}
                    type="button"
                    onClick={() => toggleStyle(style)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    {style}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Orçamento & Ritmo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-indigo-500" />
                Ritmo Padrão do Itinerário
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['tranquilo', 'moderado', 'intenso'] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPace(item)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold capitalize transition-all border cursor-pointer ${
                      pace === item
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 text-indigo-700 dark:text-indigo-300 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                Faixa de Orçamento Típica
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['economico', 'moderado', 'luxo'] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setBudget(item)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold capitalize transition-all border cursor-pointer ${
                      budget === item
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-600 text-emerald-700 dark:text-emerald-300 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Meios de Transporte Prioritários (Múltipla Seleção) */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-sky-500" />
                Modais de Deslocamento Preferidos (Múltipla seleção) *
              </label>
              <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400">
                {transportation.length} selecionado{transportation.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {TRANSPORT_OPTIONS.map((opt) => {
                const isSelected = transportation.includes(opt.id);
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleTransport(opt.id)}
                    className={`p-3 rounded-2xl text-xs font-bold transition-all border flex flex-col items-center gap-2 text-center cursor-pointer ${
                      isSelected
                        ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-600 text-sky-700 dark:text-sky-300 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-sky-600' : 'text-slate-400'}`} />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Clima Preferido */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-500" />
              Clima Preferido para Viajar
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {WEATHER_OPTIONS.map((w) => {
                const isSelected = preferredWeather === w.id;
                const Icon = w.icon;
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setPreferredWeather(w.id)}
                    className={`p-3 rounded-2xl text-xs font-semibold transition-all border flex flex-col items-start gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-500 text-amber-900 dark:text-amber-200 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      <Icon className="w-4 h-4 text-amber-500" />
                      <span>{w.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 text-left">{w.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Raio Máximo Diário (Slider) */}
          <div className="pt-2 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-indigo-500" />
                Raio Máximo de Deslocamento Diário
              </label>
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60">
                {maxDistanceKm} km por dia
              </span>
            </div>

            <input
              type="range"
              min={2}
              max={300}
              step={1}
              value={maxDistanceKm}
              onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>2 km (A pé / Bairro)</span>
              <span>15 km (Padrão Urbano)</span>
              <span>300 km (Bate-volta Regional)</span>
            </div>

            {isOnlyWalking && maxDistanceKm > 20 && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                Atenção: distâncias superiores a 20 km a pé podem tornar o itinerário desgastante.
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 hover:scale-[1.01] active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando Preferências...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar Alterações
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
