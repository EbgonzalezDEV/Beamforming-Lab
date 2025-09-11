import { type PropsWithChildren } from 'react';
import { X } from 'lucide-react';

interface ModalProps extends PropsWithChildren {
  open: boolean;
  onClose: () => void;
  title?: string;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm" 
        onClick={onClose} 
      />
      <div className="relative z-10 w-full max-w-6xl max-h-[90vh] overflow-hidden glass-card-strong border border-white/20 rounded-3xl shadow-2xl animate-slide-up">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl hover:bg-white/10 transition-colors duration-200"
          >
            <X className="w-5 h-5 text-white/70 hover:text-white" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
}


