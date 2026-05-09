// ========================================
// MyWallet — Debts Page
// ========================================

function renderDebts(container) {
  let activeTab = 'debt'; // 'debt' | 'receivable'
  let showPaid = false;

  function render() {
    const debts = Store.getDebts({ type: activeTab, isPaid: showPaid });
    const totalDebt = Store.getTotalDebt();
    const totalReceivable = Store.getTotalReceivable();
    const net = totalReceivable - totalDebt;

    container.innerHTML = `
      <!-- Summary -->
      <div class="stat-row section" style="animation:fadeInUp .5s var(--ease-out)">
        <div class="stat-item">
          <div class="stat-item__label">Total Hutang</div>
          <div class="stat-item__value text-debt mono">-${Utils.formatRupiah(totalDebt)}</div>
        </div>
        <div class="stat-item">
          <div class="stat-item__label">Total Piutang</div>
          <div class="stat-item__value text-credit mono">+${Utils.formatRupiah(totalReceivable)}</div>
        </div>
        <div class="stat-item">
          <div class="stat-item__label">Selisih Bersih</div>
          <div class="stat-item__value mono" style="color:${net >= 0 ? 'var(--color-credit)' : 'var(--color-debt)'}">
            ${Utils.formatRupiah(net, true)}
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:var(--space-lg);flex-wrap:wrap;animation:fadeInUp .6s var(--ease-out)">
        <div class="tab-switcher" style="flex:1;max-width:300px;" id="debt-tabs">
          <button class="tab-switcher__tab ${activeTab === 'debt' ? 'active' : ''}" data-tab="debt">Hutang</button>
          <button class="tab-switcher__tab ${activeTab === 'receivable' ? 'active' : ''}" data-tab="receivable">Piutang</button>
        </div>
        <button class="btn btn--sm ${showPaid ? 'btn--primary' : 'btn--secondary'}" id="toggle-paid">
          ${showPaid ? '✅ Riwayat Lunas' : '📋 Aktif'}
        </button>
        <button class="btn btn--primary btn--sm" id="add-debt-btn">${Icons.plus} Catat ${activeTab === 'debt' ? 'Hutang' : 'Piutang'}</button>
      </div>

      <!-- List -->
      <div class="card" style="animation:fadeInUp .7s var(--ease-out)">
        ${debts.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state__icon">${showPaid ? '✅' : '🤝'}</div>
            <div class="empty-state__title">${showPaid ? 'Belum ada riwayat lunas' : `Tidak ada ${activeTab === 'debt' ? 'hutang' : 'piutang'} aktif`}</div>
            <div class="empty-state__desc">${showPaid ? '' : 'Tekan tombol + untuk mencatat'}</div>
          </div>
        ` : `
          <div style="display:flex;flex-direction:column;gap:12px;">
            ${debts.map(d => {
              const w = Store.getWallet(d.walletId);
              const initial = d.personName.charAt(0).toUpperCase();
              const colorClass = d.type === 'debt' ? 'text-debt' : 'text-credit';
              const sign = d.type === 'debt' ? '-' : '+';

              return `
                <div class="debt-row" data-debt-id="${d.id}">
                  <div class="debt-row__avatar">${initial}</div>
                  <div class="debt-row__info">
                    <div class="debt-row__name">${Utils.escapeHtml(d.personName)}</div>
                    <div class="debt-row__detail">
                      ${Utils.formatDate(d.date)} • ${w ? w.name : '—'}
                      ${d.note ? ' • ' + Utils.escapeHtml(d.note) : ''}
                      ${d.isPaid ? ' • ✅ Lunas ' + Utils.formatDate(d.paidDate) : ''}
                    </div>
                    ${!d.isPaid ? `
                      <div class="debt-row__actions">
                        <button class="btn btn--sm btn--primary mark-paid-btn" data-id="${d.id}">✅ Tandai Lunas</button>
                        <button class="btn btn--sm btn--danger del-debt-btn" data-id="${d.id}">🗑️</button>
                      </div>
                    ` : ''}
                  </div>
                  <div class="debt-row__amount ${colorClass} mono">${sign}${Utils.formatRupiah(d.amount)}</div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    `;

    // Tab events
    container.querySelectorAll('#debt-tabs .tab-switcher__tab').forEach(tab => {
      tab.addEventListener('click', () => { activeTab = tab.dataset.tab; render(); });
    });

    container.querySelector('#toggle-paid').addEventListener('click', () => { showPaid = !showPaid; render(); });
    container.querySelector('#add-debt-btn').addEventListener('click', () => openDebtForm(activeTab));

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
