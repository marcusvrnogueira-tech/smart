import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Check,
  Copy,
  ExternalLink,
  Code2,
  Sparkles,
  Link2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Eye,
  Layers
} from 'lucide-react';
import { IMAGE_PRESETS } from '../data/mockData';
import { Trip, ImagePreset } from '../types';

interface DirectImageHubProps {
  activeTrip: Trip;
  onUpdateTripCover: (tripId: string, directUrl: string) => void;
}

export const DirectImageHub: React.FC<DirectImageHubProps> = ({
  activeTrip,
  onUpdateTripCover,
}) => {
  const [testUrl, setTestUrl] = useState(
    'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80'
  );
  const [altText, setAltText] = useState('Vista deslumbrante da Costa Amalfitana');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [appliedNotification, setAppliedNotification] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  const htmlCodeSnippet = `<img \n  src="${testUrl}" \n  alt="${altText}" \n  referrerPolicy="no-referrer" \n  class="w-full h-auto rounded-2xl object-cover" \n/>`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(htmlCodeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyUrl = (urlToCopy: string) => {
    navigator.clipboard.writeText(urlToCopy);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleApplyToTrip = (url: string, title?: string) => {
    onUpdateTripCover(activeTrip.id, url);
    setAppliedNotification(title ? `"${title}" aplicada como capa da viagem!` : 'Imagem aplicada com sucesso!');
    setTimeout(() => setAppliedNotification(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex items-center gap-2.5 text-xs font-bold text-blue-600 uppercase tracking-wider">
          <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center">
            <Link2 className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <span>Suporte Nativo a Links Diretos de Imagens</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Sim! É 100% possível e recomendado usar links diretos no HTML.
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
          No HTML e em aplicações web modernas (React, Vite, Tailwind), você pode utilizar qualquer URL direta no atributo <code className="bg-slate-100 text-blue-600 px-1.5 py-0.5 rounded font-mono text-xs">src="..."</code> da tag <code className="bg-slate-100 text-blue-600 px-1.5 py-0.5 rounded font-mono text-xs">&lt;img&gt;</code>. 
          Isso carrega as imagens instantaneamente a partir de CDNs (como Unsplash, Imgur, Cloudinary ou servidores próprios), com alta performance e sem necessidade de upload pesado local.
        </p>

        {appliedNotification && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{appliedNotification}</span>
          </div>
        )}
      </div>

      {/* Interactive Tester & HTML Code Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Tester Input & Code Generator */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-blue-600" />
              <span>Gerador de Código & Testador de Link Direto</span>
            </h3>
            <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              HTML5 Nativo
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                URL direta da imagem (Cole qualquer link HTTP/HTTPS):
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={testUrl}
                  onChange={(e) => {
                    setTestUrl(e.target.value);
                    setImageLoadError(false);
                  }}
                  placeholder="https://exemplo.com/minha-imagem.jpg"
                  className="flex-1 text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Texto alternativo (alt text para acessibilidade):
              </label>
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Descrição da imagem"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Generated HTML Code Block */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">Código HTML gerado:</span>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-bold transition-colors cursor-pointer"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Tag HTML</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="bg-slate-900 text-slate-100 p-3 rounded-xl text-xs font-mono overflow-x-auto selection:bg-blue-600">
                {htmlCodeSnippet}
              </pre>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={() => handleApplyToTrip(testUrl)}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Layers className="w-4 h-4" />
                <span>Aplicar como Capa de "{activeTrip.title}"</span>
              </button>

              <button
                onClick={() => handleCopyUrl(testUrl)}
                className="py-2.5 px-3 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center gap-1 transition-all cursor-pointer"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copiar Link</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Visual Render Preview */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <span>Pré-visualização em Tempo Real</span>
              </h3>
              <span className="text-xs text-slate-400">Renderização Direta</span>
            </div>

            {/* Rendered Container */}
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner flex items-center justify-center">
              {testUrl ? (
                <img
                  src={testUrl}
                  alt={altText}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-all"
                  onError={() => setImageLoadError(true)}
                  onLoad={() => setImageLoadError(false)}
                />
              ) : (
                <div className="text-center p-4 text-slate-400">
                  <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                  <span className="text-xs">Insira um link para visualizar</span>
                </div>
              )}

              {imageLoadError && (
                <div className="absolute inset-0 bg-red-50/95 flex flex-col items-center justify-center p-4 text-center">
                  <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                  <span className="text-xs font-bold text-red-800">
                    Não foi possível carregar a imagem deste link
                  </span>
                  <span className="text-[11px] text-red-600 mt-1 max-w-xs">
                    Verifique se o link termina com extensão de imagem (.jpg, .png, .webp) ou permite acesso direto sem bloqueio de CORS.
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 text-xs text-slate-600 space-y-1">
            <span className="font-bold text-slate-800 block">Dica de Ouro para Imagens HTML:</span>
            <p>
              Ao usar fotos do <strong>Unsplash</strong>, certifique-se de adicionar parâmetros como <code className="font-mono text-blue-600">?auto=format&fit=crop&w=1200&q=80</code> no final da URL para obter imagens perfeitamente comprimidas e nítidas!
            </p>
          </div>
        </div>
      </div>

      {/* Preset Curated Direct Image Links Library */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Galeria de Links Diretos Prontos em Alta Resolução</span>
            </h3>
            <p className="text-xs text-slate-500">
              Clique em qualquer imagem para testar, copiar o link direto ou aplicar na viagem atual.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {IMAGE_PRESETS.map((preset) => (
            <div
              key={preset.id}
              className="group relative rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-all bg-slate-50 flex flex-col justify-between"
            >
              <div className="aspect-[4/3] w-full relative overflow-hidden bg-slate-200">
                <img
                  src={preset.url}
                  alt={preset.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  {preset.category}
                </span>
              </div>

              <div className="p-3 space-y-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {preset.title}
                  </h4>
                  <span className="text-[10px] text-slate-500 block truncate">
                    {preset.location} • Foto por {preset.photographer}
                  </span>
                </div>

                <div className="flex gap-1.5 pt-1">
                  <button
                    onClick={() => {
                      setTestUrl(preset.url);
                      setAltText(preset.title);
                    }}
                    className="flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-2xs text-center cursor-pointer"
                  >
                    Testar no Gerador
                  </button>

                  <button
                    onClick={() => handleApplyToTrip(preset.url, preset.title)}
                    className="py-1.5 px-2 rounded-lg text-[10px] font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer"
                    title="Aplicar na capa da viagem ativa"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
