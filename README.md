# Smart Coin Optimizer

**Smart Coin Optimizer** is a web-based tool that compares **Greedy** and **Dynamic Programming** approaches to find the minimum number of coins for a given amount. Built using C, Node.js, and a modern UI, it highlights optimal solutions and stores history.

## Features

- 🪙 Compare Greedy vs DP algorithms in real-time
- 📊 Interactive dashboard with visualization
- 💾 History tracking with export functionality
- ⚡ High-performance C implementation
- 🪟 Cross-platform (Windows, Linux, macOS)
- ✅ Input validation and error handling

## Quick Start

1. **Open the live project:**
   ```
   https://smart-coin-optimizer.onrender.com
   ```

2. **Use the app in your browser:**
   - Enter coin values and amount
   - Compare Greedy vs DP results
   - View history and export data

3. **Optional local run:**
   - Install backend dependencies
   - Build the C program
   - Start the backend server

## Project Structure

```
coin_optimiser/
├── backend/              # Node.js Express server
│   ├── server.js         # API endpoints & frontend serving
│   ├── package.json
│   └── package-lock.json
├── c_program/            # Coin algorithm implementation
│   ├── coin_optimizer.c  # Greedy & DP algorithms
│   ├── Makefile          # Cross-platform build
│   └── history.txt       # Runtime history (auto-generated)
├── frontend/             # Web dashboard
│   ├── index.html
│   ├── style.css
│   └── script.js
└── README.md
```

## Prerequisites

- Node.js 14+
- GCC compiler (for building C program)

## How It Works

- **Frontend**: Dashboard for input, displays results with comparison and history
- **Backend**: Express.js API that routes requests to the compiled C binary
- **C Program**: Implements both Greedy and DP solutions for coin change problem
- **History**: All computations are saved to `history.txt` for tracking

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/optimize` | Run coin optimization |
| GET | `/api/history` | Fetch all history entries |
| DELETE | `/api/history` | Clear all history |
| DELETE | `/api/history/:id` | Delete specific entry |
| GET | `/api/export-history` | Export history as file |

## Algorithm Details

- **Greedy**: Takes largest coins first (fast but not always optimal)
- **DP**: Dynamic programming solution (always optimal, slightly slower)

## Languages & Technologies

![C](https://img.shields.io/badge/C-00599C?style=for-the-badge&logo=c&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)

## License

MIT
