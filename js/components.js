// ========================================
// MyWallet — UI Components
// ========================================

// ── Toast Notification System ──
const Toast = {
  show(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const icons = {
      success: Icons.check,
      error: Icons.x,
      warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
      info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
      <span class="toast__icon">${icons[type]}</span>
      <span class="toast__message">${Utils.escapeHtml(message)}</span>
      <button class="toast__close" onclick="this.closest('.toast').remove()">${Icons.x}</button>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
};

// ── Modal System ──
const Modal = {
  open(title, bodyHtml, options = {}) {
    // Close any existing modal
    this.close();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modal-overlay';

    const footerHtml = options.footerHtml || '';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal__header">
          <h3 class="modal__title">${title}</h3>
          <button class="modal__close" id="modal-close-btn">${Icons.x}</button>
        </div>
        <div class="modal__body" id="modal-body">
          ${bodyHtml}
        </div>
        ${footerHtml ? `<div class="modal__footer">${footerHtml}</div>` : ''}
      </div>
    `;

    document.body.appendChild(overlay);

    // Close events
    overlay.querySelector('#modal-close-btn').addEventListener('click', () => this.close());
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close();
    });

    // Call onOpen callback
    if (options.onOpen) {
      setTimeout(() => options.onOpen(overlay), 50);
    }

    return overlay;
  },

  close() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
      overlay.classList.add('closing');
      setTimeout(() => overlay.remove(), 200);
    }
  }
};

// ── Sidebar Renderer ──
function renderSidebar() {
  const activeDebts = Store.getDebts({ isPaid: false }).length;
  const nav = [
    { page: 'dashboard', icon: Icons.dashboard, label: 'Dashboard' },
    { page: 'transactions', icon: Icons.transactions, label: 'Transaksi' },
    { page: 'wallets', icon: Icons.wallet, label: 'Dompet' },
    { page: 'debts', icon: Icons.debt, label: 'Hutang/Piutang', badge: activeDebts || null },
    { page: 'ai', icon: Icons.ai, label: 'AI Assistant' },
  ];

  return `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar__logo">
        <div class="sidebar__logo-icon">${Icons.wallet}</div>
        <span class="sidebar__logo-text">MyWallet</span>
      </div>
      <nav class="sidebar__nav">
        ${nav.map(n => `
          <a href="#${n.page}" class="sidebar__link" data-page="${n.page}">
            <span class="sidebar__link-icon">${n.icon}</span>
            <span>${n.label}</span>
            ${n.badge ? `<span class="sidebar__link-badge">${n.badge}</span>` : ''}
          </a>
        `).join('')}
      </nav>
      <div class="sidebar__footer">
        <span class="sidebar__version">MyWallet v1.0</span>
      </div>
    </aside>
  `;
}

// ── Header Renderer ──
function renderHeader() {
  return `
    <header class="header" id="header">
      <div class="header__left">
        <button class="header__menu-btn" id="menu-btn">${Icons.menu}</button>
        <h2 class="header__title" id="header-title">🏠 Dashboard</h2>
      </div>
      <div class="header__right">
        <span class="header__date">${Utils.longDate()}</span>
      </div>
    </header>
  `;
}

// ── Bottom Nav Renderer ──
function renderBottomNav() {
  const nav = [
    { page: 'dashboard', icon: Icons.dashboard, label: 'Home' },
    { page: 'transactions', icon: Icons.transactions, label: 'Transaksi' },
    { page: 'wallets', icon: Icons.wallet, label: 'Dompet' },
    { page: 'debts', icon: Icons.debt, label: 'Hutang' },
    { page: 'ai', icon: Icons.ai, label: 'AI' },
  ];

  return `
    <nav class="bottom-nav" id="bottom-nav">
      <div class="bottom-nav__list">
        ${nav.map(n => `
          <a href="#${n.page}" class="bottom-nav__item" data-page="${n.page}">
            ${n.icon}
            <span>${n.label}</span>
          </a>
        `).join('')}
      </div>
    </nav>
  `;
}

// ── FAB Renderer ──
function renderFAB() {
  return `<button class="fab" id="fab-btn" title="Tambah Transaksi">${Icons.plus}</button>`;
}

// ── Onboarding ──
function renderOnboarding() {
  const defaults = [
    { name: 'BRI', type: 'bank', icon: Icons.wallet_bank },
    { name: 'BCA', type: 'bank', icon: Icons.wallet_bank },
    { name: 'OVO', type: 'ewallet', icon: Icons.wallet_ewallet },
    { name: 'Dana', type: 'ewallet', icon: Icons.wallet_ewallet },
    { name: 'GoPay', type: 'ewallet', icon: Icons.wallet_ewallet },
    { name: 'Cash', type: 'cash', icon: Icons.wallet_cash },
  ];

  const overlay = document.createElement('div');
  overlay.className = 'onboarding-overlay';
  overlay.id = 'onboarding';
  overlay.innerHTML = `
    <div class="onboarding animate-fade-in-up">
      <div class="onboarding__logo">${Icons.wallet}</div>
      <h1 class="onboarding__title">Selamat Datang di MyWallet</h1>
      <p class="onboarding__desc">Masukkan saldo awal dompet kamu untuk memulai. Kamu bisa menambah atau mengubahnya nanti.</p>
      <div class="onboarding__wallets" id="onboarding-wallets">
        ${defaults.map((w, i) => `
          <div class="onboarding__wallet-row">
            <span class="wallet-icon">${w.icon}</span>
            <label>${w.name}</label>
            <input type="text" id="setup-bal-${i}" placeholder="Rp 0" data-name="${w.name}" data-type="${w.type}" inputmode="numeric">
          </div>
        `).join('')}
      </div>
      <div class="onboarding__submit-wrap">
        <button class="btn btn--primary btn--lg btn--full" id="setup-done-btn">🚀 Mulai Sekarang</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Format input as Rupiah
  overlay.querySelectorAll('input').forEach(inp => {
    inp.addEventListener('input', (e) => {
      const val = Utils.parseRupiah(e.target.value);
      if (val > 0) {
        e.target.value = 'Rp ' + new Intl.NumberFormat('id-ID').format(val);
      } else {
        e.target.value = '';
      }
    });
  });

  // Done button
  overlay.querySelector('#setup-done-btn').addEventListener('click', () => {
    const inputs = overlay.querySelectorAll('input');
    let hasWallet = false;

    inputs.forEach(inp => {
      const bal = Utils.parseRupiah(inp.value);
      if (bal > 0) {
        Store.addWallet({
          name: inp.dataset.name,
          type: inp.dataset.type,
          balance: bal
        });
        hasWallet = true;
      }
    });

    if (!hasWallet) {
      // Add at least Cash with 0
      Store.addWallet({ name: 'Cash', type: 'cash', balance: 0 });
    }

    Store.completeSetup();
    overlay.remove();
    Router.handleRoute();
    Toast.show('Selamat datang di MyWallet! 🎉', 'success');
  });
}

// ── Wallet Selector (for forms) ──
function renderWalletSelector(selectedId = '') {
  const wallets = Store.getWallets();
  return `
    <div class="form-group">
      <label class="form-group__label">Sumber Dana</label>
      <div style="display:flex;flex-wrap:wrap;gap:8px;">
        ${wallets.map(w => `
          <div class="wallet-chip ${w.id === selectedId ? 'selected' : ''}" data-wallet-id="${w.id}">
            <span class="wallet-chip__icon">${getWalletIcon(w)}</span>
            <span class="wallet-chip__name">${Utils.escapeHtml(w.name)}</span>
            <span class="wallet-chip__balance">${Utils.formatShort(w.balance)}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ── Category Selector (for forms) ──
function renderCategorySelector(type = 'expense', selectedCat = '') {
  const cats = Object.entries(CATEGORIES).filter(([, v]) => v.type === type);
  return `
    <div class="form-group">
      <label class="form-group__label">Kategori</label>
      <div class="cat-grid">
        ${cats.map(([key, cat]) => `
          <div class="cat-grid__item ${key === selectedCat ? 'selected' : ''}" data-category="${key}">
            <span class="cat-grid__item-icon">${cat.icon}</span>
            <span>${cat.name}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
