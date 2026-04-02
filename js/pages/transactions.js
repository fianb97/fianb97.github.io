// ========================================
// MyWallet — Transactions Page
// ========================================

function renderTransactions(container) {
  let currentFilter = { type: '', walletId: '', category: '' };

  function render() {
    const transactions = Store.getTransactions(currentFilter);
    const wallets = Store.getWallets();
    const incomeTotal = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenseTotal = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    // Group by date
    const grouped = {};
    transactions.forEach(tx => {
      const group = Utils.formatDateGroup(tx.date);
      if (!grouped[group]) grouped[group] = [];
      grouped[group].push(tx);
    });

    container.innerHTML = `
      <!-- Summary -->
      <div class="stat-row section">
        <div class="stat-item">
          <div class="stat-item__label">Pemasukan</div>
          <div class="stat-item__value text-income mono">+${Utils.formatRupiah(incomeTotal)}</div>
        </div>
        <div class="stat-item">
          <div class="stat-item__label">Pengeluaran</div>
          <div class="stat-item__value text-expense mono">-${Utils.formatRupiah(expenseTotal)}</div>
        </div>
        <div class="stat-item">
          <div class="stat-item__label">Selisih</div>
          <div class="stat-item__value mono" style="color:${incomeTotal - expenseTotal >= 0 ? 'var(--color-income)' : 'var(--color-expense)'}">
            ${Utils.formatRupiah(incomeTotal - expenseTotal, true)}
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filter-bar">
        <select id="filter-type">
          <option value="">Semua Tipe</option>
          <option value="income" ${currentFilter.type === 'income' ? 'selected' : ''}>Pemasukan</option>
          <option value="expense" ${currentFilter.type === 'expense' ? 'selected' : ''}>Pengeluaran</option>
        </select>
        <select id="filter-wallet">
          <option value="">Semua Dompet</option>
          ${wallets.map(w => `<option value="${w.id}" ${currentFilter.walletId === w.id ? 'selected' : ''}>${Utils.escapeHtml(w.name)}</option>`).join('')}
        </select>
      </div>

      <!-- Transaction List -->
      <div class="card">
        ${transactions.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state__icon">📋</div>
            <div class="empty-state__title">Belum Ada Transaksi</div>
            <div class="empty-state__desc">Klik tombol + untuk menambahkan transaksi baru</div>
          </div>
        ` : Object.entries(grouped).map(([date, txs]) => `
          <div class="date-group">${date}</div>
          ${txs.map(tx => renderTxRow(tx)).join('')}
        `).join('<div class="divider"></div>')}
      </div>
    `;

    // Filter events
    container.querySelector('#filter-type').addEventListener('change', (e) => {
      currentFilter.type = e.target.value;
      render();
    });
    container.querySelector('#filter-wallet').addEventListener('change', (e) => {
      currentFilter.walletId = e.target.value;
      render();
    });

    // Click on tx row to delete
    container.querySelectorAll('.tx-row').forEach(row => {
      row.addEventListener('click', () => {
        const txId = row.dataset.txId;
        if (!txId) return;
        const tx = Store.getTransactions({}).find(t => t.id === txId);
        if (!tx) return;
        const cat = CATEGORIES[tx.category] || { name: tx.category };

        Modal.open('Detail Transaksi', `
          <div style="text-align:center;margin-bottom:20px;">
            <div style="font-size:48px;margin-bottom:8px;">${(CATEGORIES[tx.category] || {}).icon || '📌'}</div>
            <div class="mono" style="font-size:var(--fs-2xl);font-weight:700;color:${tx.type === 'income' ? 'var(--color-income)' : 'var(--color-expense)'}">
              ${tx.type === 'income' ? '+' : '-'}${Utils.formatRupiah(tx.amount)}
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:12px;">
            <div style="display:flex;justify-content:space-between;"><span class="text-secondary">Kategori</span><span>${cat.name}</span></div>
            <div style="display:flex;justify-content:space-between;"><span class="text-secondary">Dompet</span><span>${(Store.getWallet(tx.walletId) || {}).name || '—'}</span></div>
            <div style="display:flex;justify-content:space-between;"><span class="text-secondary">Tanggal</span><span>${Utils.formatDate(tx.date)}</span></div>
            ${tx.note ? `<div style="display:flex;justify-content:space-between;"><span class="text-secondary">Catatan</span><span>${Utils.escapeHtml(tx.note)}</span></div>` : ''}
          </div>
        `, {
          footerHtml: `
            <button class="btn btn--danger btn--sm" id="modal-delete-tx">🗑️ Hapus</button>
            <button class="btn btn--secondary btn--sm" onclick="Modal.close()">Tutup</button>
          `,
          onOpen() {
            document.getElementById('modal-delete-tx').addEventListener('click', () => {
              Store.deleteTransaction(txId);
              Modal.close();
              render();
              Toast.show('Transaksi dihapus', 'success');
            });
          }
        });
      });
    });
  }

  render();
}

// ── Transaction Form (Modal) ──
function openTransactionForm(prefill = {}) {
  let selectedType = prefill.type || 'expense';
  let selectedCategory = prefill.category || '';
  let selectedWalletId = prefill.walletId || '';

  function getFormHtml() {
    return `
      <div class="form-group">
        <div class="tab-switcher" id="tx-type-tabs">
          <button class="tab-switcher__tab ${selectedType === 'expense' ? 'active' : ''}" data-type="expense">Pengeluaran</button>
          <button class="tab-switcher__tab ${selectedType === 'income' ? 'active' : ''}" data-type="income">Pemasukan</button>
        </div>
      </div>

      <div class="form-group">
        <label class="form-group__label">Jumlah (Rp)</label>
        <input type="text" id="tx-amount" placeholder="Rp 0" inputmode="numeric" value="${prefill.amount ? 'Rp ' + new Intl.NumberFormat('id-ID').format(prefill.amount) : ''}" style="font-family:var(--font-mono);font-size:var(--fs-xl);text-align:center;font-weight:700;">
      </div>

      <div id="tx-cat-container">
        ${renderCategorySelector(selectedType, selectedCategory)}
      </div>

      <div id="tx-wallet-container">
        ${renderWalletSelector(selectedWalletId)}
      </div>

      <div class="form-group">
        <label class="form-group__label">Tanggal</label>
        <input type="date" id="tx-date" value="${prefill.date || Utils.today()}">
      </div>

      <div class="form-group">
        <label class="form-group__label">Catatan (opsional)</label>
        <input type="text" id="tx-note" placeholder="Makan siang di kantin..." value="${prefill.note || ''}">
      </div>
    `;
  }

  Modal.open('Catat Transaksi', getFormHtml(), {
    footerHtml: `<button class="btn btn--primary btn--full" id="tx-save-btn">💾 Simpan Transaksi</button>`,
    onOpen(overlay) {
      function bindEvents() {
        // Format amount input
        const amtInput = overlay.querySelector('#tx-amount');
        if (amtInput) {
          amtInput.addEventListener('input', (e) => {
            const val = Utils.parseRupiah(e.target.value);
            e.target.value = val > 0 ? 'Rp ' + new Intl.NumberFormat('id-ID').format(val) : '';
          });
          amtInput.focus();
        }

        // Type tabs
        overlay.querySelectorAll('#tx-type-tabs .tab-switcher__tab').forEach(tab => {
          tab.addEventListener('click', () => {
            selectedType = tab.dataset.type;
            selectedCategory = '';
            overlay.querySelectorAll('#tx-type-tabs .tab-switcher__tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            overlay.querySelector('#tx-cat-container').innerHTML = renderCategorySelector(selectedType, '');
            bindCategoryEvents();
          });
        });

        bindCategoryEvents();
        bindWalletEvents();
      }

      function bindCategoryEvents() {
        overlay.querySelectorAll('.cat-grid__item').forEach(item => {
          item.addEventListener('click', () => {
            overlay.querySelectorAll('.cat-grid__item').forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            selectedCategory = item.dataset.category;
          });
        });
      }

      function bindWalletEvents() {
        overlay.querySelectorAll('.wallet-chip').forEach(chip => {
          chip.addEventListener('click', () => {
            overlay.querySelectorAll('.wallet-chip').forEach(c => c.classList.remove('selected'));
            chip.classList.add('selected');
            selectedWalletId = chip.dataset.walletId;
          });
        });
      }

      bindEvents();

      // Save
      overlay.querySelector('#tx-save-btn').addEventListener('click', () => {
        const amount = Utils.parseRupiah(overlay.querySelector('#tx-amount').value);
        const date = overlay.querySelector('#tx-date').value;
        const note = overlay.querySelector('#tx-note').value.trim();

        if (!amount || amount <= 0) { Toast.show('Masukkan jumlah transaksi', 'warning'); return; }
        if (!selectedCategory) { Toast.show('Pilih kategori', 'warning'); return; }
        if (!selectedWalletId) { Toast.show('Pilih sumber dana', 'warning'); return; }

        Store.addTransaction({
          type: selectedType,
          amount,
          category: selectedCategory,
          walletId: selectedWalletId,
          date,
          note
        });

        Modal.close();
        Router.handleRoute();
        const cat = CATEGORIES[selectedCategory];
        Toast.show(`${cat.icon} ${selectedType === 'income' ? 'Pemasukan' : 'Pengeluaran'} ${Utils.formatRupiah(amount)} dicatat!`, 'success');
      });
    }
  });
}
