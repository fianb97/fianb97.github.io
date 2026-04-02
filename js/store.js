// ========================================
// MyWallet — State Management (Store)
// ========================================

const Store = {
  STORAGE_KEY: 'mywallet_data',

  // Default state
  defaultState() {
    return {
      wallets: [],
      transactions: [],
      debts: [],
      settings: { setupComplete: false, currency: 'IDR' }
    };
  },

  // Load from localStorage
  load() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Merge with defaults to handle new fields
        return { ...this.defaultState(), ...parsed };
      }
    } catch (e) {
      console.error('Store load error:', e);
    }
    return this.defaultState();
  },

  // Save to localStorage
  save(state) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Store save error:', e);
    }
  },

  // Get current state
  getState() {
    return this.load();
  },

  // ── Wallet Operations ──

  addWallet(wallet) {
    const state = this.load();
    const newWallet = {
      id: Utils.id(),
      name: wallet.name,
      type: wallet.type,        // 'bank' | 'ewallet' | 'cash'
      balance: wallet.balance || 0,
      icon: wallet.icon || WALLET_TYPES[wallet.type]?.icon || Icons.wallet_bank,
      color: wallet.color || '#7c5cfc',
      createdAt: Date.now()
    };
    state.wallets.push(newWallet);
    this.save(state);
    return newWallet;
  },

  updateWallet(id, updates) {
    const state = this.load();
    const idx = state.wallets.findIndex(w => w.id === id);
    if (idx !== -1) {
      state.wallets[idx] = { ...state.wallets[idx], ...updates };
      this.save(state);
      return state.wallets[idx];
    }
    return null;
  },

  deleteWallet(id) {
    const state = this.load();
    state.wallets = state.wallets.filter(w => w.id !== id);
    this.save(state);
  },

  getWallet(id) {
    const state = this.load();
    return state.wallets.find(w => w.id === id) || null;
  },

  getWallets() {
    return this.load().wallets;
  },

  getTotalBalance() {
    return this.getWallets().reduce((sum, w) => sum + w.balance, 0);
  },

  // ── Transaction Operations ──

  addTransaction(tx) {
    const state = this.load();
    const newTx = {
      id: Utils.id(),
      type: tx.type,             // 'income' | 'expense'
      amount: Math.abs(tx.amount),
      category: tx.category,
      walletId: tx.walletId,
      date: tx.date || Utils.today(),
      note: tx.note || '',
      createdAt: Date.now()
    };

    // Update wallet balance
    const wIdx = state.wallets.findIndex(w => w.id === tx.walletId);
    if (wIdx !== -1) {
      if (tx.type === 'income') {
        state.wallets[wIdx].balance += newTx.amount;
      } else {
        state.wallets[wIdx].balance -= newTx.amount;
      }
    }

    state.transactions.push(newTx);
    this.save(state);
    return newTx;
  },

  updateTransaction(id, updates) {
    const state = this.load();
    const txIdx = state.transactions.findIndex(t => t.id === id);
    if (txIdx === -1) return null;

    const oldTx = state.transactions[txIdx];

    // Reverse old wallet balance
    const oldWIdx = state.wallets.findIndex(w => w.id === oldTx.walletId);
    if (oldWIdx !== -1) {
      if (oldTx.type === 'income') {
        state.wallets[oldWIdx].balance -= oldTx.amount;
      } else {
        state.wallets[oldWIdx].balance += oldTx.amount;
      }
    }

    // Apply updates
    const newTx = { ...oldTx, ...updates, amount: Math.abs(updates.amount || oldTx.amount) };
    state.transactions[txIdx] = newTx;

    // Apply new wallet balance
    const newWIdx = state.wallets.findIndex(w => w.id === newTx.walletId);
    if (newWIdx !== -1) {
      if (newTx.type === 'income') {
        state.wallets[newWIdx].balance += newTx.amount;
      } else {
        state.wallets[newWIdx].balance -= newTx.amount;
      }
    }

    this.save(state);
    return newTx;
  },

  deleteTransaction(id) {
    const state = this.load();
    const tx = state.transactions.find(t => t.id === id);
    if (!tx) return;

    // Reverse wallet balance
    const wIdx = state.wallets.findIndex(w => w.id === tx.walletId);
    if (wIdx !== -1) {
      if (tx.type === 'income') {
        state.wallets[wIdx].balance -= tx.amount;
      } else {
        state.wallets[wIdx].balance += tx.amount;
      }
    }

    state.transactions = state.transactions.filter(t => t.id !== id);
    this.save(state);
  },

  getTransactions(filters = {}) {
    let txs = this.load().transactions;

    if (filters.type) txs = txs.filter(t => t.type === filters.type);
    if (filters.walletId) txs = txs.filter(t => t.walletId === filters.walletId);
    if (filters.category) txs = txs.filter(t => t.category === filters.category);
    if (filters.dateFrom) txs = txs.filter(t => t.date >= filters.dateFrom);
    if (filters.dateTo) txs = txs.filter(t => t.date <= filters.dateTo);
    if (filters.currentMonth) txs = txs.filter(t => Utils.isCurrentMonth(t.date));

    // Sort newest first
    txs.sort((a, b) => b.createdAt - a.createdAt);
    return txs;
  },

  getMonthlyIncome() {
    return this.getTransactions({ type: 'income', currentMonth: true })
      .reduce((s, t) => s + t.amount, 0);
  },

  getMonthlyExpense() {
    return this.getTransactions({ type: 'expense', currentMonth: true })
      .reduce((s, t) => s + t.amount, 0);
  },

  getExpenseByCategory() {
    const txs = this.getTransactions({ type: 'expense', currentMonth: true });
    const map = {};
    txs.forEach(t => {
      if (!map[t.category]) map[t.category] = 0;
      map[t.category] += t.amount;
    });
    return Object.entries(map)
      .map(([cat, amount]) => ({ category: cat, amount }))
      .sort((a, b) => b.amount - a.amount);
  },

  // ── Debt Operations ──

  addDebt(debt) {
    const state = this.load();
    const newDebt = {
      id: Utils.id(),
      type: debt.type,           // 'debt' | 'receivable'
      personName: debt.personName,
      amount: Math.abs(debt.amount),
      walletId: debt.walletId,
      date: debt.date || Utils.today(),
      note: debt.note || '',
      isPaid: false,
      paidDate: null,
      createdAt: Date.now()
    };

    // Update wallet balance
    const wIdx = state.wallets.findIndex(w => w.id === debt.walletId);
    if (wIdx !== -1) {
      if (debt.type === 'receivable') {
        // Piutang: uang keluar dari wallet
        state.wallets[wIdx].balance -= newDebt.amount;
      } else {
        // Hutang: uang masuk ke wallet
        state.wallets[wIdx].balance += newDebt.amount;
      }
    }

    state.debts.push(newDebt);
    this.save(state);
    return newDebt;
  },

  markDebtPaid(id) {
    const state = this.load();
    const dIdx = state.debts.findIndex(d => d.id === id);
    if (dIdx === -1) return;

    const debt = state.debts[dIdx];
    debt.isPaid = true;
    debt.paidDate = Utils.today();

    // Reverse wallet balance
    const wIdx = state.wallets.findIndex(w => w.id === debt.walletId);
    if (wIdx !== -1) {
      if (debt.type === 'receivable') {
        // Piutang lunas: uang kembali ke wallet
        state.wallets[wIdx].balance += debt.amount;
      } else {
        // Hutang lunas: uang keluar dari wallet
        state.wallets[wIdx].balance -= debt.amount;
      }
    }

    this.save(state);
  },

  deleteDebt(id) {
    const state = this.load();
    const debt = state.debts.find(d => d.id === id);
    if (!debt) return;

    // If not paid, reverse wallet balance
    if (!debt.isPaid) {
      const wIdx = state.wallets.findIndex(w => w.id === debt.walletId);
      if (wIdx !== -1) {
        if (debt.type === 'receivable') {
          state.wallets[wIdx].balance += debt.amount;
        } else {
          state.wallets[wIdx].balance -= debt.amount;
        }
      }
    }

    state.debts = state.debts.filter(d => d.id !== id);
    this.save(state);
  },

  getDebts(filters = {}) {
    let debts = this.load().debts;
    if (filters.type) debts = debts.filter(d => d.type === filters.type);
    if (filters.isPaid !== undefined) debts = debts.filter(d => d.isPaid === filters.isPaid);
    debts.sort((a, b) => b.createdAt - a.createdAt);
    return debts;
  },

  getTotalDebt() {
    return this.getDebts({ type: 'debt', isPaid: false }).reduce((s, d) => s + d.amount, 0);
  },

  getTotalReceivable() {
    return this.getDebts({ type: 'receivable', isPaid: false }).reduce((s, d) => s + d.amount, 0);
  },

  // ── Settings ──

  completeSetup() {
    const state = this.load();
    state.settings.setupComplete = true;
    this.save(state);
  },

  isSetupComplete() {
    return this.load().settings.setupComplete;
  },

  // Transfer between wallets
  transfer(fromId, toId, amount) {
    const state = this.load();
    const fromIdx = state.wallets.findIndex(w => w.id === fromId);
    const toIdx = state.wallets.findIndex(w => w.id === toId);
    if (fromIdx === -1 || toIdx === -1) return false;
    if (state.wallets[fromIdx].balance < amount) return false;
    state.wallets[fromIdx].balance -= amount;
    state.wallets[toIdx].balance += amount;
    this.save(state);
    return true;
  },

  // Export all data as JSON
  exportData() {
    return JSON.stringify(this.load(), null, 2);
  },

  // Import data from JSON
  importData(jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      this.save(data);
      return true;
    } catch (e) {
      return false;
    }
  }
};
