// ========================================
// MyWallet — Transactions Page (Verdant Glass)
// ========================================

function renderTransactions(container) {
  let currentPeriod = 'daily'; // 'daily' | 'weekly' | 'monthly'
  let currentFilter = { type: '', walletId: '' };
  let navDate = new Date(); // reference date for navigation
  let collapsedGroups = new Set(); // track user-collapsed groups

  // ── Local date helpers (prevents UTC timezone shift bug) ──
  function formatLocalYYYYMMDD(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function parseLocalYYYYMMDD(dateStr) {
    const parts = dateStr.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  // ── Helper: get days (Mon-Sun) of the week containing navDate ──
  function getDaysOfWeek() {
    const d = new Date(navDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.getFullYear(), d.getMonth(), diff);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const dt = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      const dateStr = formatLocalYYYYMMDD(dt);
      days.push({
        startStr: dateStr,
        endStr: dateStr,
        label: dt.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }),
        shortLabel: dt.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' })
      });
    }
    // Reverse array so newest date (Today) is at top, Yesterday is below it!
    return days.reverse();
  }

  // ── Helper: get week navigation label ──
  function getWeekNavLabel() {
    const days = getDaysOfWeek();
    const mon = parseLocalYYYYMMDD(days[days.length - 1].startStr);
    const sun = parseLocalYYYYMMDD(days[0].startStr);
    return `${mon.getDate()} - ${sun.getDate()} ${sun.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`;
  }

  // ── Helper: get weeks of the month containing navDate ──
  function getWeeksOfMonth() {
    const year = navDate.getFullYear();
    const month = navDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const weeks = [];
    let weekStart = new Date(firstDay);
    const startDow = weekStart.getDay();
    if (startDow !== 1) {
      weekStart.setDate(weekStart.getDate() - (startDow === 0 ? 6 : startDow - 1));
    }

    let weekNum = 1;
    while (weekStart <= lastDay) {
      const weekEnd = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6);

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
        startStr: formatLocalYYYYMMDD(weekStart),
        endStr: formatLocalYYYYMMDD(weekEnd),
        label: `Minggu ke ${weekNum}`,
        sublabel: sublabel,
        weekNum
      });

      weekStart = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 7);
      weekNum++;
    }
    return weeks.reverse();
  }

  // ── Helper: get months of the year ──
  function getMonthsOfYear() {
    const year = navDate.getFullYear();
    const months = [];
    for (let m = 0; m < 12; m++) {
      const first = new Date(year, m, 1);
      const last = new Date(year, m + 1, 0);
      months.push({
        startStr: formatLocalYYYYMMDD(first),
        endStr: formatLocalYYYYMMDD(last),
        label: first.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
        sublabel: year.toString()
      });
    }
    return months.reverse();
  }

  // ── Helper: get years history list ──
  function getYearsOfHistory() {
    const currentYear = new Date().getFullYear();
    const txs = Store.getTransactions({});
    let minYear = currentYear;
    txs.forEach(t => {
      if (t.date) {
        const y = parseInt(t.date.substring(0, 4), 10);
        if (y && y < minYear) minYear = y;
      }
    });

    const years = [];
    for (let y = currentYear; y >= minYear; y--) {
      const first = new Date(y, 0, 1);
      const last = new Date(y, 11, 31);
      years.push({
        startStr: formatLocalYYYYMMDD(first),
        endStr: formatLocalYYYYMMDD(last),
        label: `Tahun ${y}`,
        sublabel: `${y}`,
        yearNum: y
      });
    }
    return years;
  }

  // ── Navigation label & step ──
  function getNavLabel() {
    if (currentPeriod === 'daily') return getWeekNavLabel();
    if (currentPeriod === 'weekly') return navDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    if (currentPeriod === 'monthly') return `Tahun ${navDate.getFullYear()}`;
    if (currentPeriod === 'yearly') {
      const years = getYearsOfHistory();
      if (years.length === 0) return `Ringkasan Tahunan`;
      if (years.length === 1) return `Tahun ${years[0].yearNum}`;
      return `Tahun ${years[years.length - 1].yearNum} - ${years[0].yearNum}`;
    }
    return `Riwayat Transaksi`;
  }

  function navPrev() {
    if (currentPeriod === 'daily') navDate.setDate(navDate.getDate() - 7);
    else if (currentPeriod === 'weekly') navDate.setMonth(navDate.getMonth() - 1);
    else if (currentPeriod === 'monthly') navDate.setFullYear(navDate.getFullYear() - 1);
    else navDate.setFullYear(navDate.getFullYear() - 1);
    collapsedGroups.clear();
    render();
  }
  function navNext() {
    if (currentPeriod === 'daily') navDate.setDate(navDate.getDate() + 7);
    else if (currentPeriod === 'weekly') navDate.setMonth(navDate.getMonth() + 1);
    else if (currentPeriod === 'monthly') navDate.setFullYear(navDate.getFullYear() + 1);
    else navDate.setFullYear(navDate.getFullYear() + 1);
    collapsedGroups.clear();
    render();
  }

  // ── Get period groups ──
  function getPeriodGroups() {
    if (currentPeriod === 'daily') return getDaysOfWeek();
    if (currentPeriod === 'weekly') return getWeeksOfMonth();
    if (currentPeriod === 'monthly') return getMonthsOfYear();
    return getYearsOfHistory();
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

    if (!hasTx) return ''; // Hide empty period groups for a clean view

    const balanceFormatted = (balance >= 0 ? '+' : '-') + 'Rp ' + new Intl.NumberFormat('id-ID').format(Math.abs(balance));
    const balanceClass = balance >= 0 ? 'text-income' : 'text-expense';

    // ── YEARLY VIEW: Summary Card with Drill-Down to Monthly View & Chart ──
    if (currentPeriod === 'yearly') {
      return `
        <div class="card year-summary-card" data-start-date="${group.startStr}" style="padding:18px;margin-bottom:12px;transition:transform 0.2s ease, box-shadow 0.2s ease;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
            <div>
              <h3 style="font-size:16px;font-weight:700;color:var(--on-surface);">${group.label}</h3>
              <span style="font-size:12px;color:var(--outline);font-weight:500;">12 Months</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <button type="button" class="btn--ghost period-chart-btn" data-start-date="${group.startStr}" data-end-date="${group.endStr}" data-label="${group.label}" data-type="${t('periodYear')}" style="display:flex;align-items:center;gap:4px;font-size:12px;font-weight:600;color:var(--primary);background:rgba(0,69,13,0.08);padding:6px 12px;border-radius:var(--radius-full);border:none;cursor:pointer;">
                ${mIcon('pie_chart')}
                <span>${t('viewChart')}</span>
              </button>
              <button type="button" class="btn--ghost year-drill-btn" data-start-date="${group.startStr}" style="display:flex;align-items:center;gap:4px;font-size:12px;font-weight:600;color:#ffffff;background:var(--primary);padding:6px 12px;border-radius:var(--radius-full);border:none;cursor:pointer;">
                <span>${t('viewMonths')}</span>
                ${mIcon('chevron_right')}
              </button>
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid var(--outline-variant);flex-wrap:wrap;gap:8px;">
            <div>
              <span style="display:block;font-size:10px;font-weight:700;color:var(--outline);text-transform:uppercase;letter-spacing:0.05em;">${t('income')}</span>
              <span class="mono text-income" style="font-weight:600;font-size:14px;">+Rp ${new Intl.NumberFormat('id-ID').format(income)}</span>
            </div>
            <div>
              <span style="display:block;font-size:10px;font-weight:700;color:var(--outline);text-transform:uppercase;letter-spacing:0.05em;">${t('expense')}</span>
              <span class="mono text-expense" style="font-weight:600;font-size:14px;">-Rp ${new Intl.NumberFormat('id-ID').format(expense)}</span>
            </div>
            <div style="text-align:right;">
              <span style="display:block;font-size:10px;font-weight:700;color:var(--outline);text-transform:uppercase;letter-spacing:0.05em;">${t('netBalance')}</span>
              <span class="mono ${balanceClass}" style="font-weight:700;font-size:15px;">${balanceFormatted}</span>
            </div>
          </div>
        </div>
      `;
    }

    // ── MONTHLY VIEW: Summary Card with Drill-Down to Weekly View & Chart ──
    if (currentPeriod === 'monthly') {
      return `
        <div class="card month-summary-card" data-start-date="${group.startStr}" style="padding:18px;margin-bottom:12px;transition:transform 0.2s ease, box-shadow 0.2s ease;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
            <div>
              <h3 style="font-size:16px;font-weight:700;color:var(--on-surface);">${group.label}</h3>
              ${group.sublabel ? `<span style="font-size:12px;color:var(--outline);font-weight:500;">${group.sublabel}</span>` : ''}
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <button type="button" class="btn--ghost period-chart-btn" data-start-date="${group.startStr}" data-end-date="${group.endStr}" data-label="${group.label}" data-type="${t('periodMonth')}" style="display:flex;align-items:center;gap:4px;font-size:12px;font-weight:600;color:var(--primary);background:rgba(0,69,13,0.08);padding:6px 12px;border-radius:var(--radius-full);border:none;cursor:pointer;">
                ${mIcon('pie_chart')}
                <span>${t('viewChart')}</span>
              </button>
              <button type="button" class="btn--ghost month-drill-btn" data-start-date="${group.startStr}" style="display:flex;align-items:center;gap:4px;font-size:12px;font-weight:600;color:#ffffff;background:var(--primary);padding:6px 12px;border-radius:var(--radius-full);border:none;cursor:pointer;">
                <span>${t('viewWeeks')}</span>
                ${mIcon('chevron_right')}
              </button>
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid var(--outline-variant);flex-wrap:wrap;gap:8px;">
            <div>
              <span style="display:block;font-size:10px;font-weight:700;color:var(--outline);text-transform:uppercase;letter-spacing:0.05em;">${t('income')}</span>
              <span class="mono text-income" style="font-weight:600;font-size:14px;">+Rp ${new Intl.NumberFormat('id-ID').format(income)}</span>
            </div>
            <div>
              <span style="display:block;font-size:10px;font-weight:700;color:var(--outline);text-transform:uppercase;letter-spacing:0.05em;">${t('expense')}</span>
              <span class="mono text-expense" style="font-weight:600;font-size:14px;">-Rp ${new Intl.NumberFormat('id-ID').format(expense)}</span>
            </div>
            <div style="text-align:right;">
              <span style="display:block;font-size:10px;font-weight:700;color:var(--outline);text-transform:uppercase;letter-spacing:0.05em;">${t('netBalance')}</span>
              <span class="mono ${balanceClass}" style="font-weight:700;font-size:15px;">${balanceFormatted}</span>
            </div>
          </div>
        </div>
      `;
    }

    // ── WEEKLY VIEW: Summary Card with Drill-Down to Daily View & Chart ──
    if (currentPeriod === 'weekly') {
      return `
        <div class="card week-summary-card" data-start-date="${group.startStr}" style="padding:18px;margin-bottom:12px;transition:transform 0.2s ease, box-shadow 0.2s ease;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
            <div>
              <h3 style="font-size:16px;font-weight:700;color:var(--on-surface);">${group.label}</h3>
              ${group.sublabel ? `<span style="font-size:12px;color:var(--outline);font-weight:500;">${group.sublabel}</span>` : ''}
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <button type="button" class="btn--ghost period-chart-btn" data-start-date="${group.startStr}" data-end-date="${group.endStr}" data-label="${group.label}" data-type="${t('periodWeek')}" style="display:flex;align-items:center;gap:4px;font-size:12px;font-weight:600;color:var(--primary);background:rgba(0,69,13,0.08);padding:6px 12px;border-radius:var(--radius-full);border:none;cursor:pointer;">
                ${mIcon('pie_chart')}
                <span>${t('viewChart')}</span>
              </button>
              <button type="button" class="btn--ghost week-drill-btn" data-start-date="${group.startStr}" style="display:flex;align-items:center;gap:4px;font-size:12px;font-weight:600;color:#ffffff;background:var(--primary);padding:6px 12px;border-radius:var(--radius-full);border:none;cursor:pointer;">
                <span>${t('viewDays')}</span>
                ${mIcon('chevron_right')}
              </button>
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid var(--outline-variant);flex-wrap:wrap;gap:8px;">
            <div>
              <span style="display:block;font-size:10px;font-weight:700;color:var(--outline);text-transform:uppercase;letter-spacing:0.05em;">${t('income')}</span>
              <span class="mono text-income" style="font-weight:600;font-size:14px;">+Rp ${new Intl.NumberFormat('id-ID').format(income)}</span>
            </div>
            <div>
              <span style="display:block;font-size:10px;font-weight:700;color:var(--outline);text-transform:uppercase;letter-spacing:0.05em;">${t('expense')}</span>
              <span class="mono text-expense" style="font-weight:600;font-size:14px;">-Rp ${new Intl.NumberFormat('id-ID').format(expense)}</span>
            </div>
            <div style="text-align:right;">
              <span style="display:block;font-size:10px;font-weight:700;color:var(--outline);text-transform:uppercase;letter-spacing:0.05em;">${t('netBalance')}</span>
              <span class="mono ${balanceClass}" style="font-weight:700;font-size:15px;">${balanceFormatted}</span>
            </div>
          </div>
        </div>
      `;
    }

    // ── DAILY VIEW: Date Header + Individual Transaction Cards ──
    const isCollapsed = collapsedGroups.has(idx);
    const isExpanded = !isCollapsed;

    return `
      <div class="tx-group" data-group-idx="${idx}">
        <!-- Pinned Date & Daily Total Header -->
        <div class="tx-group__header" data-toggle="${idx}" style="cursor:pointer;display:flex;justify-content:space-between;align-items:flex-end;border-bottom:1px solid rgba(192,201,187,0.4);padding-bottom:8px;padding-left:4px;padding-right:4px;">
          <div>
            <h3 class="tx-group__date" style="font-size:15px;font-weight:600;color:var(--on-surface);">${group.label}</h3>
            ${group.sublabel ? `<span style="font-size:12px;color:var(--outline);">${group.sublabel}</span>` : ''}
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <button type="button" class="btn--ghost period-chart-btn" data-start-date="${group.startStr}" data-end-date="${group.endStr}" data-label="${group.label}" data-type="${t('periodDay')}" style="display:flex;align-items:center;gap:4px;font-size:11px;font-weight:600;color:var(--primary);background:rgba(0,69,13,0.08);padding:4px 10px;border-radius:var(--radius-full);border:none;cursor:pointer;">
              ${mIcon('pie_chart')}
              <span>${t('viewChart')}</span>
            </button>
            <span class="mono ${balanceClass}" style="font-size:15px;font-weight:700;">
              ${balanceFormatted}
            </span>
            <span style="transition:transform 0.2s;transform:rotate(${isExpanded ? '180deg' : '0deg'});color:var(--outline);font-size:18px;">
              ${mIcon('keyboard_arrow_down')}
            </span>
          </div>
        </div>

        <!-- Transactions List under the Date Header -->
        <div class="tx-group__body" style="display:${isExpanded ? 'flex' : 'none'};flex-direction:column;gap:12px;margin-top:12px;">
          ${txs.map(tx => renderTxCard(tx)).join('')}
        </div>
      </div>
    `;
  }

  function renderTxCard(tx) {
    const cat = CATEGORIES[tx.category] || { name: tx.category, icon: mIcon('label') };
    const wallet = Store.getWallet(tx.walletId);
    const walletName = wallet ? wallet.name : '—';
    const isIncome = tx.type === 'income';
    const isTransfer = tx.type === 'transfer';
    let iconClass = 'tx-card__icon--expense';
    let amountClass = 'text-expense';
    let sign = '-';

    if (isIncome) {
      iconClass = 'tx-card__icon--income';
      amountClass = 'text-income';
      sign = '+';
    } else if (isTransfer) {
      iconClass = 'tx-card__icon--transfer';
      amountClass = 'text-secondary';
      sign = '';
    }

    return `
      <div class="tx-card" data-tx-id="${tx.id}">
        <div class="tx-card__left">
          <div class="tx-card__icon ${iconClass}">
            ${cat.icon}
          </div>
          <div class="tx-card__info">
            <span class="tx-card__name">${tx.note ? Utils.escapeHtml(tx.note) : cat.name}</span>
            <div class="tx-card__tags">
              <span class="tx-card__tag">${(cat.name || 'OTHER').toUpperCase()}</span>
              <span class="tx-card__separator">•</span>
              <span class="tx-card__wallet">${walletName}</span>
            </div>
          </div>
        </div>
        <span class="tx-card__amount ${amountClass} mono">${sign}${new Intl.NumberFormat('id-ID').format(tx.amount)}</span>
      </div>
    `;
  }

  // ── Main render ──
  function render() {
    const wallets = Store.getWallets();
    const groups = getPeriodGroups();

    // Calculate grand totals for the visible period range
    const minStart = groups[groups.length - 1]?.startStr || '';
    const maxEnd = groups[0]?.endStr || '';
    const allTxs = getTxForRange(minStart, maxEnd);
    const totalIncome = allTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = allTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const totalBalance = totalIncome - totalExpense;

    container.innerHTML = `
      <!-- Header Section -->
      <div class="page-header" style="animation:fadeInUp .35s var(--ease-out)">
        <div style="display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:12px;">
          <div>
            <h2 class="page-header__title">${t('transactionsTitle')}</h2>
            <p class="page-header__subtitle">${t('transactionsSubtitle')}</p>
          </div>
          <!-- Period Selector -->
          <div class="tab-switcher" id="period-tabs">
            <button class="tab-switcher__tab ${currentPeriod === 'daily' ? 'active' : ''}" data-period="daily">${t('periodDay')}</button>
            <button class="tab-switcher__tab ${currentPeriod === 'weekly' ? 'active' : ''}" data-period="weekly">${t('periodWeek')}</button>
            <button class="tab-switcher__tab ${currentPeriod === 'monthly' ? 'active' : ''}" data-period="monthly">${t('periodMonth')}</button>
            <button class="tab-switcher__tab ${currentPeriod === 'yearly' ? 'active' : ''}" data-period="yearly">${t('periodYear')}</button>
          </div>
        </div>
      </div>

      <!-- Navigation Bar -->
      <div class="card section" style="animation:fadeInUp .4s var(--ease-out);padding:12px 16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <button class="btn btn--ghost btn--icon" id="nav-prev">${mIcon('chevron_left')}</button>
          <span style="font-family:var(--font-mono);font-weight:700;font-size:16px;color:var(--primary);">${getNavLabel()}</span>
          <button class="btn btn--ghost btn--icon" id="nav-next">${mIcon('chevron_right')}</button>
        </div>
      </div>

      <!-- Filter Glass Container -->
      <div class="filter-container section" style="animation:fadeInUp .45s var(--ease-out)">
        <!-- Search Input -->
        <div class="search-input">
          ${mIcon('search')}
          <input type="text" id="tx-search-input" placeholder="${t('searchPlaceholder')}">
        </div>
        <!-- Filter Chips Bar -->
        <div class="filter-chips">
          <span class="filter-chips__label">FILTERS:</span>
          <select id="filter-type" style="width:auto;padding:6px 12px;border-radius:var(--radius-full);font-size:12px;font-weight:700;">
            <option value="">${t('filterAll')}</option>
            <option value="income" ${currentFilter.type === 'income' ? 'selected' : ''}>${t('filterIncome')}</option>
            <option value="expense" ${currentFilter.type === 'expense' ? 'selected' : ''}>${t('filterExpense')}</option>
          </select>
          <select id="filter-wallet" style="width:auto;padding:6px 12px;border-radius:var(--radius-full);font-size:12px;font-weight:700;">
            <option value="">${t('filterWalletAll')}</option>
            ${wallets.map(w => `<option value="${w.id}" ${currentFilter.walletId === w.id ? 'selected' : ''}>${Utils.escapeHtml(w.name)}</option>`).join('')}
          </select>
        </div>
      </div>

      <!-- Period Groups -->
      <div class="section" style="display:flex;flex-direction:column;gap:24px;animation:fadeInUp .5s var(--ease-out)">
        ${groups.map((g, i) => renderPeriodGroup(g, i)).join('')}
      </div>
    `;

    // ── Bind Events ──

    // Period tab switch
    container.querySelectorAll('#period-tabs .tab-switcher__tab').forEach(tab => {
      tab.addEventListener('click', () => {
        currentPeriod = tab.dataset.period;
        navDate = new Date();
        collapsedGroups.clear();
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
    container.querySelectorAll('.tx-group__header').forEach(header => {
      header.addEventListener('click', (e) => {
        if (e.target.closest('.tx-card')) return;
        const idx = parseInt(header.dataset.toggle);
        if (collapsedGroups.has(idx)) {
          collapsedGroups.delete(idx);
        } else {
          collapsedGroups.add(idx);
        }
        render();
      });
    });

    // Click on period chart button (Year, Month, Week) to view diagram modal
    container.querySelectorAll('.period-chart-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const startDate = btn.dataset.startDate;
        const endDate = btn.dataset.endDate;
        const label = btn.dataset.label;
        const pType = btn.dataset.type || '';
        if (startDate && endDate) {
          openPeriodChartModal(startDate, endDate, label, pType);
        }
      });
    });

    // Click on year summary card or drill button to drill down to Monthly view
    container.querySelectorAll('.year-drill-btn, .year-summary-card').forEach(elem => {
      elem.addEventListener('click', (e) => {
        if (e.target.closest('.period-chart-btn')) return;
        const startDate = elem.dataset.startDate;
        if (startDate) {
          navDate = parseLocalYYYYMMDD(startDate);
          currentPeriod = 'monthly';
          collapsedGroups.clear();
          render();
        }
      });
    });

    // Click on month summary card or drill button to drill down to Weekly view
    container.querySelectorAll('.month-drill-btn, .month-summary-card').forEach(elem => {
      elem.addEventListener('click', (e) => {
        if (e.target.closest('.period-chart-btn')) return;
        const startDate = elem.dataset.startDate;
        if (startDate) {
          navDate = parseLocalYYYYMMDD(startDate);
          currentPeriod = 'weekly';
          collapsedGroups.clear();
          render();
        }
      });
    });

    // Click on week summary card or drill button to drill down to Daily view
    container.querySelectorAll('.week-drill-btn, .week-summary-card').forEach(elem => {
      elem.addEventListener('click', (e) => {
        if (e.target.closest('.period-chart-btn')) return;
        const startDate = elem.dataset.startDate;
        if (startDate) {
          navDate = parseLocalYYYYMMDD(startDate);
          currentPeriod = 'daily';
          collapsedGroups.clear();
          render();
        }
      });
    });

    // Click on tx card for detail
    container.querySelectorAll('.tx-card').forEach(card => {
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        const txId = card.dataset.txId;
        if (!txId) return;
        const tx = Store.getTransactions({}).find(t => t.id === txId);
        if (!tx) return;
        showTxDetail(tx);
      });
    });
  }

  // ── Transaction Detail Modal ──
  function showTxDetail(tx) {
    const cat = CATEGORIES[tx.category] || { name: tx.category, icon: mIcon('label') };
    Modal.open('Detail Transaksi', `
      <div style="text-align:center;margin-bottom:20px;">
        <div style="font-size:48px;margin-bottom:8px;color:var(--primary);">${cat.icon}</div>
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
        <button class="btn btn--primary btn--sm" id="modal-edit-tx">${mIcon('edit')} Edit</button>
        <button class="btn btn--danger btn--sm" id="modal-delete-tx">${mIcon('delete')} Hapus</button>
        <button class="btn btn--secondary btn--sm" onclick="Modal.close()">Tutup</button>
      `,
      onOpen(overlay) {
        overlay.querySelector('#modal-edit-tx').addEventListener('click', () => {
          Modal.close();
          openTransactionForm({
            editId: tx.id,
            type: tx.type,
            amount: tx.amount,
            category: tx.category,
            walletId: tx.walletId,
            date: tx.date,
            note: tx.note
          });
        });
        overlay.querySelector('#modal-delete-tx').addEventListener('click', () => {
          Store.deleteTransaction(tx.id);
          Modal.close();
          render();
          Toast.show('Transaksi dihapus', 'success');
        });
      }
    });
  }

  // ── Open Period Donut Chart Modal (Weekly, Monthly, Yearly) ──
  function openPeriodChartModal(startDate, endDate, label, periodType = '') {
    const txs = getTxForRange(startDate, endDate);
    const expenses = txs.filter(t => t.type === 'expense');
    const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = expenses.reduce((s, t) => s + t.amount, 0);
    const balance = income - totalExpense;

    const catMap = {};
    expenses.forEach(t => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });

    const expByCategory = Object.entries(catMap)
      .map(([cat, amount]) => ({ category: cat, amount }))
      .sort((a, b) => b.amount - a.amount);

    const bodyHtml = `
      <div style="text-align:center;margin-bottom:16px;">
        <span style="font-size:12px;color:var(--outline);font-weight:600;text-transform:uppercase;">${t('viewChart')} ${periodType}</span>
        <h3 style="font-size:18px;font-weight:700;color:var(--on-surface);margin-top:2px;">${label}</h3>
      </div>

      <!-- Donut Canvas Container -->
      <div style="display:flex;justify-content:center;align-items:center;margin-bottom:20px;min-height:180px;">
        ${expenses.length === 0 ? `
          <div style="text-align:center;color:var(--outline);font-size:13px;padding:20px;">
            ${mIcon('pie_chart')}
            <div style="margin-top:8px;">${t('noExpensesYet')}</div>
          </div>
        ` : `<canvas id="modal-period-chart" width="180" height="180"></canvas>`}
      </div>

      <!-- Category Breakdown List -->
      ${expByCategory.length > 0 ? `
        <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px;max-height:180px;overflow-y:auto;padding-right:4px;">
          ${expByCategory.map(d => {
            const cat = CATEGORIES[d.category] || { name: d.category, icon: mIcon('label'), color: '#888' };
            const pct = Math.round((d.amount / totalExpense) * 100) || 0;
            return `
              <div style="display:flex;align-items:center;gap:12px;padding:8px 12px;border-radius:var(--radius-md);background:var(--surface);">
                <div style="color:${cat.color};font-size:20px;">${cat.icon}</div>
                <div style="flex:1;">
                  <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:600;">
                    <span>${cat.name}</span>
                    <span class="mono">${Utils.formatRupiah(d.amount)} (${pct}%)</span>
                  </div>
                  <div style="width:100%;height:4px;background:var(--outline-variant);border-radius:2px;margin-top:4px;overflow:hidden;">
                    <div style="width:${pct}%;height:100%;background:${cat.color};border-radius:2px;"></div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      ` : ''}

      <!-- Totals Summary Grid -->
      <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;border-radius:var(--radius-lg);background:rgba(0,69,13,0.04);border:1px solid var(--outline-variant);">
        <div>
          <span style="display:block;font-size:10px;font-weight:700;color:var(--outline);text-transform:uppercase;">${t('income')}</span>
          <span class="mono text-income" style="font-weight:700;font-size:13px;">+${Utils.formatRupiah(income)}</span>
        </div>
        <div>
          <span style="display:block;font-size:10px;font-weight:700;color:var(--outline);text-transform:uppercase;">${t('expense')}</span>
          <span class="mono text-expense" style="font-weight:700;font-size:13px;">-${Utils.formatRupiah(totalExpense)}</span>
        </div>
        <div style="text-align:right;">
          <span style="display:block;font-size:10px;font-weight:700;color:var(--outline);text-transform:uppercase;">${t('netBalance')}</span>
          <span class="mono" style="font-weight:700;font-size:14px;color:${balance >= 0 ? 'var(--color-income)' : 'var(--color-expense)'}">
            ${Utils.formatRupiah(balance, true)}
          </span>
        </div>
      </div>
    `;

    Modal.open(`${t('viewChart')}`, bodyHtml, {
      footerHtml: `<button class="btn btn--secondary btn--full" onclick="Modal.close()">${t('close')}</button>`,
      onOpen(overlay) {
        if (expByCategory.length > 0) {
          setTimeout(() => {
            const canvas = overlay.querySelector('#modal-period-chart');
            if (canvas && typeof drawExpenseChart === 'function') {
              drawExpenseChart(expByCategory, canvas);
            }
          }, 100);
        }
      }
    });
  }

  render();
}

// ── Transaction Form (Modal) ── supports create, edit & transfer
function openTransactionForm(prefill = {}) {
  const isEdit = !!prefill.editId;
  let selectedType = prefill.type || 'expense';
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
        const amtInput = overlay.querySelector('#tx-amount');
        if (amtInput) {
          amtInput.addEventListener('input', (e) => {
            const val = Utils.parseRupiah(e.target.value);
            e.target.value = val > 0 ? 'Rp ' + new Intl.NumberFormat('id-ID').format(val) : '';
          });
          amtInput.focus();
        }

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
        const catContainer = overlay.querySelector('#tx-cat-container');

        // Add custom category button
        const addBtn = overlay.querySelector('#manage-cat-add-btn');
        if (addBtn) {
          addBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openAddCategoryModal(selectedType, (newType) => {
              if (newType !== selectedType) selectedType = newType;
              if (catContainer) {
                catContainer.innerHTML = renderCategorySelector(selectedType, selectedCategory);
                bindCategoryEvents();
              }
            });
          });
        }

        // Delete custom category button
        overlay.querySelectorAll('.del-cat-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const key = btn.dataset.catKey;
            if (!key) return;
            const catName = CATEGORIES[key]?.name || 'kategori';
            Store.deleteCustomCategory(key);
            if (selectedCategory === key) selectedCategory = '';
            if (catContainer) {
              catContainer.innerHTML = renderCategorySelector(selectedType, selectedCategory);
              bindCategoryEvents();
            }
            Toast.show(`Kategori "${catName}" dihapus`, 'info');
          });
        });

        // Select category item
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

      overlay.querySelector('#tx-save-btn').addEventListener('click', () => {
        const amount = Utils.parseRupiah(overlay.querySelector('#tx-amount').value);
        const date = overlay.querySelector('#tx-date').value;
        const note = overlay.querySelector('#tx-note').value.trim();

        if (!amount || amount <= 0) { Toast.show('Masukkan jumlah', 'warning'); return; }

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
          Toast.show(`${selectedType === 'income' ? 'Pemasukan' : 'Pengeluaran'} ${Utils.formatRupiah(amount)} dicatat!`, 'success');
        }
      });
    }
  });
}
