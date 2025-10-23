# JobPilot Dashboard

A modern, professional job automation dashboard built with React, TypeScript, and Tailwind CSS. This dashboard connects to the JobPilot Spring Boot backend to manage job applications, trigger scrapers, and monitor job search automation.

## 🚀 Features

- **Dashboard Overview**: Real-time statistics and status distribution charts
- **Jobs Management**: View, filter, search, and manage job applications
- **Job Scraper**: Configure and trigger Naukri job scraping with custom filters
- **Status Tracking**: Track job application status (Applied, Pending, Failed)
- **Dark Theme**: Professional dark UI with modern design
- **Responsive**: Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

- **Framework**: React 19 with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: Sonner

## 📋 Prerequisites

- Node.js 20.10.0 or higher
- npm 10.8.2 or higher
- JobPilot Spring Boot backend running on `http://localhost:8080`

## 🔧 Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Create a `.env.local` file in the root directory:
   ```env
   VITE_API_BASE=http://localhost:8080
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
jobpilot-dashboard/
├── src/
│   ├── components/
│   │   ├── dashboard/
│   │   ├── jobs/
│   │   ├── layout/
│   │   ├── scraper/
│   │   └── ui/
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env.local
├── package.json
└── vite.config.ts
```

## 🎯 Usage

### Dashboard
- View real-time job statistics
- Monitor status distribution with charts
- Quick access to recent jobs

### Jobs Page
- **Search**: Filter jobs by title or company
- **Filter**: By status, job type, location
- **Actions**: Mark as Applied/Failed, View details, Open in Naukri

### Scraper Page
- Configure scraping parameters (Role, Location, Experience, etc.)
- Trigger scraping with one click
- Monitor scraper status and recent activity

## 🔌 API Integration

The dashboard connects to these backend endpoints:
- `GET /api/jobs` - Fetch all jobs
- `GET /api/jobs/filter` - Filter jobs
- `PATCH /api/jobs/{id}/status` - Update job status
- `GET /api/jobs/scrape` - Trigger scraper

## 🚀 Build for Production

```bash
npm run build
```

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🐛 Troubleshooting

- Ensure Spring Boot backend is running on `http://localhost:8080`
- Check CORS settings in backend
- Verify `VITE_API_BASE` environment variable

---

## React + TypeScript + Vite Template Info

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:
- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)