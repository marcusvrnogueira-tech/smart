// ==========================================================
// SMARTTRIP - COMPONENTE DE RESUMO METEOROLÓGICO (UI)
// Exibe condições reais, alerta de chuva e ausência explícita de previsão
// ==========================================================

import React from 'react';
import { DestinationWeatherData } from '../lib/weather';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  Snowflake,
  HelpCircle,
  AlertTriangle,
  Info,
  Loader2,
  Droplets,
  Thermometer,
} from 'lucide-react';

interface WeatherSummaryCardProps {
  weather: DestinationWeatherData | null;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

export const WeatherSummaryCard: React.FC<WeatherSummaryCardProps> = ({
  weather,
  isLoading = false,
  error = null,
  className = '',
}) => {
  if (isLoading) {
    return (
      <div className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse space-y-3 ${className}`}>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
          <span>Consultando previsão meteorológica do destino...</span>
        </div>
        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-3/4"></div>
      </div>
    );
  }

  if (!weather) {
    return null;
  }

  const { summary, daily } = weather;

  // Renderiza o ícone apropriado para a condição
  const getConditionIcon = (condition: string) => {
    switch (condition) {
      case 'Ensolarado':
        return <Sun className="w-4 h-4 text-amber-500" />;
      case 'Parcialmente Nublado':
        return <CloudSun className="w-4 h-4 text-sky-500" />;
      case 'Nublado':
        return <Cloud className="w-4 h-4 text-slate-400" />;
      case 'Chuvoso':
        return <CloudRain className="w-4 h-4 text-blue-500" />;
      case 'Tempestade':
        return <CloudLightning className="w-4 h-4 text-purple-500" />;
      case 'Neve':
        return <Snowflake className="w-4 h-4 text-teal-400" />;
      default:
        return <HelpCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className={`p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 ${className}`}>
      {/* Header com síntese */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Thermometer className="w-5 h-5 text-indigo-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Condições Meteorológicas do Período
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {summary.mainCondition}
            </p>
          </div>
        </div>

        {summary.avgTemp !== null && (
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-extrabold border border-indigo-200/50 self-start sm:self-center">
            <span>Média:</span>
            <span>{summary.avgTemp}°C</span>
          </div>
        )}
      </div>

      {/* Alerta de Chuva (RN-004) */}
      {summary.hasRainRisk && (
        <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
          <CloudRain className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Alerta de Precipitação Detectado:</span>
            <span>
              Previsão de chuva em {summary.rainyDaysCount} {summary.rainyDaysCount === 1 ? 'dia' : 'dias'}. O itinerário do Gemini priorizará atrações cobertas e opções gastronômicas nestes períodos.
            </span>
          </div>
        </div>
      )}

      {/* Alerta de Datas Fora do Horizonte de 16 Dias (Regra Anti-Alucinação) */}
      {summary.reliability === 'unavailable' && (
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Previsão Indisponível para esta Janela:</span>
            <span>
              Modelos meteorológicos determinísticos cobrem até 16 dias de antecedência. O SmartTrip não inventa dados climáticos; seu roteiro será gerado com alta versatilidade para qualquer tempo.
            </span>
          </div>
        </div>
      )}

      {summary.reliability === 'partial_forecast' && (
        <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/60 text-sky-900 dark:text-sky-200 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Previsão Parcial:</span>
            <span>
              Alguns dias estão dentro do horizonte determinístico e outros além. Apenas as datas válidas possuem previsão de temperatura e chuva.
            </span>
          </div>
        </div>
      )}

      {/* Grade diária de previsão */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5 pt-1">
        {daily.map((day) => {
          const formattedDate = day.date.split('-').slice(1).reverse().join('/'); // MM-DD para DD/MM
          return (
            <div
              key={day.date}
              className={`p-3 rounded-2xl border transition-all flex flex-col justify-between gap-1.5 ${
                day.hasForecast
                  ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                  : 'bg-slate-100/40 dark:bg-slate-800/20 border-dashed border-slate-200 dark:border-slate-800 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400">
                <span>{formattedDate}</span>
                {getConditionIcon(day.condition)}
              </div>

              {day.hasForecast ? (
                <>
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                    {day.tempMin}°C ~ {day.tempMax}°C
                  </div>

                  <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                    <Droplets className="w-3 h-3 text-sky-500" />
                    <span>{day.rainProbability}% chuva</span>
                  </div>
                </>
              ) : (
                <div className="text-[10px] font-semibold text-slate-400 py-1">
                  Sem Previsão
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
