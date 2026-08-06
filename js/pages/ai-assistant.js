// ========================================
// MyWallet — AI Assistant Page (Verdant Glass)
// ========================================

function renderAI(container) {
  const chatHistory = [];

  function render() {
    container.innerHTML = `
      <div class="ai-container">
        <div class="ai-messages" id="chat-messages">
          ${chatHistory.length === 0 ? renderWelcomeScreen() : chatHistory.map(msg => renderMessageBubble(msg)).join('')}
        </div>
        
        <!-- Input Area (Fixed above bottom nav) -->
        <div class="ai-input-area">
          <div class="ai-input-bar">
            <button class="btn--ghost btn--icon" style="color:var(--mint-accent);">${mIcon('mic')}</button>
            <input type="text" id="chat-input" placeholder="Tuliskan transaksi atau pertanyaan..." autocomplete="off">
            <button class="ai-input-bar__send" id="chat-send">${mIcon('send')}</button>
          </div>
        </div>
      </div>
    `;

    // Scroll to bottom
    const msgContainer = container.querySelector('#chat-messages');
    if (msgContainer) {
      msgContainer.scrollTop = msgContainer.scrollHeight;
    }

    // Events
    const input = container.querySelector('#chat-input');
    const sendBtn = container.querySelector('#chat-send');

    function sendMessage(customText = null) {
      const text = customText || input.value.trim();
      if (!text) return;
      if (!customText) input.value = '';

      chatHistory.push({ role: 'user', text: Utils.escapeHtml(text), time: getCurrentTimeStr() });
      const responseObj = processAIMessage(text);
      chatHistory.push({ role: 'ai', ...responseObj, time: getCurrentTimeStr() });
      render();
    }

    if (sendBtn) sendBtn.addEventListener('click', () => sendMessage());
    if (input) {
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(); });
      input.focus();
    }

    // Quick prompt chip clicks
    container.querySelectorAll('.ai-welcome__prompt-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const text = chip.dataset.prompt;
        sendMessage(text);
      });
    });
  }

  render();
}

