document.addEventListener('DOMContentLoaded', function () {

  const memberBody = document.getElementById('memberBody');
  const errorBox   = document.getElementById('errorBox');
  const resultsSection = document.getElementById('resultsSection');

  // Update serial numbers & member count badge
  function refreshSerials() {
    const rows = memberBody.querySelectorAll('tr');
    rows.forEach((row, i) => {
      const sn = row.querySelector('.sn-cell');
      if (sn) sn.textContent = i + 1;
    });
    const badge = document.getElementById('memberCount');
    if (badge) badge.textContent = rows.length + ' member' + (rows.length !== 1 ? 's' : '');
  }

  // Show error
  function showErr(msg) {
    errorBox.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0">
        <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/>
        <path d="M8 5v3.5M8 11v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      ${msg}`;
    errorBox.classList.add('visible');
    errorBox.style.display = 'flex';
    errorBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Clear error
  function clearErr() {
    errorBox.classList.remove('visible');
    errorBox.style.display = 'none';
  }

  // Get initials from name
  function getInitials(name) {
    return name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  // Add Member Row
  window.addRow = function () {
    const rowCount = memberBody.querySelectorAll('tr').length;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="col-sn sn-cell">${rowCount + 1}</td>
      <td><input class="inputName" type="text" placeholder="Member name"></td>
      <td><input class="inputMeal" type="number" placeholder="0" min="0" step="0.5"></td>
      <td><input class="inputBazar" type="number" placeholder="0.00" min="0" step="0.01"></td>
      <td>
        <button class="del-btn" onclick="delRow(this)" title="Remove member" aria-label="Remove">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </td>`;
    memberBody.appendChild(tr);
    tr.querySelector('.inputName').focus();
    refreshSerials();
    clearErr();
  };

  // Delete Row
  window.delRow = function (btn) {
    const rows = memberBody.querySelectorAll('tr');
    if (rows.length <= 1) {
      showErr('At least one member is required.');
      return;
    }
    btn.closest('tr').remove();
    refreshSerials();
    clearErr();
    resultsSection.classList.remove('visible');
  };

  // Reset All
  window.resetAll = function () {
    // Clear all rows except keep one blank row
    while (memberBody.rows.length > 1) memberBody.deleteRow(memberBody.rows.length - 1);
    memberBody.rows[0].querySelectorAll('input').forEach(i => i.value = '');
    refreshSerials();
    resultsSection.classList.remove('visible');
    clearErr();
  };

  // ===== CALCULATE =====
  window.calculate = function () {
    clearErr();

    const rows = memberBody.querySelectorAll('tr');
    const members = [];

    for (const row of rows) {
      const name  = row.querySelector('.inputName').value.trim();
      const meal  = parseFloat(row.querySelector('.inputMeal').value)  || 0;
      const bazar = parseFloat(row.querySelector('.inputBazar').value) || 0;

      if (!name) {
        showErr('Please enter names for all members.');
        row.querySelector('.inputName').focus();
        return;
      }
      members.push({ name, meal, bazar });
    }

    const totalMeals = members.reduce((s, m) => s + m.meal,  0);
    const totalBazar = members.reduce((s, m) => s + m.bazar, 0);

    if (totalMeals === 0) {
      showErr('Total meals cannot be zero. Please enter meal counts.');
      return;
    }

    const rate = totalBazar / totalMeals;

    // --- Meta info ---
    const month    = document.getElementById('metaMonth').value;
    const year     = document.getElementById('metaYear').value;
    const messName = document.getElementById('metaName').value.trim();
    const label    = (messName ? messName + '  —  ' : '') + month + ' ' + year;
    document.getElementById('resultsTitle').textContent = label;

    // --- Summary Cards ---
    const summaryGrid = document.getElementById('summaryGrid');
    summaryGrid.innerHTML = `
      <div class="s-card s-card--green">
        <div class="s-label">Total Bazar</div>
        <div class="s-val">৳${totalBazar.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
        <div class="s-sub">All contributions</div>
      </div>
      <div class="s-card s-card--blue">
        <div class="s-label">Total Meals</div>
        <div class="s-val">${totalMeals.toFixed(1)}</div>
        <div class="s-sub">Across all members</div>
      </div>
      <div class="s-card s-card--amber">
        <div class="s-label">Meal Rate</div>
        <div class="s-val">৳${rate.toFixed(2)}</div>
        <div class="s-sub">Per meal</div>
      </div>
      <div class="s-card s-card--purple">
        <div class="s-label">Members</div>
        <div class="s-val">${members.length}</div>
        <div class="s-sub">In this mess</div>
      </div>`;

    // --- Breakdown Table ---
    const resultsBody = document.getElementById('resultsBody');
    resultsBody.innerHTML = '';

    members.forEach((m, idx) => {
      const cost    = m.meal * rate;
      const bal     = m.bazar - cost;
      const absBal  = Math.abs(bal);
      const initials = getInitials(m.name);
      const avClass  = 'av-' + (idx % 8);

      let badge = '';
      let balClass = '';
      let balText = '';

      if (absBal < 0.005) {
        badge    = `<span class="badge badge-settled">✓ Settled</span>`;
        balClass = 'balance-zero';
        balText  = '৳0.00';
      } else if (bal > 0) {
        badge    = `<span class="badge badge-receive">↑ Will receive ৳${absBal.toFixed(2)}</span>`;
        balClass = 'balance-positive';
        balText  = '+৳' + absBal.toFixed(2);
      } else {
        badge    = `<span class="badge badge-pay">↓ Will pay ৳${absBal.toFixed(2)}</span>`;
        balClass = 'balance-negative';
        balText  = '-৳' + absBal.toFixed(2);
      }

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div class="member-name-cell">
            <span class="avatar ${avClass}">${initials}</span>
            ${m.name}
          </div>
        </td>
        <td>${m.meal.toFixed(1)}</td>
        <td>৳${m.bazar.toFixed(2)}</td>
        <td>৳${cost.toFixed(2)}</td>
        <td class="${balClass}">${balText}</td>
        <td>${badge}</td>`;
      resultsBody.appendChild(tr);
    });

    // Show results
    resultsSection.classList.add('visible');
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Init
  refreshSerials();
});