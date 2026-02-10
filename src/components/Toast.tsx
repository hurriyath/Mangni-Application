import { useEffect } from 'react';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const bgColor = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
  }[type];

  const textColor = {
    success: 'text-green-800',
    error: 'text-red-800',
    info: 'text-blue-800',
  }[type];

  const IconComponent = {
    success: CheckCircle,
    error: XCircle,
    info: AlertCircle,
  }[type];

  return (
    <div className={`fixed bottom-6 right-6 max-w-sm rounded-lg border ${bgColor} p-4 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300 z-50`}>
      <div className="flex items-start gap-3">
        <IconComponent className={`w-5 h-5 ${textColor} flex-shrink-0 mt-0.5`} />
        <p className={`text-sm font-medium ${textColor}`}>{message}</p>
      </div>
    </div>
  );
}
