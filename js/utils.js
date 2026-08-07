// ========================================
// MyWallet — Utility Functions
// ========================================

const Utils = {
  // Generate unique ID
  id() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  },

  // Format to Rupiah
  formatRupiah(amount, showSign = false) {
    const abs = Math.abs(amount);
    const formatted = new Intl.NumberFormat('id-ID').format(abs);
    const sign = showSign ? (amount >= 0 ? '+' : '-') : (amount < 0 ? '-' : '');
    return `${sign}Rp ${formatted}`;
  },

  // Short format (1jt, 500rb)
  formatShort(amount) {
    const abs = Math.abs(amount);
    if (abs >= 1000000) return `${(abs / 1000000).toFixed(1).replace('.0', '')}jt`;
    if (abs >= 1000) return `${(abs / 1000).toFixed(0)}rb`;
    return abs.toString();
  },

  // Parse Rupiah input string to number
  parseRupiah(str) {
    if (typeof str === 'number') return str;
    return parseInt(String(str).replace(/[^0-9]/g, ''), 10) || 0;
  },

  // Format date
  formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  },

  // Format relative date
  formatRelativeDate(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Hari ini';
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return Utils.formatDate(dateStr);
  },

  // Format date for grouping
  formatDateGroup(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diffDays = Math.floor((today - target) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Hari Ini';
    if (diffDays === 1) return 'Kemarin';
    return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  },

  // Get today's date as YYYY-MM-DD (local time)
  today() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // Get current month & year label
  currentMonthLabel() {
    return new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  },

  // Get long date string
  longDate() {
    return new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  },

  // Check if date is in current month
  isCurrentMonth(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  },

  // Get start of current week (Monday)
  startOfWeek() {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.getFullYear(), now.getMonth(), diff);
    const year = monday.getFullYear();
    const month = String(monday.getMonth() + 1).padStart(2, '0');
    const d = String(monday.getDate()).padStart(2, '0');
    return `${year}-${month}-${d}`;
  },

  // Escape HTML to prevent XSS
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  // Debounce
  debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }
};

// ── Helper: Material Symbol icon generator ──
function mIcon(name, fill = false) {
  const style = fill ? ' style="font-variation-settings: \'FILL\' 1;"' : '';
  return `<span class="material-symbols-outlined"${style}>${name}</span>`;
}

// ── Helper: Get wallet Material icon by type ──
function getWalletIcon(wallet) {
  if (!wallet) return mIcon('account_balance_wallet');
  const typeIcons = {
    bank: 'account_balance',
    ewallet: 'phone_iphone',
    cash: 'payments'
  };
  return mIcon(typeIcons[wallet.type] || 'account_balance_wallet');
}

// ── Material Symbol Icons ──
const Icons = {
  dashboard:    mIcon('dashboard'),
  transactions: mIcon('receipt_long'),
  wallet:       mIcon('account_balance_wallet'),
  debt:         mIcon('handshake'),
  ai:           mIcon('smart_toy'),
  plus:         mIcon('add'),
  x:            mIcon('close'),
  menu:         mIcon('menu'),
  send:         mIcon('send'),
  check:        mIcon('check_circle'),
  trash:        mIcon('delete'),
  edit:         mIcon('edit'),
  arrowUp:      mIcon('arrow_upward'),
  arrowDown:    mIcon('arrow_downward'),
  transfer:     mIcon('sync_alt'),
  search:       mIcon('search'),
  settings:     mIcon('settings'),
  notification: mIcon('notifications'),
  person:       mIcon('person'),
  more:         mIcon('more_vert'),
  addCircle:    mIcon('add_circle'),
  trendUp:      mIcon('trending_up'),
  balance:      mIcon('balance'),
  callReceived: mIcon('call_received'),
  callMade:     mIcon('call_made'),

  // Category icons (Material Symbols)
  cat_food:          mIcon('restaurant'),
  cat_transport:     mIcon('directions_car'),
  cat_shopping:      mIcon('shopping_bag'),
  cat_bills:         mIcon('bolt'),
  cat_health:        mIcon('medical_services'),
  cat_entertainment: mIcon('movie'),
  cat_education:     mIcon('school'),
  cat_tax:           mIcon('description'),
  cat_charity:       mIcon('favorite'),
  cat_installment:   mIcon('calendar_month'),
  cat_salary:        mIcon('payments'),
  cat_bonus:         mIcon('emoji_events'),
  cat_sales:         mIcon('sell'),
  cat_investment:    mIcon('trending_up'),
  cat_allowance:     mIcon('work'),
  cat_refund:        mIcon('replay'),
  cat_gift:          mIcon('redeem'),

  // Wallet type icons
  wallet_bank:    mIcon('account_balance'),
  wallet_ewallet: mIcon('phone_iphone'),
  wallet_cash:    mIcon('payments')
};

// ── Category Definitions ──
const CATEGORIES = {
  // Expenses
  food:          { name: 'Makanan & Minuman', icon: Icons.cat_food, color: 'var(--cat-food)', type: 'expense' },
  transport:     { name: 'Transportasi', icon: Icons.cat_transport, color: 'var(--cat-transport)', type: 'expense' },
  shopping:      { name: 'Belanja/Pakaian', icon: Icons.cat_shopping, color: 'var(--cat-shopping)', type: 'expense' },
  bills:         { name: 'Tagihan', icon: Icons.cat_bills, color: 'var(--cat-bills)', type: 'expense' },
  health:        { name: 'Kesehatan', icon: Icons.cat_health, color: 'var(--cat-health)', type: 'expense' },
  entertainment: { name: 'Hiburan', icon: Icons.cat_entertainment, color: 'var(--cat-entertainment)', type: 'expense' },
  education:     { name: 'Pendidikan', icon: Icons.cat_education, color: 'var(--cat-education)', type: 'expense' },
  tax:           { name: 'Pajak', icon: Icons.cat_tax, color: 'var(--cat-tax)', type: 'expense' },
  charity:       { name: 'Sedekah/Donasi', icon: Icons.cat_charity, color: 'var(--cat-charity)', type: 'expense' },
  installment:   { name: 'Cicilan', icon: Icons.cat_installment, color: 'var(--cat-installment)', type: 'expense' },
  // Income
  salary:        { name: 'Gaji Bulanan', icon: Icons.cat_salary, color: 'var(--cat-salary)', type: 'income' },
  bonus:         { name: 'Bonus/THR', icon: Icons.cat_bonus, color: 'var(--cat-bonus)', type: 'income' },
  sales:         { name: 'Hasil Penjualan', icon: Icons.cat_sales, color: 'var(--cat-sales)', type: 'income' },
  investment:    { name: 'Dividen/Investasi', icon: Icons.cat_investment, color: 'var(--cat-investment)', type: 'income' },
  allowance:     { name: 'Uang Saku', icon: Icons.cat_allowance, color: 'var(--cat-allowance)', type: 'income' },
  refund:        { name: 'Kembalian', icon: Icons.cat_refund, color: 'var(--cat-refund)', type: 'income' },
  gift:          { name: 'Hibah/Hadiah', icon: Icons.cat_gift, color: 'var(--cat-gift)', type: 'income' },
};

// ── Wallet Type Definitions ──
const WALLET_TYPES = {
  bank:    { name: 'Bank', icon: Icons.wallet_bank },
  ewallet: { name: 'E-Wallet', icon: Icons.wallet_ewallet },
  cash:    { name: 'Cash', icon: Icons.wallet_cash },
};
