import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

let toastId = 0;
const toastListeners: ((toast: Toast) => void)[] = [];

export const showToast = (type: ToastType, message: string, duration = 4000) => {
  const toast: Toast = {
    id: `toast-${toastId++}`,
    type,
    message,
    duration
  };
  toastListeners.forEach(listener => listener(toast));
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (toast: Toast) => {
      setToasts(prev => [...prev, toast]);
      
      if (toast.duration) {
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== toast.id));
        }, toast.duration);
      }
    };

    toastListeners.push(listener);
    return () => {
      const index = toastListeners.indexOf(listener);
      if (index > -1) toastListeners.splice(index, 1);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return <CheckCircle size={20} />;
      case 'error': return <XCircle size={20} />;
      case 'warning': return <AlertCircle size={20} />;
      case 'info': return <Info size={20} />;
    }
  };

  const getColors = (type: ToastType) => {
    switch (type) {
      case 'success': return { bg: '#10b981', border: '#059669', icon: '#d1fae5' };
      case 'error': return { bg: '#ef4444', border: '#dc2626', icon: '#fee2e2' };
      case 'warning': return { bg: '#f59e0b', border: '#d97706', icon: '#fef3c7' };
      case 'info': return { bg: '#3b82f6', border: '#2563eb', icon: '#dbeafe' };
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '1rem',
      right: '1rem',
      zIndex: 10001,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      maxWidth: '400px'
    }}>
      {toasts.map(toast => {
        const colors = getColors(toast.type);
        return (
          <div
            key={toast.id}
            style={{
              backgroundColor: colors.bg,
              color: 'white',
              padding: '1rem 1.25rem',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              border: `2px solid ${colors.border}`,
              animation: 'slideIn 0.3s ease-out',
              minWidth: '300px'
            }}
          >
            <div style={{ color: colors.icon }}>
              {getIcon(toast.type)}
            </div>
            <span style={{ flex: 1, fontSize: '0.95rem', fontWeight: '500' }}>
              {toast.message}
            </span>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: '0.25rem',
                opacity: 0.8,
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
            >
              <X size={18} />
            </button>
          </div>
        );
      })}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
