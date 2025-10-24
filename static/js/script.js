document.addEventListener('DOMContentLoaded', () => {
  // Auth elements
  const authSection = document.getElementById('authSection');
  const profileSection = document.getElementById('profileSection');
  const appContent = document.getElementById('appContent');
  const profilePage = document.getElementById('profilePage');
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');
  const registerError = document.getElementById('registerError');
  const loginError = document.getElementById('loginError');
  const logoutBtn = document.getElementById('logoutBtn');
  const headerLogoutLink = document.getElementById('headerLogoutLink');
  const logoutError = document.getElementById('logoutError');
  const profileEmail = document.getElementById('profileEmail');
  // Profile card & page DOM
  const profileCard = document.getElementById('profileCard');
  const profileAvatarThumb = document.getElementById('profileAvatarThumb');
  const profileUsername = document.getElementById('profileUsername');
  const profileEmailSmall = document.getElementById('profileEmailSmall');
  const editProfileLink = document.getElementById('editProfileLink');
  const profileBackBtn = document.getElementById('profileBackBtn');
  const profileAvatar = document.getElementById('profileAvatar');
  const avatarForm = document.getElementById('avatarForm');
  const avatarInput = document.getElementById('avatarInput');
  const profileForm = document.getElementById('profileForm');
  const pfFullName = document.getElementById('pfFullName');
  const pfUsername = document.getElementById('pfUsername');
  const pfEmail = document.getElementById('pfEmail');
  const pfCurrentPassword = document.getElementById('pfCurrentPassword');
  const pfNewPassword = document.getElementById('pfNewPassword');
  const profileError = document.getElementById('profileError');
  const profileSuccess = document.getElementById('profileSuccess');
  const deleteAccountBtn = document.getElementById('deleteAccountBtn');
  const deleteDataBtn = document.getElementById('deleteDataBtn');
  const accountCreatedEl = document.getElementById('accountCreated');
  const profileMonthExpenseEl = document.getElementById('profileMonthExpense');
  const profileActiveGoalsEl = document.getElementById('profileActiveGoals');
  const badgesWrap = document.getElementById('badgesWrap');
  const demoBtn = document.getElementById('demoBtn');

  const incomeForm = document.getElementById('incomeForm');
  const expenseForm = document.getElementById('expenseForm');
  const incomeErrorEl = document.getElementById('incomeError');
  const expenseErrorEl = document.getElementById('expenseError');
  const incomeEl = document.getElementById('incomeValue');
  const expenseEl = document.getElementById('expenseValue');
  const balanceEl = document.getElementById('balanceValue');
  const listEl = document.getElementById('transactionsList');
  const expenseChartCanvas = document.getElementById('expenseChart');
  const expenseChartEmpty = document.getElementById('expenseChartEmpty');
  // Breakdown controls
  const rangeWeekBtn = document.getElementById('rangeWeek');
  const rangeMonthBtn = document.getElementById('rangeMonth');
  const rangeYearBtn = document.getElementById('rangeYear');
  const chartPieBtn = document.getElementById('chartPieBtn');
  const chartBarBtn = document.getElementById('chartBarBtn');
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  const exportPdfBtn = document.getElementById('exportPdfBtn');
  const sumTotalEl = document.getElementById('sumTotal');
  const sumTopCatEl = document.getElementById('sumTopCat');
  const sumAvgEl = document.getElementById('sumAvg');
  const catTableBody = document.getElementById('catTableBody');
  const detailsCategory = document.getElementById('detailsCategory');
  const detailsTableBody = document.getElementById('detailsTableBody');
  const budgetInput = document.getElementById('budgetInput');
  const budgetVariance = document.getElementById('budgetVariance');
  const expenseTrendCanvas = document.getElementById('expenseTrendChart');
  // New feature DOM
  const inviteEmail = document.getElementById('inviteEmail');
  const inviteBtn = document.getElementById('inviteBtn');
  const walletMembers = document.getElementById('walletMembers');
  const goalForm = document.getElementById('goalForm');
  const goalName = document.getElementById('goalName');
  const goalTarget = document.getElementById('goalTarget');
  const goalCategory = document.getElementById('goalCategory');
  const goalsList = document.getElementById('goalsList');
  const expenseHeatmap = document.getElementById('expenseHeatmap');
  const moodForm = document.getElementById('moodForm');
  const moodSelect = document.getElementById('moodSelect');
  const moodNote = document.getElementById('moodNote');
  const moodTrendCanvas = document.getElementById('moodTrend');
  const moodInsights = document.getElementById('moodInsights');
  // Wallet management page DOM
  const walletPage = document.getElementById('walletPage');
  const walletManageBtn = document.getElementById('walletManageBtn');
  const walletBackBtn = document.getElementById('walletBackBtn');
  const walletCreateBtn = document.getElementById('walletCreateBtn');
  const walletRenameInput = document.getElementById('walletRenameInput');
  const walletRenameSave = document.getElementById('walletRenameSave');
  const walletInviteEmail = document.getElementById('walletInviteEmail');
  const walletInviteBtn = document.getElementById('walletInviteBtn');
  const walletMembersPage = document.getElementById('walletMembersPage');
  const walletNameEl = document.getElementById('walletName');
  let expenseChart;
  let trendChart;

  // Plugin to paint a solid background color behind Chart.js canvases
  const chartBgPlugin = {
    id: 'bg',
    beforeDraw(chart, args, pluginOptions) {
      const { ctx, chartArea } = chart;
      if (!chartArea) return;
      ctx.save();
      ctx.fillStyle = (pluginOptions && pluginOptions.color) || '#0f172a'; // dark blue background
      ctx.fillRect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
      ctx.restore();
    }
  };

  // Update breakdown summary stats and category table
  const updateBreakdownSummary = (shaped) => {
    const entries = Object.entries(shaped || {});
    const sum = entries.reduce((a,[,v]) => a + Number(v||0), 0);
    if (sumTotalEl) sumTotalEl.textContent = sum.toFixed(2);
    const sorted = entries.sort((a,b)=> b[1]-a[1]);
    const top = sorted[0] ? `${sorted[0][0]} ($${Number(sorted[0][1]).toFixed(2)})` : '—';
    if (sumTopCatEl) sumTopCatEl.textContent = top;
    const avg = entries.length ? sum/entries.length : 0;
    if (sumAvgEl) sumAvgEl.textContent = avg.toFixed(2);
    if (catTableBody) {
      catTableBody.innerHTML='';
      for (const [cat, val] of sorted) {
        const pct = sum>0 ? ((Number(val)/sum)*100).toFixed(1) : '0.0';
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${cat}</td><td style="text-align:right;">$${Number(val).toFixed(2)}</td><td class="meta" style="text-align:right;">${pct}%</td>`;
        catTableBody.appendChild(tr);
      }
    }
  };

  // Fetch backend category summary (preferred when no local filters)
  const refreshCategorySummary = async () => {
    try {
      const data = await fetchJSON('/api/category_summary'); // [{category, amount}]
      const shaped = {};
      (data||[]).forEach(row => { shaped[row.category] = Number(row.amount||0); });
      state.lastBreakdown = shaped;
      updateBreakdownSummary(shaped);
      renderExpenseChart(shaped);
      updateCategoryDetails(state.focusedCategory || '');
    } catch (_) {
      const shaped = computeBreakdownFrom(state.lastTransactions||[]);
      state.lastBreakdown = shaped;
      updateBreakdownSummary(shaped);
      renderExpenseChart(shaped);
      updateCategoryDetails(state.focusedCategory || '');
    }
  };

  // Smart insights list
  const refreshInsights = async () => {
    if (!insightsList) return;
    insightsList.innerHTML='';
    try {
      const r = await fetchJSON('/api/insights');
      (r.insights||[]).forEach(txt => {
        const li = document.createElement('li');
        li.className = 'meta';
        li.textContent = txt;
        insightsList.appendChild(li);
      });
    } catch {}
  };

  // Filters and summary DOM
  const filterCategory = document.getElementById('filterCategory');
  const filterStart = document.getElementById('filterStart');
  const filterEnd = document.getElementById('filterEnd');
  const applyFiltersBtn = document.getElementById('applyFilters');
  const clearFiltersBtn = document.getElementById('clearFilters');
  const downloadCsvBtn = document.getElementById('downloadCsv');
  const monthIncomeEl = document.getElementById('monthIncome');
  const monthExpenseEl = document.getElementById('monthExpense');
  const monthNetEl = document.getElementById('monthNet');

  // Compute a category breakdown from a list of transactions (expenses only)
  const computeBreakdownFrom = (txs) => {
    const res = {};
    if (!Array.isArray(txs)) return res;
    for (const t of txs) {
      if (!t || t.type !== 'expense') continue;
      const cat = (t.category || 'Uncategorized').toString();
      const amt = Number(t.amount || 0);
      res[cat] = (res[cat] || 0) + (isNaN(amt) ? 0 : amt);
    }
    return res;
  };

  const insightsList = document.getElementById('insightsList');

  const state = {
    filters: { category: '', start: '', end: '' },
    lastTransactions: [],
    lastBreakdown: {},
    chartType: 'pie',
    focusedCategory: '',
    walletId: null,
    goals: [],
    moods: [],
  };

  // Populate the category <select> with unique categories from transactions
  const populateCategoryFilter = (txs) => {
    if (!filterCategory) return;
    const seen = new Set();
    const cats = [];
    (Array.isArray(txs) ? txs : []).forEach(t => {
      if (t && t.category && t.type) {
        if (!seen.has(t.category)) {
          seen.add(t.category);
          cats.push(t.category);
        }
      }
    });
    filterCategory.innerHTML = '';
    const allOpt = document.createElement('option');
    allOpt.value = '';
    allOpt.textContent = 'All categories';
    filterCategory.appendChild(allOpt);
    cats.sort().forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      filterCategory.appendChild(opt);
    });
    if (state.filters.category) filterCategory.value = state.filters.category;
  };

  // ---------- Demo Mode ----------
  const runDemo = async () => {
    try {
      const me = await fetchJSON('/api/auth/me');
      if (!me.user) {
        alert('Please register or log in first to run the demo.');
        return;
      }
    } catch {
      alert('Please register or log in first to run the demo.');
      return;
    }
    // Seed transactions across last 14 days
    const today = new Date();
    const iso = (d) => new Date(d).toISOString();
    const txSamples = [
      { type:'income', category:'Salary', amount:1200, date: iso(today) },
      { type:'expense', category:'Food', amount:35.5, date: iso(new Date(today.getFullYear(), today.getMonth(), today.getDate()-1)) },
      { type:'expense', category:'Transport', amount:12.0, date: iso(new Date(today.getFullYear(), today.getMonth(), today.getDate()-2)) },
      { type:'expense', category:'Rent', amount:500, date: iso(new Date(today.getFullYear(), today.getMonth(), 1)) },
      { type:'expense', category:'Entertainment', amount:28.75, date: iso(new Date(today.getFullYear(), today.getMonth(), today.getDate()-3)) },
      { type:'expense', category:'Food', amount:22.10, date: iso(new Date(today.getFullYear(), today.getMonth(), today.getDate()-5)) },
      { type:'expense', category:'Groceries', amount:64.90, date: iso(new Date(today.getFullYear(), today.getMonth(), today.getDate()-7)) },
      { type:'expense', category:'Utilities', amount:80.0, date: iso(new Date(today.getFullYear(), today.getMonth(), today.getDate()-10)) },
      { type:'income', category:'Bonus', amount:200, date: iso(new Date(today.getFullYear(), today.getMonth(), today.getDate()-11)) },
      { type:'expense', category:'Food', amount:18.35, date: iso(new Date(today.getFullYear(), today.getMonth(), today.getDate()-12)) },
    ];
    for (const t of txSamples) {
      try { await fetchJSON('/api/transactions', { method:'POST', body: JSON.stringify(t) }); } catch {}
    }
    // Goals
    const goals = [
      { name:'Spend under $300 on Food', target_amount:300, category:'Food' },
      { name:'Save $200 this month', target_amount:200, category:'' },
    ];
    for (const g of goals) {
      try { await fetchJSON('/api/goals', { method:'POST', body: JSON.stringify(g) }); } catch {}
    }
    // Moods over last 7 days
    for (let i=0;i<7;i++) {
      const d = new Date(today); d.setDate(today.getDate()-i);
      const score = 2 + (i % 4); // 2..5
      try { await fetchJSON('/api/moods', { method:'POST', body: JSON.stringify({ score, note: '', date: d.toISOString().slice(0,10) }) }); } catch {}
    }
    // Shared wallet: ensure wallet, invite two, accept one
    const wid = await ensureWallet();
    if (wid) {
      try { await fetchJSON(`/api/wallets/${wid}/invite`, { method:'POST', body: JSON.stringify({ email:'teammate@example.com' }) }); } catch {}
      try { const inv2 = await fetchJSON(`/api/wallets/${wid}/invite`, { method:'POST', body: JSON.stringify({ email:'friend@example.com' }) });
        // attempt to accept the first invited member (owner can set status)
        if (inv2 && inv2.member && inv2.member.id) {
          await fetchJSON(`/api/wallets/${wid}/members/${inv2.member.id}/status`, { method:'POST', body: JSON.stringify({ status:'active' }) });
        }
      } catch {}
    }
    await refreshAll();
    // Open Wallet page to showcase
    if (typeof openWalletPage === 'function') await openWalletPage();
  };
  if (demoBtn) demoBtn.addEventListener('click', runDemo);

  // ---------- Shared Wallets ----------
  const ensureWallet = async () => {
    if (state.walletId) return state.walletId;
    try {
      const w = await fetchJSON('/api/wallets', { method: 'POST', body: JSON.stringify({ name: 'My Wallet' }) });
      state.walletId = w.wallet.id;
      return state.walletId;
    } catch { return null; }
  };

  const refreshMembers = async () => {
    if (!state.walletId || !walletMembers) return;
    try {
      const ms = await fetchJSON(`/api/wallets/${state.walletId}/members`);
      walletMembers.innerHTML = '';
      const colors = ['#93c5fd','#60a5fa','#a78bfa','#38bdf8','#7dd3fc'];
      ms.forEach((m, i) => {
        const tag = document.createElement('span');
        tag.textContent = `${m.email} • ${m.role} • ${m.status}`;
        tag.style.padding = '6px 10px';
        tag.style.borderRadius = '999px';
        tag.style.fontSize = '12px';
        tag.style.background = 'var(--card-muted)';
        tag.style.border = '1px solid var(--border)';
        tag.style.color = colors[i % colors.length];
        walletMembers.appendChild(tag);
      });
    } catch {}
  };
  if (inviteBtn) inviteBtn.addEventListener('click', async () => {
    const email = (inviteEmail?.value || '').trim();
    if (!email) return;
    const wid = await ensureWallet();
    if (!wid) return;
    try {
      await fetchJSON(`/api/wallets/${wid}/invite`, { method: 'POST', body: JSON.stringify({ email }) });
      inviteEmail.value = '';
      await refreshMembers();
      // also open management page for full control
      await openWalletPage();
    } catch {}
  });

  // ---------- Goals & Achievements ----------
  const monthBounds = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth()+1, 0);
    const iso = d => d.toISOString().slice(0,10);
    return { startISO: iso(start), endISO: iso(end) };
  };
  const computeSpend = (txs, category=null) => {
    const { startISO, endISO } = monthBounds();
    let sum = 0;
    for (const t of txs||[]) {
      if (!t || t.type !== 'expense') continue;
      const day = (t.date||'').slice(0,10);
      if (day && (day < startISO || day > endISO)) continue;
      if (category && t.category !== category) continue;
      sum += Number(t.amount||0);
    }
    return sum;
  };
  const renderGoals = () => {
    if (!goalsList) return;
    goalsList.innerHTML = '';
    const txs = state.lastTransactions || [];
    for (const g of state.goals) {
      const spent = computeSpend(txs, g.category || null);
      const pct = Math.min(100, Math.round((spent / (g.target_amount||1)) * 100));
      const wrap = document.createElement('div');
      wrap.className = 'goal-item';
      wrap.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <div><strong>${g.name}</strong> <span class="meta">${g.category? '('+g.category+')':''}</span></div>
          <div class="meta">$${spent.toFixed(2)} / $${Number(g.target_amount||0).toFixed(2)}</div>
        </div>
        <div style="height:10px; background: var(--card-muted); border:1px solid var(--border); border-radius:999px; overflow:hidden;">
          <div style="height:100%; width:${pct}%; background: var(--primary);"></div>
        </div>
        <div class="meta" style="margin-top:4px;">${pct>=100? '🏆 Goal achieved':''}</div>
      `;
      goalsList.appendChild(wrap);
    }
  };
  const refreshGoals = async () => {
    try {
      state.goals = await fetchJSON('/api/goals');
      renderGoals();
    } catch {}
  };
  if (goalForm) goalForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = { name: goalName.value, target_amount: goalTarget.value, category: goalCategory.value };
    try {
      await fetchJSON('/api/goals', { method: 'POST', body: JSON.stringify(payload) });
      goalName.value=''; goalTarget.value=''; goalCategory.value='';
      await refreshGoals();
    } catch {}
  });

  // ---------- Expense Heatmap (last 30 days) ----------
  const renderHeatmap = (txs) => {
    if (!expenseHeatmap) return;
    const ctx = expenseHeatmap.getContext('2d');
    const W = expenseHeatmap.width, H = expenseHeatmap.height;
    ctx.clearRect(0,0,W,H);
    // Build daily totals for last 30 days
    const map = new Map();
    const today = new Date();
    for (let i=29;i>=0;i--) {
      const d = new Date(today); d.setDate(today.getDate()-i);
      const key = d.toISOString().slice(0,10);
      map.set(key, 0);
    }
    for (const t of txs||[]) {
      if (t.type !== 'expense') continue;
      const day = (t.date||'').slice(0,10);
      if (map.has(day)) map.set(day, map.get(day) + Number(t.amount||0));
    }
    const vals = Array.from(map.values());
    const max = Math.max(1, ...vals);
    const cols = 15, rows = 2; // 30 cells grid
    const pad = 4; const cellW = (W - (cols+1)*pad)/cols; const cellH = (H - (rows+1)*pad)/rows;
    const days = Array.from(map.keys());
    let idx=0;
    for (let r=0;r<rows;r++) {
      for (let c=0;c<cols;c++) {
        const v = vals[idx];
        const intensity = v/max; // 0..1
        const rcol = Math.round(147 + (56-147)*intensity); // from #93c5fd to #1e3a8a-ish via blue depth
        const gcol = Math.round(197 + (64-197)*intensity);
        const bcol = Math.round(253 + (138-253)*intensity);
        ctx.fillStyle = `rgb(${rcol},${gcol},${bcol})`;
        const x = pad + c*(cellW+pad);
        const y = pad + r*(cellH+pad);
        ctx.fillRect(x,y,cellW,cellH);
        idx++;
      }
    }
  };

  // ---------- Mood & Money ----------
  let moodChart;
  const renderMoodTrend = (moods) => {
    if (!moodTrendCanvas) return;
    const labels = (moods||[]).map(m => m.date);
    const values = (moods||[]).map(m => m.score);
    if (moodChart) { moodChart.destroy(); moodChart=null; }
    const ctx = moodTrendCanvas.getContext('2d');
    moodChart = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets: [{ label: 'Mood', data: values, borderColor: '#93c5fd', tension: 0.25, fill: false }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display:false }, bg: { color: '#0f172a' } }, scales: { y: { min:1, max:5, ticks:{ color:'#e5e7eb' } }, x: { ticks:{ color:'#e5e7eb' } } } },
      plugins: [chartBgPlugin]
    });
  };
  const refreshMoods = async () => {
    try {
      state.moods = await fetchJSON('/api/moods');
      renderMoodTrend(state.moods.slice().reverse()); // oldest to newest
      // Simple insight: compare avg spend on days mood>=4 vs <=2
      if (moodInsights) {
        moodInsights.innerHTML = '';
        const spendByDay = {};
        (state.lastTransactions||[]).forEach(t => { if (t.type==='expense'){ const d=(t.date||'').slice(0,10); spendByDay[d]=(spendByDay[d]||0)+Number(t.amount||0);} });
        const highs = state.moods.filter(m=>m.score>=4).map(m=>spendByDay[m.date]||0);
        const lows = state.moods.filter(m=>m.score<=2).map(m=>spendByDay[m.date]||0);
        const avg = arr => arr.length? arr.reduce((a,b)=>a+b,0)/arr.length : 0;
        if (highs.length||lows.length) {
          const li = document.createElement('li');
          li.className='meta';
          li.textContent = `Avg spend on good mood days: $${avg(highs).toFixed(2)} vs low mood days: $${avg(lows).toFixed(2)}`;
          moodInsights.appendChild(li);
        }
      }
    } catch {}
  };
  if (moodForm) moodForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = { score: Number(moodSelect.value), note: moodNote.value, date: new Date().toISOString().slice(0,10) };
    try {
      await fetchJSON('/api/moods', { method: 'POST', body: JSON.stringify(payload) });
      moodNote.value='';
      await refreshMoods();
    } catch {}
  });
  

  const fetchJSON = async (url, options = {}) => {
    const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  };

  const fetchProfile = async () => {
    try {
      const p = await fetchJSON('/api/profile');
      return p;
    } catch {
      return null;
    }
  };

  const showApp = (user) => {
    if (authSection) authSection.hidden = true;
    if (profileSection) {
      profileSection.hidden = false;
      if (profileEmail) profileEmail.textContent = user?.email || '';
    }
    if (appContent) appContent.hidden = false;
    if (profilePage) profilePage.hidden = true;
  };

  const showAuth = () => {
    if (authSection) authSection.hidden = false;
    if (profileSection) profileSection.hidden = true;
    if (appContent) appContent.hidden = true;
    if (profilePage) profilePage.hidden = true;
  };

  const loadMe = async () => {
    try {
      const r = await fetchJSON('/api/auth/me');
      return r.user || null;
    } catch {
      return null;
    }
  };

  const refreshBalance = async () => {
    const b = await fetchJSON('/api/balance');
    incomeEl.textContent = b.income.toFixed(2);
    expenseEl.textContent = b.expense.toFixed(2);
    balanceEl.textContent = b.balance.toFixed(2);
  };

  const formatDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString();
  };

  const fetchTransactions = async () => {
    const params = new URLSearchParams();
    if (state.filters.category) params.set('category', state.filters.category);
    if (state.filters.start) params.set('start_date', new Date(state.filters.start).toISOString());
    if (state.filters.end) params.set('end_date', new Date(state.filters.end).toISOString());
    const url = `/api/transactions${params.toString() ? `?${params.toString()}` : ''}`;
    const txs = await fetchJSON(url);
    state.lastTransactions = txs;
    return txs;
  };

  const makeActionButton = (label, className) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = label;
    btn.className = className;
    btn.style.marginLeft = '8px';
    return btn;
  };

  const renderTransactions = (txs) => {
    listEl.innerHTML = '';
    if (!txs.length) {
      listEl.innerHTML = '<div class="transaction-item"><div>No transactions yet.</div></div>';
      return;
    }
    for (const tx of txs) {
      const row = document.createElement('div');
      row.className = 'transaction-item';

      const info = document.createElement('div');
      const title = document.createElement('div');
      title.innerHTML = `<strong>${tx.category || '(No category)'} </strong>`;
      const meta = document.createElement('div');
      meta.className = 'meta';
      meta.textContent = `${formatDate(tx.date)} · ${tx.type}`;
      info.appendChild(title);
      info.appendChild(meta);

      const right = document.createElement('div');
      right.className = `amount-${tx.type === 'income' ? 'income' : 'expense'}`;
      right.textContent = `${tx.type === 'income' ? '+' : '-'}$${Number(tx.amount).toFixed(2)}`;

      const actions = document.createElement('div');
      const editBtn = makeActionButton('Edit', 'btn-edit');
      const delBtn = makeActionButton('Delete', 'btn-delete');
      actions.appendChild(editBtn);
      actions.appendChild(delBtn);

      const wrapper = document.createElement('div');
      wrapper.style.display = 'grid';
      wrapper.style.gridTemplateColumns = '1fr auto auto';
      wrapper.style.alignItems = 'center';
      wrapper.style.gap = '8px';
      wrapper.appendChild(info);
      wrapper.appendChild(right);
      wrapper.appendChild(actions);
      row.appendChild(wrapper);

      // Inline edit logic
      editBtn.addEventListener('click', () => {
        // Build inline editor
        const editor = document.createElement('div');
        editor.style.display = 'grid';
        editor.style.gridTemplateColumns = '1fr 1fr 1fr auto auto';
        editor.style.gap = '8px';

        const typeSel = document.createElement('select');
        typeSel.innerHTML = '<option value="income">Income</option><option value="expense">Expense</option>';
        typeSel.value = tx.type;

        const catIn = document.createElement('input');
        catIn.type = 'text';
        catIn.value = tx.category || '';

        const amtIn = document.createElement('input');
        amtIn.type = 'number';
        amtIn.step = '0.01';
        amtIn.min = '0';
        amtIn.value = String(tx.amount);

        const dateIn = document.createElement('input');
        dateIn.type = 'datetime-local';
        if (tx.date) {
          const d = new Date(tx.date);
          // format to yyyy-MM-ddThh:mm
          const pad = (n) => String(n).padStart(2, '0');
          const loc = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
          dateIn.value = loc;
        }

        const saveBtn = makeActionButton('Save', 'btn-save');
        const cancelBtn = makeActionButton('Cancel', 'btn-cancel');

        editor.appendChild(typeSel);
        editor.appendChild(catIn);
        editor.appendChild(amtIn);
        editor.appendChild(dateIn);
        editor.appendChild(saveBtn);
        editor.appendChild(cancelBtn);

        row.innerHTML = '';
        row.appendChild(editor);

        cancelBtn.addEventListener('click', async () => {
          renderTransactions(state.lastTransactions);
        });

        saveBtn.addEventListener('click', async () => {
          const payload = {
            type: typeSel.value,
            category: catIn.value.trim(),
            amount: Number(amtIn.value),
            date: dateIn.value ? new Date(dateIn.value).toISOString() : null,
          };
          try {
            await fetchJSON(`/api/transactions/${tx.id}`, { method: 'PUT', body: JSON.stringify(payload) });
            await refreshAll();
          } catch (err) {
            alert(err.message);
          }
        });
      });

      delBtn.addEventListener('click', async () => {
        if (!confirm('Delete this transaction?')) return;
        try {
          await fetchJSON(`/api/transactions/${tx.id}`, { method: 'DELETE' });
          await refreshAll();
        } catch (err) {
          alert(err.message);
        }
      });

      listEl.appendChild(row);
    }
  };

  const renderExpenseChart = (data) => {
    if (!expenseChartCanvas) return;
    let labels = Object.keys(data || {});
    let values = Object.values(data || {});

    // Fallback: if no expense data, render a neutral placeholder slice so the chart area is never blank
    const sum = values.reduce((a, b) => a + Number(b || 0), 0);
    if (!labels.length || sum === 0) {
      labels = ['No expenses'];
      values = [1];
    }
    if (expenseChartEmpty) expenseChartEmpty.hidden = !(sum === 0);
    // Use dark-blue themed palette; segments readable on dark background
    const colors = ['#93c5fd','#60a5fa','#3b82f6','#a5b4fc','#818cf8','#60a5fa','#93c5fd','#3b82f6','#a5b4fc','#818cf8'];
    const bgColors = values.map((_, i) => colors[i % colors.length]);

    if (expenseChart) {
      // If chart type changed, destroy and recreate
      if (expenseChart.config.type !== state.chartType) {
        expenseChart.destroy();
        expenseChart = null;
      }
    }

    if (!expenseChart) {
      const ctx = expenseChartCanvas.getContext('2d');
      expenseChart = new Chart(ctx, {
        type: state.chartType,
        data: {
          labels,
          datasets: [{
            data: values,
            backgroundColor: bgColors,
            borderColor: '#ffffff',
            borderWidth: 1,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: true, position: 'bottom', labels: { color: '#e5e7eb' } },
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const val = Array.isArray(ctx.raw) ? ctx.raw[1] : ctx.parsed;
                  const v = typeof val === 'number' ? val : 0;
                  const pct = sum > 0 ? ((v / sum) * 100).toFixed(1) : '0.0';
                  return `${ctx.label}: $${v.toFixed(2)} (${pct}%)`;
                }
              },
              bodyColor: '#e5e7eb',
              titleColor: '#e5e7eb',
              backgroundColor: '#1e293b'
            },
            bg: { color: '#0f172a' }
          },
          scales: state.chartType === 'bar' ? {
            y: { beginAtZero: true, ticks: { color: '#e5e7eb' }, grid: { color: 'rgba(255,255,255,0.08)' } },
            x: { ticks: { color: '#e5e7eb' }, grid: { color: 'rgba(255,255,255,0.05)' } }
          } : {},
          onClick: (evt, elements) => {
            if (!elements || !elements.length) return;
            const idx = elements[0].index;
            const cat = expenseChart.data.labels[idx];
            state.focusedCategory = cat;
            updateCategoryDetails(cat);
          }
        },
        plugins: [chartBgPlugin]
      });
    } else {
      expenseChart.data.labels = labels;
      expenseChart.data.datasets[0].data = values;
      expenseChart.data.datasets[0].backgroundColor = bgColors;
      expenseChart.update();
    }
  };

  const updateCategoryDetails = (category) => {
    if (detailsCategory) detailsCategory.textContent = category ? `(${category})` : '(click a slice/bar to focus)';
    // Filter txs by selected category and active date range
    const txs = (state.lastTransactions || []).filter(t => t.type === 'expense' && (!category || t.category === category));
    const { start, end } = state.filters;
    const inRange = (d) => {
      if (!start && !end) return true;
      const ds = (d || '').slice(0,10);
      if (start && ds < start) return false;
      if (end && ds > end) return false;
      return true;
    };
    const txsInRange = txs.filter(t => inRange(t.date || ''));
    // Fill details table
    if (detailsTableBody) {
      detailsTableBody.innerHTML = '';
      txsInRange.sort((a,b) => (a.date||'').localeCompare(b.date||''));
      for (const t of txsInRange) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${(t.date||'').slice(0,10)}</td><td>${t.category||''}</td><td style="text-align:right;">$${Number(t.amount||0).toFixed(2)}</td>`;
        detailsTableBody.appendChild(tr);
      }
    }
    // Compute total for variance
    const total = txsInRange.reduce((a,t)=> a + Number(t.amount||0), 0);
    if (budgetInput && budgetVariance) {
      const b = Number(budgetInput.value || 0);
      if (b > 0) {
        const diff = b - total;
        budgetVariance.textContent = diff >= 0 ? `Under by $${diff.toFixed(2)}` : `Over by $${Math.abs(diff).toFixed(2)}`;
        budgetVariance.style.color = diff >= 0 ? '#16a34a' : '#dc2626';
      } else {
        budgetVariance.textContent = '';
      }
    }
    // Build daily sums for trend chart
    if (expenseTrendCanvas) {
      const buckets = {};
      for (const t of txsInRange) {
        const day = (t.date||'').slice(0,10) || 'Unknown';
        buckets[day] = (buckets[day] || 0) + Number(t.amount||0);
      }
      const dLabels = Object.keys(buckets).sort();
      const dValues = dLabels.map(k => buckets[k]);
      if (trendChart) { trendChart.destroy(); trendChart = null; }
      const ctx = expenseTrendCanvas.getContext('2d');
      trendChart = new Chart(ctx, {
        type: 'line',
        data: { labels: dLabels, datasets: [{ label: category||'All expenses', data: dValues, borderColor: '#93c5fd', tension: 0.25, fill: false }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, bg: { color: '#0f172a' } }, scales: { y: { beginAtZero: true, ticks: { color: '#e5e7eb' }, grid: { color: 'rgba(255,255,255,0.08)' } }, x: { ticks: { color: '#e5e7eb' }, grid: { color: 'rgba(255,255,255,0.05)' } } } },
        plugins: [chartBgPlugin]
      });
    }
  };

  const refreshAll = async () => {
    await refreshBalance();
    const txs = await fetchTransactions();
    renderTransactions(txs);
    populateCategoryFilter(state.lastTransactions);
    try {
      if (state.filters.category || state.filters.start || state.filters.end) {
        const shaped = computeBreakdownFrom(txs);
        state.lastBreakdown = shaped;
        updateBreakdownSummary(shaped);
        renderExpenseChart(shaped);
        updateCategoryDetails(state.focusedCategory || '');
      } else {
        // No filters: prefer backend summary, fallback handled inside
        await refreshCategorySummary();
      }
    } catch (_) {
      // Last resort fallback
      const shaped = computeBreakdownFrom(txs);
      state.lastBreakdown = shaped;
      updateBreakdownSummary(shaped);
      renderExpenseChart(shaped);
      updateCategoryDetails(state.focusedCategory || '');
    }
    await refreshSummary();
    await refreshInsights();
    await refreshGoals();
    await refreshMoods();
    renderHeatmap(state.lastTransactions);
    // prepare shared wallet dashboard card
    await ensureWallet();
    await refreshMembers();
    // Refresh profile card details
    const prof = await fetchProfile();
    if (prof) {
      if (profileUsername) profileUsername.textContent = prof.username || prof.full_name || prof.email || 'User';
      if (profileEmailSmall) profileEmailSmall.textContent = prof.email || '';
      const avatarSrc = prof.avatar_url || '';
      if (profileAvatarThumb) profileAvatarThumb.src = avatarSrc || '';
      if (profileAvatar && profilePage && !profilePage.hidden) profileAvatar.src = avatarSrc || '';
    }
  };

  (async () => {
    const user = await loadMe();
    if (!user) {
      showAuth();
    } else {
      showApp(user);
      try { await refreshAll(); } catch {}
    }
  })();

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (registerError) registerError.hidden = true;
      const email = document.getElementById('regEmail').value.trim();
      const password = document.getElementById('regPassword').value;
      try {
        const r = await fetchJSON('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) });
        showApp(r.user);
        await refreshAll();
      } catch (err) {
        if (registerError) { registerError.textContent = err.message; registerError.hidden = false; }
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (loginError) loginError.hidden = true;
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      try {
        const r = await fetchJSON('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
        showApp(r.user);
        await refreshAll();
      } catch (err) {
        if (loginError) { loginError.textContent = err.message; loginError.hidden = false; }
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await fetchJSON('/api/auth/logout', { method: 'POST' });
        showAuth();
      } catch (err) {
        if (logoutError) { logoutError.textContent = err.message; logoutError.hidden = false; }
      }
    });
  }

  if (headerLogoutLink) {
    headerLogoutLink.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await fetchJSON('/api/auth/logout', { method: 'POST' });
        showAuth();
      } catch (err) {
        if (logoutError) { logoutError.textContent = err.message; logoutError.hidden = false; }
      }
    });
  }

  // -------- Profile UI handlers --------
  const openProfilePage = async () => {
      if (appContent) appContent.hidden = true;
      if (profilePage) profilePage.hidden = false;
      // Load profile details into form
      const prof = await fetchProfile();
      if (prof) {
        if (pfFullName) pfFullName.value = prof.full_name || '';
        if (pfUsername) pfUsername.value = prof.username || '';
        if (pfEmail) pfEmail.value = prof.email || '';
        if (profileAvatar) profileAvatar.src = prof.avatar_url || '';
        if (accountCreatedEl) accountCreatedEl.textContent = '—';
      }
      // Refresh stats and badges
      try { await refreshGoals(); } catch {}
      renderProfileStatsAndBadges();
  };
  if (profileCard) profileCard.addEventListener('click', openProfilePage);
  if (editProfileLink) editProfileLink.addEventListener('click', (e) => { e.preventDefault(); openProfilePage(); });

  if (profileBackBtn) {
    profileBackBtn.addEventListener('click', async () => {
      if (profilePage) profilePage.hidden = true;
      if (appContent) appContent.hidden = false;
      await refreshAll();
    });
  }

  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (profileError) profileError.hidden = true;
      if (profileSuccess) profileSuccess.hidden = true;
      const payload = {
        full_name: pfFullName?.value || '',
        username: pfUsername?.value || '',
        email: pfEmail?.value || '',
      };
      try {
        const r = await fetchJSON('/api/profile', { method: 'PUT', body: JSON.stringify(payload) });
        // If password fields provided, change password too
        const curPw = pfCurrentPassword?.value || '';
        const newPw = pfNewPassword?.value || '';
        if (curPw && newPw) {
          try {
            await fetchJSON('/api/profile/password', { method: 'POST', body: JSON.stringify({ current_password: curPw, new_password: newPw }) });
            if (profileSuccess) { profileSuccess.textContent = 'Profile and password updated'; profileSuccess.hidden = false; }
            if (pfCurrentPassword) pfCurrentPassword.value = '';
            if (pfNewPassword) pfNewPassword.value = '';
          } catch (e2) {
            if (profileError) { profileError.textContent = e2.message; profileError.hidden = false; }
          }
        } else {
          if (profileSuccess) { profileSuccess.textContent = 'Profile updated'; profileSuccess.hidden = false; }
        }
        // Update header card
        await refreshAll();
      } catch (err) {
        if (profileError) { profileError.textContent = err.message; profileError.hidden = false; }
      }
    });
  }

  // Optional destructive actions (backend must support these endpoints)
  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener('click', async () => {
      if (!confirm('Delete your account? This cannot be undone.')) return;
      try {
        const res = await fetch('/api/profile', { method: 'DELETE' });
        const data = await res.json().catch(()=>({}));
        if (!res.ok) throw new Error(data.error || 'Delete failed');
        // Go back to auth
        showAuth();
      } catch (err) {
        if (profileError) { profileError.textContent = err.message; profileError.hidden = false; }
      }
    });
  }
  if (deleteDataBtn) {
    deleteDataBtn.addEventListener('click', async () => {
      if (!confirm('Delete all your transactions? This cannot be undone.')) return;
      try {
        const res = await fetch('/api/transactions', { method: 'DELETE' });
        const data = await res.json().catch(()=>({}));
        if (!res.ok) throw new Error(data.error || 'Delete failed');
        await refreshAll();
        if (profileSuccess) { profileSuccess.textContent = 'All data deleted'; profileSuccess.hidden = false; }
      } catch (err) {
        if (profileError) { profileError.textContent = err.message; profileError.hidden = false; }
      }
    });
  }

  // -------- Profile stats and badges --------
  const renderProfileStatsAndBadges = () => {
    // This month expense
    if (profileMonthExpenseEl) {
      const txs = state.lastTransactions || [];
      const now = new Date();
      const month = now.toISOString().slice(0,7); // YYYY-MM
      let exp = 0, inc = 0;
      const daySet = new Set();
      for (const t of txs) {
        const d = (t.date||'').slice(0,7);
        if (d !== month) continue;
        if (t.type === 'expense') { exp += Number(t.amount||0); daySet.add((t.date||'').slice(0,10)); }
        if (t.type === 'income') { inc += Number(t.amount||0); }
      }
      profileMonthExpenseEl.textContent = `$${exp.toFixed(2)}`;
      if (profileActiveGoalsEl) {
        const active = (state.goals||[]).filter(g => !g.achieved_at).length;
        profileActiveGoalsEl.textContent = String(active);
      }
      // Badges
      if (badgesWrap) {
        badgesWrap.innerHTML = '';
        const badges = [];
        if (inc - exp >= 100) badges.push({ icon: '🏆', text: 'First 100 Saved' });
        if (daySet.size >= 7) badges.push({ icon: '📅', text: 'Expense Tracker Streak 7 Days' });
        if (exp === 0 && txs.length > 0) badges.push({ icon: '🥇', text: 'No Expenses Yet This Month' });
        badges.forEach(b => {
          const el = document.createElement('span');
          el.style.display = 'inline-flex'; el.style.alignItems = 'center'; el.style.gap = '6px';
          el.style.padding = '6px 10px'; el.style.borderRadius = '999px';
          el.style.background = 'var(--card-muted)'; el.style.border = '1px solid var(--border)';
          el.innerHTML = `<span>${b.icon}</span><span class="meta">${b.text}</span>`;
          badgesWrap.appendChild(el);
        });
      }
    }
  };

  if (avatarForm) {
    avatarForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!avatarInput || !avatarInput.files || !avatarInput.files[0]) return;
      const fd = new FormData();
      fd.append('avatar', avatarInput.files[0]);
      try {
        const res = await fetch('/api/profile/avatar', { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed');
        if (profileAvatarThumb) profileAvatarThumb.src = data.avatar_url || '';
        if (profileAvatar) profileAvatar.src = data.avatar_url || '';
      } catch (err) {
        if (profileError) { profileError.textContent = err.message; profileError.hidden = false; }
      }
    });
  }
});
