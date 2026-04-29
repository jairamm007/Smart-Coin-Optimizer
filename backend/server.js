const express = require('express');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const app = express();
const frontendPath = path.join(__dirname, '..', 'frontend');
const cProgramDirectory = path.join(__dirname, '..', 'c_program');
const historyPath = path.join(cProgramDirectory, 'history.txt');
const binaryPath = path.join(cProgramDirectory, process.platform === 'win32' ? 'coin.exe' : 'coin');
const SEPARATOR = '-----------------------------';

app.use(express.json());
app.use(express.static(frontendPath));

ensureHistoryFile();

function ensureHistoryFile() {
    if (!fs.existsSync(historyPath)) {
        fs.writeFileSync(historyPath, '');
    }
}

function validateOptimizationInput(numCoins, coins, amount) {
    return Number.isInteger(numCoins)
        && Array.isArray(coins)
        && coins.length === numCoins
        && coins.length > 0
        && coins.every((coin) => Number.isInteger(coin) && coin > 0)
        && Number.isInteger(amount)
        && amount > 0;
}

function formatHistoryLines(entry) {
    return [
        `Number of Coin Types: ${entry.numCoins}`,
        `Coins Entered: ${(entry.coins || []).join(' ')}`,
        `Amount: ${entry.amount}`,
        `Greedy (${entry.greedyCount} coins): ${(entry.greedyCoins || []).join(' ')}`,
        `DP (${entry.dpCount} coins): ${(entry.dpCoins || []).join(' ')}`
    ];
}

function appendHistoryEntry(entry) {
    const block = `\n${SEPARATOR}\n${formatHistoryLines(entry).join('\n')}\n${SEPARATOR}\n`;
    fs.appendFileSync(historyPath, block);
}

function readHistoryFile() {
    try {
        return fs.readFileSync(historyPath, 'utf-8');
    } catch (error) {
        return '';
    }
}

function clearHistoryFile() {
    fs.writeFileSync(historyPath, '');
}

function buildHistoryText(entries) {
    if (!entries.length) {
        return '';
    }

    return entries.map((entry) => (
        `${SEPARATOR}\n${formatHistoryLines(entry).join('\n')}\n${SEPARATOR}`
    )).join('\n\n');
}

function getWinnerSummary(entry) {
    if (entry.dpCount < entry.greedyCount) {
        return `Winner: DP wins by ${entry.greedyCount - entry.dpCount} coin(s)`;
    }

    if (entry.greedyCount < entry.dpCount) {
        return `Winner: Greedy wins by ${entry.dpCount - entry.greedyCount} coin(s)`;
    }

    return 'Winner: Tie - Greedy and DP use the same number of coins';
}

function buildVisualization(label, coins) {
    if (!coins || coins.length === 0) {
        return `${label} Visualization: No path available`;
    }

    const steps = coins.map((coin, index) => `[${index + 1}:${coin}]`).join(' -> ');
    return `${label} Visualization: ${steps}`;
}

function buildDownloadHistoryText(entries) {
    if (!entries.length) {
        return 'No history available.\n';
    }

    return entries.map((entry) => [
        SEPARATOR,
        `Number of Coin Types: ${entry.numCoins}`,
        `Coins Entered: ${(entry.coins || []).join(' ')}`,
        `Amount: ${entry.amount}`,
        `Greedy Answer (${entry.greedyCount} coins): ${(entry.greedyCoins || []).join(' ')}`,
        `DP Answer (${entry.dpCount} coins): ${(entry.dpCoins || []).join(' ')}`,
        getWinnerSummary(entry),
        buildVisualization('Greedy', entry.greedyCoins || []),
        buildVisualization('DP', entry.dpCoins || []),
        SEPARATOR
    ].join('\n')).join('\n\n') + '\n';
}

function writeHistoryEntries(entries) {
    const orderedEntries = [...entries].reverse();
    const historyText = buildHistoryText(orderedEntries);
    fs.writeFileSync(historyPath, historyText ? `${historyText}\n` : '');
}

