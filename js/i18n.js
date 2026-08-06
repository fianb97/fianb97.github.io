// ========================================
// MyWallet — Internationalization (i18n)
// ========================================

const I18n = {
  currentLang: 'id', // 'id' | 'en'

  setLang(lang) {
    if (lang === 'id' || lang === 'en') {
      this.currentLang = lang;
      if (typeof Store !== 'undefined' && Store.setLanguage) {
        Store.setLanguage(lang);
      }
    }
  },

  getLang() {
    return this.currentLang;
  },

  translations: {
    id: {
      // General & Header
      appName: 'MyWallet',
      dashboard: 'Dashboard',
      activity: 'Transaksi',
      wallets: 'Dompet',
      debts: 'Hutang & Piutang',
      assistant: 'Asisten AI',
      settings: 'Pengaturan',
      language: 'Bahasa',
      langIndonesian: 'Bahasa Indonesia 🇮🇩',
      langEnglish: 'English 🇬🇧',

      // Dashboard
      totalBalance: 'TOTAL SALDO',
      adjustedBalance: 'Total Saldo (Disesuaikan)',
      income: 'Pemasukan',
      expense: 'Pengeluaran',
      netBalance: 'Selisih',
      debtsLabel: 'Hutang',
      receivablesLabel: 'Piutang',
      expenseDistribution: 'Pengeluaran',
      activeWallets: 'Dompet Aktif',
      recentActivity: 'Aktivitas Terakhir',
      viewAll: 'Lihat Semua',
      seeAll: 'Lihat Semua',
      noExpensesYet: 'Belum ada data pengeluaran',
      noWalletsYet: 'Belum ada dompet',
      noTxYet: 'Belum ada transaksi',
      noTxDesc: 'Tekan tombol + untuk mencatat transaksi pertamamu',
      today: 'Hari Ini',
      yesterday: 'Kemarin',

      // Transactions Page
      transactionsTitle: 'Transaksi',
      transactionsSubtitle: 'Kelola dan pantau arus kas Anda',
      periodDay: 'Hari',
      periodWeek: 'Minggu',
      periodMonth: 'Bulan',
      periodYear: 'Tahun',
      searchPlaceholder: 'Cari catatan, kategori, atau jumlah...',
      filterAll: 'Tipe: Semua',
      filterIncome: 'Tipe: Pemasukan',
      filterExpense: 'Tipe: Pengeluaran',
      filterWalletAll: 'Dompet: Semua',
      viewDays: 'Lihat Hari',
      viewWeeks: 'Lihat Minggu',
      viewMonths: 'Lihat Bulan',
      viewChart: 'Lihat Diagram',

      // Wallets Page
      walletsTitle: 'Dompet Anda',
      walletsSubtitle: 'Kelola akun, kartu, dan tunai Anda di satu tempat',
      totalCombinedBalance: 'TOTAL SALDO GABUNGAN',
      activeAccounts: 'Akun Aktif',
      createNewWallet: 'Tambah Dompet Baru',
      addWallet: 'Tambah Dompet',
      transfer: 'Transfer',
      balance: 'SALDO',

      // Debts Page
      debtsTitle: 'Hutang & Piutang',
      debtsSubtitle: 'Kelola pinjaman dan piutang Anda dengan mudah',
      totalReceivablesCard: 'TOTAL PIUTANG',
      totalDebtsCard: 'TOTAL HUTANG',
      netDifferenceCard: 'SELISIH BERSIH',
      activeStatus: 'Aktif',
      paidStatus: 'Lunas',
      addRecord: 'Catat Baru',
      noDebtsActive: 'Tidak ada catatan aktif',
      noDebtsPaid: 'Belum ada riwayat lunas',
      markPaid: 'Lunas',

      // AI Assistant Page
      aiTitle: 'AI Financial Assistant',
      aiDesc: 'Saya bisa membantu mencatat transaksi, mengecek saldo, atau memberikan tips keuangan.',
      aiInputPlaceholder: 'Tuliskan transaksi atau pertanyaan...',
      promptBalance: 'Berapa saldo saya?',
      promptExpense: 'Pengeluaran minggu ini',
      promptTips: 'Kasih tips keuangan',

      // Form Modals
      recordTx: 'Catat Transaksi',
      editTx: 'Edit Transaksi',
      amountRp: 'Jumlah (Rp)',
      selectCategory: 'Kategori',
      addCategory: 'Tambah Kategori',
      selectWallet: 'Sumber Dana',
      dateLabel: 'Tanggal',
      noteLabel: 'Catatan (opsional)',
      save: 'Simpan',
      delete: 'Hapus',
      close: 'Tutup',
      cancel: 'Batal',

      // Settings Page
      settingsSubtitle: 'Kelola preferensi bahasa dan cadangan data aplikasi',
      selectLangDesc: 'Pilih bahasa tampilan aplikasi',
      themeTitle: 'Tema Tampilan',
      themeDesc: 'Sesuaikan mode tampilan visual aplikasi',
      themeLight: 'Mode Terang ☀️',
      themeDark: 'Mode Gelap (Verdant Night) 🌙',
      dataManagement: 'Manajemen Data',
      dataBackupDesc: 'Export dan import file cadangan JSON'
    },

    en: {
      // General & Header
      appName: 'MyWallet',
      dashboard: 'Dashboard',
      activity: 'Activity',
      wallets: 'Wallets',
      debts: 'Debts & Credit',
      assistant: 'AI Assistant',
      settings: 'Settings',
      language: 'Language',
      langIndonesian: 'Bahasa Indonesia 🇮🇩',
      langEnglish: 'English 🇬🇧',

      // Dashboard
      totalBalance: 'TOTAL BALANCE',
      adjustedBalance: 'Total Balance (Adjusted)',
      income: 'Income',
      expense: 'Expense',
      netBalance: 'Net Balance',
      debtsLabel: 'Debts',
      receivablesLabel: 'Receivables',
      expenseDistribution: 'Expense Distribution',
      activeWallets: 'Active Wallets',
      recentActivity: 'Recent Activity',
      viewAll: 'View All',
      seeAll: 'See All',
      noExpensesYet: 'No expense data recorded yet',
      noWalletsYet: 'No active wallets found',
      noTxYet: 'No transactions recorded',
      noTxDesc: 'Tap + button to record your first transaction',
      today: 'Today',
      yesterday: 'Yesterday',

      // Transactions Page
      transactionsTitle: 'Transactions',
      transactionsSubtitle: 'Track and manage your cash flow',
      periodDay: 'Day',
      periodWeek: 'Week',
      periodMonth: 'Month',
      periodYear: 'Year',
      searchPlaceholder: 'Search notes, categories, or amounts...',
      filterAll: 'Type: All',
      filterIncome: 'Type: Income',
      filterExpense: 'Type: Expense',
      filterWalletAll: 'Wallet: All',
      viewDays: 'View Days',
      viewWeeks: 'View Weeks',
      viewMonths: 'View Months',
      viewChart: 'View Chart',

      // Wallets Page
      walletsTitle: 'Your Wallets',
      walletsSubtitle: 'Manage your accounts, cards, and cash in one place',
      totalCombinedBalance: 'TOTAL COMBINED BALANCE',
      activeAccounts: 'Active Accounts',
      createNewWallet: 'Create New Wallet',
      addWallet: 'Add Wallet',
      transfer: 'Transfer',
      balance: 'BALANCE',

      // Debts Page
      debtsTitle: 'Debts & Receivables',
      debtsSubtitle: 'Easily track and manage loans and receivables',
      totalReceivablesCard: 'TOTAL RECEIVABLES',
      totalDebtsCard: 'TOTAL DEBTS',
      netDifferenceCard: 'NET BALANCE',
      activeStatus: 'Active',
      paidStatus: 'Paid',
      addRecord: 'Add Record',
      noDebtsActive: 'No active records found',
      noDebtsPaid: 'No paid history yet',
      markPaid: 'Mark Paid',

      // AI Assistant Page
      aiTitle: 'AI Financial Assistant',
      aiDesc: 'I can help log transactions, check your balances, or provide financial insights.',
      aiInputPlaceholder: 'Type a transaction or question...',
      promptBalance: 'What is my balance?',
      promptExpense: 'Expense this week',
      promptTips: 'Give me financial tips',

      // Form Modals
      recordTx: 'Record Transaction',
      editTx: 'Edit Transaction',
      amountRp: 'Amount (Rp)',
      selectCategory: 'Category',
      addCategory: 'Add Category',
      selectWallet: 'Wallet / Fund',
      dateLabel: 'Date',
      noteLabel: 'Note (optional)',
      save: 'Save',
      delete: 'Delete',
      close: 'Close',
      cancel: 'Cancel',

      // Settings Page
      settingsSubtitle: 'Manage language preferences and app data backup',
      selectLangDesc: 'Choose app display language',
      themeTitle: 'Display Theme',
      themeDesc: 'Customize app visual theme appearance',
      themeLight: 'Light Mode ☀️',
      themeDark: 'Dark Mode (Verdant Night) 🌙',
      dataManagement: 'Data Management',
      dataBackupDesc: 'Export and import JSON backup files'
    }
  },

  // Translate helper function t('key')
  t(key) {
    const lang = this.currentLang;
    if (this.translations[lang] && this.translations[lang][key]) {
      return this.translations[lang][key];
    }
    // Fallback to Indonesian if missing
    if (this.translations.id && this.translations.id[key]) {
      return this.translations.id[key];
    }
    return key;
  }
};

// Global helper alias t('key')
function t(key) {
  return I18n.t(key);
}
