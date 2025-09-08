interface GlossaryModalProps {
  open: boolean;
  onClose: () => void;
}

export default function GlossaryModal({ open, onClose }: GlossaryModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Glosario de conceptos</h2>
          <button onClick={onClose} className="text-slate-300 hover:text-white">✕</button>
        </div>
        <div className="space-y-4 text-slate-200 text-sm leading-6">
          <div>
            <div className="font-semibold text-indigo-300">Beamforming</div>
            <div>Formación de haces usando arreglos de antenas para dirigir la energía hacia una dirección deseada, mejorando SNR y reduciendo interferencias.</div>
          </div>
          <div>
            <div className="font-semibold text-indigo-300">FSPL (Free-Space Path Loss)</div>
            <div>Pérdida de propagación en espacio libre. Crece con la distancia y frecuencia: L = 32.44 + 20 log10(d[km]) + 20 log10(f[MHz]).</div>
          </div>
          <div>
            <div className="font-semibold text-indigo-300">SNR</div>
            <div>Relación señal-ruido, mide la calidad de la señal recibida. Valores mayores indican mejor recepción.</div>
          </div>
          <div>
            <div className="font-semibold text-indigo-300">Espectro / FFT</div>
            <div>Representación de la magnitud de la señal en frecuencia para identificar componentes espectrales y ruido.</div>
          </div>
        </div>
      </div>
    </div>
  );
}


