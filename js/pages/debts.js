// ========================================
// MyWallet — Debts Page (Verdant Glass)
// ========================================

function renderDebts(container) {
  let activeTab = 'receivable'; // 'receivable' | 'debt'
  let showPaid = false;

  function render() {
    const debts = Store.getDebts({ type: activeTab, isPaid: showPaid });
    const totalDebt = Store.getTotalDebt();
    const totalReceivable = Store.getTotalReceivable();
    const net = totalReceivable - totalDebt;

    container.innerHTML = `
      <!-- Header Section -->
      <div class="page-header" style="animation:fadeInUp .35s var(--ease-out)">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;">
          <div>
            <h2 class="page-header__title">${t('debtsTitle')}</h2>
            <p class="page-header__subtitle">${t('debtsSubtitle')}</p>
          </div>
          <div style="display:flex;gap:12px;">
            <button class="btn btn--secondary" id="transfer-btn">${mIcon('sync_alt')} ${t('transfer')}</button>
            <button class="btn btn--primary" id="add-debt-btn">${mIcon('add')} ${t('addRecord')}</button>
          </div>
        </div>
      </div>

      <!-- Bento Summary Grid -->
      <div class="grid-2 section" style="grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:20px;animation:fadeInUp .4s var(--ease-out)">
        <!-- Total Piutang -->
        <div class="card" style="border-radius:24px;padding:20px;">
          <div style="display:flex;align-items:center;gap:8px;color:var(--on-surface-variant);font-size:11px;font-weight:700;letter-spacing:0.05em;margin-bottom:12px;">
            <span style="color:var(--color-income);">${mIcon('call_received')}</span> ${t('totalReceivablesCard')}
          </div>
          <div class="mono" style="font-size:28px;font-weight:700;color:var(--color-income);">${Utils.formatRupiah(totalReceivable)}</div>
          <div style="font-size:13px;color:var(--on-surface-variant);margin-top:16px;">${Store.getDebts({ type: 'receivable', isPaid: false }).length} ${t('activeStatus')}</div>
        </div>

        <!-- Total Hutang -->
        <div class="card" style="border-radius:24px;padding:20px;">
          <div style="display:flex;align-items:center;gap:8px;color:var(--on-surface-variant);font-size:11px;font-weight:700;letter-spacing:0.05em;margin-bottom:12px;">
            <span style="color:var(--color-expense);">${mIcon('call_made')}</span> ${t('totalDebtsCard')}
          </div>
          <div class="mono text-expense" style="font-size:28px;font-weight:700;">${Utils.formatRupiah(totalDebt)}</div>
          <div style="font-size:13px;color:var(--on-surface-variant);margin-top:16px;">${Store.getDebts({ type: 'debt', isPaid: false }).length} ${t('activeStatus')}</div>
        </div>

        <!-- Selisih Bersih -->
        <div class="card" style="border-radius:24px;padding:20px;">
          <div style="display:flex;align-items:center;gap:8px;color:var(--on-surface-variant);font-size:11px;font-weight:700;letter-spacing:0.05em;margin-bottom:12px;">
            <span style="color:var(--color-income);">${mIcon('balance')}</span> ${t('netDifferenceCard')}
          </div>
          <div class="mono" style="font-size:28px;font-weight:700;color:${net >= 0 ? 'var(--color-income)' : 'var(--color-expense)'};">
            ${Utils.formatRupiah(net, true)}
          </div>
          <div style="font-size:13px;color:var(--on-surface-variant);margin-top:16px;">${net >= 0 ? 'Surplus saldo' : 'Defisit saldo'}</div>
        </div>
      </div>

      <!-- Debts Tabs -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;animation:fadeInUp .45s var(--ease-out);">
        <div class="debts-tabs" style="margin-bottom:0;">
          <button class="debts-tabs__tab ${activeTab === 'receivable' ? 'active' : ''}" data-tab="receivable">Piutang</button>
          <button class="debts-tabs__tab ${activeTab === 'debt' ? 'active' : ''}" data-tab="debt">Hutang</button>
        </div>
        <button class="btn btn--sm ${showPaid ? 'btn--primary' : 'btn--secondary'}" id="toggle-paid">
          ${showPaid ? `${mIcon('check_circle')} Lunas` : `${mIcon('pending')} Aktif`}
        </button>
      </div>

      <!-- List -->
      <div class="section" style="animation:fadeInUp .5s var(--ease-out)">
        ${debts.length === 0 ? `
          <div class="glass-panel" style="border-radius:24px;padding:60px 24px;text-align:center;max-width:600px;margin:0 auto;">
            <div style="width:80px;height:80px;border-radius:50%;background:rgba(0,69,13,0.05);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
              <span style="font-size:40px;color:rgba(0,69,13,0.4);">${mIcon('handshake')}</span>
            </div>
            <h3 style="font-size:18px;font-weight:600;color:var(--on-surface);margin-bottom:4px;">
              ${showPaid ? 'Belum ada riwayat lunas' : `Tidak ada ${activeTab === 'debt' ? 'hutang' : 'piutang'} aktif`}
            </h3>
            <p style="font-size:14px;color:var(--on-surface-variant);">
              ${showPaid ? '' : 'Tekan tombol + untuk mencatat baru.'}
            </p>
          </div>
        ` : `
          <div style="display:flex;flex-direction:column;gap:12px;">
            ${debts.map(d => {
              const w = Store.getWallet(d.walletId);
              const initial = d.personName.charAt(0).toUpperCase();
              const isReceivable = d.type === 'receivable';
              const colorClass = isReceivable ? 'text-income' : 'text-expense';
              const sign = isReceivable ? '+' : '-';
              const avatarBg = isReceivable ? 'var(--primary)' : 'var(--error)';

              return `
                <div class="debt-item" data-debt-id="${d.id}">
                  <div class="debt-item__left">
                    <div class="debt-item__avatar" style="background:${avatarBg};">${initial}</div>
                    <div class="debt-item__info">
                      <span class="debt-item__name">${Utils.escapeHtml(d.personName)}</span>
                      <span class="debt-item__desc">
                        ${Utils.formatDate(d.date)} • ${w ? w.name : '—'}
                        ${d.note ? ' • ' + Utils.escapeHtml(d.note) : ''}
                        ${d.isPaid ? ' • ✅ Lunas ' + Utils.formatDate(d.paidDate) : ''}
                      </span>
                    </div>
                  </div>
                  <div class="debt-item__right">
                    <span class="debt-item__amount ${colorClass} mono">${sign}${Utils.formatRupiah(d.amount)}</span>
                    ${!d.isPaid ? `
                      <div style="display:flex;gap:4px;margin-top:4px;">
                        <button class="btn btn--sm btn--primary mark-paid-btn" data-id="${d.id}" style="padding:4px 8px;font-size:11px;">${mIcon('check')} Lunas</button>
                        <button class="btn btn--sm btn--danger del-debt-btn" data-id="${d.id}" style="padding:4px 8px;font-size:11px;">${mIcon('delete')}</button>
                      </div>
                    ` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    `;

    // Tab events
    container.querySelectorAll('.debts-tabs__tab').forEach(tab => {
      tab.addEventListener('click', () => { activeTab = tab.dataset.tab; render(); });
    });

    container.querySelector('#toggle-paid').addEventListener('click', () => { showPaid = !showPaid; render(); });
    container.querySelector('#add-debt-btn').addEventListener('click', () => openDebtForm(activeTab));
    if (container.querySelector('#transfer-btn')) {
      container.querySelector('#transfer-btn').addEventListener('click', () => openTransferForm());
    }

    // Mark paid
    container.querySelectorAll('.mark-paid-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        Store.markDebtPaid(btn.dataset.id);
        render();
        Toast.show('Ditandai lunas! ✅', 'success');
      });
    });

    // Delete
    container.querySelectorAll('.del-debt-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        Store.deleteDebt(btn.dataset.id);
        render();
        Toast.show('Catatan dihapus', 'success');
      });
    });
  }

  render();
}

