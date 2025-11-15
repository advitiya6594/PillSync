# 💊 PillSync

**Your personalized birth control companion** - A full-stack web application for tracking birth control pill cycles, monitoring side effects, and checking medication interactions.

![Version](https://img.shields.io/badge/version-0.1-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🌟 Features

- **📅 Cycle Tracking**: Track your pill pack cycle with visual indicators for active/placebo days
- **⚡ Side Effects Monitoring**: View common side effects based on your pill type and cycle day
- **⚠️ Drug Interaction Checker**: Check for interactions between your medications and birth control pills
- **🎨 Beautiful UI**: Modern, animated interface built with Figma design system
- **🔄 Dual Mode**: Demo mode with mock data or Real API mode with RxNav/OpenFDA integration

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/advitiya6594/PillSync.git
cd PillSync
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

3. **Configure environment**
```bash
# Server configuration
cd server
cp .env.example .env
# Edit .env and set USE_DEMO_DATA=true for demo mode

# Frontend configuration (already set up)
cd ../frontend
# .env contains VITE_API_URL=http://localhost:5050
```

4. **Run the application**
```bash
# From project root - runs both backend and frontend
npm run dev
```

The app will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5050

## 📁 Project Structure

```
PillSync/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx          # Main app entry
│   │   ├── bridge/          # API integration components
│   │   │   ├── CycleBridge.jsx
│   │   │   ├── EffectsBridge.jsx
│   │   │   └── InteractionsBridge.jsx
│   │   └── figma/           # UI components from Figma design
│   │       ├── FigmaLanding.jsx
│   │       └── ui/          # 45+ shadcn/ui components
│   ├── tailwind.config.js   # Tailwind CSS v4
│   └── vite.config.js       # Vite configuration with API proxy
│
├── server/                   # Express.js backend
│   ├── index.js             # Main server file
│   ├── miniData.js          # Demo/fallback data
│   ├── services/
│   │   ├── rxnav.js         # RxNav/RxNorm API integration
│   │   ├── contraceptives.js # Pill ingredient definitions
│   │   └── openfda.js       # OpenFDA label lookup
│   └── tests.http           # REST client tests
│
└── package.json             # Root scripts for parallel dev
```

## 🔌 API Endpoints

### Backend API (port 5050)

- `GET /api/health` - Server health check and mode info
- `GET /api/cycle` - Cycle tracking information
  - Query params: `packType`, `startDate`
- `POST /api/check-interactions` - Check drug interactions
  - Body: `{ meds: string[], pillType: string }`
- `GET /api/side-effects` - Get side effects by pill type
  - Query param: `kind` (combined | progestin_only)

### Example Usage

```bash
# Check API health
curl http://localhost:5050/api/health

# Get cycle info
curl "http://localhost:5050/api/cycle?packType=combined_24_4&startDate=2025-11-01"

# Check interactions
curl -X POST http://localhost:5050/api/check-interactions \
  -H "Content-Type: application/json" \
  -d '{"meds":["rifampin","topiramate"],"pillType":"combined"}'
```

## 🎨 Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS v4** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Radix UI** - Unstyled, accessible UI components
- **Lucide React** - Icon library
- **dayjs** - Date manipulation
- **clsx** - Conditional classNames

### Backend
- **Express.js** - Web framework
- **Zod** - Schema validation
- **dotenv** - Environment configuration
- **Morgan** - HTTP request logger
- **CORS** - Cross-origin resource sharing
- **dayjs** - Date manipulation

### External APIs
- **RxNav/RxNorm** (NLM) - Drug name resolution and interaction detection
- **OpenFDA** - Drug label information (optional enrichment)

## 🔧 Configuration

### Environment Variables

**Server (server/.env)**:
```env
PORT=5050
USE_DEMO_DATA=true          # true for demo mode, false for real APIs
STRICT_REAL_MODE=false      # true to disable demo fallback
```

**Frontend (frontend/.env)**:
```env
VITE_API_URL=http://localhost:5050
```

### Demo vs Real API Mode

- **Demo Mode** (`USE_DEMO_DATA=true`): Uses mock data from `miniData.js`
- **Real Mode** (`USE_DEMO_DATA=false`): Calls RxNav and OpenFDA APIs
- **Auto-fallback**: Real mode falls back to demo data if APIs fail (unless `STRICT_REAL_MODE=true`)

## 📖 Documentation

- [Server README](./server/README.md) - Backend API documentation
- [API Tests](./server/tests.http) - REST Client test file

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## ⚠️ Disclaimer

**This is a demonstration application for educational purposes only.**

- **NOT MEDICAL ADVICE**: Always consult your healthcare provider for medical decisions
- **NOT A SUBSTITUTE**: This app does not replace professional medical consultation
- **DATA ACCURACY**: The interaction data is illustrative and may not be comprehensive
- **USE AT YOUR OWN RISK**: The developers assume no liability for decisions made using this app

## 📝 License

This project is licensed under the MIT License.

## 👏 Acknowledgments

- **RxNav API** by National Library of Medicine
- **OpenFDA** by U.S. Food and Drug Administration
- **shadcn/ui** for the beautiful component system
- **Figma Community** for design inspiration

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

Made with 💜 for better birth control awareness and safety.

