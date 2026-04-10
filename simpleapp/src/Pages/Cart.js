import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Cart = ({ cart, removeFromCart, updateQuantity, clearCart, showToast, toggleWishlist, placeOrder, user }) => {
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((count, item) => count + item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="container" style={{ margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <div className="modern-card" style={{ maxWidth: '600px', margin: '0 auto', padding: '60px 40px' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>🛒</div>
          <h2 className="text-h2" style={{ marginBottom: '16px' }}>Your cart is empty!</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', marginBottom: '32px' }}>Looks like you haven't added anything yet.</p>
          <Link to="/products" className="btn-gradient">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  const handleCheckout = () => {
    if (!user) {
       showToast('Please login to proceed to checkout.', 'info');
       navigate('/auth');
       return;
    }
    
    navigate('/checkout');
  };

  const handleSaveForLater = (item) => {
    toggleWishlist(item);
    removeFromCart(item.id);
  };

  return (
    <div className="container modern-split-layout" style={{ margin: '40px auto', padding: '0 24px' }}>
      
      {/* Left Items Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="modern-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="text-h2">Review Bag ({totalItems} items)</h2>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Deliver to: <b style={{ color: 'var(--primary-color)' }}>{user ? user.name : "Guest"}</b></div>
        </div>

        <div className="modern-card" style={{ padding: 0, overflow: 'hidden' }}>
          {cart.map((item, index) => (
            <div key={item.id} style={{ 
              display: 'flex', padding: '32px', 
              borderBottom: index < cart.length - 1 ? '1px solid var(--border-light)' : 'none',
              gap: '32px' 
            }}>
              
              <div style={{ width: '140px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                 <div style={{ height: '140px', width: '100%', display: 'flex', justifyContent: 'center', backgroundColor: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
                    <img src={item.image} alt={item.name} className="img-contain" style={{ mixBlendMode: 'multiply' }} />
                 </div>
                 
                 <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border-light)', overflow: 'hidden' }}>
                   <button 
                     onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                     disabled={item.quantity <= 1}
                     style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', opacity: item.quantity <= 1 ? 0.5 : 1, background: 'transparent', color: 'var(--text-primary)' }}
                    > – </button>
                   <div style={{ width: '36px', textAlign: 'center', fontSize: '15px', fontWeight: '500' }}>{item.quantity}</div>
                   <button 
                     onClick={() => updateQuantity(item.id, item.quantity + 1)}
                     style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', background: 'transparent', color: 'var(--text-primary)' }}
                    > + </button>
                 </div>
              </div>
              
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                 <Link to={`/product/${item.id}`} className="text-h2" style={{ fontSize: '18px', display: 'block', marginBottom: '8px', lineHeight: '1.4', color: 'var(--text-primary)' }}>{item.name}</Link>
                 <div style={{ fontSize: '14px', color: 'var(--success)', fontWeight: '500', marginBottom: '16px' }}>In Stock</div>
                 
                 <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '24px' }}>
                    <span style={{ fontSize: '24px', fontWeight: '600', color: 'var(--text-primary)' }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                    <span style={{ color: 'var(--text-tertiary)', textDecoration: 'line-through', fontSize: '16px' }}>₹{((item.price * item.quantity) * 1.2).toFixed(2)}</span>
                 </div>
                 
                 <div style={{ display: 'flex', gap: '16px', marginTop: 'auto' }}>
                    <button className="btn-outline" style={{ padding: '8px 20px', fontSize: '13px' }} onClick={() => handleSaveForLater(item)}>Move to Wishlist</button>
                    <button style={{ background: 'transparent', padding: '8px 20px', fontSize: '13px', color: 'var(--error)', fontWeight: '600' }} onClick={() => removeFromCart(item.id)}>Remove</button>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Price Summary Sticky Column */}
      <div style={{ position: 'sticky', top: '100px' }}>
        <div className="modern-card" style={{ padding: '24px' }}>
          <h2 className="text-h2" style={{ paddingBottom: '20px', marginBottom: '24px', borderBottom: '1px solid var(--border-light)' }}>
            Order Summary
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Items Total ({totalItems})</span>
              <span style={{ color: 'var(--text-primary)' }}>₹{(total * 1.2).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Bag Discount</span>
              <span style={{ color: 'var(--primary-color)' }}>− ₹{(total * 0.2).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Delivery</span>
              <span style={{ color: 'var(--success)' }}>Free</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '24px', borderTop: '1px solid var(--border-light)', marginBottom: '32px' }}>
            <span style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>Total Amount</span>
            <span style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary-color)' }}>₹{total.toFixed(2)}</span>
          </div>
          
          <button className="btn-gradient" style={{ width: '100%', fontSize: '16px', padding: '16px' }} onClick={handleCheckout}>
            Proceed to Checkout
          </button>
        </div>
      </div>

    </div>
  );
};

export default Cart;
