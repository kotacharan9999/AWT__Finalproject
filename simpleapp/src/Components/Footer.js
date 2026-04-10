import React from 'react';
import { Link } from 'react-router-dom';

const FooterLink = ({ to, children }) => {
  return (
    <li>
      <Link 
        to={to} 
        style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color var(--transition-fast)' }}
        onMouseEnter={(e) => e.target.style.color = 'var(--primary-color)'}
        onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
      >
        {children}
      </Link>
    </li>
  );
};

const Footer = () => {
  return (
    <footer style={{ marginTop: '80px', borderTop: '1px solid var(--border-light)', backgroundColor: 'var(--bg-primary)' }}>
      <div className="container" style={{ padding: '60px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '40px' }}>
        
        <div>
          <div className="text-overline" style={{ marginBottom: '20px' }}>Company</div>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
            <FooterLink to="/products">About Us</FooterLink>
            <FooterLink to="/products">Careers</FooterLink>
            <FooterLink to="/products">Press</FooterLink>
            <FooterLink to="/products">Corporate Info</FooterLink>
          </ul>
        </div>

        <div>
          <div className="text-overline" style={{ marginBottom: '20px' }}>Support</div>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
            <FooterLink to="/products">Payments</FooterLink>
            <FooterLink to="/products">Shipping</FooterLink>
            <FooterLink to="/products">Returns</FooterLink>
            <FooterLink to="/products">FAQ</FooterLink>
          </ul>
        </div>

        <div>
          <div className="text-overline" style={{ marginBottom: '20px' }}>Legal</div>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
            <FooterLink to="/products">Terms of Service</FooterLink>
            <FooterLink to="/products">Privacy Policy</FooterLink>
            <FooterLink to="/products">Cookie Policy</FooterLink>
          </ul>
        </div>

        <div>
          <div className="text-overline" style={{ marginBottom: '20px' }}>Social</div>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
            <FooterLink to="/products">Instagram</FooterLink>
            <FooterLink to="/products">Twitter</FooterLink>
            <FooterLink to="/products">LinkedIn</FooterLink>
          </ul>
        </div>

        <div style={{ paddingLeft: '24px', borderLeft: '1px solid var(--border-light)', minWidth: '200px' }}>
          <div className="text-overline" style={{ marginBottom: '20px' }}>Contact Details</div>
          <address style={{ color: 'var(--text-secondary)', fontSize: '14px', fontStyle: 'normal', lineHeight: '1.6' }}>
            ShopEase Global Headquarters, <br/>
            123 Innovation Drive, <br/>
            Tech District, San Francisco, <br/>
            CA 94105, USA
          </address>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-light)' }}>
        <div className="container" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '24px', fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '500' }}>
            <span style={{ cursor: 'pointer', transition: 'color var(--transition-fast)' }} onMouseEnter={(e) => e.target.style.color = 'var(--primary-color)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}><span style={{ color: 'var(--primary-color)' }}>✓</span> Become a Seller</span>
            <span style={{ cursor: 'pointer', transition: 'color var(--transition-fast)' }} onMouseEnter={(e) => e.target.style.color = 'var(--primary-color)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}><span style={{ color: 'var(--primary-color)' }}>★</span> Advertise</span>
            <span style={{ cursor: 'pointer', transition: 'color var(--transition-fast)' }} onMouseEnter={(e) => e.target.style.color = 'var(--primary-color)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>💼 Gift Cards</span>
          </div>
          
          <div style={{ color: 'var(--text-tertiary)', fontSize: '13px' }}>
            © {new Date().getFullYear()} ShopEase.com. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
