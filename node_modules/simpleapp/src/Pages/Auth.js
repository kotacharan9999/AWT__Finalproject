import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Zap, Package, Eye, EyeOff, Sparkles } from 'lucide-react';

const Auth = ({ setUser, showToast }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSuggestPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let pass = "";
    for (let i = 0; i < 12; i++) pass += chars[Math.floor(Math.random() * chars.length)];
    setPassword(pass);
    showToast("Strong password suggested!", "info");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const endpoint = isLogin ? 'login' : 'signup';
    const body = isLogin ? { email, password } : { email, password, name };

    try {
      const res = await fetch(`/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        const authenticatedUser = data.user;
        if (/^[a-f0-9:]{20,}$/i.test(authenticatedUser?.name)) {
          authenticatedUser.name = authenticatedUser.email.split('@')[0];
        }
        setUser(authenticatedUser);
        showToast(isLogin ? "Welcome back!" : "Account created successfully!");
        navigate(authenticatedUser?.isAdmin ? '/admin' : '/');
      } else {
        showToast(data.message || "Auth error", "error");
      }
    } catch (err) {
      showToast("Network error", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      
      {/* Left Splash Panel */}
      <div className="auth-splash-left">
        <div style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ marginBottom: '60px' }}>
             <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: '42px', fontWeight: '900', color: '#fff', fontStyle: 'italic', letterSpacing: '-1px' }}>
                Shop<span style={{ color: 'var(--gold)', animation: 'logoGlow 2.5s infinite' }}>Plus</span>
             </div>
             <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.8)', fontWeight: '500', marginTop: '8px' }}>Explore the new way of shopping.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={24} color="#fff" />
              </div>
              <div>
                <h4 style={{ color: '#fff', margin: 0, fontSize: '18px' }}>Wide Catalog</h4>
                <p style={{ color: 'rgba(255,255,255,0.6)', margin: '4px 0 0', fontSize: '14px' }}>Access over 100,000 top brands.</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={24} color="#fff" />
              </div>
              <div>
                <h4 style={{ color: '#fff', margin: 0, fontSize: '18px' }}>Fast Delivery</h4>
                <p style={{ color: 'rgba(255,255,255,0.6)', margin: '4px 0 0', fontSize: '14px' }}>Real-time tracking for every order.</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={24} color="#fff" />
              </div>
              <div>
                <h4 style={{ color: '#fff', margin: 0, fontSize: '18px' }}>Secure Payments</h4>
                <p style={{ color: 'rgba(255,255,255,0.6)', margin: '4px 0 0', fontSize: '14px' }}>Encrypted transactions always.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Animated background shapes */}
        <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '240px', height: '240px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', top: '20%', right: '-60px', width: '180px', height: '180px', borderRadius: '40px', background: 'rgba(240,180,41,0.1)', transform: 'rotate(25deg)' }} />
      </div>

      {/* Right Form Panel */}
      <div className="auth-glass-panel">
        <div className="auth-form-wrapper" style={{ width: '100%', maxWidth: '420px', animation: 'fadeInSlideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both' }}>
          
          <div style={{ marginBottom: '40px', textAlign: 'center' }}>
            <h2 className="text-h1" style={{ marginBottom: '12px' }}>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <p style={{ color: 'var(--text-3)', fontSize: '15px' }}>
              {isLogin ? "Sign in to access your profile and orders." : "Join ShopPlus for a premium shopping experience."}
            </p>
          </div>

          {/* Tab Switcher */}
          <div style={{ display: 'flex', background: 'var(--bg-subtle)', borderRadius: '12px', padding: '6px', marginBottom: '32px' }}>
            <button onClick={() => setIsLogin(true)} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '800', background: isLogin ? 'var(--bg-card)' : 'transparent', color: isLogin ? 'var(--primary)' : 'var(--text-3)', boxShadow: isLogin ? 'var(--shadow-sm)' : 'none', transition: '0.2s' }}>LOGIN</button>
            <button onClick={() => setIsLogin(false)} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '800', background: !isLogin ? 'var(--bg-card)' : 'transparent', color: !isLogin ? 'var(--primary)' : 'var(--text-3)', boxShadow: !isLogin ? 'var(--shadow-sm)' : 'none', transition: '0.2s' }}>SIGN UP</button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {!isLogin && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-2)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
                <input required type="text" className="modern-input" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-2)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
              <input required type="email" className="modern-input" placeholder="name@email.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
                {!isLogin && (
                  <button type="button" onClick={handleSuggestPassword} style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '800', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Sparkles size={11} /> Suggest Strong
                  </button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <input required type={showPassword ? "text" : "password"} className="modern-input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div style={{ textAlign: 'right', marginTop: '-12px' }}>
                <Link to="#" style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '700' }}>Forgot password?</Link>
              </div>
            )}

            <button type="submit" disabled={isLoading} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '15px', justifyContent: 'center', marginTop: '12px' }}>
               {isLoading ? "Please wait..." : isLogin ? "Login to Account" : "Create New Account"}
            </button>

            <div style={{ position: 'relative', margin: '16px 0', textAlign: 'center' }}>
                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'var(--border)', zIndex: 0 }} />
                <span style={{ position: 'relative', background: 'var(--bg-page)', padding: '0 16px', fontSize: '12px', color: 'var(--text-3)', fontWeight: '700', textTransform: 'uppercase' }}>Or Continue With</span>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" style={{ flex: 1, padding: '12px', background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px', fontWeight: '700' }}>
                Google
              </button>
              <button type="button" style={{ flex: 1, padding: '12px', background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px', fontWeight: '700' }}>
                Facebook
              </button>
            </div>
            
            <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '13px', color: 'var(--text-2)' }}>
              By continuing, you agree to our <Link to="#" style={{ color: 'var(--primary)', fontWeight: '700' }}>Terms</Link> and <Link to="#" style={{ color: 'var(--primary)', fontWeight: '700' }}>Privacy Policy</Link>.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
