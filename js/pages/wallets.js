// ========================================
// MyWallet — Wallets Page
// ========================================

function renderWallets(container) {
  const wallets = Store.getWallets();
  const total = Store.getTotalBalance();

  const grouped = {
    bank: wallets.filter(w => w.type === 'bank'),
    ewallet: wallets.filter(w => w.type === 'ewallet'),
    cash: wallets.filter(w => w.type === 'cash'),
  };

  container.innerHTML = `
    <!-- Total -->
    <div class="card card--hero section" style="animation:fadeInUp .5s var(--ease-out)">
      <div class="card__title">Total Saldo Gabungan</div>
      <div class="card__value mono">${Utils.formatRupiah(total)}</div>
      <div class="card__subtitle">${wallets.length} dompet aktif</div>
    </div>

    <!-- Actions -->
    <div style="display:flex;gap:8px;margin-bottom:var(--space-lg);flex-wrap:wrap;animation:fadeInUp .6s var(--ease-out)">
      <button class="btn btn--primary btn--sm" id="add-wallet-btn">${Icons.plus} Tambah Dompet</button>
      <button class="btn btn--secondary btn--sm" id="transfer-btn">${Icons.transfer} Transfer</button>
    </div>

    <!-- Wallet Groups -->
    ${Object.entries(grouped).map(([type, wList]) => `
      <div class="section" style="animation:fadeInUp .7s var(--ease-out)">
        <div class="section__header">
          <h3 class="section__title">${WALLET_TYPES[type].icon} ${WALLET_TYPES[type].name}</h3>
        </div>
        <div class="grid-auto">
          ${wList.map((w, i) => `
            <div class="wallet-card stagger-${(i % 5) + 1}" data-wallet-id="${w.id}">
              <div class="wallet-card__header">
                <div class="wallet-card__icon-wrap" style="background:${w.color || 'var(--accent-primary)'}40;">
                  ${getWalletIcon(w)}
                </div>
                <div class="wallet-card__type">${WALLET_TYPES[type].name}</div>
              </div>
              <div class="wallet-card__name">${Utils.escapeHtml(w.name)}</div>
              <div class="wallet-card__balance mono">${Utils.formatRupiah(w.balance)}</div>
            </div>
          `).join('')}
          <div class="wallet-card wallet-card--add" data-add-type="${type}">
            ${Icons.plus}
            <span>Tambah ${WALLET_TYPES[type].name}</span>
          </div>
        </div>
      </div>
    `).join('')}
  `;

  // Events
  container.querySelector('#add-wallet-btn').addEventListener('click', () => openAddWalletForm());
  container.querySelector('#transfer-btn').addEventListener('click', () => openTransferForm());

  container.querySelectorAll('.wallet-card--add').forEach(card => {
    card.addEventListener('click', () => openAddWalletForm(card.dataset.addType));
  });

  container.querySelectorAll('.wallet-card:not(.wallet-card--add)').forEach(card => {
    card.addEventListener('click', () => {
      const wId = card.dataset.walletId;
      const w = Store.getWallet(wId);
      if (!w) return;
      const txs = Store.getTransactions({ walletId: wId }).slice(0, 10);

      Modal.open(`${Utils.escapeHtml(w.name)}`, `
        <div style="text-align:center;margin-bottom:20px;">
          <div class="mono" style="font-size:var(--fs-2xl);font-weight:700;">${Utils.formatRupiah(w.balance)}</div>
          <div class="text-muted" style="margin-top:4px;">${WALLET_TYPES[w.type].name}</div>
        </div>
        <div class="divider"></div>
        <h4 style="margin-bottom:12px;">Riwayat Transaksi</h4>
        ${txs.length === 0 ? '<p class="text-muted">Belum ada transaksi</p>' :
          txs.map(tx => renderTxRow(tx)).join('')}
      `, {
        footerHtml: `
          <button class="btn btn--danger btn--sm" id="modal-del-wallet">🗑️ Hapus</button>
          <button class="btn btn--secondary btn--sm" onclick="Modal.close()">Tutup</button>
        `,
        onOpen() {
          document.getElementById('modal-del-wallet').addEventListener('click', () => {
            if (w.balance !== 0) {
              Toast.show('Tidak bisa menghapus dompet dengan saldo != 0', 'warning');
              return;
            }
            Store.deleteWallet(wId);
            Modal.close();
            renderWallets(container);
            Toast.show(`${w.name} dihapus`, 'success');
          });
        }
      });
    });
  });
}