function parseHistoryFile(historyText) {
    return historyText
        .split(SEPARATOR)
        .map((entry) => entry.trim())
        .filter(Boolean)
        .map((entry, index) => {
            const lines = entry.split(/\r?\n/).filter(Boolean);
            const parsed = {
                id: `file-${index + 1}`,
                source: 'file',
                timestamp: null,
                numCoins: null,
                coins: [],
                amount: null,
                greedyCount: 0,
                greedyCoins: [],
                dpCount: 0,
                dpCoins: [],
                lines
            };

            for (const line of lines) {
                let match = line.match(/^Number of Coin Types:\s*(\d+)/);
                if (match) {
                    parsed.numCoins = parseInt(match[1], 10);
                    continue;
                }

                match = line.match(/^Coins Entered:\s*(.*)$/);
                if (match) {
                    parsed.coins = match[1].trim() ? match[1].trim().split(/\s+/).map(Number) : [];
                    continue;
                }

                match = line.match(/^Amount:\s*(\d+)/);
                if (match) {
                    parsed.amount = parseInt(match[1], 10);
                    continue;
                }

                match = line.match(/^Greedy \((\d+) coins\):\s*(.*)$/);
                if (match) {
                    parsed.greedyCount = parseInt(match[1], 10);
                    parsed.greedyCoins = match[2].trim() ? match[2].trim().split(/\s+/).map(Number) : [];
                    continue;
                }

                match = line.match(/^DP \((\d+) coins\):\s*(.*)$/);
                if (match) {
                    parsed.dpCount = parseInt(match[1], 10);
                    parsed.dpCoins = match[2].trim() ? match[2].trim().split(/\s+/).map(Number) : [];
                }
            }

            return parsed;
        })
        .reverse();
}

function parseProgramOutput(output, baseData) {
    const lines = output.split(/\r?\n/);
    const resultData = {
        ...baseData,
        greedyCoins: [],
        greedyCount: 0,
        dpCoins: [],
        dpCount: 0,
        timestamp: new Date().toISOString()
    };

    for (const line of lines) {
        if (line.includes('Greedy')) {
            const match = line.match(/Greedy \((\d+) coins\):\s*(.*)/);
            if (match) {
                resultData.greedyCount = parseInt(match[1], 10);
                resultData.greedyCoins = match[2].trim() ? match[2].trim().split(/\s+/).map(Number) : [];
            }
        }

        if (line.includes('DP') && !line.includes('coins:')) {
            const match = line.match(/DP \((\d+) coins\):\s*(.*)/);
            if (match) {
                resultData.dpCount = parseInt(match[1], 10);
                resultData.dpCoins = match[2].trim() ? match[2].trim().split(/\s+/).map(Number) : [];
            }
        }
    }

    return resultData;
}

function runGreedy(coins, amount) {
    const sortedCoins = [...coins].sort((a, b) => a - b);
    const result = [];
    let remaining = amount;

    for (let index = sortedCoins.length - 1; index >= 0; index--) {
        while (remaining >= sortedCoins[index]) {
            remaining -= sortedCoins[index];
            result.push(sortedCoins[index]);
        }
    }

    return result;
}

function runDynamicProgramming(coins, amount) {
    const dp = new Array(amount + 1).fill(Number.POSITIVE_INFINITY);
    const last = new Array(amount + 1).fill(-1);
    dp[0] = 0;

    for (let value = 1; value <= amount; value++) {
        for (const coin of coins) {
            if (coin <= value && dp[value - coin] !== Number.POSITIVE_INFINITY) {
                if (dp[value] > dp[value - coin] + 1) {
                    dp[value] = dp[value - coin] + 1;
                    last[value] = coin;
                }
            }
        }
    }

    const result = [];
    let remaining = amount;

    while (remaining > 0 && last[remaining] !== -1) {
        result.push(last[remaining]);
        remaining -= last[remaining];
    }

    return result;
}