function openDebtForm(type = 'debt') {
  let selectedWalletId = '';

  Modal.open(`Catat ${type === 'debt' ? 'Hutang' : 'Piutang'}`, `
    <div class="form-group">
      <label class="form-group__label">Nama Orang</label>
      <input type="text" id="df-person" placeholder="${type === 'debt' ? 'Siapa yang kamu hutangi?' : 'Siapa yang meminjam?'}">
    </div>
    <div class="form-group">
      <label class="form-group__label">Jumlah (Rp)</label>
      <input type="text" id="df-amount" placeholder="Rp 0" inputmode="numeric" style="font-family:var(--font-mono);">
    </div>
    <div id="df-wallet-container">
      ${renderWalletSelector()}
    </div>
    <div class="form-group">
      <label class="form-group__label">Tanggal</label>
      <input type="date" id="df-date" value="${Utils.today()}">
    </div>
    <div class="form-group">
      <label class="form-group__label">Catatan (opsional)</label>
      <input type="text" id="df-note" placeholder="Keterangan...">
    </div>
  `, {
    footerHtml: `<button class="btn btn--primary btn--full" id="df-save">💾 Simpan</button>`,
    onOpen(overlay) {
      overlay.querySelector('#df-amount').addEventListener('input', (e) => {
        const v = Utils.parseRupiah(e.target.value);
        e.target.value = v > 0 ? 'Rp ' + new Intl.NumberFormat('id-ID').format(v) : '';
      });

      overlay.querySelectorAll('.wallet-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          overlay.querySelectorAll('.wallet-chip').forEach(c => c.classList.remove('selected'));
          chip.classList.add('selected');
          selectedWalletId = chip.dataset.walletId;
        });
      });

      overlay.querySelector('#df-save').addEventListener('click', () => {
        const personName = overlay.querySelector('#df-person').value.trim();
        const amount = Utils.parseRupiah(overlay.querySelector('#df-amount').value);
        const date = overlay.querySelector('#df-date').value;
        const note = overlay.querySelector('#df-note').value.trim();

        if (!personName) { Toast.show('Masukkan nama orang', 'warning'); return; }
        if (!amount || amount <= 0) { Toast.show('Masukkan jumlah', 'warning'); return; }
        if (!selectedWalletId) { Toast.show('Pilih sumber dana', 'warning'); return; }

        Store.addDebt({ type, personName, amount, walletId: selectedWalletId, date, note });
        Modal.close();
        Router.handleRoute();
        Toast.show(`${type === 'debt' ? 'Hutang' : 'Piutang'} dicatat! 📝`, 'success');
      });
    }
  });
}