function openAddWalletForm(preType = '') {
  Modal.open('Tambah Dompet', `
    <div class="form-group">
      <label class="form-group__label">Nama Dompet</label>
      <input type="text" id="wf-name" placeholder="Contoh: BCA, ShopeePay...">
    </div>
    <div class="form-group">
      <label class="form-group__label">Jenis</label>
      <select id="wf-type">
        <option value="bank" ${preType === 'bank' ? 'selected' : ''}>Bank</option>
        <option value="ewallet" ${preType === 'ewallet' ? 'selected' : ''}>E-Wallet</option>
        <option value="cash" ${preType === 'cash' ? 'selected' : ''}>Cash</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-group__label">Saldo Awal (Rp)</label>
      <input type="text" id="wf-balance" placeholder="Rp 0" inputmode="numeric" style="font-family:var(--font-mono);">
    </div>
  `, {
    footerHtml: `<button class="btn btn--primary btn--full" id="wf-save">💾 Simpan</button>`,
    onOpen(overlay) {
      const balInput = overlay.querySelector('#wf-balance');
      balInput.addEventListener('input', (e) => {
        const v = Utils.parseRupiah(e.target.value);
        e.target.value = v > 0 ? 'Rp ' + new Intl.NumberFormat('id-ID').format(v) : '';
      });

      overlay.querySelector('#wf-save').addEventListener('click', () => {
        const name = overlay.querySelector('#wf-name').value.trim();
        const type = overlay.querySelector('#wf-type').value;
        const balance = Utils.parseRupiah(balInput.value);

        if (!name) { Toast.show('Masukkan nama dompet', 'warning'); return; }

        Store.addWallet({ name, type, balance, icon: WALLET_TYPES[type].icon });
        Modal.close();
        Router.handleRoute();
        Toast.show(`${WALLET_TYPES[type].icon} ${name} ditambahkan!`, 'success');
      });
    }
  });
}

function openTransferForm() {
  const wallets = Store.getWallets();
  if (wallets.length < 2) { Toast.show('Minimal 2 dompet untuk transfer', 'warning'); return; }

  Modal.open('Transfer Antar Dompet', `
    <div class="form-group">
      <label class="form-group__label">Dari</label>
      <select id="tf-from">
        ${wallets.map(w => `<option value="${w.id}">${Utils.escapeHtml(w.name)} (${Utils.formatRupiah(w.balance)})</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label class="form-group__label">Ke</label>
      <select id="tf-to">
        ${wallets.map((w, i) => `<option value="${w.id}" ${i === 1 ? 'selected' : ''}>${Utils.escapeHtml(w.name)}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label class="form-group__label">Jumlah (Rp)</label>
      <input type="text" id="tf-amount" placeholder="Rp 0" inputmode="numeric" style="font-family:var(--font-mono);">
    </div>
  `, {
    footerHtml: `<button class="btn btn--primary btn--full" id="tf-save">${Icons.transfer} Transfer</button>`,
    onOpen(overlay) {
      overlay.querySelector('#tf-amount').addEventListener('input', (e) => {
        const v = Utils.parseRupiah(e.target.value);
        e.target.value = v > 0 ? 'Rp ' + new Intl.NumberFormat('id-ID').format(v) : '';
      });

      overlay.querySelector('#tf-save').addEventListener('click', () => {
        const fromId = overlay.querySelector('#tf-from').value;
        const toId = overlay.querySelector('#tf-to').value;
        const amount = Utils.parseRupiah(overlay.querySelector('#tf-amount').value);

        if (fromId === toId) { Toast.show('Pilih dompet yang berbeda', 'warning'); return; }
        if (!amount || amount <= 0) { Toast.show('Masukkan jumlah', 'warning'); return; }

        const ok = Store.transfer(fromId, toId, amount);
        if (!ok) { Toast.show('Saldo tidak cukup', 'error'); return; }

        Modal.close();
        Router.handleRoute();
        Toast.show(`Transfer ${Utils.formatRupiah(amount)} berhasil! ✅`, 'success');
      });
    }
  });
}
