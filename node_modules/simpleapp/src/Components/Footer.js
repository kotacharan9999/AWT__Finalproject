import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const FooterCol = ({ title, links }) => (
  <div>
    <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ea3bb', marginBottom: '16px' }}>{title}</div>
    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {links.map(({ label, to }) => (
        <li key={label}>
          <Link to={to}
            style={{ fontSize: '13px', color: '#5a5f7a', textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={e => e.target.style.color = '#3d5af1'}
            onMouseLeave={e => e.target.style.color = '#5a5f7a'}>
            {label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer style={{ background: '#0f1120', color: '#fff', marginTop: '48px' }}>
      {/* Newsletter Strip */}
      <div style={{ background: 'linear-gradient(135deg, #3d5af1 0%, #2b3de8 100%)', padding: '40px 24px' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <h3 style={{ fontWeight: '900', fontSize: '22px', margin: '0 0 6px' }}>
              🎁 Get exclusive deals in your inbox
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '14px', margin: 0 }}>
              Join 2 lakh+ shoppers. No spam, unsubscribe anytime.
            </p>
          </div>
          <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={{ padding: '12px 18px', borderRadius: '8px', border: 'none', fontSize: '14px', minWidth: '260px', outline: 'none', color: '#1a1d2e', flex: 1 }}
            />
            <button type="submit" style={{ padding: '12px 24px', background: '#f0b429', color: '#1a1d2e', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {subscribed ? '✅ Subscribed!' : 'Subscribe Free'}
            </button>
          </form>
        </div>
      </div>

      {/* Main grid */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '56px 24px 40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '40px' }}>

        {/* Brand col */}
        <div style={{ minWidth: '200px' }}>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: '26px', fontWeight: '900', fontStyle: 'italic', letterSpacing: '-0.5px', marginBottom: '12px' }}>
            Shop<span style={{ color: '#f0b429' }}>Plus</span>
          </div>
          <p style={{ fontSize: '13px', color: '#9ea3bb', lineHeight: 1.7, marginBottom: '20px' }}>
            India's favourite online marketplace. Millions of products. Unbeatable prices. Fast delivery.
          </p>
          {/* Social Icons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            {[
              { icon: '📘', label: 'Facebook', href: '#' },
              { icon: '📸', label: 'Instagram', href: '#' },
              { icon: '🐦', label: 'Twitter', href: '#' },
              { icon: '▶️', label: 'YouTube', href: '#' },
            ].map(s => (
              <a key={s.label} href={s.href} aria-label={s.label}
                style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', cursor: 'pointer', transition: 'background 0.15s', textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(61,90,241,.4)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.08)'}>
                {s.icon}
              </a>
            ))}
          </div>
          {/* App Download badges */}
          <div style={{ marginTop: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '11px', fontWeight: '700', color: '#9ea3bb', cursor: 'pointer' }}>
              📱 App Store
            </div>
            <div style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '11px', fontWeight: '700', color: '#9ea3bb', cursor: 'pointer' }}>
              🤖 Google Play
            </div>
          </div>
        </div>

        <FooterCol title="Explore" links={[
          { label: 'Top Offers', to: '/products' },
          { label: 'Electronics', to: '/products?category=Electronics & Gadgets' },
          { label: 'Ladies Corner', to: '/products?category=Ladies Corner' },
          { label: 'Mens Corner', to: '/products?category=Mens Corner' },
          { label: 'Grocery', to: '/products?category=Grocery' },
        ]} />

        <FooterCol title="Account" links={[
          { label: 'My Profile', to: '/account' },
          { label: 'My Orders', to: '/orders' },
          { label: 'My Wishlist', to: '/wishlist' },
          { label: 'Checkout', to: '/checkout' },
        ]} />

        <FooterCol title="Help & Support" links={[
          { label: 'Customer Care', to: '/' },
          { label: 'Track Order', to: '/orders' },
          { label: 'Return Policy', to: '/' },
          { label: 'Payments', to: '/' },
          { label: 'FAQ', to: '/' },
        ]} />

        <FooterCol title="Legal" links={[
          { label: 'Terms of Service', to: '/' },
          { label: 'Privacy Policy', to: '/' },
          { label: 'Cookie Policy', to: '/' },
          { label: 'Seller Policy', to: '/' },
        ]} />

        {/* Contact */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ea3bb', marginBottom: '16px' }}>Contact Us</div>
          <address style={{ fontStyle: 'normal', fontSize: '13px', color: '#5a5f7a', lineHeight: 1.8 }}>
            ShopPlus Pvt. Ltd.<br />
            42, Cyber Towers, HITEC City,<br />
            Hyderabad – 500081<br />
            Telangana, India<br />
            <a href="mailto:support@shopplus.in" style={{ color: '#3d5af1', marginTop: '8px', display: 'block', textDecoration: 'none' }}>support@shopplus.in</a>
            <a href="tel:+918001234567" style={{ color: '#5a5f7a', marginTop: '4px', display: 'block', textDecoration: 'none' }}>+91 800 123 4567</a>
          </address>
          {/* Payment icons */}
          <div style={{ marginTop: '20px' }}>
            <div style={{ fontSize: '11px', color: '#9ea3bb', fontWeight: '700', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>We Accept</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['💳 Visa', '💳 MC', '🏦 UPI', '💰 COD'].map(p => (
                <div key={p} style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', fontSize: '11px', color: '#9ea3bb', fontWeight: '700' }}>{p}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,.06)' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: '#5a5f7a' }}>
            {['Become a Seller', 'Advertise with Us', 'Gift Cards', 'Blog'].map(l => (
              <span key={l} style={{ cursor: 'pointer', transition: 'color 0.15s' }}
                onMouseEnter={e => e.target.style.color = '#3d5af1'}
                onMouseLeave={e => e.target.style.color = '#5a5f7a'}>{l}</span>
            ))}
          </div>
          <div style={{ fontSize: '12px', color: '#3a3d52' }}>
            © {new Date().getFullYear()} ShopPlus Pvt. Ltd. All rights reserved. 🇮🇳 Made with ❤️ in India
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
