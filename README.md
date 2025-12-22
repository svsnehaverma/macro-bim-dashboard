# Macro BIM Adoption Dashboard

A web-based interactive dashboard for visualising **Macro BIM Adoption survey data** (Education Landscape & Organisational Adoption) using Excel datasets.

This project is built with **Next.js (App Router)** and is designed to run **entirely on Vercel**, without Docker, GraphQL, or a separate backend server.

---

##  Features

- 📊 Interactive dashboard with:
  - Donut (pie) charts
  - Horizontal bar charts
  - Tabular summaries
- Country-based filtering (e.g. ECU, PER, BRA)
- Reads survey data directly from Excel (`.xlsx`) files
- Server-side aggregation using Next.js API routes
- Vercel-ready deployment
- No database or backend required

---

##  Project Structure


---

## 📊 Data Format

The dashboard expects Excel files that contain a sheet named **`Answers`** (or equivalent), with columns similar to:

- `Item ID`
- `Item Title`
- `User Input`
- (other metadata columns are ignored)

Each row represents **one survey response**.

The dashboard automatically:
- groups responses by question
- counts answer frequencies
- calculates percentages for visualisation

---

##  Tech Stack

- **Next.js 14** (App Router)
- **React**
- **TypeScript**
- **xlsx** – for reading Excel files
- **Recharts** – for charts
- **Vercel** – hosting & deployment

---

## Run Locally

### 1. Install dependencies

**`npm install`**

2. Start development server
npm run dev

Open in your browser:

http://localhost:3000

API endpoint (for debugging):

http://localhost:3000/api/summary

Deploy on Vercel

Push this repository to GitHub

Go to https://vercel.com

Click New Project

Import the GitHub repository

Click Deploy

No additional configuration is required.
