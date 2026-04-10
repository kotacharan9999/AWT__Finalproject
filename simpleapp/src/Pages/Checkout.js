import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, CreditCard, MapPin, CheckCircle, Package, Bookmark } from 'lucide-react';

function Checkout({ cart, placeOrder, clearCart, showToast, user, addresses, setAddresses }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    deliveryMethod: 'standard', // standard | express
  });

  const [saveAddress, setSaveAddress] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const deliveryCost = formData.deliveryMethod === 'express' ? 15.00 : 0.00;
  const orderTotal = cartTotal + deliveryCost;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleDeliveryChange = (method) => {
    setFormData({ ...formData, deliveryMethod: method });
  };

  const fillAddress = (addr) => {
    const first = addr.name?.split(' ')[0] || formData.firstName;
    const last = addr.name?.split(' ').slice(1).join(' ') || formData.lastName;
    
    setFormData(prev => ({
      ...prev,
      firstName: first,
      lastName: last,
      phone: addr.phone || '',
      address: addr.street || '',
      city: addr.city || '',
      postalCode: addr.postalCode || ''
    }));
    showToast('Shipping details auto-filled!', 'success');
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      showToast('Your cart is empty', 'error');
      navigate('/products');
      return;
    }

    if (saveAddress) {
      const newAddr = {
        id: Date.now(),
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        street: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        phone: formData.phone
      };
      setAddresses([...(addresses || []), newAddr]);
    }

    setIsProcessing(true);
    
    try {
        // Build Stripe Session
        const res = await fetch('http://localhost:5000/api/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                orderItems: cart,
                userEmail: user?.email || formData.email,
                totalAmount: orderTotal
            })
        });
        
        const session = await res.json();
        
        // Save the order to DB
        placeOrder(cart, orderTotal);
        clearCart();
        
        // Redirect to Stripe or mock route immediately
        window.location.href = session.url;
        
    } catch(err) {
        console.error(err);
        showToast('Failed to initialize payment', 'error');
        setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2 className="text-h2">Your Cart is Empty</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Add some items before checking out.</p>
        <button className="btn-gradient" onClick={() => navigate('/products')} style={{ marginTop: '24px' }}>
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <h1 className="text-h1" style={{ marginBottom: '2rem' }}>Secure Checkout</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
        {/* Left Form Column */}
        <form onSubmit={handleCheckoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Section 1: Contact & Shipping */}
          <div className="modern-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-color)', margin: 0 }}>
                <MapPin size={20} /> Shipping Details
              </h3>
            </div>

            {/* Address Auto-Fill Cards */}
            {addresses && addresses.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <div className="text-overline" style={{ marginBottom: '12px' }}>Saved Addresses</div>
                <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px' }}>
                  {addresses.map(addr => (
                    <div 
                      key={addr.id} 
                      onClick={() => fillAddress(addr)}
                      style={{ 
                        flexShrink: 0, width: '240px', padding: '16px',
                        border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)',
                        cursor: 'pointer', transition: 'all 0.2s', backgroundColor: 'var(--bg-secondary)',
                        position: 'relative'
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--primary-color)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <Bookmark size={16} color="var(--primary-color)" style={{ position: 'absolute', top: '16px', right: '16px' }} />
                      <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>{addr.name}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {addr.street}, {addr.city}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="text-overline" style={{ display: 'block', marginBottom: '8px' }}>First Name</label>
                <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="modern-input" />
              </div>
              <div>
                <label className="text-overline" style={{ display: 'block', marginBottom: '8px' }}>Last Name</label>
                <input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="modern-input" />
              </div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <label className="text-overline" style={{ display: 'block', marginBottom: '8px' }}>Email Address</label>
              <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="modern-input" />
            </div>
            <div style={{ marginTop: '16px' }}>
              <label className="text-overline" style={{ display: 'block', marginBottom: '8px' }}>Phone Number</label>
              <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="modern-input" />
            </div>
            <div style={{ marginTop: '16px' }}>
              <label className="text-overline" style={{ display: 'block', marginBottom: '8px' }}>Street Address</label>
              <input required type="text" name="address" value={formData.address} onChange={handleInputChange} className="modern-input" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
              <div>
                <label className="text-overline" style={{ display: 'block', marginBottom: '8px' }}>City</label>
                <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="modern-input" />
              </div>
              <div>
                <label className="text-overline" style={{ display: 'block', marginBottom: '8px' }}>Postal Code</label>
                <input required type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange} className="modern-input" />
              </div>
            </div>

            <label className="modern-checkbox-label" style={{ marginTop: '24px' }}>
              <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} />
              <span>Save this address for future orders</span>
            </label>
          </div>

          {/* Section 2: Delivery Method */}
          <div className="modern-card" style={{ padding: '24px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: 'var(--primary-color)' }}>
              <Truck size={20} /> Delivery Options
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div 
                onClick={() => handleDeliveryChange('standard')}
                style={{ border: formData.deliveryMethod === 'standard' ? '2px solid var(--primary-color)' : '1px solid var(--border-light)', padding: '16px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: formData.deliveryMethod === 'standard' ? 'rgba(0,128,128,0.05)' : 'transparent', transition: 'all 0.2s' }}
              >
                <div>
                  <h4 style={{ margin: 0, fontWeight: '600' }}>Standard Delivery</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>3-5 Business Days</p>
                </div>
                <strong style={{ color: formData.deliveryMethod === 'standard' ? 'var(--primary-color)' : 'var(--text-primary)' }}>Free</strong>
              </div>
              <div 
                onClick={() => handleDeliveryChange('express')}
                style={{ border: formData.deliveryMethod === 'express' ? '2px solid var(--primary-color)' : '1px solid var(--border-light)', padding: '16px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: formData.deliveryMethod === 'express' ? 'rgba(0,128,128,0.05)' : 'transparent', transition: 'all 0.2s' }}
              >
                <div>
                  <h4 style={{ margin: 0, fontWeight: '600' }}>Express Delivery</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>1-2 Business Days</p>
                </div>
                <strong style={{ color: formData.deliveryMethod === 'express' ? 'var(--primary-color)' : 'var(--text-primary)' }}>₹15.00</strong>
              </div>
            </div>
          </div>

          {/* Payment Section Replaced with Stripe */}
          <div className="modern-card" style={{ padding: '24px', backgroundColor: 'rgba(0,128,128,0.02)', border: '1px solid var(--primary-color)' }}>
             <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--primary-color)' }}>
              <CreditCard size={20} /> Secure Stripe Checkout
             </h3>
             <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>You will be redirected to Stripe to securely complete your payment.</p>
          </div>

          <button type="submit" className="btn-gradient" disabled={isProcessing} style={{ padding: '16px', fontSize: '18px', marginTop: '8px', width: '100%', opacity: isProcessing ? 0.7 : 1 }}>
            {isProcessing ? 'Connecting to Stripe...' : `Pay ₹${orderTotal.toFixed(2)} & Place Order`}
          </button>
        </form>

        {/* Right Summary Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="modern-card" style={{ padding: '24px', position: 'sticky', top: '100px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px', margin: 0 }}>
              <Package size={20} /> Order Summary
            </h3>
            
            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '24px' }}>
              {cart.map((item) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'contain', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: '600', fontSize: '14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.name}</p>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '13px' }}>Qty: {item.quantity}</p>
                  </div>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '14px' }}>
                <span>Subtotal ({cart.reduce((a, b) => a + b.quantity, 0)} items)</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>₹{cartTotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '14px' }}>
                <span>Delivery ({formData.deliveryMethod})</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{deliveryCost === 0 ? 'Free' : `$₹{deliveryCost.toFixed(2)}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '20px', marginTop: '16px', borderTop: '1px dashed var(--border-light)', paddingTop: '16px' }}>
                <span>Order Total</span>
                <span style={{ color: 'var(--primary-color)' }}>₹{orderTotal.toFixed(2)}</span>
              </div>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '24px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <CheckCircle size={14} color="var(--primary-color)" /> Secured with 256-bit encryption
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Checkout;
