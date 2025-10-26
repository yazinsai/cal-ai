# Calorie Tracker

A **lightning-fast**, privacy-first calorie tracking application that makes food logging effortless. Built with AI-powered analysis to instantly estimate calories and macros from photos or text descriptions.

## Features

### Core Functionality
- **AI-Powered Analysis**: Snap a photo or describe your meal, and get instant calorie and macro estimates using Gemini 2.5 Flash
- **Lightning-Fast Logging**: Designed for speed - log meals in under 10 seconds
- **Privacy-First**: All data stored locally on your device - no server-side storage or tracking
- **Smart Targets**: AI-calculated daily calorie and macro targets based on your profile, goals, and activity level
- **Real-Time Progress**: Visual progress bars showing your daily intake vs targets

### Advanced Features
- **Voice Input**: Hands-free meal logging with voice-to-text
- **Quick Log**: One-tap logging for frequently eaten foods
- **Photo & Text Analysis**: Multiple input methods for maximum flexibility
- **Meal History**: Browse and edit previous entries grouped by meal type
- **Statistics & Charts**: Track trends with interactive charts (7/30/90-day views)
- **Data Export**: Export your data as CSV or JSON for backup and analysis
- **Progressive Web App**: Install on your home screen for native app-like experience
- **Offline-First**: Log entries even without internet connection

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with React 19
- **AI SDK**: [Vercel AI SDK](https://sdk.vercel.ai/) with [OpenRouter](https://openrouter.ai/) (Gemini 2.5 Flash)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Camera**: [react-webcam](https://github.com/mozmorris/react-webcam)
- **TypeScript**: Full type safety throughout

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- An [OpenRouter API key](https://openrouter.ai/keys) (required for AI analysis)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/calorie-tracker.git
cd calorie-tracker
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Configuration

### Setting Up Your API Key

1. Get a free API key from [OpenRouter](https://openrouter.ai/keys)
2. On first launch, you'll be prompted to enter your API key
3. Your API key is stored locally in your browser and never sent to any server except OpenRouter

### Setting Up Your Profile

1. Navigate to the **Profile** tab
2. Enter your details:
   - Age
   - Gender
   - Activity level (sedentary to very active)
   - Goal (lose weight, maintain, or gain muscle)
   - Weight and height (optional, for more accurate calculations)
3. Click **Calculate Targets** to get AI-generated daily calorie and macro targets

## Usage

### Logging a Meal

**Method 1: Photo**
1. Click the camera icon or "Take Photo" button
2. Capture your meal
3. Review the AI analysis
4. Confirm and save

**Method 2: Text Description**
1. Type or speak your meal description (e.g., "grilled chicken breast with rice")
2. Click **Analyze**
3. Review the AI analysis
4. Confirm and save

**Method 3: Quick Log**
1. Select a frequently eaten food from your Quick Log list
2. Instant entry with saved values

### Viewing Progress

- **Today Tab**: See real-time progress bars for calories and macros
- **History Tab**: Browse past entries grouped by meal type
- **Stats Tab**: View trends, charts, and insights over time

### Managing Data

- **Edit Entries**: Click any entry to edit calories, macros, or delete
- **Export Data**: Go to Stats → Export to download CSV or JSON backup
- **Import Data**: Restore from a previous JSON export
- **Clear Data**: Reset all entries (with confirmation)

## Privacy & Data Storage

- **100% Local Storage**: All your data stays on your device
- **No Tracking**: No analytics, cookies, or third-party tracking
- **API Key Security**: Your OpenRouter API key is stored locally and only used to communicate directly with OpenRouter
- **No Account Required**: Use the app immediately without signing up

## Development

### Project Structure
```
src/
├── app/              # Next.js app directory
├── components/       # React components
├── hooks/            # Custom React hooks
├── lib/              # Utilities (AI, storage)
└── types/            # TypeScript type definitions
```

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Key Technologies

- **AI Integration**: Uses Vercel AI SDK with OpenRouter for flexible model support
- **State Management**: React hooks + localStorage for persistence
- **Data Visualization**: Recharts for interactive charts
- **Responsive Design**: Mobile-first with Tailwind CSS
- **Image Processing**: Automatic compression and optimization before API calls

## Roadmap

- [ ] Barcode scanner for packaged foods
- [ ] Meal templates and favorites
- [ ] Smart suggestions based on time and patterns
- [ ] Widget support for instant access
- [ ] Nutrition goals beyond macros (vitamins, minerals)
- [ ] Integration with fitness trackers

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Powered by [Google's Gemini 2.5 Flash](https://deepmind.google/technologies/gemini/) via [OpenRouter](https://openrouter.ai/)
- Built with [Vercel AI SDK](https://sdk.vercel.ai/)
- Icons by [Lucide](https://lucide.dev/)

---

**Note**: This app provides estimates based on AI analysis. For medical or dietary advice, please consult a healthcare professional.
