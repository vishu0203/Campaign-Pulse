Campaign Pulse – Marketing Analytics Dashboard
Overview

Campaign Pulse is a modular marketing analytics dashboard built to visualize campaign performance across multiple channels.

The dashboard provides aggregated KPIs, daily performance trends, a sortable campaign table, and a campaign drill-down view with detailed breakdown and mini trend visualization.

The project is implemented using vanilla JavaScript (ES modules), HTML, CSS (Grid/Flex), and Chart.js for visualization. Data is served from mock JSON files.

Features

Filter bar with:

Date range

Channel selection

Campaign search
Filters dynamically update all data components.

KPI summary:

Opens

Clicks

Purchases / Leads
Includes loading states and error handling.

Global daily trend chart (filter-aware)

Sortable campaign table:

Sort by Clicks

Sort by Revenue

Selected row highlight

Campaign drill-down panel:

Campaign metadata

Aggregated engagement counts

Mini daily trend chart

Responsive layout:

KPI cards stack on smaller screens

Table becomes horizontally scrollable

Drill-down adapts to screen size

Architecture

The application follows a modular structure:

js/
  app.js         → Application orchestrator
  state.js       → Shared state management
  filters.js     → Filter handling
  kpis.js        → KPI aggregation and rendering
  trend.js       → Global trend chart logic
  table.js       → Campaign table and sorting
  drilldown.js   → Campaign detail view
  api.js         → Data layer abstraction


Key characteristics:

Clear separation of concerns

No circular dependencies

Centralized state management

try/catch error handling

Explicit loading states

Filter-driven data refresh

Project Structure
CAMPAIGN_PULSE/
│
├── index.html
├── README.md
│
├── data/
│   ├── campaigns.json
│   ├── trend.json
│
├── js/
│   ├── app.js
│   ├── state.js
│   ├── filters.js
│   ├── kpis.js
│   ├── trend.js
│   ├── table.js
│   ├── drilldown.js
│   ├── api.js
│
├── sql/
│   ├── schema.sql
│   ├── campaign_table.sql
│   ├── kpi_queries.sql
│   ├── trend_queries.sql

Running the Project

Open the project folder in VS Code (or any editor with a local server).

Start a local development server (e.g., Live Server).

Navigate to:

http://127.0.0.1:5500/index.html


The dashboard will load with mock data from the /data directory.

Notes

Data is mocked using JSON files.

Charts are rendered using Chart.js via CDN.

The SQL folder contains schema and query files corresponding to the data model used in the dashboard.