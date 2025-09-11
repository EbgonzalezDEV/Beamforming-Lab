import { BookOpen, Radio, Zap, Activity, BarChart3, X } from 'lucide-react';

interface GlossaryModalProps {
  open: boolean;
  onClose: () => void;
}

const glossaryTerms = [
  {
    term: 'Beamforming',
    icon: Radio,
    color: 'from-primary-500 to-primary-600',
    description: 'Formación de haces usando arreglos de antenas para dirigir la energía hacia una dirección deseada, mejorando SNR y reduciendo interferencias.',
    details: 'Técnica que permite controlar la dirección de radiación de un arreglo de antenas mediante el ajuste de las fases y amplitudes de los elementos.'
  },
  {
    term: 'FSPL (Free-Space Path Loss)',
    icon: Activity,
    color: 'from-secondary-500 to-secondary-600',
    description: 'Pérdida de propagación en espacio libre. Crece con la distancia y frecuencia: L = 32.44 + 20 log10(d[km]) + 20 log10(f[MHz]).',
    details: 'Modelo teórico que predice la atenuación de una señal electromagnética en el espacio libre, sin obstáculos ni reflexiones.'
  },
  {
    term: 'SNR (Signal-to-Noise Ratio)',
    icon: Zap,
    color: 'from-accent-500 to-accent-600',
    description: 'Relación señal-ruido, mide la calidad de la señal recibida. Valores mayores indican mejor recepción.',
    details: 'Cociente entre la potencia de la señal deseada y la potencia del ruido. Se expresa en decibeles (dB).'
  },
  {
    term: 'Espectro / FFT',
    icon: BarChart3,
    color: 'from-warning-500 to-warning-600',
    description: 'Representación de la magnitud de la señal en frecuencia para identificar componentes espectrales y ruido.',
    details: 'La Transformada Rápida de Fourier convierte una señal del dominio temporal al dominio frecuencial, revelando su contenido espectral.'
  }
];

export default function GlossaryModal({ open, onClose }: GlossaryModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-hidden glass-card-strong border border-white/20 rounded-3xl shadow-2xl animate-slide-up">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="icon-wrapper gradient-primary">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Glosario Técnico</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl hover:bg-white/10 transition-colors duration-200"
          >
            <X className="w-5 h-5 text-white/70 hover:text-white" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {glossaryTerms.map((item, index) => (
              <div key={index} className="glass-card p-6 group hover:bg-white/5 transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className={`icon-wrapper bg-gradient-to-r ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">{item.term}</h3>
                    <p className="text-white/70 text-sm leading-relaxed mb-3">{item.description}</p>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-white/60 text-xs leading-relaxed">{item.details}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-6 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-start space-x-3">
              <div className="icon-wrapper bg-white/10">
                <BookOpen className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Acerca del Glosario</h4>
                <p className="text-white/70 text-sm leading-relaxed">
                  Este glosario contiene los términos técnicos más importantes relacionados con comunicaciones inalámbricas, 
                  procesamiento de señales y análisis espectral. Los conceptos están organizados para facilitar la comprensión 
                  de los resultados de la simulación.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