function getCurrentTimeStr() {
  const d = new Date();
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function renderWelcomeScreen() {
  return `
    <div class="ai-welcome">
      <div class="ai-welcome__icon">${mIcon('smart_toy')}</div>
      <h2 class="ai-welcome__title">AI Financial Assistant</h2>
      <p class="ai-welcome__desc">Saya bisa membantu mencatat transaksi, mengecek saldo, atau memberikan tips keuangan berbasis dompet kamu.</p>
      
      <div class="ai-welcome__prompts">
        <button class="ai-welcome__prompt-chip" data-prompt="Berapa saldo saya?">"Berapa saldo saya?"</button>
        <button class="ai-welcome__prompt-chip" data-prompt="Pengeluaran minggu ini">"Pengeluaran minggu ini"</button>
        <button class="ai-welcome__prompt-chip" data-prompt="Kasih tips keuangan">"Kasih tips keuangan"</button>
      </div>
    </div>
  `;
}

function renderMessageBubble(msg) {
  if (msg.role === 'user') {
    return `
      <div class="chat-bubble-user">
        <div class="chat-bubble-user__content">
          <p>${msg.text}</p>
        </div>
        <span class="chat-bubble-user__time">${msg.time}</span>
      </div>
    `;
  }

  // AI role
  let receiptHtml = '';
  if (msg.parsedTx) {
    const tx = msg.parsedTx;
    const cat = CATEGORIES[tx.category] || {};
    const wallet = Store.getWallet(tx.walletId) || {};
    const isIncome = tx.type === 'income';

    receiptHtml = `
      <div class="chat-receipt">
        <div class="chat-receipt__header">
          <span class="chat-receipt__type ${isIncome ? 'chat-receipt__type--income' : 'chat-receipt__type--expense'}">
            ${isIncome ? 'Income' : 'Expense'}
          </span>
          <span class="chat-receipt__date">Today</span>
        </div>
        <p class="chat-receipt__desc">${tx.note ? Utils.escapeHtml(tx.note) : (cat.name || tx.category)}</p>
        <div class="chat-receipt__footer">
          <div class="chat-receipt__wallet">
            ${mIcon('account_balance_wallet')}
            <span>${wallet.name || '—'}</span>
          </div>
          <span class="chat-receipt__amount ${isIncome ? 'text-income' : 'text-expense'} mono">
            ${isIncome ? '+' : '-'}Rp ${new Intl.NumberFormat('id-ID').format(tx.amount)}
          </span>
        </div>
      </div>
    `;
  }

  return `
    <div class="chat-bubble-ai">
      <div class="chat-bubble-ai__avatar">
        ${mIcon('smart_toy')}
      </div>
      <div class="chat-bubble-ai__wrap">
        <div class="chat-bubble-ai__content">
          <p>${msg.text}</p>
          ${receiptHtml}
        </div>
        <span class="chat-bubble-ai__time">${msg.time}</span>
      </div>
    </div>
  `;
}

// ── AI Natural Language Parser ──
function processAIMessage(text) {
  const lower = text.toLowerCase().trim();

  // ── Check for balance query ──
  if (lower.match(/saldo|berapa\s*(uang|duit|saldo)|total\s*(saldo|uang)/)) {
    const total = Store.getTotalBalance();
    const wallets = Store.getWallets();

    let details = wallets.map(w => `${w.name}: **${Utils.formatRupiah(w.balance)}**`).join('\n');
    return {
      text: `Saldo dompet Anda saat ini total **${Utils.formatRupiah(total)}**:\n\n${details}`
    };
  }

  // ── Check for expense report ──
  if (lower.match(/pengeluaran\s*(minggu|bulan|hari)|laporan|report|ringkasan/)) {
    const isWeek = lower.includes('minggu');
    let txs;
    if (isWeek) {
      const startWeek = Utils.startOfWeek();
      txs = Store.getTransactions({ type: 'expense', dateFrom: startWeek });
    } else {
      txs = Store.getTransactions({ type: 'expense', currentMonth: true });
    }

    const total = txs.reduce((s, t) => s + t.amount, 0);
    const byCategory = {};
    txs.forEach(t => {
      const catName = (CATEGORIES[t.category] || {}).name || t.category;
      byCategory[catName] = (byCategory[catName] || 0) + t.amount;
    });

    let textResp = `📊 Total pengeluaran **${isWeek ? 'minggu ini' : 'bulan ini'}** adalah **${Utils.formatRupiah(total)}**.`;
    if (total > 0) {
      const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
      const topCategory = sorted[0][0];
      textResp += ` Pengeluaran terbesar pada kategori **${topCategory}**.`;
    }
    return { text: textResp };
  }

  // ── Check for debt/receivable query ──
  if (lower.match(/hutang|piutang|pinjam/)) {
    const totalDebt = Store.getTotalDebt();
    const totalReceivable = Store.getTotalReceivable();

    return {
      text: `Ringkasan Hutang-Piutang Anda:\n• Total Hutang: **-${Utils.formatRupiah(totalDebt)}**\n• Total Piutang: **+${Utils.formatRupiah(totalReceivable)}**`
    };
  }

  // ── Check for financial tips ──
  if (lower.match(/saran|tips?|rekomendasi|hemat|nabung/)) {
    const expense = Store.getMonthlyExpense();
    const income = Store.getMonthlyIncome();

    let textResp = `💡 **Tips Keuangan MyWallet:**\n`;
    if (income > 0) {
      const savingsRate = Math.round(((income - expense) / income) * 100);
      textResp += `Rasio tabungan Anda bulan ini: **${savingsRate}%**. `;
      if (savingsRate < 20) textResp += `Disarankan untuk menyisihkan minimal 20% dari pemasukan.`;
      else textResp += `Hebat! Anda berhasil menabung di atas 20%.`;
    } else {
      textResp += `Selalu catat pengeluaran harian dan alokasikan 20% pemasukan untuk tabungan darurat.`;
    }
    return { text: textResp };
  }

  // ── Try to parse as transaction ──
  const parsed = parseTransaction(lower);
  if (parsed) {
    Store.addTransaction(parsed);
    Router.handleRoute();

    return {
      text: `Baik, saya telah mencatat pengeluaran/pemasukan Anda.`,
      parsedTx: parsed
    };
  }

  // ── Fallback ──
  return {
    text: `Saya belum memahami pesan tersebut. Coba gunakan contoh perintah:\n• *"Beli kopi 20rb pakai OVO"*\n• *"Berapa saldo saya?"*\n• *"Pengeluaran minggu ini"*`
  };
}

// ── Natural Language Transaction Parser ──
function parseTransaction(text) {
  const wallets = Store.getWallets();

  // Parse amount
  let amount = 0;
  const amountPatterns = [
    /(\d+(?:[.,]\d+)?)\s*(?:jt|juta)/i,
    /(\d+(?:[.,]\d+)?)\s*(?:rb|ribu|k)/i,
    /(?:rp\.?\s*)?(\d{1,3}(?:[.,]\d{3})*)/i,
    /(\d+)/
  ];

  for (const pat of amountPatterns) {
    const m = text.match(pat);
    if (m) {
      let val = parseFloat(m[1].replace(/\./g, '').replace(',', '.'));
      if (text.match(/jt|juta/i)) val *= 1000000;
      else if (text.match(/rb|ribu|k\b/i)) val *= 1000;
      amount = Math.round(val);
      break;
    }
  }

  if (amount <= 0) return null;

  // Parse wallet
  let walletId = '';
  for (const w of wallets) {
    if (text.includes(w.name.toLowerCase())) {
      walletId = w.id;
      break;
    }
  }
  if (!walletId) {
    const walletMatch = text.match(/(?:pakai|pake|dari|lewat|via|ke|masuk)\s+(\w+)/i);
    if (walletMatch) {
      const wName = walletMatch[1].toLowerCase();
      const found = wallets.find(w => w.name.toLowerCase().includes(wName));
      if (found) walletId = found.id;
    }
  }
  if (!walletId && wallets.length > 0) walletId = wallets[0].id;

  // Parse type
  let type = 'expense';
  if (text.match(/gaji|bonus|thr|terima|dapat|masuk|pendapatan|penjualan|dividen|saku|hadiah|hibah/)) {
    type = 'income';
  }

  // Parse category
  let category = type === 'expense' ? 'food' : 'salary';
  const categoryMap = {
    food: /makan|nasi|goreng|minum|kopi|ayam|sate|bakso|indomie|kantin|warung|resto|snack|jajan|sarapan|makan\s+siang|makan\s+malam|beli\s+makan/,
    transport: /transport|grab|gojek|ojol|bensin|bbm|parkir|tol|bus|kereta|taxi|angkot|ongkos/,
    shopping: /belanja|baju|pakaian|sepatu|tas|beli|shopee|tokopedia|online\s+shop|lazada|mall/,
    bills: /tagihan|listrik|wifi|internet|pulsa|token|air|pdam|gas|langganan|netflix|spotify|subscri/,
    health: /obat|dokter|rumah\s+sakit|rs|apotek|sehat|vitamin|klinik|medis/,
    entertainment: /hiburan|nonton|film|bioskop|game|main|karaoke|wisata|jalan-jalan|liburan|rekreasi/,
    education: /pendidikan|buku|kursus|les|sekolah|kuliah|spp|sertifikat|training|udemy/,
    tax: /pajak|tax|pph|ppn/,
    charity: /sedekah|donasi|infaq|zakat|amal|sumbangan/,
    installment: /cicilan|kredit|angsuran|cicil/,
    salary: /gaji|salary|upah/,
    bonus: /bonus|thr|insentif|lembur/,
    sales: /penjualan|jual|jualan/,
    investment: /dividen|investasi|saham|reksadana|bunga|return/,
    allowance: /saku|uang\s+jajan/,
    refund: /kembalian|refund|cashback/,
    gift: /hadiah|hibah|warisan|kado/,
  };

  for (const [cat, regex] of Object.entries(categoryMap)) {
    if (text.match(regex)) {
      category = cat;
      break;
    }
  }

  const note = text.charAt(0).toUpperCase() + text.slice(1);

  return {
    type,
    amount,
    category,
    walletId,
    date: Utils.today(),
    note
  };
}
