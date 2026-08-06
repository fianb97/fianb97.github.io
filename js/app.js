// ========================================
// MyWallet — App Initialization
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  // Ensure stored settings (language & theme) are initialized
  Store.load();

  // Build app shell
  const app = document.getElementById('app');
  app.innerHTML = `
    ${renderSidebar()}
    <div class="sidebar-overlay" id="sidebar-overlay"></div>
    <div class="main">
      ${renderHeader()}
      <div class="page-content" id="page-content"></div>
    </div>
    ${renderBottomNav()}
    ${renderFAB()}
  `;

  // Register routes
  Router.register('dashboard', renderDashboard);
  Router.register('transactions', renderTransactions);
  Router.register('wallets', renderWallets);
  Router.register('debts', renderDebts);
  Router.register('ai', renderAI);
  Router.register('settings', renderSettings);

  function bindAppEvents() {
    const menuBtn = document.getElementById('menu-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    function closeSidebar() {
      if (sidebar) sidebar.classList.remove('open');
      if (overlay) overlay.classList.remove('visible');
    }

    if (menuBtn) {
      menuBtn.onclick = () => {
        if (sidebar) sidebar.classList.toggle('open');
        if (overlay) overlay.classList.toggle('visible');
      };
    }
    if (overlay) {
      overlay.onclick = closeSidebar;
    }

    document.querySelectorAll('.sidebar__link').forEach(link => {
      link.onclick = closeSidebar;
    });

    const langBtn = document.getElementById('lang-toggle-btn');
    if (langBtn) {
      langBtn.onclick = () => {
        const curLang = I18n.getLang();
        const newLang = curLang === 'id' ? 'en' : 'id';
        Store.setLanguage(newLang);

        const sidebarElem = document.getElementById('sidebar');
        const headerElem = document.getElementById('header');
        const bottomNavElem = document.getElementById('bottom-nav');

        if (sidebarElem) sidebarElem.outerHTML = renderSidebar();
        if (headerElem) headerElem.outerHTML = renderHeader();
        if (bottomNavElem) bottomNavElem.outerHTML = renderBottomNav();

        bindAppEvents();
        Router.handleRoute();
        Toast.show(newLang === 'id' ? 'Bahasa diubah ke Bahasa Indonesia 🇮🇩' : 'Language changed to English 🇬🇧', 'success');
      };
    }
  }

  bindAppEvents();

  // FAB
  const fab = document.getElementById('fab-btn');
  if (fab) {
    fab.addEventListener('click', () => openTransactionForm());
  }

  // Check if onboarding needed
  if (!Store.isSetupComplete()) {
    renderOnboarding();
  }

  // Init router
  Router.init();
}

// Service Worker Registration for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}
