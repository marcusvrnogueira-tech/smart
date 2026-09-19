import React, { useState } from 'react';
import { X, Image as ImageIcon, Check, Link2, Sparkles } from 'lucide-react';
import { IMAGE_PRESETS } from '../data/mockData';

interface EditImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUrl: string;
  title: string;
  onSave: (newUrl: string) => void;
}

export const EditImageModal: React.FC<EditImageModalProps> = ({
  isOpen,
  onClose,
  currentUrl,
  title,
  onSave,
}) => {
  const [url, setUrl] = useState(currentUrl);
  const [previewError, setPreviewError] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSave(url.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Editar Link Direto da Imagem
              </h3>
              <p className="text-xs text-slate-500 truncate max-w-[280px]">
                {title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Cole o link direto da imagem (URL HTTPS):
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                required
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setPreviewError(false);
                }}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Live Preview of Direct Image */}
          <div>
            <span className="text-xs font-semibold text-slate-600 block mb-1.5">
              Prévia do Link Direto:
            </span>
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative flex items-center justify-center">
              <img
                src={url}
                alt="Preview"
                referrerPolicy="no-referrer"
                onError={() => setPreviewError(true)}
                onLoad={() => setPreviewError(false)}
                className="w-full h-full object-cover"
              />
              {previewError && (
                <div className="absolute inset-0 bg-red-50/90 flex flex-col items-center justify-center p-3 text-center">
                  <span className="text-xs font-bold text-red-700">Link não pôde ser carregado</span>
                  <span className="text-[10px] text-red-500">Verifique a URL direta informada</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Sugestões Rápidas de Alta Resolução:
            </span>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {IMAGE_PRESETS.slice(0, 5).map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setUrl(preset.url)}
                  className="flex-shrink-0 w-20 rounded-lg overflow-hidden border border-slate-200 hover:border-blue-500 transition-all text-left group"
                >
                  <img
                    src={preset.url}
                    alt={preset.title}
                    className="w-full h-12 object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className="text-[9px] font-medium text-slate-700 block p-1 truncate">
                    {preset.title.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-500/20"
            >
              Atualizar Link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
