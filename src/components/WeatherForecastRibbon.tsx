import React from 'react';
import { Sun, CloudSun, Sunset, Moon, CloudMoon, CloudRain, Snowflake, Wind, Umbrella } from 'lucide-react';
import { WeatherForecastHour } from '../types';

interface WeatherForecastRibbonProps {
  forecast: WeatherForecastHour[];
  destination: string;
}

export const WeatherForecastRibbon: React.FC<WeatherForecastRibbonProps> = ({
  forecast,
  destination,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sun':
        return <Sun className="w-5 h-5 text-amber-500" />;
      case 'CloudSun':
        return <CloudSun className="w-5 h-5 text-sky-500" />;
      case 'Sunset':
        return <Sunset className="w-5 h-5 text-orange-500" />;
      case 'Moon':
        return <Moon className="w-5 h-5 text-indigo-400" />;
      case 'CloudMoon':
        return <CloudMoon className="w-5 h-5 text-indigo-300" />;
      case 'CloudRain':
        return <CloudRain className="w-5 h-5 text-blue-500" />;
      case 'Snowflake':
        return <Snowflake className="w-5 h-5 text-sky-400" />;
      default:
        return <Sun className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
            <Wind className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Previsão Horária em Tempo Real
            </h4>
            <p className="text-sm font-extrabold text-slate-800">{destination}</p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Radar Ativo
        </span>
      </div>

      {/* Horizontal Snap-scrolling Strip */}
      <div className="flex gap-2.5 overflow-x-auto pb-1 pt-1 no-scrollbar scroll-smooth">
        {forecast.map((item, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-24 bg-slate-50/80 hover:bg-sky-50/60 transition-all rounded-xl p-2.5 border border-slate-200/70 flex flex-col items-center justify-center text-center space-y-1.5 group cursor-default"
          >
            <span className="text-[11px] font-bold text-slate-500 tracking-tight">
              {item.hour}
            </span>
            <div className="p-1 group-hover:scale-110 transition-transform">
              {getIcon(item.icon)}
            </div>
            <span className="text-sm font-extrabold text-slate-800">
              {item.temp}
            </span>
            <div className="flex items-center gap-0.5 text-[10px] font-semibold text-sky-600">
              <Umbrella className="w-2.5 h-2.5" />
              <span>{item.rainChance}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
