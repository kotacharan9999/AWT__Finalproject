import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Truck, MapPin, Package, ArrowRight } from 'lucide-react';

function OrderSuccess() {
  const navigate = useNavigate();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container" style={{ padding: '4rem 1rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="hover-card" style={{ maxWidth: '600px', width: '100%', padding: '3rem 2rem', textAlign: 'center', borderRadius: '16px' }}>
        
        {/* Success Icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{ backgroundColor: '#e6f2f2', padding: '1rem', borderRadius: '50%', color: 'var(--primary-color)' }}>
            <CheckCircle size={64} />
          </div>
        </div>

        <h1 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>Order Confirmed!</h1>
        <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '2.5rem' }}>
          Thank you for your purchase. Your order has been placed successfully and is being processed for delivery.
        </p>

        {/* Delivery Progress Bar Simulation */}
        <div style={{ backgroundColor: '#f9f9f9', padding: '2rem', borderRadius: '12px', marginBottom: '2.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Truck size={20} /> Delivery Status
          </h3>
          
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 1rem' }}>
             {/* Progress line */}
             <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '4px', backgroundColor: '#e0e0e0', zIndex: 0 }}></div>
             <div style={{ position: 'absolute', top: '50%', left: 0, width: '25%', height: '4px', backgroundColor: 'var(--primary-color)', zIndex: 1 }}></div>

             {/* Steps */}
             <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f9f9f9', padding: '0 10px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--primary-color)' }}></div>
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Ordered</span>
             </div>
             <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f9f9f9', padding: '0 10px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '4px solid var(--primary-color)', backgroundColor: '#fff' }}></div>
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Processing</span>
             </div>
             <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f9f9f9', padding: '0 10px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#e0e0e0' }}></div>
                <span style={{ fontSize: '0.8rem', color: '#999' }}>Shipped</span>
             </div>
             <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f9f9f9', padding: '0 10px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#e0e0e0' }}></div>
                <span style={{ fontSize: '0.8rem', color: '#999' }}>Delivered</span>
             </div>
          </div>
          
          <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#555', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <MapPin size={16} /> Estimated Delivery: <strong>Next 3-5 Days</strong>
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
           <button 
             className="btn-outline" 
             onClick={() => navigate('/account')}
             style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
           >
             <Package size={18} /> View Orders
           </button>
           <button 
             className="btn-gradient" 
             onClick={() => navigate('/products')}
             style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
           >
             Continue Shopping <ArrowRight size={18} />
           </button>
        </div>

      </div>
    </div>
  );
}

export default OrderSuccess;
