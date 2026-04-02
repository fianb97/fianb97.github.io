// ========================================
// MyWallet — App Initialization
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
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

  // Mobile sidebar toggle
  const menuBtn = document.getElementById('menu-btn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('visible');
  }

  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('visible');
    });
  }
  if (overlay) {
    overlay.addEventListener('click', closeSidebar);
  }

  // Close sidebar on nav click (mobile)
  document.querySelectorAll('.sidebar__link').forEach(link => {
    link.addEventListener('click', closeSidebar);
  });

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
