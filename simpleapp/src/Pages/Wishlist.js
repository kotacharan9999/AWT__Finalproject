import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';

const Wishlist = ({ wishlist, toggleWishlist, addToCart, user }) => {
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="container modern-card animate-entrance" style={{ margin: '40px auto', padding: '60px', textAlign: 'center', maxWidth: '600px' }}>
        <h2 className="text-h2" style={{ marginBottom: '16px' }}>Please login to view your Wishlist</h2>
        <button onClick={() => navigate('/auth')} className="btn-gradient" style={{ margin: '16px auto', display: 'inline-flex' }}>Login to Continue</button>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="container modern-card animate-entrance" style={{ margin: '40px auto', padding: '80px 24px', textAlign: 'center', maxWidth: '800px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤍</div>
        <h2 className="text-h2" style={{ marginBottom: '16px' }}>Empty Wishlist</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>You have no items in your wishlist. Start adding!</p>
        <Link to="/products" className="btn-gradient" style={{ display: 'inline-flex', padding: '12px 32px' }}>Discover Products</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ margin: '40px auto' }}>
      <div className="modern-card">
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center' }}>
          <h1 className="text-h2" style={{ margin: 0 }}>My Wishlist ({wishlist.length})</h1>
        </div>

        <div>
          {wishlist.map((item, index) => (
            <div key={item.id} className="hover-card" style={{ display: 'flex', borderBottom: index < wishlist.length - 1 ? '1px solid var(--border-light)' : 'none', padding: '24px', position: 'relative', margin: '16px', borderRadius: 'var(--radius-sm)' }}>
              
              <div style={{ width: '130px', height: '130px', display: 'flex', justifyContent: 'center', marginRight: '24px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', padding: '12px' }}>
                <Link to={`/product/${item.id}`}>
                  <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
                </Link>
              </div>
              
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                 <Link to={`/product/${item.id}`} className="text-h2" style={{ fontSize: '18px', display: 'block', marginBottom: '8px', color: 'var(--text-primary)' }}>
                   {item.name}
                 </Link>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '600', color: 'var(--warning)', marginBottom: '12px' }}>{item.rating} ★</div>
                 
                 <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginTop: 'auto' }}>
                    <span style={{ fontSize: '24px', fontWeight: '600', color: 'var(--text-primary)' }}>₹{item.price.toFixed(2)}</span>
                    <span style={{ color: 'var(--text-tertiary)', textDecoration: 'line-through', fontSize: '16px' }}>₹{(item.price * 1.2).toFixed(2)}</span>
                    <span style={{ color: 'var(--success)', fontSize: '15px', fontWeight: '600' }}>20% Off</span>
                 </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <button 
                  onClick={() => toggleWishlist(item)}
                  style={{ background: 'transparent', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '8px', transition: 'color 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.color = 'var(--error)'}
                  onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
                  title="Remove from Wishlist"
                >
                  <Trash2 size={24} />
                </button>
                <button 
                  className="btn-outline" 
                  style={{ padding: '8px 20px', fontSize: '14px' }}
                  onClick={() => addToCart(item)}
                >
                  Move to Cart
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
