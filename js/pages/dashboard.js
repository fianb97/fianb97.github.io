// ========================================
// MyWallet — Dashboard Page (Verdant Glass)
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

  function renderExpenseCard() {
    const expByCategory = Store.getExpenseByCategoryPeriod('daily');
    return `
      <div class="card__header" style="flex-wrap:wrap;gap:8px;">
        <span class="card__title">${mIcon('pie_chart')} ${t('expenseDistribution')} (${t('today')})</span>
      </div>
      <div class="expense-chart-wrap">
        <canvas id="expense-chart"></canvas>
      </div>
      ${expByCategory.length === 0 ? `<p style="text-align:center;margin-top:12px;color:var(--on-surface-variant);">${t('noExpensesYet')}</p>` : `
        <div style="margin-top:12px;display:flex;flex-direction:column;gap:6px;">
          ${expByCategory.slice(0, 5).map(d => {
            const cat = CATEGORIES[d.category] || { name: d.category, icon: mIcon('label'), color: '#888' };
            return `<div style="display:flex;align-items:center;gap:8px;font-size:var(--fs-sm);">
              <span style="color:${cat.color};">${cat.icon}</span>
              <span style="flex:1;color:var(--on-surface-variant);">${cat.name}</span>
              <span class="mono" style="font-weight:600;">${Utils.formatRupiah(d.amount)}</span>
            </div>`;
          }).join('')}
        </div>
      `}
    `;
  }

  container.innerHTML = `
    <!-- Hero Balance Card (Gradient Green) -->
    <div class="card card--hero section" id="balance-hero" style="animation: fadeInUp 0.5s var(--ease-out)">
      <div class="card__title">${t('totalBalance')}</div>
      <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:16px;">
        <span class="mono" style="font-size:24px;color:#ffffff;">Rp</span>
        <div class="card__value mono">${new Intl.NumberFormat('id-ID').format(Math.abs(totalBalance))}</div>
      </div>
      <div class="flow-row">
        <div class="flow-row__item">
          ${mIcon('arrow_upward')}
          <span>${t('income')}:<br>${Utils.formatShort(monthlyIncome)}</span>
        </div>
        <div class="flow-row__item">
          ${mIcon('arrow_downward')}
          <span>${t('expense')}:<br>${Utils.formatShort(monthlyExpense)}</span>
        </div>
      </div>
    </div>

    <!-- Adjusted Balance (Glass Card) -->
    <div class="card card--adjusted section" style="animation: fadeInUp 0.55s var(--ease-out)">
      <div class="card__title">${mIcon('account_balance')} ${t('adjustedBalance')}</div>
      <div style="display:flex;align-items:baseline;gap:4px;">
        <span class="mono" style="color:var(--primary);font-size:14px;">Rp</span>
        <div class="card__value">${new Intl.NumberFormat('id-ID').format(Math.abs(adjustedBalance))}</div>
      </div>
      <div class="adjusted-sub">
        <div class="adjusted-sub__item">
          <span class="adjusted-sub__label">${t('debtsLabel')}</span>
          <span class="mono text-expense" style="font-weight:500;">- ${Utils.formatShort(totalDebt)}</span>
        </div>
        <div class="adjusted-sub__item">
          <span class="adjusted-sub__label">${t('receivablesLabel')}</span>
          <span class="mono text-income" style="font-weight:500;">+ ${Utils.formatShort(totalReceivable)}</span>
        </div>
      </div>
    </div>

    <!-- Expense Distribution -->
    <div class="card section" id="expense-card-container" style="animation: fadeInUp 0.6s var(--ease-out)">
      ${renderExpenseCard()}
    </div>

    <!-- Active Wallets (Horizontal Scroll) -->
    <div class="section" style="animation: fadeInUp 0.65s var(--ease-out)">
      <div class="section__header">
        <h3 class="section__title">${t('activeWallets')}</h3>
        <a href="#wallets" class="section__action">${t('viewAll')}</a>
      </div>
      <div class="wallets-scroll">
        ${wallets.length === 0 ? `<p style="color:var(--on-surface-variant);padding:20px;">${t('noWalletsYet')}</p>` : wallets.map(w => {
          const typeLabel = (WALLET_TYPES[w.type] || { name: 'Other' }).name;
          return `
            <div class="wallet-scroll-card">
              <div class="wallet-scroll-card__top">
                <div class="wallet-scroll-card__icon">${getWalletIcon(w)}</div>
                <span class="wallet-scroll-card__badge">${typeLabel}</span>
              </div>
              <div>
                <div class="wallet-scroll-card__name">${Utils.escapeHtml(w.name)}</div>
                <div class="wallet-scroll-card__balance">${Utils.formatRupiah(w.balance)}</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="card section" style="animation: fadeInUp 0.7s var(--ease-out)">
      <div class="card__header">
        <span class="card__title">${mIcon('history')} ${t('recentActivity')}</span>
        <a href="#transactions" class="section__action">${t('seeAll')}</a>
      </div>
      <div id="recent-tx-list">
        ${recentTx.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state__icon">${mIcon('edit_note')}</div>
            <div class="empty-state__title">${t('noTxYet')}</div>
            <div class="empty-state__desc">${t('noTxDesc')}</div>
          </div>
        ` : recentTx.map(tx => renderTxRow(tx)).join('')}
      </div>
    </div>
  `;

  // Draw chart for daily expenses
  const expByCategory = Store.getExpenseByCategoryPeriod('daily');
  if (expByCategory.length > 0) {
    drawExpenseChart(expByCategory);
  }
}

function renderTxRow(tx) {
  const cat = CATEGORIES[tx.category] || { name: tx.category, icon: mIcon('label'), color: '#888' };
  const wallet = Store.getWallet(tx.walletId);
  const walletName = wallet ? wallet.name : '—';
  const isIncome = tx.type === 'income';
  const iconClass = isIncome ? 'tx-item__icon--income' : 'tx-item__icon--expense';
  const amountClass = isIncome ? 'text-income' : 'text-expense';
  const sign = isIncome ? '+' : '-';

  return `
    <div class="tx-item" data-tx-id="${tx.id}">
      <div class="tx-item__left">
        <div class="tx-item__icon ${iconClass}">${cat.icon}</div>
        <div class="tx-item__info">
          <span class="tx-item__name">${tx.note ? Utils.escapeHtml(tx.note) : cat.name}</span>
          <span class="tx-item__meta">${walletName} • ${Utils.formatRelativeDate(tx.date)}</span>
        </div>
      </div>
      <span class="tx-item__amount ${amountClass} mono">${sign}${new Intl.NumberFormat('id-ID').format(tx.amount)}</span>
    </div>
  `;
}

function drawExpenseChart(data, targetCanvas = null) {
  const canvas = targetCanvas || document.getElementById('expense-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Get the container's actual width for responsive sizing
  const chartContainer = canvas.parentElement;
  const size = Math.min(chartContainer.clientWidth, 220);

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

  // Center text
  const mainFontSize = Math.max(12, size * 0.073);
  const subFontSize = Math.max(9, size * 0.05);

  ctx.fillStyle = '#00450d';
  ctx.font = `bold ${mainFontSize}px 'JetBrains Mono', monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(Utils.formatShort(total), cx, cy - (size * 0.036));
  ctx.font = `${subFontSize}px Inter, sans-serif`;
  ctx.fillStyle = '#41493e';
  ctx.fillText('Total', cx, cy + (size * 0.045));
}
