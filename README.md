# ScentCraft - AI-Powered Personalized Fragrance Recommendation

An intelligent perfume recommendation system that creates personalized scent blends using AI-powered analysis of user preferences.

🔗 **Live Demo**: [https://scent-one.vercel.app](https://scent-one.vercel.app)

## ✨ Features

- **AI-Powered Recommendations** - Uses Google Gemini 2.0 Flash to analyze quiz responses and create personalized scent formulas
- **Psychological Personalization** - Implements IKEA Effect, Cold Reading, and Endowment Effect techniques for hyper-personalized results
- **8-Question Quiz** - Captures user preferences across energy, mood, setting, and purpose
- **Smart Blending Algorithm** - Creates scientifically balanced formulas (80% perfume essence, 20% support notes)
- **Beautiful UI** - Apple-inspired minimalist design with smooth Framer Motion animations
- **Comprehensive Inventory** - 24 perfume essences + 32 support notes with detailed profiles

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: TailwindCSS + shadcn/ui components
- **Animations**: Framer Motion
- **AI**: Google Gemini 2.0 Flash Exp via `@google/generative-ai`
- **Icons**: Lucide React
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/K0rnhulio/ScentCraft.git
cd ScentCraft
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173)

## 📦 Build for Production

```bash
npm run build
npm run preview
```

## 🎨 Project Structure

```
src/
├── components/          # shadcn/ui components
│   └── ui/             # Reusable UI components
├── services/
│   ├── aiService.ts    # Gemini AI integration
│   └── inventoryData.ts # Perfume inventory database
├── App.tsx             # Main application component
└── main.tsx            # Entry point
```

## 🧪 How It Works

1. **Quiz Phase** - User answers 8 questions about their scent preferences
2. **AI Analysis** - Gemini AI analyzes responses against perfume inventory
3. **Formula Generation** - AI creates a balanced blend (80% essence, 20% support)
4. **Personalized Result** - User receives custom blend with detailed reasoning

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_GEMINI_API_KEY` | Google Gemini API key | Yes |

## 📝 License

MIT

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- AI powered by [Google Gemini](https://ai.google.dev/)

---

Made with ❤️ by K0rnhulio
