import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Auth = ({ setUser, showToast }) => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const name = formData.get('name');

    try {


      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin ? { email, password } : { name, email, password };
      
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setUser({ ...data.user });
        showToast(data.message || (data.user.isAdmin ? 'Welcome to Owner Dashboard!' : 'Welcome to ShopEase!'), 'success');
        navigate(data.user.isAdmin ? '/admin' : '/');
      } else {
        showToast(data.message || 'Authentication failed', 'error');
      }
    } catch (err) {
      console.error('Auth error:', err);
      showToast('Server error. Please try again later.', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', backgroundColor: 'var(--bg-primary)' }}>
      {/* Left Splash Side - Animated Video & Logo */}
      <div className="auth-splash-left">
        <video autoPlay loop muted playsInline className="auth-splash-video-bg">
          <source src="https://cdn.pixabay.com/video/2020/02/20/32626-393278546_tiny.mp4" type="video/mp4" />
        </video>
        <div className="auth-splash-content">
          <h1 className="auth-splash-logo">Shop<span>Ease</span></h1>
          <p style={{ fontSize: '1.1rem', fontWeight: '500', opacity: 0.9, letterSpacing: '4px', textTransform: 'uppercase' }}>Discover The Extraordinary</p>
        </div>
      </div>

      {/* Right Login Side */}
      <div className="auth-glass-panel">
        <div className="modern-card auth-card" style={{ width: '100%', maxWidth: '440px', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', padding: '40px', border: '1px solid rgba(0,0,0,0.05)' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', letterSpacing: '-1px' }}>
              {isLogin ? 'Welcome Back' : 'Create an Account'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
              {isLogin ? 'Enter your details to access your account.' : 'Sign up to get started with ShopEase.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {!isLogin && (
              <div>
                <label className="text-overline" style={{ display: 'block', marginBottom: '8px' }}>Full Name</label>
                <input type="text" name="name" className="modern-input" placeholder="John Doe" required />
              </div>
            )}
            
            <div>
              <label className="text-overline" style={{ display: 'block', marginBottom: '8px' }}>Email Address</label>
              <input type="email" name="email" className="modern-input" placeholder="you@example.com" required />
            </div>

            <div>
               <label className="text-overline" style={{ display: 'block', marginBottom: '8px' }}>Password</label>
               <input type="password" name="password" className="modern-input" placeholder="••••••••" required />
            </div>

            <button type="submit" className="btn-gradient" style={{ width: '100%', marginTop: '12px', padding: '14px', fontSize: '16px', letterSpacing: '1px' }}>
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
            
          </form>

          <div style={{ textAlign: 'center', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border-light)' }}>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </p>
            <button 
              type="button"
              className="btn-outline"
              style={{ width: '100%', padding: '12px', fontWeight: '600' }}
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </div>
          
          {isLogin && (
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
                onClick={(e) => {
                  const form = e.target.closest('.modern-card').querySelector('form');
                  form.email.value = 'kotareddy9848@gmail.com';
                  form.password.value = 'kotareddy9848';
                }}
              >
                Populate Owner Credentials
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Auth;
