import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'تأكيد',
    cancelText: 'إلغاء',
    onConfirm: null,
    onCancel: null,
    isDanger: false,
  });

  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const showConfirm = useCallback(({
    title = 'تأكيد العملية',
    message = 'هل أنت متأكد من تنفيذ هذا الإجراء؟',
    confirmText = 'تأكيد',
    cancelText = 'إلغاء',
    isDanger = false,
  }) => {
    return new Promise((resolve) => {
      setConfirmDialog({
        isOpen: true,
        title,
        message,
        confirmText,
        cancelText,
        isDanger,
        onConfirm: () => {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          resolve(false);
        },
      });
    });
  }, []);

  return (
    <NotificationContext.Provider value={{ showToast, showConfirm }}>
      {children}

      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';

          const bgColor = isSuccess
            ? '#059669'
            : isError
            ? '#dc2626'
            : isWarning
            ? '#d97706'
            : '#2563eb';

          return (
            <div
              key={toast.id}
              style={{
                pointerEvents: 'auto',
                background: bgColor,
                color: '#ffffff',
                padding: '12px 20px',
                borderRadius: '10px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                minWidth: '280px',
                maxWidth: '420px',
                fontSize: '0.95rem',
                fontWeight: '500',
              }}
            >
              <i
                className={`fa-solid ${
                  isSuccess
                    ? 'fa-circle-check'
                    : isError
                    ? 'fa-circle-exclamation'
                    : isWarning
                    ? 'fa-triangle-exclamation'
                    : 'fa-circle-info'
                }`}
                style={{ fontSize: '1.2rem' }}
              ></i>
              <div style={{ flex: 1 }}>{toast.message}</div>
            </div>
          );
        })}
      </div>

      {confirmDialog.isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              color: '#1f2937',
              borderRadius: '16px',
              maxWidth: '440px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 30px rgba(0,0,0,0.25)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: confirmDialog.isDanger ? '#fee2e2' : '#e0f2fe',
                color: confirmDialog.isDanger ? '#ef4444' : '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '1.5rem',
              }}
            >
              <i
                className={`fa-solid ${
                  confirmDialog.isDanger
                    ? 'fa-trash-can'
                    : 'fa-circle-question'
                }`}
              ></i>
            </div>
            <h3
              style={{
                fontSize: '1.2rem',
                fontWeight: '700',
                marginBottom: '8px',
                color: '#111827',
              }}
            >
              {confirmDialog.title}
            </h3>
            <p
              style={{
                fontSize: '0.95rem',
                color: '#6b7280',
                marginBottom: '24px',
                lineHeight: '1.5',
              }}
            >
              {confirmDialog.message}
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '12px',
              }}
            >
              <button
                type="button"
                onClick={confirmDialog.onCancel}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  background: '#f9fafb',
                  color: '#374151',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                }}
              >
                {confirmDialog.cancelText}
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                style={{
                  padding: '10px 22px',
                  borderRadius: '8px',
                  border: 'none',
                  background: confirmDialog.isDanger ? '#ef4444' : '#2563eb',
                  color: '#ffffff',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  boxShadow: confirmDialog.isDanger
                    ? '0 4px 12px rgba(239, 68, 68, 0.3)'
                    : '0 4px 12px rgba(37, 99, 235, 0.3)',
                }}
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
