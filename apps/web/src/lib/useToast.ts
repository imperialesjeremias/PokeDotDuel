import { toast } from 'react-hot-toast';

export const useToast = () => {
  const showSuccess = (message: string) => {
    toast.success(message, {
      duration: 4000,
      style: {
        background: '#1f2937',
        color: '#ffffff',
        border: '1px solid #10b981',
      },
      iconTheme: {
        primary: '#10b981',
        secondary: '#ffffff',
      },
    });
  };

  const showError = (message: string) => {
    toast.error(message, {
      duration: 5000,
      style: {
        background: '#1f2937',
        color: '#ffffff',
        border: '1px solid #ef4444',
      },
      iconTheme: {
        primary: '#ef4444',
        secondary: '#ffffff',
      },
    });
  };

  const showWarning = (message: string) => {
    toast(message, {
      duration: 4000,
      style: {
        background: '#1f2937',
        color: '#ffffff',
        border: '1px solid #f59e0b',
      },
      icon: '⚠️',
    });
  };

  const showInfo = (message: string) => {
    toast(message, {
      duration: 4000,
      style: {
        background: '#1f2937',
        color: '#ffffff',
        border: '1px solid #3b82f6',
      },
      icon: 'ℹ️',
    });
  };

  const showLoading = (message: string) => {
    return toast.loading(message, {
      style: {
        background: '#1f2937',
        color: '#ffffff',
        border: '1px solid #6b7280',
      },
    });
  };

  const dismiss = (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    dismiss,
  };
};
