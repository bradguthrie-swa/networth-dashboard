# [Net Worth Dashboard](https://bradguthrie-swa.github.io/networth-dashboard/)

Personal dashboard for displaying net worth built with React and Tailwind CSS. Demonstrates modern frontend workflows, API integration, and developer productivity with Cursor and AI-assisted development.

## Features

- Real-time crypto price updates via CoinGecko API
- Visual allocation breakdown with interactive pie chart
- Account balance tracking and sorting
- Automatic price refresh with caching to prevent API rate limits

## Tech Stack

- React 19
- Vite
- Tailwind CSS
- Recharts
- React Router DOM

## Development

### Prerequisites

- Node.js 20 or higher
- npm

### Setup

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

## Deployment

This project is configured for automatic deployment to GitHub Pages when code is pushed to the `main` branch.

### Initial Setup

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. The workflow will automatically deploy when you push to `main`

### Configuration

If your repository name is different from "dashboard", update the `base` path in `vite.config.js`:

```js
base: process.env.NODE_ENV === "production" ? "/your-repo-name/" : "/",
```

The app will be available at: `https://your-username.github.io/your-repo-name/`

### Manual Deployment

You can also manually trigger deployment by:

1. Going to the **Actions** tab in your repository
2. Selecting **Deploy to GitHub Pages** workflow
3. Clicking **Run workflow**
