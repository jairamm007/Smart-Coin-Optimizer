const form = document.getElementById('optimizerForm');
const numCoinsInput = document.getElementById('numCoins');
const coinValuesInput = document.getElementById('coinValues');
const amountInput = document.getElementById('amount');
const resultsSection = document.getElementById('resultsSection');
const winnerBanner = document.getElementById('winnerBanner');
const winnerBannerText = document.getElementById('winnerBannerText');
const greedyCoinsDiv = document.getElementById('greedyCoins');
const dpCoinsDiv = document.getElementById('dpCoins');
const greedyCard = document.querySelector('.greedy-card');
const dpCard = document.querySelector('.dp-card');
const greedyPathDiv = document.getElementById('greedyPath');
const dpPathDiv = document.getElementById('dpPath');
const greedyCountSpan = document.getElementById('greedyCount');
const dpCountSpan = document.getElementById('dpCount');
const greedyEquation = document.getElementById('greedyEquation');
const dpEquation = document.getElementById('dpEquation');
const greedyStatus = document.getElementById('greedyStatus');
const dpStatus = document.getElementById('dpStatus');
const resultAmountSpan = document.getElementById('resultAmount');
const efficiencySpan = document.getElementById('efficiency');
const greedyBar = document.getElementById('greedyBar');
const dpBar = document.getElementById('dpBar');
const greedyBarLabel = document.getElementById('greedyBarLabel');
const dpBarLabel = document.getElementById('dpBarLabel');
const historyContainer = document.getElementById('historyContainer');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const exportHistoryBtn = document.getElementById('exportHistoryBtn');
const viewAllHistoryBtn = document.getElementById('viewAllHistoryBtn');
const presetButtons = Array.from(document.querySelectorAll('.preset-pill'));
let showingAllHistory = false;

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const numCoins = parseInt(numCoinsInput.value, 10);
    const coins = coinValuesInput.value.trim().split(/\s+/).map(Number);
    const amount = parseInt(amountInput.value, 10);

    if (coins.length !== numCoins) {
        alert(`Please enter exactly ${numCoins} coin values.`);
        return;
    }

    if (coins.some(Number.isNaN) || Number.isNaN(numCoins) || Number.isNaN(amount)) {
        alert('Please enter valid numeric values.');
        return;
    }

    try {
        const response = await fetch('/api/optimize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ numCoins, coins, amount })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to process optimization');
        }

        displayResults(data);
        await loadHistory();
    } catch (error) {
        alert(`Error: ${error.message}`);
        console.error(error);
    }
});

presetButtons.forEach((button) => {
    button.addEventListener('click', () => {
        amountInput.value = button.dataset.amount || '';
        coinValuesInput.value = button.dataset.coins || '';
        numCoinsInput.value = button.dataset.numCoins || '';
    });
});

