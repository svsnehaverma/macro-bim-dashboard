Macro BIM Adoption Dashboard

A Next.js-based interactive dashboard for visualising BIM Macro Adoption survey data (Education Landscape & Organisational Adoption studies).

This dashboard reads survey data from Excel (.xlsx) files, aggregates responses server-side, and presents results using interactive charts and tables, similar to the Macro BIM adoption dashboards demonstrated in project videos.

✨ Features

📊 Interactive donut (pie) charts, bar charts, and tables

🌍 Country-based filtering (derived from Excel filenames)

📁 Reads survey data directly from Excel files

⚡ No backend / database required

🚀 Deploys easily on Vercel

🔒 No GraphQL, Docker, or external services needed

🧱 Tech Stack

Next.js (App Router)

TypeScript

Recharts – data visualisation

xlsx – Excel parsing

Node.js (server-side API routes)

Project Structure
macro-bim-dashboard/
├── app/
│   ├── api/
│   │   └── summary/route.ts   # Server-side Excel aggregation
│   └── page.tsx               # Main dashboard UI
├── data/
│   └── EL_ECU.xlsx             # Survey data (example)
├── components/                # UI components (charts, layout)
├── package.json
└── README.md

Data Format

The dashboard expects Excel files exported from BIM adoption surveys with a sheet such as Answers containing columns like:

Item ID

Item Title

User Input

Each row represents one response to one question (long format).

Country/module information is inferred from the filename, e.g.:

EL - ECU XLSX Report - BIMei Macro Adoption Study.xlsx

Run Locally
1. Clone the repository
git clone https://github.com/<your-username>/macro-bim-dashboard.git
cd macro-bim-dashboard

2. Install dependencies
npm install

3. Start development server
npm run dev


Open in browser:

http://localhost:3000


To test the data API directly:

http://localhost:3000/api/summary

🚀 Deploy on Vercel

Push the repository to GitHub

Go to https://vercel.com

Click New Project

Import this GitHub repository

Click Deploy

No special configuration required.

How It Works (Brief)

Excel files are read server-side using a Next.js API route

Responses are aggregated by:

question (Item ID / Item Title)

answer (User Input)

The frontend fetches aggregated JSON and renders charts dynamically

This approach avoids:

backend servers

databases

GraphQL APIs

Docker
