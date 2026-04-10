import React, { useState } from 'react';
import { Settings, X, RotateCcw } from 'lucide-react';

const ThemeCustomizer = ({ themeSettings, setThemeSettings }) => {
  const [isOpen, setIsOpen] = useState(false);

  const defaultTheme = {
    primaryColor: '#008080',
    accentColor: '#FF6F61',
    cornerStyle: 'rounded'
  };

  const handleColorChange = (key, value) => {
    setThemeSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetTheme = () => {
    setThemeSettings(defaultTheme);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border-light)',
          cursor: 'pointer',
          zIndex: 9999,
          transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <Settings size={28} />
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '90px',
          right: '24px',
          width: '320px',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          border: '1px solid var(--border-light)',
          padding: '24px',
          zIndex: 9999,
          animation: 'fadeInSlideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>Theme Settings</h3>
            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', color: 'var(--text-tertiary)', cursor: 'pointer', border: 'none' }}>
              <X size={20} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Primary Color */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Primary Color</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input 
                  type="color" 
                  value={themeSettings.primaryColor}
                  onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                  style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '14px', fontFamily: 'monospace', color: 'var(--text-primary)' }}>{themeSettings.primaryColor.toUpperCase()}</span>
              </div>
            </div>

            {/* Accent Color */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Accent Color</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input 
                  type="color" 
                  value={themeSettings.accentColor}
                  onChange={(e) => handleColorChange('accentColor', e.target.value)}
                  style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '14px', fontFamily: 'monospace', color: 'var(--text-primary)' }}>{themeSettings.accentColor.toUpperCase()}</span>
              </div>
            </div>

            {/* Corner Style */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '12px' }}>Corner Radius</label>
              <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-primary)', padding: '6px', borderRadius: '8px' }}>
                {['sharp', 'rounded', 'pill'].map(style => (
                  <button
                    key={style}
                    onClick={() => handleColorChange('cornerStyle', style)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      textTransform: 'capitalize',
                      backgroundColor: themeSettings.cornerStyle === style ? 'var(--bg-secondary)' : 'transparent',
                      color: themeSettings.cornerStyle === style ? 'var(--text-primary)' : 'var(--text-secondary)',
                      boxShadow: themeSettings.cornerStyle === style ? 'var(--shadow-sm)' : 'none',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={resetTheme}
              style={{
                marginTop: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '12px',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-light)',
                borderRadius: '8px',
                color: 'var(--text-secondary)',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.backgroundColor = 'var(--bg-primary)'; }}
              onMouseOut={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <RotateCcw size={16} /> Reset Default
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ThemeCustomizer;
