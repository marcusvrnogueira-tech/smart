import React from 'react';
import { useRouter, Link } from '../router/RouterContext';
import { useDemoState } from '../context/DemoContext';
import { EmptyState, LoadingState, ErrorState } from '../components/common/FeedbackStates';
import {
  Compass,
  Sparkles,
  CloudSun,
  Edit3,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MapPin,
  Umbrella,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { navigate } = useRouter();
  const { demoState } = useDemoState();

  if (demoState === 'loading') {
    return <LoadingState message="Carregando visão geral do SmartTrip..." />;
  }

  if (demoState === 'error') {
    return (
      <ErrorState
        title="Falha ao carregar a página inicial"
        message="Não foi possível sincronizar o conteúdo da landing page. Teste o estado normal."
      />
    );
  }

  if (demoState === 'empty') {
    return (
      <EmptyState
        title="Nenhum destaque ativo no momento"
        description="O catálogo de roteiros públicos e destaques da comunidade está temporariamente indisponível."
        actionText="Ir para o Dashboard"
        onAction={() => navigate('/dashboard')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/60 dark:border-indigo-800/60 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>IA Propõe, o Humano Dispõe</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                Seu assistente de viagens que{' '}
                <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 bg-clip-text text-transparent">
                  planeja com o clima real.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0">
                Transforme pequenos feriados ou férias em itinerários realistas em menos de 45 segundos.
                O SmartTrip une o raciocínio do <strong>Google Gemini</strong> à previsão meteorológica
                para que você nunca encare um parque sob tempestade ou perca o melhor da cidade.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/explore"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-98 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  Começar a Planejar Grátis
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all shadow-sm"
                >
                  Entrar na Minha Conta
                </Link>
              </div>

              {/* Trust badges */}
              <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Previsão Climática Integrada
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Edição Humana 100% Flexível
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                  Totalmente Gratuito
                </span>
              </div>
            </div>

            {/* Right Interactive Preview Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md rounded-3xl p-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                  </div>
                  <span className="text-[11px] font-mono uppercase bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md font-semibold">
                    Simulação IA ao Vivo
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">Montevidéu, Uruguai</h4>
                      <p className="text-xs text-slate-500">10 a 13 de Outubro • 4 dias</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 justify-end">
                        <Umbrella className="w-3.5 h-3.5 text-amber-500" />
                        Chuva no Dia 2
                      </span>
                      <span className="text-[10px] text-slate-400">IA adaptou para museus</span>
                    </div>
                  </div>

                  {/* Simulated Itinerary Turn Cards */}
                  <div className="space-y-2.5">
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 font-bold text-xs">
                        09h
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            Teatro Solís & Museu Torres García
                          </h5>
                          <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                            Indoor
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          Refúgio cultural protegido da chuva com visita guiada.
                        </p>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0 font-bold text-xs">
                        13h
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            Mercado del Puerto (Parrilla Coberta)
                          </h5>
                          <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded">
                            Gastronomia
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          Almoço aconchegante no clássico uruguaio.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 text-center">
                    <Link
                      to="/trips/trip_mvd_2026"
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                    >
                      Explorar roteiro completo da demonstração
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Core Pillars Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Diferenciais de Engenharia
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Por que planejar com o SmartTrip?
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Muito além de um chatbot comum: uma arquitetura de contexto rica que respeita seus planos e horários.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <CloudSun className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">1. Sensível ao Clima</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Consultamos previsões em tempo real para o seu período de folga. Se a previsão indicar chuva, a IA automaticamente sugere atrações em locais fechados.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Edit3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">2. Revisão Humana Total</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Você não fica refém da IA. Cada atividade gerada pode ser editada, reordenada ou excluída com um clique, além de permitir adicionar paradas manuais.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">3. Gestão de Folgas</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Cadastre suas pontes de feriado e janelas livres. O sistema avisa quanto tempo falta e sugere destinos ideais para aquela duração exata.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-10 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>© 2026 SmartTrip — Projeto Final de Inteligência Artificial Generativa. Desenvolvido com Next.js/React, Gemini & Firebase.</p>
      </footer>
    </div>
  );
};
