// ========================================
// MyWallet — Dashboard Page
// ========================================

function renderDashboard(container) {
  const totalBalance = Store.getTotalBalance();
  const monthlyIncome = Store.getMonthlyIncome();
  const monthlyExpense = Store.getMonthlyExpense();
  const wallets = Store.getWallets();
  const recentTx = Store.getTransactions({}).slice(0, 5);
  const totalDebt = Store.getTotalDebt();
  const totalReceivable = Store.getTotalReceivable();
  const netDebtBalance = totalReceivable - totalDebt;
  const adjustedBalance = totalBalance + netDebtBalance;
  const expByCategory = Store.getExpenseByCategory();

  container.innerHTML = `
    <!-- Hero Balance Card -->
    <div class="card card--hero section" id="balance-hero" style="animation: fadeInUp 0.5s var(--ease-out)">
      <div class="card__title">Total Saldo</div>
      <div class="card__value mono">${Utils.formatRupiah(totalBalance)}</div>
      <div class="card__subtitle" style="display:flex;gap:24px;margin-top:12px;">
        <span style="display:flex;align-items:center;gap:6px;">
          <span style="display:inline-flex;width:20px;height:20px;align-items:center;justify-content:center;color:rgba(255,255,255,0.9)">${Icons.arrowUp}</span>
          Pemasukan: ${Utils.formatShort(monthlyIncome)}
        </span>
        <span style="display:flex;align-items:center;gap:6px;">
          <span style="display:inline-flex;width:20px;height:20px;align-items:center;justify-content:center;color:rgba(255,255,255,0.9)">${Icons.arrowDown}</span>
          Pengeluaran: ${Utils.formatShort(monthlyExpense)}
        </span>
      </div>
    </div>

    <!-- Debt/Credit Summary (below Total Saldo) -->
    <div class="card section" style="animation: fadeInUp 0.55s var(--ease-out)">
      <div class="card__header">
        <span class="card__title">Hutang & Piutang</span>
        <a href="#debts" class="section__action">Detail</a>
      </div>
      <div style="display:flex;gap:12px;margin-bottom:12px;">
        <div style="flex:1;text-align:center;padding:10px 8px;border-radius:var(--radius-sm);background:var(--color-debt-bg);">
          <div style="font-size:var(--fs-xs);color:var(--color-debt);margin-bottom:4px;">Hutang</div>
          <div class="mono" style="font-weight:600;color:var(--color-debt);">-${Utils.formatShort(totalDebt)}</div>
        </div>
        <div style="flex:1;text-align:center;padding:10px 8px;border-radius:var(--radius-sm);background:var(--color-credit-bg);">
          <div style="font-size:var(--fs-xs);color:var(--color-credit);margin-bottom:4px;">Piutang</div>
          <div class="mono" style="font-weight:600;color:var(--color-credit);">+${Utils.formatShort(totalReceivable)}</div>
        </div>
      </div>
      <div style="text-align:center;padding:10px;border-radius:var(--radius-sm);background:var(--bg-glass);border:1px solid var(--border-glass);">
        <div style="font-size:var(--fs-xs);color:var(--text-muted);margin-bottom:4px;">Total Saldo (setelah hutang/piutang)</div>
        <div class="mono" style="font-weight:700;font-size:var(--fs-lg);color:${adjustedBalance >= 0 ? 'var(--color-income)' : 'var(--color-expense)'};">
          ${Utils.formatRupiah(adjustedBalance)}
        </div>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="grid-2 section" style="animation: fadeInUp 0.6s var(--ease-out)">
      <!-- Expense Chart -->
      <div class="card">
        <div class="card__header">
          <span class="card__title">Pengeluaran ${Utils.currentMonthLabel()}</span>
        </div>
        <div class="expense-chart-wrap">
          <canvas id="expense-chart"></canvas>
        </div>
        ${expByCategory.length === 0 ? '<p style="text-align:center;margin-top:12px;">Belum ada data pengeluaran</p>' : ''}
      </div>

      <!-- Wallet Breakdown -->
      <div class="card">
        <div class="card__header">
          <span class="card__title">Saldo Dompet</span>
          <a href="#wallets" class="section__action">Lihat Semua</a>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${wallets.length === 0 ? '<p class="text-muted">Belum ada dompet</p>' : wallets.map(w => `
            <div class="wallet-chip">
              <span class="wallet-chip__icon">${getWalletIcon(w)}</span>
              <span class="wallet-chip__name">${Utils.escapeHtml(w.name)}</span>
              <span class="wallet-chip__balance mono">${Utils.formatRupiah(w.balance)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- Recent Transactions -->
    <div class="card section" style="animation: fadeInUp 0.7s var(--ease-out)">
      <div class="card__header">
        <span class="card__title">Transaksi Terakhir</span>
        <a href="#transactions" class="section__action">Lihat Semua</a>
      </div>
      <div id="recent-tx-list">
        ${recentTx.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state__icon">📝</div>
            <div class="empty-state__title">Belum Ada Transaksi</div>
            <div class="empty-state__desc">Tekan tombol + untuk mencatat transaksi pertamamu</div>
          </div>
        ` : recentTx.map(tx => renderTxRow(tx)).join('')}
      </div>
    </div>
  `;

  // Draw chart
  if (expByCategory.length > 0) {
    drawExpenseChart(expByCategory);
  }
}

function renderTxRow(tx) {
  const cat = CATEGORIES[tx.category] || { name: tx.category, icon: '📌', color: '#888' };
  const wallet = Store.getWallet(tx.walletId);
  const walletName = wallet ? wallet.name : '—';
  const sign = tx.type === 'income' ? '+' : '-';
  const cls = tx.type === 'income' ? 'income' : 'expense';

  return `
    <div class="tx-row" data-tx-id="${tx.id}">
      <div class="tx-row__icon" style="background:${cat.color}22;color:${cat.color};">
        ${cat.icon}
      </div>
      <div class="tx-row__info">
        <div class="tx-row__name">${tx.note ? Utils.escapeHtml(tx.note) : cat.name}</div>
        <div class="tx-row__meta">
          <span>${walletName}</span>
          <span>•</span>
          <span>${Utils.formatRelativeDate(tx.date)}</span>
        </div>
      </div>
      <div class="tx-row__amount ${cls} mono">${sign}${Utils.formatRupiah(tx.amount)}</div>
    </div>
  `;
}

function drawExpenseChart(data) {
  const canvas = document.getElementById('expense-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Get the container's actual width for responsive sizing
  const container = canvas.parentElement;
  const size = Math.min(container.clientWidth, 220);

  // Colors for chart
  const colors = data.map(d => {
    const cat = CATEGORIES[d.category];
    return cat ? getComputedStyle(document.documentElement).getPropertyValue(cat.color.replace('var(', '').replace(')', '')).trim() || '#7c5cfc' : '#7c5cfc';
  });

  // Fallback colors if CSS var resolution fails
  const fallbackColors = ['#fb923c', '#38bdf8', '#e879f9', '#facc15', '#f87171', '#a78bfa', '#34d399', '#94a3b8', '#fb7185', '#f97316'];

  const total = data.reduce((s, d) => s + d.amount, 0);
  const dpr = window.devicePixelRatio || 1;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';
  ctx.scale(dpr, dpr);

  const cx = size / 2, cy = size / 2;
  const radius = (size / 2) * 0.82;
  const innerRadius = (size / 2) * 0.55;
  let startAngle = -Math.PI / 2;

  data.forEach((d, i) => {
    const sliceAngle = (d.amount / total) * 2 * Math.PI;
    const endAngle = startAngle + sliceAngle;

    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.arc(cx, cy, innerRadius, endAngle, startAngle, true);
    ctx.closePath();

    const color = colors[i] !== '#7c5cfc' ? colors[i] : (fallbackColors[i % fallbackColors.length]);
    ctx.fillStyle = color;
    ctx.fill();

    startAngle = endAngle;
  });

  // Center text — scale font size with chart
  const mainFontSize = Math.max(12, size * 0.073);
  const subFontSize = Math.max(9, size * 0.05);
  ctx.fillStyle = '#f0f0f5';
  ctx.font = `bold ${mainFontSize}px Inter, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(Utils.formatShort(total), cx, cy - (size * 0.036));
  ctx.font = `${subFontSize}px Inter, sans-serif`;
  ctx.fillStyle = '#9090b0';
  ctx.fillText('Total', cx, cy + (size * 0.045));
}
