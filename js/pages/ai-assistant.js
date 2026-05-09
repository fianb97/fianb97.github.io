// ========================================
// MyWallet — AI Assistant Page
// ========================================

function renderAI(container) {
  const chatHistory = [];

  // Add welcome message
  chatHistory.push({
    role: 'ai',
    text: `Halo! 👋 Saya AI asisten keuangan kamu.\n\nKamu bisa:\n• Catat transaksi: <em>"Beli nasi goreng 20rb pakai Dana"</em>\n• Tanya saldo: <em>"Berapa saldo saya?"</em>\n• Laporan: <em>"Pengeluaran minggu ini"</em>\n• Tips: <em>"Kasih saran keuangan"</em>`
  });

  function render() {
    container.innerHTML = `
      <div class="card chat-container" style="animation:fadeInUp .5s var(--ease-out)">
        <div class="chat-messages" id="chat-messages">
          ${chatHistory.map(msg => `
            <div class="chat-bubble chat-bubble--${msg.role}">
              ${msg.role === 'ai' ? '<strong>🤖 MyWallet AI</strong><br>' : ''}
              ${msg.text}
            </div>
          `).join('')}
        </div>
        <div class="chat-input-area">
          <input type="text" id="chat-input" placeholder="Ketik pesan... cth: 'Beli kopi 15rb pakai OVO'" autocomplete="off">
          <button class="chat-send-btn" id="chat-send">${Icons.send}</button>
        </div>
      </div>
    `;

    // Scroll to bottom
    const msgContainer = container.querySelector('#chat-messages');
    msgContainer.scrollTop = msgContainer.scrollHeight;

    // Events
    const input = container.querySelector('#chat-input');
    const sendBtn = container.querySelector('#chat-send');

    function sendMessage() {
      const text = input.value.trim();
      if (!text) return;
      input.value = '';

      chatHistory.push({ role: 'user', text: Utils.escapeHtml(text) });
      const response = processAIMessage(text);
      chatHistory.push({ role: 'ai', text: response });
      render();
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(); });
    input.focus();
  }

  render();
}

