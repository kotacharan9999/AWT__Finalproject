import React from 'react';
import { Link } from 'react-router-dom';

const Welcome = ({ user, setUser }) => {
  return (
    <div className="container page-header">
      <div style={{
        backgroundColor: '#e9ecef', 
        padding: '60px 20px', 
        borderRadius: '8px', 
        marginTop: '40px',
        maxWidth: '800px',
        margin: '40px auto'
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '20px', color: '#333' }}>
          Welcome back, {user?.name}!
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '30px' }}>
          We're glad to see you again. Check out our latest products or view your cart.
        </p>
        
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <Link to="/products" className="btn btn-primary">Continue Shopping</Link>
          <button 
            className="btn btn-danger"
            onClick={() => setUser(null)}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
