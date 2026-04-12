const fs = require('fs');
const css = `
/* Mega Menu & Navbar Dropdowns */
@keyframes slideDownFade {
  from { opacity: 0; transform: translateY(-10px); pointer-events: none; }
  to { opacity: 1; transform: translateY(0); pointer-events: auto; }
}

.mega-menu-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
  padding: 32px;
  min-width: 800px;
}

.mega-menu-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mega-link {
  color: var(--text-secondary);
  font-size: 14px;
  padding: 6px 8px;
  border-radius: 6px;
  transition: all 0.2s;
  text-decoration: none;
}

.mega-link:hover {
  color: var(--primary-color);
  background: var(--bg-primary);
  padding-left: 12px;
}

.account-dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-light);
  transition: all 0.2s;
  cursor: pointer;
  text-decoration: none;
}

.account-dropdown-item:last-child {
  border-bottom: none;
}

.account-dropdown-item:hover {
  background: var(--bg-primary);
  color: var(--primary-color);
  padding-left: 24px;
}

.account-dropdown-item.logout:hover {
  color: var(--error);
}

.top-minibar {
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-light);
  padding: 6px 0;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
}

.category-ribbon {
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-light);
  padding: 0;
  display: flex;
  gap: 32px;
}

.ribbon-item {
  padding: 12px 0;
  cursor: pointer;
  transition: color 0.2s;
  font-weight: 600;
  font-size: 14px;
  position: relative;
}

.ribbon-item:hover {
  color: var(--primary-color);
}

.ribbon-item::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0; height: 3px;
  background-color: var(--primary-color);
  transform: scaleX(0);
  transition: transform 0.2s;
}

.ribbon-item:hover::after {
  transform: scaleX(1);
}

.nav-hover-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--bg-secondary);
  box-shadow: 0 16px 40px rgba(0,0,0,0.12);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  overflow: hidden;
  animation: slideDownFade 0.2s ease forwards;
  z-index: 1000;
}

/* Specific fixing for the search category select */
.search-category-select {
  border: none;
  background: var(--bg-primary);
  color: var(--text-secondary);
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 500;
  outline: none;
  border-right: 1px solid var(--border-light);
  cursor: pointer;
  border-radius: var(--radius-pill) 0 0 var(--radius-pill);
}

.search-category-select:hover {
  background: var(--border-light);
  color: var(--text-primary);
}
`;
fs.appendFileSync('src/index.css', css);
console.log('CSS appended successfully');