// ── AI Natural Language Parser ──
function processAIMessage(text) {
  const lower = text.toLowerCase().trim();

  // ── Check for balance query ──
  if (lower.match(/saldo|berapa\s*(uang|duit|saldo)|total\s*(saldo|uang)/)) {
    const total = Store.getTotalBalance();
    const wallets = Store.getWallets();
    let response = `💰 <strong>Total Saldo: ${Utils.formatRupiah(total)}</strong>\n\n`;
    wallets.forEach(w => {
      response += `• ${w.name}: <strong class="mono">${Utils.formatRupiah(w.balance)}</strong>\n`;
    });
    return response;
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

    let response = `📊 <strong>Pengeluaran ${isWeek ? 'Minggu Ini' : 'Bulan Ini'}: ${Utils.formatRupiah(total)}</strong>\n\n`;
    if (total > 0) {
      const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
      sorted.forEach(([cat, amt]) => {
        const pct = Math.round((amt / total) * 100);
        response += `• ${cat}: ${Utils.formatRupiah(amt)} (${pct}%)\n`;
      });

      // Add tip
      const topCategory = sorted[0][0];
      response += `\n💡 <em>Pengeluaran terbesar kamu di kategori ${topCategory}. Coba evaluasi apakah bisa dikurangi.</em>`;
    } else {
      response += `Belum ada pengeluaran tercatat.`;
    }
    return response;
  }

  // ── Check for debt/receivable query ──
  if (lower.match(/hutang|piutang|pinjam/)) {
    const totalDebt = Store.getTotalDebt();
    const totalReceivable = Store.getTotalReceivable();
    const debts = Store.getDebts({ isPaid: false });

    let response = `🤝 <strong>Ringkasan Hutang-Piutang:</strong>\n`;
    response += `• Hutang: <strong class="text-debt">-${Utils.formatRupiah(totalDebt)}</strong>\n`;
    response += `• Piutang: <strong class="text-credit">+${Utils.formatRupiah(totalReceivable)}</strong>\n\n`;

    if (debts.length > 0) {
      response += `<strong>Detail:</strong>\n`;
      debts.forEach(d => {
        const sign = d.type === 'debt' ? '-' : '+';
        const label = d.type === 'debt' ? 'Hutang ke' : 'Piutang dari';
        response += `• ${label} ${Utils.escapeHtml(d.personName)}: ${sign}${Utils.formatRupiah(d.amount)}\n`;
      });
    }
    return response;
  }

  // ── Check for financial tips ──
  if (lower.match(/saran|tips?|rekomendasi|hemat|nabung/)) {
    const expense = Store.getMonthlyExpense();
    const income = Store.getMonthlyIncome();
    const expByCat = Store.getExpenseByCategory();

    let response = `💡 <strong>Tips Keuangan dari MyWallet AI:</strong>\n\n`;

    if (income > 0) {
      const savingsRate = Math.round(((income - expense) / income) * 100);
      response += `📈 Rasio tabungan kamu bulan ini: <strong>${savingsRate}%</strong>\n`;
      if (savingsRate < 20) {
        response += `⚠️ <em>Idealnya, sisihkan minimal 20% dari pemasukan untuk tabungan.</em>\n\n`;
      } else {
        response += `✅ <em>Bagus! Kamu sudah menabung di atas 20%.</em>\n\n`;
      }
    }

    if (expByCat.length > 0) {
      const top = expByCat[0];
      const cat = CATEGORIES[top.category] || {};
      response += `${cat.icon || ''} Pengeluaran terbesar: <strong>${cat.name || top.category}</strong> (${Utils.formatRupiah(top.amount)})\n`;
      response += `<em>Coba buat budget harian untuk kategori ini agar lebih terkontrol.</em>\n\n`;
    }

    response += `📌 <strong>Tips Umum:</strong>\n`;
    response += `1. Catat setiap pengeluaran, sekecil apapun\n`;
    response += `2. Gunakan metode 50/30/20 (Kebutuhan/Keinginan/Tabungan)\n`;
    response += `3. Review pengeluaran mingguan di hari Minggu\n`;
    response += `4. Lunasi hutang sebelum belanja non-esensial`;

    return response;
  }

  // ── Try to parse as transaction ──
  const parsed = parseTransaction(lower);
  if (parsed) {
    // Auto-create the transaction
    Store.addTransaction(parsed);
    Router.handleRoute(); // Refresh current page data (sidebar badge etc.)

    const cat = CATEGORIES[parsed.category] || {};
    const wallet = Store.getWallet(parsed.walletId) || {};

    return `✅ <strong>Transaksi dicatat!</strong>\n\n` +
      `• Jenis: <strong>${parsed.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</strong>\n` +
      `• Jumlah: <strong class="mono">${Utils.formatRupiah(parsed.amount)}</strong>\n` +
      `• Kategori: <strong>${cat.icon || ''} ${cat.name || parsed.category}</strong>\n` +
      `• Sumber: <strong>${wallet.name || '—'}</strong>\n` +
      `• Tanggal: <strong>${Utils.formatDate(parsed.date)}</strong>` +
      `${parsed.note ? '\n• Catatan: ' + Utils.escapeHtml(parsed.note) : ''}`;
  }

  // ── Fallback ──
  return `🤔 Maaf, saya belum bisa memahami pesan itu.\n\n` +
    `Coba gunakan format seperti:\n` +
    `• <em>"Beli nasi goreng 20rb pakai Dana"</em>\n` +
    `• <em>"Gaji 3jt masuk BRI"</em>\n` +
    `• <em>"Berapa saldo saya?"</em>\n` +
    `• <em>"Pengeluaran bulan ini"</em>\n` +
    `• <em>"Kasih tips keuangan"</em>`;
}

// ── Natural Language Transaction Parser ──
function parseTransaction(text) {
  const wallets = Store.getWallets();

  // ── Parse amount ──
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

  // ── Parse wallet ──
  let walletId = '';
  for (const w of wallets) {
    if (text.includes(w.name.toLowerCase())) {
      walletId = w.id;
      break;
    }
  }
  // Fallback: pakai/pake/dari
  if (!walletId) {
    const walletMatch = text.match(/(?:pakai|pake|dari|lewat|via|ke|masuk)\s+(\w+)/i);
    if (walletMatch) {
      const wName = walletMatch[1].toLowerCase();
      const found = wallets.find(w => w.name.toLowerCase().includes(wName));
      if (found) walletId = found.id;
    }
  }
  // Fallback to first wallet
  if (!walletId && wallets.length > 0) walletId = wallets[0].id;

  // ── Parse type (income or expense) ──
  let type = 'expense';
  if (text.match(/gaji|bonus|thr|terima|dapat|masuk|pendapatan|penjualan|dividen|saku|hadiah|hibah/)) {
    type = 'income';
  }

  // ── Parse category ──
  let category = type === 'expense' ? 'food' : 'salary';

  const categoryMap = {
    // Expenses
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
    // Income
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

  // ── Build note from text ──
  // Clean up the original text as note
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
