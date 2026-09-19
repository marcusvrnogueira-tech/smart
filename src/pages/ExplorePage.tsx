import React, { useState, useEffect } from 'react';
import { useRouter } from '../router/RouterContext';
import {
  mockStore,
  MOCK_DESTINATIONS,
  DestinationSuggestion,
  Trip,
  DayPlan,
} from '../data/mockStore';
import { useDemoState } from '../context/DemoContext';
import { EmptyState, LoadingState, ErrorState } from '../components/common/FeedbackStates';
import {
  Sparkles,
  MapPin,
  Calendar,
  CloudSun,
  Search,
  CheckCircle2,
  Gauge,
  DollarSign,
  ArrowRight,
  Loader2,
  Umbrella,
} from 'lucide-react';
import { DestinationSearchInput } from '../components/DestinationSearchInput';
import { NormalizedDestination } from '../lib/geocoding';
import { WeatherSummaryCard } from '../components/WeatherSummaryCard';
import { DestinationWeatherData, weatherService } from '../lib/weather';

export const ExplorePage: React.FC = () => {
  const { navigate, match } = useRouter();
  const { demoState } = useDemoState();
  const user = mockStore.getUser();

  // Query params
  const initialStart = match.searchParams.get('startDate') || '2026-10-10';
  const initialEnd = match.searchParams.get('endDate') || '2026-10-13';

  const [destination, setDestination] = useState('Montevidéu');
  const [normalizedDest, setNormalizedDest] = useState<NormalizedDestination | null>(null);
  const [selectedDestObj, setSelectedDestObj] = useState<DestinationSuggestion | undefined>(
    MOCK_DESTINATIONS[0]
  );

  const handleSelectNormalizedDest = (dest: NormalizedDestination) => {
    setDestination(dest.city);
    setNormalizedDest(dest);
    setSelectedDestObj({
      id: dest.id,
      name: dest.city,
      country: dest.country,
      tagline: `Destino confirmado via busca geográfica (${dest.countryCode}).`,
      coverImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&fit=crop',
      coordinates: { lat: dest.coordinates.latitude, lng: dest.coordinates.longitude },
      sampleWeather: { temp: 22, condition: 'Agradável', rainProb: 15 },
    });
  };
  const [startDate, setStartDate] = useState(initialStart);
  const [endDate, setEndDate] = useState(initialEnd);
  const [selectedStyles, setSelectedStyles] = useState<string[]>(user.preferences.styles);
  const [pace, setPace] = useState<'tranquilo' | 'moderado' | 'intenso'>(user.preferences.pace);
  const [budget, setBudget] = useState<'economico' | 'moderado' | 'luxo'>(user.preferences.budget);

  // Clima normalizado
  const [weatherData, setWeatherData] = useState<DestinationWeatherData | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);

  useEffect(() => {
    const lat = normalizedDest?.coordinates.latitude ?? selectedDestObj?.coordinates.lat ?? -34.9011;
    const lng = normalizedDest?.coordinates.longitude ?? selectedDestObj?.coordinates.lng ?? -56.1645;

    if (!startDate || !endDate || endDate < startDate) return;

    setIsWeatherLoading(true);
    weatherService
      .getForecast({
        latitude: lat,
        longitude: lng,
        startDate,
        endDate,
      })
      .then((data) => {
        setWeatherData(data);
      })
      .catch(() => {
        // Fallback gracioso já embutido no weatherService
      })
      .finally(() => {
        setIsWeatherLoading(false);
      });
  }, [normalizedDest, selectedDestObj, startDate, endDate]);

  // Stepper state
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    'Consultando previsão do tempo e precipitação...',
    'Identificando atrações e pontos de interesse (POIs)...',
    'Google Gemini alinhando turnos com o clima...',
    'Roteiro gerado com sucesso!',
  ];

  if (demoState === 'loading') {
    return <LoadingState message="Buscando informações climáticas e destinos recomendados..." />;
  }

  if (demoState === 'error') {
    return (
      <ErrorState
        title="Erro no serviço de exploração"
        message="Não foi possível consultar os serviços de clima ou geolocalização. Tente novamente."
      />
    );
  }

  if (demoState === 'empty') {
    return (
      <EmptyState
        title="Nenhum destino selecionado"
        description="Escolha uma cidade ou use uma das sugestões para ver o clima e gerar seu roteiro."
      />
    );
  }

  const handleSelectCity = (dest: DestinationSuggestion) => {
    setDestination(dest.name);
    setSelectedDestObj(dest);
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setCurrentStep(0);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < 2) return prev + 1;
        clearInterval(stepInterval);

        // Criar roteiro mock na memória e navegar
        setTimeout(() => {
          const newTripId = `trip_${Date.now()}`;
          const generatedTrip: Trip = {
            id: newTripId,
            userId: user.id || 'usr_larissa_001',
            title: `Roteiro ${destination} & IA`,
            destination,
            country: selectedDestObj?.country || 'Destino Internacional',
            coverImage:
              selectedDestObj?.coverImage ||
              'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&fit=crop',
            startDate,
            endDate,
            durationDays: 4,
            status: 'draft',
            preferencesSnapshot: {
              styles: selectedStyles,
              pace,
              budget,
              transportation: user.preferences?.transportation || ['caminhada', 'transporte_publico'],
              preferredWeather: user.preferences?.preferredWeather || 'ameno_primavera',
              maxDistanceKm: user.preferences?.maxDistanceKm || 15,
            },
            weatherSummary: {
              avgTemp: weatherData?.summary.avgTemp ?? selectedDestObj?.sampleWeather.temp ?? 21,
              hasRainRisk: weatherData?.summary.hasRainRisk ?? ((selectedDestObj?.sampleWeather.rainProb || 0) > 40),
              mainCondition: weatherData?.summary.mainCondition ?? selectedDestObj?.sampleWeather.condition ?? 'Agradável',
            },
            itinerary: [
              {
                dayIndex: 1,
                date: startDate,
                weather: {
                  tempMin: 15,
                  tempMax: 22,
                  rainProbability: selectedDestObj?.sampleWeather.rainProb || 20,
                  condition: 'Parcialmente Nublado',
                },
                activities: [
                  {
                    id: `act_${Date.now()}_1`,
                    period: 'morning',
                    time: '09:30',
                    title: `Passeio Histórico Central por ${destination}`,
                    description: 'Reconhecimento a pé das principais praças e marcos históricos com apoio da IA.',
                    category: 'cultural',
                    estimatedCost: 'gratis',
                    weatherTip: 'Clima ameno; perfeito para caminhar sem sol forte.',
                  },
                  {
                    id: `act_${Date.now()}_2`,
                    period: 'afternoon',
                    time: '13:00',
                    title: 'Almoço em Restaurante Tradicional Típico',
                    description: 'Sugestão de culinária típica recomendada pela curadoria do assistente.',
                    category: 'gastronomia',
                    estimatedCost: '$$',
                    weatherTip: 'Pausa gastronômica coberta.',
                  },
                  {
                    id: `act_${Date.now()}_3`,
                    period: 'evening',
                    time: '19:00',
                    title: 'Entardecer em Mirante Panorâmico',
                    description: 'Vista privilegiada da cidade iluminada ao anoitecer.',
                    category: 'lazer',
                    estimatedCost: 'gratis',
                    weatherTip: 'Temperatura caindo gradualmente; leve um casaco.',
                  },
                ],
              },
            ],
          };

          mockStore.createTrip(generatedTrip);
          setIsGenerating(false);
          navigate(`/trips/${newTripId}`);
        }, 800);

        return 3;
      });
    }, 700);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 px-3 py-1 rounded-full mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Gerador Contextual
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Criar Roteiro Inteligente com IA
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Informe seu destino e datas. O SmartTrip integrará o clima previsto com as melhores atrações.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col: Form (7 cols) */}
        <form onSubmit={handleGenerate} className="lg:col-span-7 space-y-6">
          <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            {/* Destino */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Cidade de Destino
              </label>
              <DestinationSearchInput
                initialValue={destination}
                onSelect={handleSelectNormalizedDest}
                placeholder="Para onde você quer viajar? (ex: Santiago, Gramado, Paris)"
              />

              {/* Quick suggestions chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-2.5">
                <span className="text-[11px] text-slate-400">Sugestões:</span>
                {MOCK_DESTINATIONS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => handleSelectCity(d)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                      destination === d.name
                        ? 'bg-indigo-600 text-white border-indigo-600 font-semibold shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {d.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  Data de Chegada
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  Data de Retorno
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Resumo Meteorológico Dinâmico */}
            <WeatherSummaryCard weather={weatherData} isLoading={isWeatherLoading} />

            {/* Preferences tweak */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Preferências Desta Viagem
                </span>
                <span className="text-[10px] text-slate-400">Importadas do seu perfil</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                    <Gauge className="w-3 h-3 text-indigo-500" />
                    Ritmo
                  </label>
                  <select
                    value={pace}
                    onChange={(e) => setPace(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    <option value="tranquilo">Tranquilo</option>
                    <option value="moderado">Moderado</option>
                    <option value="intenso">Intenso</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-emerald-500" />
                    Orçamento
                  </label>
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    <option value="economico">Econômico</option>
                    <option value="moderado">Moderado</option>
                    <option value="luxo">Conforto / Luxo</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isGenerating || !destination}
              className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 hover:scale-[1.01] active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              Gerar Roteiro com Gemini & Clima
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Right Col: Weather & Context Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <CloudSun className="w-4 h-4 text-amber-500" />
                Previsão Meteorológica Simulada
              </h3>
              <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded font-mono font-bold">
                Open-Meteo
              </span>
            </div>

            {selectedDestObj ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">
                      {selectedDestObj.name}
                    </h4>
                    <p className="text-xs text-slate-500">{selectedDestObj.country}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                      {selectedDestObj.sampleWeather.temp}°C
                    </span>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {selectedDestObj.sampleWeather.condition}
                    </p>
                  </div>
                </div>

                {/* Rain Risk banner */}
                {selectedDestObj.sampleWeather.rainProb > 40 ? (
                  <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-200 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <Umbrella className="w-4 h-4 text-amber-600" />
                      Atenção: {selectedDestObj.sampleWeather.rainProb}% de chance de chuva
                    </div>
                    <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80">
                      A IA priorizará museus, galerias e centros gastronômicos cobertos durante os períodos chuvosos.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Tempo propício para caminhadas ao ar livre e passeios panorâmicos!
                  </div>
                )}

                <p className="text-xs text-slate-500 italic">"{selectedDestObj.tagline}"</p>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">
                Selecione uma cidade para carregar o resumo meteorológico.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generation Stepper Modal */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-md shadow-indigo-500/10">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Construindo Seu Itinerário
              </h3>
              <p className="text-xs text-slate-500">
                Orquestrando clima e inteligência do Gemini para {destination}
              </p>
            </div>

            <div className="space-y-3 text-left">
              {steps.map((stepText, idx) => {
                const isDone = idx < currentStep;
                const isCurrent = idx === currentStep;

                return (
                  <div
                    key={stepText}
                    className={`flex items-center gap-3 text-xs transition-all ${
                      isDone
                        ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                        : isCurrent
                        ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                        : 'text-slate-400 dark:text-slate-600'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 shrink-0" />
                    )}
                    <span>{stepText}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
