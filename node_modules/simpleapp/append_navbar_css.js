const fs = require('fs');

const css = `
/* Floating Pill Navbar Styles */
.floating-navbar {
  position: fixed;
  top: 24px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 1000;
  pointer-events: none;
}

.navbar-pill {
  pointer-events: auto;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border-light);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border-radius: 100px;
  padding: 8px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 90%;
  max-width: 1000px;
  transition: all 0.3s ease;
}

.pill-links {
  display: flex;
  align-items: center;
  gap: 32px;
}

.pill-link {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s;
}

.pill-link:hover {
  color: var(--primary-color);
}

.pill-search {
  display: flex;
  align-items: center;
  background: var(--bg-primary);
  border-radius: 50px;
  padding: 6px 16px;
  border: 1px solid var(--border-light);
  min-width: 200px;
}

.pill-search input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: var(--text-primary);
  width: 100%;
}

.pill-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background-color: var(--accent-color);
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}
`;

fs.appendFileSync('src/index.css', css);
console.log('Appended Floating Navbar CSS');
