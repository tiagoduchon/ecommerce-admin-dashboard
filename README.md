# Northstar — E-Commerce Admin Dashboard

A responsive **frontend portfolio project** built with **HTML5, CSS3 and vanilla JavaScript (ES6+)**. Explore a fictional store's analytics, manage its product catalog, update order statuses, and view customer insights.

> **Demo only:** All customers, orders, revenue figures, and product data are fictional. No real payments, authentication, backend, or production integrations are included.

## Features

- Overview with KPI cards, revenue trend, order status doughnut chart, and recent orders
- Product catalog with search, category filters, sorting, and create/edit/delete actions
- Order search, status filtering, and editable fulfillment statuses
- Customer summary with total orders and spending
- Dark/light theme, responsive layout, accessible labels, and feedback messages
- Browser `localStorage` persistence and one-click reset
- Downloadable CSV order report

## Tech stack

- HTML5 and CSS3 (Grid, Flexbox, responsive media queries)
- Vanilla JavaScript ES6+ (DOM manipulation, events, arrays, state, localStorage)
- [Chart.js 4](https://www.chartjs.org/) via CDN for charts
- Google Fonts via CDN

## Run locally

1. Download or clone the repository.
2. Open `index.html` in a modern browser.
3. An internet connection is required for Chart.js and web fonts. All other functionality runs locally.

No npm install, server, or database is required.

## Publish with GitHub Pages

1. Push all files and folders to a public GitHub repository named `ecommerce-admin-dashboard`.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Select branch `main`, folder `/ (root)`, and save.
5. GitHub will show the public site URL after deployment.

## Project structure

```text
ecommerce-admin-dashboard/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── app.js
└── README.md
```

## Notes

The dashboard is a client-side demonstration, not a production commerce platform. Data is stored only in the current browser's localStorage; it is not shared across devices. The seven-month revenue line is a fixed illustrative sample; KPI totals and order status chart use the editable demo orders. Use **Reset demo data** to restore the original sample dataset.

## Author

**Tiago Duchon** — Software Development student

[GitHub profile](https://github.com/tiagoduchon)
