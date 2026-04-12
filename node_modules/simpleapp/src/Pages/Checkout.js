import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, MapPin, Package, Bookmark, ShieldCheck, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import SafeImage from '../Components/SafeImage';

// Input with validation feedback
const FormField = ({ label, required, error, children }) => (
  <div>
    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: error ? '#dc2626' : 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '7px' }}>
      {label}{required && <span style={{ color: '#dc2626', marginLeft: '2px' }}>*</span>}
    </label>
    {children}
    {error && <p style={{ color: '#dc2626', fontSize: '11px', fontWeight: '700', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={11} /> {error}</p>}
  </div>
);

function Checkout({ cart, placeOrder, clearCart, showToast, user, addresses, setAddresses }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=address, 2=review
  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'India',
    deliveryMethod: 'standard',
  });
  const [errors, setErrors] = useState({});
  const [saveAddress, setSaveAddress] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Scroll to top on mount
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const deliveryCost = formData.deliveryMethod === 'express' ? 150 : 0;
  const orderTotal = cartTotal + deliveryCost;
  const totalItems = cart.reduce((a, b) => a + b.quantity, 0);

  const validate = () => {
    const e = {};
    if (!formData.firstName.trim()) e.firstName = 'First name is required';
    if (!formData.lastName.trim()) e.lastName = 'Last name is required';
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Valid email is required';
    if (!formData.phone.trim() || !/^\d{10}$/.test(formData.phone.replace(/\s/g, ''))) e.phone = 'Enter a valid 10-digit phone number';
    if (!formData.address.trim()) e.address = 'Street address is required';
    if (!formData.city.trim()) e.city = 'City is required';
    if (!formData.postalCode.trim() || !/^\d{6}$/.test(formData.postalCode.replace(/\s/g, ''))) e.postalCode = 'Enter a valid 6-digit PIN code';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const fillAddress = (addr) => {
    setFormData(prev => ({
      ...prev,
      firstName: addr.name?.split(' ')[0] || prev.firstName,
      lastName: addr.name?.split(' ').slice(1).join(' ') || prev.lastName,
      phone: addr.phone || '',
      address: addr.street || '',
      city: addr.city || '',
      postalCode: addr.postalCode || ''
    }));
    showToast('Shipping details auto-filled!', 'success');
  };

  const handleProceedToReview = (e) => {
    e.preventDefault();
    if (validate()) setStep(2);
    else showToast('Please fix the highlighted errors', 'error');
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      showToast('Your cart is empty', 'error');
      navigate('/products');
      return;
    }
    if (!user?.token) {
      showToast('Please login to place an order', 'error');
      navigate('/auth');
      return;
    }

    // Save address if checked
    if (saveAddress) {
      const newAddr = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        street: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        phone: formData.phone
      };
      // Update local state for immediate UI feedback
      setAddresses(prev => [...(Array.isArray(prev) ? prev : []), { ...newAddr, id: Date.now() }]);
      // Persist to backend database
      fetch(`/api/users/${user.email}/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify(newAddr)
      }).catch(err => console.error('Failed to persist address:', err));
    }

    setIsProcessing(true);
    try {
      // Step 1: Place order in DB (primary action)
      const orderPlaced = await placeOrder(cart, orderTotal);
      if (!orderPlaced) {
        showToast('Order placement failed. Please try again.', 'error');
        setIsProcessing(false);
        return;
      }

      // Step 2: Try Stripe checkout (optional — falls back gracefully)
      try {
        const res = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`
          },
          body: JSON.stringify({
            orderItems: cart,
            userEmail: user.email,
            totalAmount: orderTotal
          })
        });
        if (res.ok) {
          const session = await res.json();
          if (session?.url && !session.url.includes('mock')) {
            // Real Stripe — redirect there
            clearCart();
            window.location.href = session.url;
            return;
          }
        }
      } catch (stripeErr) {
        console.log('Stripe not configured, proceeding with mock payment.');
      }

      // Step 3: Mock payment flow — stay in app, use navigate()
      clearCart();
      setIsProcessing(false);
      setOrderSuccess(true);

    } catch (err) {
      console.error('Checkout error:', err);
      showToast('Something went wrong. Please try again.', 'error');
      setIsProcessing(false);
    }
  };

  // ── ORDER SUCCESS STATE ──────────────────────────────────────────────────
  if (orderSuccess) {
    return (
      <div className="container" style={{ padding: '60px 32px 80px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ maxWidth: '560px', width: '100%', textAlign: 'center' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
            <CheckCircle size={52} color="#16a34a" />
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: '900', color: 'var(--text-1)', marginBottom: '16px' }}>Order Placed! 🎉</h1>
          <p style={{ fontSize: '16px', color: 'var(--text-2)', lineHeight: 1.7, marginBottom: '36px' }}>
            Thank you for shopping with <strong>ShopPlus</strong>! Your order has been confirmed and is being processed. You'll receive an update soon.
          </p>

          {/* Mini Tracking Steps */}
          <div style={{ background: 'var(--bg-subtle)', borderRadius: '16px', padding: '28px', marginBottom: '36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {['Order Placed ✅', 'Packed 📦', 'Shipped 🚚', 'Delivered 🏠'].map((s, i) => (
              <React.Fragment key={i}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: i === 0 ? '#16a34a' : 'var(--border)', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {i === 0 && <CheckCircle size={16} color="#fff" />}
                  </div>
                  <div style={{ fontSize: '10px', fontWeight: '800', color: i === 0 ? 'var(--success)' : 'var(--text-3)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{s.split(' ')[0]}</div>
                </div>
                {i < 3 && <div style={{ flex: 1, height: '3px', background: 'var(--border)', margin: '0 8px', marginBottom: '18px' }} />}
              </React.Fragment>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-outline" style={{ padding: '14px 28px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => navigate('/orders')}>
              <Package size={16} /> View My Orders
            </button>
            <button className="btn-primary" style={{ padding: '14px 28px' }} onClick={() => navigate('/products')}>
              Continue Shopping →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── EMPTY CART ────────────────────────────────────────────────────────────
  if (cart.length === 0) {
    return (
      <div className="container free-padding" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '72px', marginBottom: '24px' }}>🛒</div>
        <h2 className="text-h1">Your cart is empty</h2>
        <p style={{ color: 'var(--text-2)', marginTop: '8px', fontSize: '16px' }}>Add some items to start shopping.</p>
        <button className="btn-primary" onClick={() => navigate('/products')} style={{ marginTop: '32px' }}>
          Browse Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 32px 80px' }}>
      {/* Progress Steps */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '48px', maxWidth: '400px' }}>
        {['Shipping Details', 'Review & Pay'].map((label, i) => (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: step > i + 1 ? 'var(--success)' : step === i + 1 ? 'var(--primary)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '900', color: step >= i + 1 ? '#fff' : 'var(--text-3)', flexShrink: 0, transition: 'all 0.3s' }}>
                {step > i + 1 ? <CheckCircle size={14} /> : i + 1}
              </div>
              <span style={{ fontSize: '13px', fontWeight: step === i + 1 ? '800' : '500', color: step === i + 1 ? 'var(--primary)' : 'var(--text-3)', whiteSpace: 'nowrap' }}>{label}</span>
            </div>
            {i < 1 && <div style={{ flex: 1, height: '2px', background: step > 1 ? 'var(--success)' : 'var(--border)', margin: '0 12px', transition: 'background 0.4s' }} />}
          </React.Fragment>
        ))}
      </div>

      <div className="modern-split-layout free-gap" style={{ alignItems: 'flex-start' }}>

        {/* ─── LEFT COLUMN ─── */}
        <div style={{ flex: 1 }}>

          {/* STEP 1: Shipping Details */}
          {step === 1 && (
            <form onSubmit={handleProceedToReview} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} noValidate>
              <div className="modern-card free-padding">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', margin: '0 0 28px', fontSize: '18px', fontWeight: '800' }}>
                  <MapPin size={20} /> Shipping Details
                </h3>

                {/* Saved Addresses */}
                {addresses?.length > 0 && (
                  <div style={{ marginBottom: '32px' }}>
                    <p style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Use a Saved Address</p>
                    <div style={{ display: 'flex', gap: '14px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
                      {addresses.map(addr => (
                        <div key={addr.id} onClick={() => fillAddress(addr)}
                          style={{ flexShrink: 0, width: '230px', padding: '16px', border: '1.5px solid var(--border)', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', background: 'var(--bg-subtle)', position: 'relative' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
                          <Bookmark size={14} color="var(--primary)" style={{ position: 'absolute', top: '14px', right: '14px' }} />
                          <div style={{ fontWeight: '800', fontSize: '13px', marginBottom: '5px' }}>{addr.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-2)', lineHeight: 1.6 }}>{addr.street}, {addr.city}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <FormField label="First Name" required error={errors.firstName}>
                      <input className="modern-input" type="text" name="firstName" value={formData.firstName} onChange={handleInputChange}
                        style={errors.firstName ? { borderColor: '#dc2626' } : {}} />
                    </FormField>
                    <FormField label="Last Name" required error={errors.lastName}>
                      <input className="modern-input" type="text" name="lastName" value={formData.lastName} onChange={handleInputChange}
                        style={errors.lastName ? { borderColor: '#dc2626' } : {}} />
                    </FormField>
                  </div>

                  <FormField label="Email Address" required error={errors.email}>
                    <input className="modern-input" type="email" name="email" value={formData.email} onChange={handleInputChange}
                      style={errors.email ? { borderColor: '#dc2626' } : {}} />
                  </FormField>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ width: '100px', flexShrink: 0 }}>
                      <FormField label="Code">
                        <select name="countryCode" value={formData.countryCode || '+91'} onChange={handleInputChange} className="modern-input">
                          <option value="+91">+91 (IN)</option>
                          <option value="+1">+1 (US)</option>
                          <option value="+44">+44 (UK)</option>
                        </select>
                      </FormField>
                    </div>
                    <div style={{ flex: 1 }}>
                      <FormField label="Phone Number" required error={errors.phone}>
                        <input className="modern-input" type="tel" name="phone" placeholder="9876543210" value={formData.phone} onChange={handleInputChange}
                          style={errors.phone ? { borderColor: '#dc2626' } : {}} maxLength={10} />
                      </FormField>
                    </div>
                  </div>

                  <FormField label="Street Address" required error={errors.address}>
                    <input className="modern-input" type="text" name="address" placeholder="House No., Area, Landmark" value={formData.address} onChange={handleInputChange}
                      style={errors.address ? { borderColor: '#dc2626' } : {}} />
                  </FormField>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <FormField label="City" required error={errors.city}>
                      <input className="modern-input" type="text" name="city" value={formData.city} onChange={handleInputChange}
                        style={errors.city ? { borderColor: '#dc2626' } : {}} />
                    </FormField>
                    <FormField label="PIN Code" required error={errors.postalCode}>
                      <input className="modern-input" type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange}
                        maxLength={6} style={errors.postalCode ? { borderColor: '#dc2626' } : {}} />
                    </FormField>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', background: 'var(--bg-subtle)', borderRadius: '10px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={saveAddress} onChange={e => setSaveAddress(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-1)' }}>Save this address for future orders</span>
                  </label>
                </div>
              </div>

              {/* Delivery Method */}
              <div className="modern-card free-padding">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', color: 'var(--primary)', fontSize: '18px', fontWeight: '800' }}>
                  <Truck size={20} /> Delivery Options
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { id: 'standard', label: 'Standard Delivery', sub: '3–5 Business Days', price: 'FREE', accent: 'var(--success)' },
                    { id: 'express', label: 'Express Delivery', sub: 'Tomorrow by 8 PM', price: '₹150', accent: 'var(--text-1)' },
                  ].map(opt => (
                    <div key={opt.id} onClick={() => setFormData(f => ({ ...f, deliveryMethod: opt.id }))}
                      style={{ border: formData.deliveryMethod === opt.id ? '2.5px solid var(--primary)' : '1.5px solid var(--border)', padding: '20px 24px', borderRadius: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: formData.deliveryMethod === opt.id ? 'var(--bg-subtle)' : 'transparent', transition: 'all 0.2s' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {formData.deliveryMethod === opt.id && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)' }} />}
                        </div>
                        <div>
                          <div style={{ fontWeight: '800', fontSize: '14px' }}>{opt.label}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-2)', marginTop: '2px' }}>{opt.sub}</div>
                        </div>
                      </div>
                      <strong style={{ fontSize: '14px', color: opt.accent }}>{opt.price}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ padding: '18px', fontSize: '16px', width: '100%', justifyContent: 'center', borderRadius: '12px' }}>
                Continue to Review →
              </button>
            </form>
          )}

          {/* STEP 2: Review & Pay */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Delivery Summary */}
              <div className="modern-card free-padding">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '16px', color: 'var(--primary)', margin: 0 }}>
                    <MapPin size={18} /> Shipping To
                  </h3>
                  <button onClick={() => setStep(1)} style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '800', background: 'none', border: 'none', cursor: 'pointer' }}>✏️ Edit</button>
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-1)', lineHeight: 1.8, fontWeight: '600' }}>
                  <div>{formData.firstName} {formData.lastName}</div>
                  <div style={{ color: 'var(--text-2)' }}>{formData.address}, {formData.city} – {formData.postalCode}</div>
                  <div style={{ color: 'var(--text-2)' }}>{formData.phone} • {formData.email}</div>
                  <div style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--bg-subtle)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '800' }}>
                    <Truck size={12} /> {formData.deliveryMethod === 'express' ? 'Express Delivery (Tomorrow)' : 'Standard Delivery (3–5 days)'}
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              <div className="modern-card free-padding" style={{ border: '2px solid var(--primary)', background: 'var(--bg-subtle)' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '16px', color: 'var(--primary)', margin: '0 0 16px' }}>
                  <ShieldCheck size={18} /> Payment
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                  {['💳 Card', '🏦 UPI', '🏧 Net Banking', '💸 COD'].map(p => (
                    <div key={p} style={{ padding: '6px 14px', background: 'var(--bg-card)', borderRadius: '8px', fontSize: '12px', fontWeight: '700', border: '1px solid var(--border)' }}>{p}</div>
                  ))}
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>
                  Your payment is secured by bank-grade encryption. Click "Place Order" to confirm your purchase.
                </p>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="btn-primary"
                style={{ padding: '20px', fontSize: '18px', width: '100%', justifyContent: 'center', borderRadius: '12px', letterSpacing: '0.02em' }}>
                {isProcessing
                  ? <><Loader size={18} style={{ animation: 'spin 1s linear infinite', marginRight: '8px' }} /> Processing Your Order...</>
                  : `🛒 PLACE ORDER • ₹${orderTotal.toLocaleString('en-IN')}`
                }
              </button>

              <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-3)', fontWeight: '600', margin: '-8px 0 0' }}>
                🔒 Secured by 256-bit SSL encryption
              </p>
            </div>
          )}
        </div>

        {/* ─── RIGHT: ORDER SUMMARY ─── */}
        <aside style={{ width: '400px', flexShrink: 0 }}>
          <div className="modern-card free-padding" style={{ position: 'sticky', top: '100px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 24px', fontSize: '16px', fontWeight: '800', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
              <Package size={20} color="var(--primary)" /> Order Summary ({totalItems} items)
            </h3>

            <div style={{ maxHeight: '320px', overflowY: 'auto', paddingRight: '4px', marginBottom: '20px' }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: '16px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: '68px', height: '68px', background: '#fff', borderRadius: '10px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', flexShrink: 0 }}>
                    <SafeImage src={item.image} alt={item.name} productId={item.id} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: '700', fontSize: '13px', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{item.name}</p>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-3)', fontSize: '12px' }}>Qty: {item.quantity}</p>
                    <p style={{ margin: '4px 0 0', fontWeight: '800', fontSize: '13px' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-2)' }}>
                <span>Subtotal ({totalItems} items)</span>
                <span style={{ fontWeight: '700', color: 'var(--text-1)' }}>₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-2)' }}>
                <span>Shipping</span>
                <span style={{ fontWeight: '700', color: deliveryCost === 0 ? 'var(--success)' : 'var(--text-1)' }}>{deliveryCost === 0 ? 'FREE' : `₹${deliveryCost}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--success)' }}>
                <span style={{ fontWeight: '600' }}>You save</span>
                <span style={{ fontWeight: '800' }}>₹{Math.round(cartTotal * 0.15).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '900', fontSize: '22px', borderTop: '2px dashed var(--border)', paddingTop: '16px', marginTop: '4px' }}>
                <span>Total</span>
                <span style={{ color: 'var(--primary)' }}>₹{orderTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div style={{ marginTop: '24px', padding: '14px', background: 'var(--bg-subtle)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <ShieldCheck size={16} color="var(--success)" />
              <span style={{ fontSize: '12px', color: 'var(--text-3)', fontWeight: '700' }}>100% SECURE CHECKOUT</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Checkout;