function displayResults(data) {
    resultsSection.hidden = false;
    winnerBanner.hidden = false;

    const greedyState = data.greedyCount < data.dpCount ? 'winner' : data.greedyCount > data.dpCount ? 'loser' : 'neutral';
    const dpState = data.dpCount < data.greedyCount ? 'winner' : data.dpCount > data.greedyCount ? 'loser' : 'neutral';

    greedyCountSpan.textContent = data.greedyCount;
    dpCountSpan.textContent = data.dpCount;
    greedyCoinsDiv.innerHTML = renderCoinChips(data.greedyCoins, greedyState);
    dpCoinsDiv.innerHTML = renderCoinChips(data.dpCoins, dpState);
    greedyPathDiv.innerHTML = renderCoinPath(data.greedyCoins, greedyState);
    dpPathDiv.innerHTML = renderCoinPath(data.dpCoins, dpState);
    greedyEquation.textContent = buildEquation(data.greedyCoins, data.amount);
    dpEquation.textContent = buildEquation(data.dpCoins, data.amount);
    resultAmountSpan.textContent = data.amount;

    const comparisonText = getEfficiencyText(data.greedyCount, data.dpCount);
    efficiencySpan.textContent = comparisonText;
    winnerBannerText.textContent = comparisonText;

    const maxCount = Math.max(data.greedyCount, data.dpCount, 1);
    greedyBar.style.width = `${(data.greedyCount / maxCount) * 100}%`;
    dpBar.style.width = `${(data.dpCount / maxCount) * 100}%`;
    greedyBarLabel.textContent = `${data.greedyCount} coin${data.greedyCount === 1 ? '' : 's'}`;
    dpBarLabel.textContent = `${data.dpCount} coin${data.dpCount === 1 ? '' : 's'}`;

    applyStatuses(data.greedyCount, data.dpCount);
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function applyStatuses(greedyCount, dpCount) {
    greedyCard.classList.remove('result-winner', 'result-loser', 'result-neutral');
    dpCard.classList.remove('result-winner', 'result-loser', 'result-neutral');
    greedyStatus.classList.remove('status-win', 'status-lose', 'status-neutral');
    dpStatus.classList.remove('status-win', 'status-lose', 'status-neutral');
    greedyBar.classList.remove('compare-bar-win', 'compare-bar-lose', 'compare-bar-neutral');
    dpBar.classList.remove('compare-bar-win', 'compare-bar-lose', 'compare-bar-neutral');

    if (greedyCount === dpCount) {
        greedyStatus.textContent = 'Matched';
        dpStatus.textContent = 'Matched';
        greedyCard.classList.add('result-neutral');
        dpCard.classList.add('result-neutral');
        greedyStatus.classList.add('status-neutral');
        dpStatus.classList.add('status-neutral');
        greedyBar.classList.add('compare-bar-neutral');
        dpBar.classList.add('compare-bar-neutral');
        winnerBanner.className = 'winner-banner winner-neutral';
        return;
    }

    if (dpCount < greedyCount) {
        greedyStatus.textContent = 'Sub-optimal';
        dpStatus.textContent = 'Optimal';
        greedyCard.classList.add('result-loser');
        dpCard.classList.add('result-winner');
        greedyStatus.classList.add('status-lose');
        dpStatus.classList.add('status-win');
        greedyBar.classList.add('compare-bar-lose');
        dpBar.classList.add('compare-bar-win');
        winnerBanner.className = 'winner-banner winner-dp';
        return;
    }

    greedyStatus.textContent = 'Best Here';
    dpStatus.textContent = 'Review';
    greedyCard.classList.add('result-winner');
    dpCard.classList.add('result-loser');
    greedyStatus.classList.add('status-win');
    dpStatus.classList.add('status-lose');
    greedyBar.classList.add('compare-bar-win');
    dpBar.classList.add('compare-bar-lose');
    winnerBanner.className = 'winner-banner winner-greedy';
}

function renderCoinChips(coins, type) {
    return (coins || [])
        .map((coin) => `<span class="coin-chip coin-chip-${type}">${escapeHtml(String(coin))}</span>`)
        .join('');
}

function renderCoinPath(coins, type) {
    if (!coins || coins.length === 0) {
        return '<span class="path-empty">No path available</span>';
    }

    return coins.map((coin, index) => `
        <div class="path-node path-node-${type}">
            <span class="path-step">${index + 1}</span>
            <span class="path-coin">${escapeHtml(String(coin))}</span>
        </div>
    `).join('<span class="path-arrow">→</span>');
}

function buildEquation(coins, amount) {
    if (!coins || coins.length === 0) {
        return `No combination found for ${amount}`;
    }

    return `${coins.join(' + ')} = ${amount}`;
}

function getEfficiencyText(greedyCount, dpCount) {
    if (greedyCount > dpCount) {
        return `DP wins and saves ${greedyCount - dpCount} coin(s) vs Greedy.`;
    }

    if (dpCount > greedyCount) {
        return `Greedy wins and saves ${dpCount - greedyCount} coin(s) vs DP.`;
    }

    return 'Both algorithms use the same number of coins.';
}

function normalizeEntry(entry) {
    const lines = Array.isArray(entry.lines) ? entry.lines : [];
    const normalized = {
        ...entry,
        coins: Array.isArray(entry.coins) ? entry.coins : [],
        greedyCoins: Array.isArray(entry.greedyCoins) ? entry.greedyCoins : [],
        dpCoins: Array.isArray(entry.dpCoins) ? entry.dpCoins : [],
        amount: Number.isFinite(entry.amount) ? entry.amount : extractNumber(lines, /^Amount:\s*(\d+)/),
        greedyCount: Number.isFinite(entry.greedyCount) ? entry.greedyCount : extractNumber(lines, /^Greedy \((\d+) coins\):/),
        dpCount: Number.isFinite(entry.dpCount) ? entry.dpCount : extractNumber(lines, /^DP \((\d+) coins\):/)
    };

    return normalized;
}

function extractNumber(lines, pattern) {
    for (const line of lines) {
        const match = line.match(pattern);
        if (match) {
            return parseInt(match[1], 10);
        }
    }
    return 0;
}

async function loadHistory() {
    try {
        const response = await fetch('/api/history');
        const data = await response.json();
        const entries = Array.isArray(data.entries) ? data.entries : [];

        if (entries.length === 0) {
            historyContainer.innerHTML = '<p class="empty-state">No history yet. Perform an optimization to see results.</p>';
            return;
        }

        const visibleEntries = showingAllHistory ? entries : entries.slice(0, 1);
        viewAllHistoryBtn.hidden = entries.length <= 1;
        viewAllHistoryBtn.textContent = showingAllHistory ? 'Show Latest' : 'View All';
        historyContainer.innerHTML = visibleEntries.map((entry, index) => {
            const order = showingAllHistory ? entries.length - index : entries.length;
            return renderHistoryItem(normalizeEntry(entry), order);
        }).join('');
    } catch (error) {
        console.error('Error loading history:', error);
        historyContainer.innerHTML = '<p class="empty-state">Error loading history</p>';
    }
}

function renderHistoryItem(entry, order) {
    const timestamp = entry.timestamp
        ? new Date(entry.timestamp).toLocaleString()
        : 'Saved in history.txt';
    const sourceLabel = 'history.txt only';
    const maxCount = Math.max(entry.greedyCount || 0, entry.dpCount || 0, 1);
    const greedyWidth = ((entry.greedyCount || 0) / maxCount) * 100;
    const dpWidth = ((entry.dpCount || 0) / maxCount) * 100;
    const greedyState = entry.greedyCount < entry.dpCount ? 'winner' : entry.greedyCount > entry.dpCount ? 'loser' : 'neutral';
    const dpState = entry.dpCount < entry.greedyCount ? 'winner' : entry.dpCount > entry.greedyCount ? 'loser' : 'neutral';

    return `
        <article class="history-item">
            <div class="history-item-header">
                <div>
                    <h3>Optimization #${order}</h3>
                    <p class="history-meta">Source: ${escapeHtml(sourceLabel)}</p>
                </div>
                <div class="history-item-controls">
                    <span class="history-timestamp">${escapeHtml(timestamp)}</span>
                    <button type="button" class="history-delete-btn" data-entry-id="${escapeHtml(entry.id)}">Remove</button>
                </div>
            </div>

            <div class="history-summary-row">
                <span class="history-tag">Amount: ${escapeHtml(String(entry.amount))}</span>
                <span class="history-tag">Coins: ${escapeHtml((entry.coins || []).join(', '))}</span>
            </div>

            <div class="history-visual-grid">
                <div class="history-visual history-greedy history-${greedyState}">
                    <p class="mini-label greedy-text">Greedy</p>
                    <div class="mini-count">${escapeHtml(String(entry.greedyCount))}</div>
                    <div class="chips">${renderCoinChips(entry.greedyCoins, greedyState)}</div>
                    <div class="coin-path history-path">${renderCoinPath(entry.greedyCoins, greedyState)}</div>
                    <p class="equation small-equation">${escapeHtml(buildEquation(entry.greedyCoins, entry.amount))}</p>
                </div>

                <div class="history-visual history-dp history-${dpState}">
                    <p class="mini-label dp-text">Dynamic Programming</p>
                    <div class="mini-count">${escapeHtml(String(entry.dpCount))}</div>
                    <div class="chips">${renderCoinChips(entry.dpCoins, dpState)}</div>
                    <div class="coin-path history-path">${renderCoinPath(entry.dpCoins, dpState)}</div>
                    <p class="equation small-equation">${escapeHtml(buildEquation(entry.dpCoins, entry.amount))}</p>
                </div>
            </div>

            <div class="history-bars">
                <div class="compare-row">
                    <span class="compare-name greedy-text">Greedy</span>
                    <div class="compare-bar-track">
                        <div class="compare-bar compare-bar-greedy" style="width:${greedyWidth}%"></div>
                    </div>
                    <span class="compare-value">${escapeHtml(String(entry.greedyCount))} coins</span>
                </div>

                <div class="compare-row">
                    <span class="compare-name dp-text">DP</span>
                    <div class="compare-bar-track">
                        <div class="compare-bar compare-bar-dp" style="width:${dpWidth}%"></div>
                    </div>
                    <span class="compare-value">${escapeHtml(String(entry.dpCount))} coins</span>
                </div>
            </div>
        </article>
    `;
}

clearHistoryBtn.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to clear all history from history.txt?')) {
        return;
    }

    try {
        const response = await fetch('/api/history', { method: 'DELETE' });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to clear history');
        }

        await loadHistory();
        alert('History cleared successfully.');
    } catch (error) {
        alert(`Error clearing history: ${error.message}`);
    }
});

exportHistoryBtn.addEventListener('click', () => {
    window.location.href = '/api/export-history';
});

viewAllHistoryBtn.addEventListener('click', async () => {
    showingAllHistory = !showingAllHistory;
    await loadHistory();
});

historyContainer.addEventListener('click', async (event) => {
    const button = event.target.closest('.history-delete-btn');
    if (!button) {
        return;
    }

    const entryId = button.dataset.entryId;
    if (!entryId) {
        return;
    }

    if (!confirm('Delete this optimization from history.txt?')) {
        return;
    }

    try {
        const response = await fetch(`/api/history/${encodeURIComponent(entryId)}`, {
            method: 'DELETE'
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to delete history entry');
        }

        await loadHistory();
    } catch (error) {
        alert(`Error deleting history entry: ${error.message}`);
    }
});

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', () => {
    loadHistory();
});

setInterval(loadHistory, 5000);
