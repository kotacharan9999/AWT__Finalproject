import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, ArrowRight } from 'lucide-react';
import SafeImage from './SafeImage';

const CartDrawer = ({ isOpen, onClose, cart, updateQuantity, removeFromCart, getCartCount }) => {
  const navigate = useNavigate();
  const totalAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);

  return (
    <>
      {/* Overlay Backdrop */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1040,
          opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease', backdropFilter: 'blur(3px)'
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, width: '100%', maxWidth: '450px', height: '100vh',
        backgroundColor: 'var(--bg-secondary)', zIndex: 1050,
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.1)',
        display: 'flex', flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="text-h2" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            Shopping Cart <span style={{ fontSize: '14px', background: 'var(--primary-color)', color: '#fff', padding: '2px 8px', borderRadius: 'var(--radius-pill)' }}>{getCartCount()}</span>
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {cart.length === 0 ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', textAlign: 'center' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.5 }}>🛍️</div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>Your cart is empty</h3>
              <p style={{ marginBottom: '24px' }}>Looks like you haven't added anything yet.</p>
              <button className="btn-gradient" onClick={() => { onClose(); navigate('/products'); }}>Start Shopping</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '20px' }}>
                  <div style={{ width: '80px', height: '80px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', padding: '8px' }}>
                    <SafeImage src={item.image} alt={item.name} productId={item.id} className="img-contain" style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <h4 style={{ fontWeight: '600', fontSize: '15px', color: 'var(--text-primary)', paddingRight: '12px' }}>{item.name}</h4>
                      <button onClick={() => removeFromCart(item.id)} style={{ color: 'var(--text-tertiary)', background: 'none', padding: 0 }}><Trash2 size={16} /></button>
                    </div>
                    <div style={{ fontWeight: '700', color: 'var(--primary-color)', marginBottom: 'auto' }}>₹{item.price.toFixed(2)}</div>
                    
                    {/* Quantity Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-primary)', borderRadius: 'var(--radius-pill)', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                         <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ padding: '4px 12px', background: 'transparent', fontSize: '16px', fontWeight: '600' }}>-</button>
                         <span style={{ fontSize: '14px', fontWeight: '600', padding: '0 8px' }}>{item.quantity}</span>
                         <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ padding: '4px 12px', background: 'transparent', fontSize: '16px', fontWeight: '600' }}>+</button>
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div style={{ padding: '24px', borderTop: '1px solid var(--border-light)', backgroundColor: 'var(--bg-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
              <span>Subtotal:</span>
              <span>₹{totalAmount}</span>
            </div>
            <button 
              className="btn-gradient" 
              style={{ width: '100%', padding: '16px', fontSize: '16px' }}
              onClick={() => { onClose(); navigate('/checkout'); }}
            >
              Proceed to Checkout <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
