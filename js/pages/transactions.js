// ========================================
// MyWallet — Transactions Page
// ========================================

function renderTransactions(container) {
  let currentPeriod = 'daily'; // 'daily' | 'weekly' | 'monthly'
  let currentFilter = { type: '', walletId: '' };
  let navDate = new Date(); // reference date for navigation
  let expandedGroups = new Set(); // track which groups are expanded

  // ── Helper: get days (Mon-Sun) of the week containing navDate ──
  function getDaysOfWeek() {
    const d = new Date(navDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.getFullYear(), d.getMonth(), diff);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const dt = new Date(monday);
      dt.setDate(monday.getDate() + i);
      const dateStr = dt.toISOString().split('T')[0];
      days.push({
        startStr: dateStr,
        endStr: dateStr,
        label: dt.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }),
        shortLabel: dt.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' })
      });
    }
    return days;
  }

  // ── Helper: get week navigation label ──
  function getWeekNavLabel() {
    const days = getDaysOfWeek();
    const mon = new Date(days[0].startStr);
    const sun = new Date(days[6].startStr);
    return `${mon.getDate()} - ${sun.getDate()} ${sun.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`;
  }

  // ── Helper: get weeks of the month containing navDate ──
  function getWeeksOfMonth() {
    const year = navDate.getFullYear();
    const month = navDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const weeks = [];
    // Start from Monday on or before the 1st
    let weekStart = new Date(firstDay);
    const startDow = weekStart.getDay();
    if (startDow !== 1) {
      weekStart.setDate(weekStart.getDate() - (startDow === 0 ? 6 : startDow - 1));
    }

    let weekNum = 1;
    while (weekStart <= lastDay) {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const rangeStartDate = weekStart.getDate();
      const rangeEndDate = weekEnd.getDate();
      const rangeStartMonth = weekStart.toLocaleDateString('id-ID', { month: 'short' });
      const rangeEndMonth = weekEnd.toLocaleDateString('id-ID', { month: 'short' });

      let sublabel;
      if (weekStart.getMonth() === weekEnd.getMonth()) {
        sublabel = `${rangeStartDate} - ${rangeEndDate} ${rangeEndMonth}`;
      } else {
        sublabel = `${rangeStartDate} ${rangeStartMonth} - ${rangeEndDate} ${rangeEndMonth}`;
      }

      weeks.push({
        startStr: weekStart.toISOString().split('T')[0],
        endStr: weekEnd.toISOString().split('T')[0],
        label: `Minggu ke ${weekNum}`,
        sublabel: sublabel,
        weekNum
      });

      weekStart = new Date(weekStart);
      weekStart.setDate(weekStart.getDate() + 7);
      weekNum++;
    }
    return weeks;
  }

  // ── Helper: get months of the year ──
  function getMonthsOfYear() {
    const year = navDate.getFullYear();
    const months = [];
    for (let m = 0; m < 12; m++) {
      const first = new Date(year, m, 1);
      const last = new Date(year, m + 1, 0);
      months.push({
        startStr: first.toISOString().split('T')[0],
        endStr: last.toISOString().split('T')[0],
        label: first.toLocaleDateString('id-ID', { month: 'long' }),
        sublabel: year.toString()
      });
    }
    return months;
  }

  // ── Navigation label & step ──
  function getNavLabel() {
    if (currentPeriod === 'daily') return getWeekNavLabel();
    if (currentPeriod === 'weekly') return navDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    return navDate.getFullYear().toString();
  }

  function navPrev() {
    if (currentPeriod === 'daily') navDate.setDate(navDate.getDate() - 7);
    else if (currentPeriod === 'weekly') navDate.setMonth(navDate.getMonth() - 1);
    else navDate.setFullYear(navDate.getFullYear() - 1);
    expandedGroups.clear();
    render();
  }
  function navNext() {
    if (currentPeriod === 'daily') navDate.setDate(navDate.getDate() + 7);
    else if (currentPeriod === 'weekly') navDate.setMonth(navDate.getMonth() + 1);
    else navDate.setFullYear(navDate.getFullYear() + 1);
    expandedGroups.clear();
    render();
  }

  // ── Get period groups ──
  function getPeriodGroups() {
    if (currentPeriod === 'daily') return getDaysOfWeek();
    if (currentPeriod === 'weekly') return getWeeksOfMonth();
    return getMonthsOfYear();
  }

  // ── Filter transactions for a date range ──
  function getTxForRange(startStr, endStr) {
    let txs = Store.getTransactions(currentFilter);
    return txs.filter(t => t.date >= startStr && t.date <= endStr);
  }

  // ── Render a period group card ──
  function renderPeriodGroup(group, idx) {
    const txs = getTxForRange(group.startStr, group.endStr);
    const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const balance = income - expense;
    const hasTx = txs.length > 0;
    const isExpanded = expandedGroups.has(idx);
    const today = Utils.today();
    const isToday = currentPeriod === 'daily' && group.startStr === today;

    return `
      <div class="period-group ${isToday ? 'period-group--today' : ''} ${hasTx ? '' : 'period-group--empty'}" data-group-idx="${idx}">
        <div class="period-group__header" data-toggle="${idx}">
          <div class="period-group__left">
            <div class="period-group__label">${group.label}${isToday ? ' <span style="color:var(--accent-secondary);font-size:var(--fs-xs);font-weight:600;">● HARI INI</span>' : ''}</div>
            ${group.sublabel ? `<div class="period-group__sublabel">${group.sublabel}</div>` : ''}
          </div>
          <div class="period-group__summary">
            <span class="period-group__stat text-income mono">+${Utils.formatShort(income)}</span>
            <span class="period-group__stat text-expense mono">-${Utils.formatShort(expense)}</span>
            <span class="period-group__stat mono" style="color:${balance >= 0 ? 'var(--color-income)' : 'var(--color-expense)'}; font-weight:700;">
              ${balance >= 0 ? '+' : ''}${Utils.formatShort(balance)}
            </span>
          </div>
          <div class="period-group__arrow ${isExpanded ? 'expanded' : ''}">${Icons.arrowDown}</div>
        </div>
        <div class="period-group__body ${isExpanded ? 'expanded' : ''}">
          ${hasTx ? txs.map(tx => renderTxRow(tx)).join('') : `
            <div style="padding:var(--space-base);text-align:center;color:var(--text-muted);font-size:var(--fs-sm);">
              Tidak ada transaksi
            </div>
          `}
        </div>
      </div>
    `;
  }

  // ── Main render ──
  function render() {
    const wallets = Store.getWallets();
    const groups = getPeriodGroups();

    // Calculate grand totals for the visible period range
    const allStart = groups[0]?.startStr || '';
    const allEnd = groups[groups.length - 1]?.endStr || '';
    const allTxs = getTxForRange(allStart, allEnd);
    const totalIncome = allTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = allTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const totalBalance = totalIncome - totalExpense;

    container.innerHTML = `
      <!-- Period Tabs -->
      <div class="tab-switcher section" id="period-tabs" style="animation:fadeInUp .4s var(--ease-out)">
        <button class="tab-switcher__tab ${currentPeriod === 'daily' ? 'active' : ''}" data-period="daily">Harian</button>
        <button class="tab-switcher__tab ${currentPeriod === 'weekly' ? 'active' : ''}" data-period="weekly">Mingguan</button>
        <button class="tab-switcher__tab ${currentPeriod === 'monthly' ? 'active' : ''}" data-period="monthly">Bulanan</button>
      </div>

      <!-- Navigation -->
      <div class="period-nav section" style="animation:fadeInUp .45s var(--ease-out)">
        <button class="btn btn--ghost btn--icon" id="nav-prev">${Icons.arrowUp}</button>
        <div class="period-nav__label">${getNavLabel()}</div>
        <button class="btn btn--ghost btn--icon" id="nav-next">${Icons.arrowDown}</button>
      </div>

      <!-- Grand Total Summary -->
      <div class="card section" style="animation:fadeInUp .5s var(--ease-out);padding:var(--space-base) var(--space-lg);">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
          <div style="display:flex;align-items:center;gap:16px;">
            <div>
              <div style="font-size:var(--fs-xs);color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em;">Pemasukan</div>
              <div class="mono text-income" style="font-weight:600;">+${Utils.formatRupiah(totalIncome)}</div>
            </div>
            <div>
              <div style="font-size:var(--fs-xs);color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em;">Pengeluaran</div>
              <div class="mono text-expense" style="font-weight:600;">-${Utils.formatRupiah(totalExpense)}</div>
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:var(--fs-xs);color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em;">Selisih</div>
            <div class="mono" style="font-weight:700;font-size:var(--fs-lg);color:${totalBalance >= 0 ? 'var(--color-income)' : 'var(--color-expense)'}">
              ${Utils.formatRupiah(totalBalance, true)}
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filter-bar" style="animation:fadeInUp .55s var(--ease-out)">
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

      <!-- Period Groups -->
      <div class="period-groups" style="animation:fadeInUp .6s var(--ease-out)">
        ${groups.map((g, i) => renderPeriodGroup(g, i)).join('')}
      </div>
    `;

    // ── Bind Events ──

    // Period tab switch
    container.querySelectorAll('#period-tabs .tab-switcher__tab').forEach(tab => {
      tab.addEventListener('click', () => {
        currentPeriod = tab.dataset.period;
        navDate = new Date();
        expandedGroups.clear();
        render();
      });
    });

    // Navigation
    container.querySelector('#nav-prev').addEventListener('click', navPrev);
    container.querySelector('#nav-next').addEventListener('click', navNext);

    // Filters
    container.querySelector('#filter-type').addEventListener('change', (e) => {
      currentFilter.type = e.target.value;
      render();
    });
    container.querySelector('#filter-wallet').addEventListener('change', (e) => {
      currentFilter.walletId = e.target.value;
      render();
    });

    // Toggle expand/collapse
    container.querySelectorAll('.period-group__header').forEach(header => {
      header.addEventListener('click', (e) => {
        // Don't toggle if clicking a tx-row inside
        if (e.target.closest('.tx-row')) return;
        const idx = parseInt(header.dataset.toggle);
        if (expandedGroups.has(idx)) {
          expandedGroups.delete(idx);
        } else {
          expandedGroups.add(idx);
        }
        render();
      });
    });

    // Click on tx row for detail
    container.querySelectorAll('.tx-row').forEach(row => {
      row.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent group toggle
        const txId = row.dataset.txId;
        if (!txId) return;
        const tx = Store.getTransactions({}).find(t => t.id === txId);
        if (!tx) return;
        showTxDetail(tx);
      });
    });
  }

  // ── Transaction Detail Modal ──
  function showTxDetail(tx) {
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
        <button class="btn btn--primary btn--sm" id="modal-edit-tx">${Icons.edit} Edit</button>
        <button class="btn btn--danger btn--sm" id="modal-delete-tx">${Icons.trash} Hapus</button>
        <button class="btn btn--secondary btn--sm" onclick="Modal.close()">Tutup</button>
      `,
      onOpen() {
        document.getElementById('modal-edit-tx').addEventListener('click', () => {
          Modal.close();
          setTimeout(() => {
            openTransactionForm({
              editId: tx.id, type: tx.type, amount: tx.amount,
              category: tx.category, walletId: tx.walletId,
              date: tx.date, note: tx.note || ''
            });
          }, 250);
        });
        document.getElementById('modal-delete-tx').addEventListener('click', () => {
          Store.deleteTransaction(tx.id);
          Modal.close();
          render();
          Toast.show('Transaksi dihapus', 'success');
        });
      }
    });
  }

  render();
}

// ── Transaction Form (Modal) ── supports create, edit & transfer
function openTransactionForm(prefill = {}) {
  const isEdit = !!prefill.editId;
  let selectedType = prefill.type || 'expense'; // 'expense' | 'income' | 'transfer'
  let selectedCategory = prefill.category || '';
  let selectedWalletId = prefill.walletId || '';
  let transferFromId = '';
  let transferToId = '';

  function getFormHtml() {
    const isTransfer = selectedType === 'transfer';

    return `
      <div class="form-group">
        <div class="tab-switcher" id="tx-type-tabs">
          <button class="tab-switcher__tab ${selectedType === 'expense' ? 'active' : ''}" data-type="expense">Pengeluaran</button>
          <button class="tab-switcher__tab ${selectedType === 'income' ? 'active' : ''}" data-type="income">Pemasukan</button>
          <button class="tab-switcher__tab ${selectedType === 'transfer' ? 'active' : ''}" data-type="transfer">Transfer</button>
        </div>
      </div>

      <div class="form-group">
        <label class="form-group__label">Jumlah (Rp)</label>
        <input type="text" id="tx-amount" placeholder="Rp 0" inputmode="numeric" value="${prefill.amount ? 'Rp ' + new Intl.NumberFormat('id-ID').format(prefill.amount) : ''}" style="font-family:var(--font-mono);font-size:var(--fs-xl);text-align:center;font-weight:700;">
      </div>

      ${isTransfer ? `
        <div class="form-group">
          <label class="form-group__label">Dari Dompet</label>
          <select id="tf-from" style="width:100%;">
            <option value="">-- Pilih dompet asal --</option>
            ${Store.getWallets().map(w => `<option value="${w.id}" ${w.id === transferFromId ? 'selected' : ''}>${Utils.escapeHtml(w.name)} (${Utils.formatRupiah(w.balance)})</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-group__label">Ke Dompet</label>
          <select id="tf-to" style="width:100%;">
            <option value="">-- Pilih dompet tujuan --</option>
            ${Store.getWallets().map(w => `<option value="${w.id}" ${w.id === transferToId ? 'selected' : ''}>${Utils.escapeHtml(w.name)}</option>`).join('')}
          </select>
        </div>
      ` : `
        <div id="tx-cat-container">
          ${renderCategorySelector(selectedType, selectedCategory)}
        </div>

        <div id="tx-wallet-container">
          ${renderWalletSelector(selectedWalletId)}
        </div>
      `}

      <div class="form-group">
        <label class="form-group__label">Tanggal</label>
        <input type="date" id="tx-date" value="${prefill.date || Utils.today()}">
      </div>

      <div class="form-group">
        <label class="form-group__label">Catatan (opsional)</label>
        <input type="text" id="tx-note" placeholder="${isTransfer ? 'Transfer dana antar dompet...' : 'Makan siang di kantin...'}" value="${prefill.note || ''}">
      </div>
    `;
  }

  const modalTitle = isEdit ? 'Edit Transaksi' : 'Catat Transaksi';
  const saveLabel = isEdit ? '💾 Simpan Perubahan' : '💾 Simpan';

  Modal.open(modalTitle, getFormHtml(), {
    footerHtml: `<button class="btn btn--primary btn--full" id="tx-save-btn">${saveLabel}</button>`,
    onOpen(overlay) {
      function rebuildForm() {
        const body = overlay.querySelector('#modal-body');
        if (body) {
          body.innerHTML = getFormHtml();
          bindEvents();
        }
      }

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
            selectedWalletId = '';
            transferFromId = '';
            transferToId = '';
            rebuildForm();
          });
        });

        // Only bind category/wallet if NOT transfer
        if (selectedType !== 'transfer') {
          bindCategoryEvents();
          bindWalletEvents();
        } else {
          const fromSelect = overlay.querySelector('#tf-from');
          const toSelect = overlay.querySelector('#tf-to');
          if (fromSelect) fromSelect.addEventListener('change', (e) => { transferFromId = e.target.value; });
          if (toSelect) toSelect.addEventListener('change', (e) => { transferToId = e.target.value; });
        }
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

        if (!amount || amount <= 0) { Toast.show('Masukkan jumlah', 'warning'); return; }

        // ── Transfer mode ──
        if (selectedType === 'transfer') {
          const fromId = overlay.querySelector('#tf-from').value;
          const toId = overlay.querySelector('#tf-to').value;

          if (!fromId) { Toast.show('Pilih dompet asal', 'warning'); return; }
          if (!toId) { Toast.show('Pilih dompet tujuan', 'warning'); return; }
          if (fromId === toId) { Toast.show('Pilih dompet yang berbeda', 'warning'); return; }

          const ok = Store.transfer(fromId, toId, amount);
          if (!ok) { Toast.show('Saldo dompet asal tidak cukup', 'error'); return; }

          const fromW = Store.getWallet(fromId);
          const toW = Store.getWallet(toId);
          Modal.close();
          Router.handleRoute();
          Toast.show(`Transfer ${Utils.formatRupiah(amount)} dari ${fromW?.name || '?'} ke ${toW?.name || '?'} berhasil! ✅`, 'success');
          return;
        }

        // ── Normal income/expense mode ──
        if (!selectedCategory) { Toast.show('Pilih kategori', 'warning'); return; }
        if (!selectedWalletId) { Toast.show('Pilih sumber dana', 'warning'); return; }

        if (isEdit) {
          Store.updateTransaction(prefill.editId, {
            type: selectedType,
            amount,
            category: selectedCategory,
            walletId: selectedWalletId,
            date,
            note
          });
          Modal.close();
          Router.handleRoute();
          Toast.show('Transaksi berhasil diperbarui! ✅', 'success');
        } else {
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
        }
      });
    }
  });
}



