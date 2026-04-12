import React from 'react';

const Toast = ({ message, type, onClose }) => {
  if (!message) return null;

  return (
    <div className={`modern-toast ${type}`} style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      padding: '16px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      zIndex: 1000,
      animation: 'slideUp 0.3s ease-out'
    }}>
      <span style={{ fontSize: '15px' }}>{message}</span>
      <button 
        onClick={onClose}
        style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1.2rem', padding: '0 4px', opacity: 0.7 }}
      >
        &times;
      </button>
      
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Toast;