function buildFallbackResult(baseData) {
    const greedyCoins = runGreedy(baseData.coins, baseData.amount);
    const dpCoins = runDynamicProgramming(baseData.coins, baseData.amount);

    return {
        ...baseData,
        greedyCoins,
        greedyCount: greedyCoins.length,
        dpCoins,
        dpCount: dpCoins.length,
        timestamp: new Date().toISOString()
    };
}

app.post('/api/optimize', (req, res) => {
    try {
        const { numCoins, coins, amount } = req.body;

        if (!validateOptimizationInput(numCoins, coins, amount)) {
            return res.status(400).json({ error: 'Invalid input parameters' });
        }

        const input = `${numCoins}\n${coins.join(' ')}\n${amount}\n`;
        const result = spawnSync(binaryPath, [], {
            input,
            encoding: 'utf-8',
            cwd: cProgramDirectory
        });

        let resultData;

        if (result.error) {
            resultData = buildFallbackResult({ numCoins, coins, amount });
            appendHistoryEntry(resultData);
        } else {
            const output = result.stdout || '';
            const stderr = result.stderr || '';

            if (stderr && /error/i.test(stderr)) {
                throw new Error(`Program execution failed: ${stderr}`);
            }

            resultData = parseProgramOutput(output, { numCoins, coins, amount });
        }

        return res.json({
            ...resultData,
            savedToFile: true
        });
    } catch (error) {
        console.error('Error executing optimization:', error);
        return res.status(500).json({ error: `Failed to process optimization: ${error.message}` });
    }
});

app.get('/api/history', (req, res) => {
    try {
        const fileHistory = readHistoryFile();
        const fileEntries = parseHistoryFile(fileHistory);

        return res.json({
            entries: fileEntries,
            fileEntries,
            rawHistory: fileHistory,
            sources: {
                file: true
            }
        });
    } catch (error) {
        console.error('Error loading history:', error);
        return res.json({
            entries: [],
            fileEntries: [],
            rawHistory: '',
            sources: {
                file: true
            }
        });
    }
});

app.delete('/api/history', (req, res) => {
    try {
        clearHistoryFile();
        return res.json({ success: true });
    } catch (error) {
        console.error('Error clearing history:', error);
        return res.status(500).json({ error: 'Failed to clear history' });
    }
});

app.delete('/api/history/:id', (req, res) => {
    try {
        const fileEntries = parseHistoryFile(readHistoryFile());
        const remainingEntries = fileEntries.filter((entry) => entry.id !== req.params.id);

        if (remainingEntries.length === fileEntries.length) {
            return res.status(404).json({ error: 'History entry not found' });
        }

        writeHistoryEntries(remainingEntries);
        return res.json({ success: true });
    } catch (error) {
        console.error('Error deleting history entry:', error);
        return res.status(500).json({ error: 'Failed to delete history entry' });
    }
});

app.get('/api/export-history', (req, res) => {
    try {
        const entries = parseHistoryFile(readHistoryFile()).reverse();
        const history = buildDownloadHistoryText(entries);
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', 'attachment; filename="history.txt"');
        return res.send(history);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to export history file' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

const DEFAULT_PORT = parseInt(process.env.PORT || '3000', 10);
const MAX_PORT_ATTEMPTS = 10;

function startServer(port, attempt = 0) {
    const server = app.listen(port, () => {
        console.log(`Coin Optimizer server running on port ${port}`);
        console.log(`Open http://localhost:${port} in your browser`);
    });

    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE' && attempt < MAX_PORT_ATTEMPTS) {
            const nextPort = port + 1;
            console.warn(`Port ${port} is already in use. Trying port ${nextPort}...`);
            startServer(nextPort, attempt + 1);
            return;
        }

        console.error(`Failed to start server on port ${port}:`, error.message);
        process.exit(1);
    });
}

startServer(DEFAULT_PORT);
