// ========================================
// MyWallet — SPA Router
// ========================================

const Router = {
  routes: {},
  currentPage: null,

  // Register a route
  register(hash, renderFn) {
    this.routes[hash] = renderFn;
  },

  // Navigate to a page
  navigate(hash) {
    window.location.hash = hash;
  },

  // Handle hash change
  handleRoute() {
    const hash = window.location.hash.slice(1) || 'dashboard';
    const renderFn = this.routes[hash];

    if (renderFn) {
      this.currentPage = hash;
      const content = document.getElementById('page-content');
      if (content) {
        content.innerHTML = '';
        content.className = 'page-content animate-fade-in';
        renderFn(content);
      }
      // Update active states
      this.updateActiveNav(hash);
      this.updateHeaderTitle(hash);
    }
  },

  // Update navigation active states
  updateActiveNav(hash) {
    // Sidebar
    document.querySelectorAll('.sidebar__link').forEach(link => {
      link.classList.toggle('active', link.dataset.page === hash);
    });
    // Bottom nav
    document.querySelectorAll('.bottom-nav__item').forEach(item => {
      item.classList.toggle('active', item.dataset.page === hash);
    });
  },

  // Update header title
  updateHeaderTitle(hash) {
    const titles = {
      dashboard: mIcon('dashboard') + ` <span>${t('dashboard')}</span>`,
      transactions: mIcon('receipt_long') + ` <span>${t('activity')}</span>`,
      wallets: mIcon('account_balance_wallet') + ` <span>${t('wallets')}</span>`,
      debts: mIcon('handshake') + ` <span>${t('debts')}</span>`,
      ai: mIcon('smart_toy') + ` <span>${t('assistant')}</span>`,
      settings: mIcon('settings') + ` <span>${t('settings')}</span>`
    };
    const el = document.getElementById('header-title');
    if (el) el.innerHTML = titles[hash] || `<span>MyWallet</span>`;
  },

  // Initialize
  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute();
  }
};
