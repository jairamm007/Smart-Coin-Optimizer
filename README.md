# coinoptimiser

Coin Optimizer is split into a Node.js backend, a static frontend, and a C program for the coin algorithms.

## Structure

```text
coin_optimiser/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
├── c_program/
│   ├── coin_optimizer.c
│   ├── Makefile
│   ├── coin.exe        # Windows build output
│   └── history.txt
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── .gitignore
└── README.md
```

## How It Works

- `backend/server.js` serves the frontend and exposes the API.
- The backend runs the compiled binary from `c_program/`.
- Web optimizations are written to `c_program/history.txt` in the exact file format used by the C program.
- The frontend is a dashboard-style single page interface with input, results, and history panels.

## Run Locally

1. Install backend dependencies:

```bash
cd backend
npm install
```

2. Compile the C program:

```bash
cd ../c_program
gcc -Wall -Wextra -O2 -o coin coin_optimizer.c
```

3. Start the backend:

```bash
cd ../backend
npm start
```

4. Open the app in your browser:

```text
http://localhost:3000
```

## API

- `POST /api/optimize`
- `GET /api/history`
- `DELETE /api/history`
- `DELETE /api/history/:id`
- `GET /api/export-history`
