# Calorie Tracker App - Implementation Plan

## Overview
A **lightning-fast**, client-side calorie tracking application designed for **effortless food logging** that takes seconds, not minutes. The app prioritizes an ultra-quick logging experience using AI SDK with Gemini 2.5 Flash via OpenRouter to instantly analyze food photos and text descriptions, providing calorie counts and macro breakdowns without friction.

### Core Philosophy: Speed & Simplicity
- **Primary Goal**: Make food logging so quick and easy that users actually do it consistently
- **Target Experience**: Open app → Snap photo/type description → Done (under 10 seconds)
- **Success Metric**: Users open the app multiple times daily because it's faster than any alternative
- **Design Principle**: Every tap, scroll, or input field must justify its existence

## Phase 1: Project Setup & Core Infrastructure

### Dependencies Installation
- [x] Install Vercel AI SDK (`npm install ai @openrouter/ai-sdk-provider`)
- [x] Install Recharts for data visualization (`npm install recharts`)
- [x] Install date-fns for date handling (`npm install date-fns`)
- [x] Install Lucide React for icons (`npm install lucide-react`)
- [x] Install react-webcam for camera functionality (`npm install react-webcam`)
- [x] Install necessary TypeScript types
- [x] Install zod for AI SDK compatibility

### Project Structure
- [x] Create `src/components/` directory
- [x] Create `src/lib/` directory for utilities
- [x] Create `src/types/` directory for TypeScript interfaces
- [x] Create `src/hooks/` directory for custom React hooks

### Type Definitions
- [x] Create `types/index.ts` with interfaces for:
  - [x] UserProfile (age, gender, activityLevel, goal)
  - [x] FoodEntry (name, calories, protein, carbs, fat, sugar, timestamp, imageUrl?)
  - [x] DailyTarget (calories, protein, carbs, fat, sugar)
  - [x] DailyProgress (date, entries, totals)
  - [x] AppSettings, QuickLogItem, MacroPercentages

## Phase 2: AI SDK Integration & Storage Layer

### AI SDK Configuration
- [x] Create `lib/ai.ts` for AI SDK setup with OpenRouter provider
- [x] Implement secure API key validation
- [x] Create function to analyze food images using Gemini 2.5 Flash via OpenRouter
- [x] Create function to analyze text descriptions using Gemini 2.5 Flash
- [x] Implement prompt engineering for accurate calorie/macro estimation
- [x] **UPDATED**: Switched from OpenAI GPT-5 to OpenRouter with Gemini 2.5 Flash for 10x faster image analysis

### Local Storage Management
- [x] Create `lib/storage.ts` with functions for:
  - [x] Storing/retrieving API key
  - [x] Saving/loading user profile
  - [x] Managing daily food entries
  - [x] Handling daily targets
  - [x] Auto-reset functionality at midnight
  - [x] Historical data management (30-90 days)
  - [x] SSR-safe localStorage access

### Custom Hooks
- [x] Create `hooks/useLocalStorage.ts` for reactive localStorage
- [x] Create `hooks/useAI.ts` for AI SDK interactions
- [x] Create `hooks/useDailyReset.ts` for midnight reset logic

## Phase 3: User Profile & Target Setting

### User Profile Component
- [x] Create `components/UserProfile.tsx`
- [x] Implement form for:
  - [x] Age input (number field)
  - [x] Gender selection (dropdown/radio)
  - [x] Activity level (sedentary, light, moderate, active, very active)
  - [x] Goal selection (lose weight, maintain, gain muscle)
  - [x] Current weight (optional)
  - [x] Height (optional)
  - [x] Units selection (metric/imperial)

### AI-Powered Target Calculator
- [x] Integrated into `lib/ai.ts`
- [x] Implement function to generate prompt for AI SDK target calculation
- [x] Parse AI response for daily targets:
  - [x] Total calories
  - [x] Protein (grams)
  - [x] Carbohydrates (grams)
  - [x] Fats (grams)
  - [x] Sugar limit (grams)
- [x] Store calculated targets in localStorage
- [x] **FIXED**: Improved target calculation with proper BMR/TDEE formulas (Mifflin-St Jeor equation)
- [x] **FIXED**: Simplified JSON parsing to extract last JSON block from AI responses

### API Key Management Component
- [x] Create `components/ApiKeyInput.tsx`
- [x] Secure input field with show/hide toggle
- [x] Validation of API key format
- [x] Test connection button
- [x] Clear/reset functionality
- [x] Visual indicator of API key status

## Phase 4: Food Entry System (Core User Experience)

### Quick-Capture Camera Component
- [x] Create `components/Camera.tsx`
- [x] **One-tap camera activation** - instant photo capture
- [x] Auto-submit option after photo capture (no confirmation needed)
- [x] Implement webcam capture using react-webcam
- [x] Add file upload as secondary option
- [x] Optional preview (can be disabled for speed)
- [x] Camera facing mode toggle (front/back)
- [ ] Batch photo support for complex meals
- [ ] Background image processing for instant UI response
- [x] Image compression/resizing for API efficiency - **COMPLETED**: Images now compressed to 800x800 @ 70% quality before API submission

### Lightning-Fast Entry Form Component
- [x] Create `components/FoodEntry.tsx`
- [x] **Voice-to-text primary input** for hands-free logging
- [x] Large, prominent text input
- [x] Quick-log items from frequent foods
- [x] Auto-detect meal type based on time of day
- [x] Instant submit with optimistic UI updates
- [x] Background processing with immediate visual feedback
- [ ] Auto-complete from previous entries (predictive typing)
- [ ] Smart portion defaults based on meal type and history
- [ ] Optional detailed fields (collapsed by default):
  - [ ] Portion size adjustment
  - [ ] Additional context (cooking method, ingredients)

### Instant AI Analysis Integration
- [x] Display AI response with:
  - [x] Estimated calories (shown first, largest)
  - [x] Macro breakdown (protein, carbs, fat)
  - [x] Sugar content
  - [x] Confidence indicator (subtle, non-blocking)
- [x] **Quick-confirm button** - accept and close in one tap
- [x] Inline adjustment with +/- buttons (no modal)
- [x] Auto-save to daily log (no confirmation needed) - FIXED: Entries now auto-save immediately
- [ ] Implement parallel image + text analysis for speed
- [ ] **Immediate placeholder values** while processing
- [ ] Progressive enhancement of results as AI responds
- [ ] Undo option for last 3 entries (swipe or button)

## Phase 5: Daily Progress Tracking

### Daily Progress Component
- [x] Create `components/DailyProgress.tsx`
- [x] Display current date prominently
- [x] Show progress bars for:
  - [x] Total calories (with target)
  - [x] Protein intake
  - [x] Carbohydrates
  - [x] Fats
  - [x] Sugar consumption
- [x] Percentage and absolute values display
- [x] Color coding (green/yellow/red) for targets

### Food Entry List Component
- [x] Create `components/FoodEntryList.tsx`
- [x] Display today's food entries grouped by meal type
- [x] Show meal type, name, calories, and macros
- [x] Edit functionality for each entry
- [x] Delete functionality with confirmation
- [x] Running total at bottom
- [x] Meal type icons and grouping

### Daily Summary Component
- [x] Create `components/DailySummary.tsx`
- [x] Calories remaining/over
- [x] Macro distribution pie chart
- [x] Suggestions for remaining meals (if under target)
- [x] Warning indicators for exceeding limits

## Phase 6: Historical Data & Visualization

### History Chart Component
- [x] Create `components/HistoryChart.tsx`
- [x] Implement using Recharts library
- [x] Line chart for calories over time (7/30/90 days)
- [x] Stacked bar chart for macro distribution
- [x] Target line overlay
- [x] Date range selector
- [x] Hover tooltips with detailed information

### Statistics Component
- [x] Create `components/Statistics.tsx`
- [x] Average daily calories (week/month)
- [x] Macro distribution trends
- [x] Goal adherence percentage
- [x] Streak tracking (days meeting targets)
- [x] Best/worst days highlighting

### Data Export Feature
- [x] Add export functionality:
  - [x] CSV export of daily entries
  - [x] JSON export for backup
  - [x] Text report generation 
- [x] Import functionality for data restoration

## Phase 7: UI/UX Enhancement

### Speed-Optimized App Layout
- [x] Update `app/page.tsx` with:
  - [x] **Camera/Input as primary screen** (FoodEntry component is primary)
  - [x] Tab navigation for quick section switching
  - [x] Swipe navigation support (mobile)
  - [x] Mobile-first design (optimized for one-handed use)
  - [x] Dark mode by default (easier on eyes, saves battery)
  - [x] Clean, minimal UI with essential elements only
  - [x] Added Stats view with charts and analytics

### Component Styling
- [x] Apply consistent Tailwind CSS styling
- [x] Create reusable style components
- [x] Implement loading skeletons
- [x] Add animations/transitions
- [x] Error state designs
- [x] Empty state designs

### Mobile-First Speed Optimization
- [x] **Extra-large touch targets** for quick tapping
- [x] Swipe gestures for all actions:
  - [x] Swipe up to capture photo
  - [x] Swipe right to confirm
  - [x] Swipe left to undo
- [ ] Haptic feedback for instant confirmation
- [x] Responsive image displays
- [ ] Full-screen camera interface
- [x] PWA with home screen shortcut
- [x] **Offline-first** - log now, sync later
- [x] Background sync when connection available
- [ ] Widget support (iOS/Android) for instant access

## Phase 8: Advanced Features (Speed Optimizations)

### Ultra-Fast Logging Features
- [ ] **Quick-Log Widgets** - one-tap frequent items
  - [ ] Morning coffee preset
  - [ ] Common breakfast/lunch/dinner options
  - [ ] Recent meals carousel
- [ ] **Smart Barcode Scanner** - instant product logging
- [ ] **Meal Templates** - save and reuse complete meals
- [ ] **Copy Previous Day** - duplicate yesterday's entry
- [ ] **Favorites Grid** - visual grid of top 20 foods

### Smart Suggestions
- [ ] **Predictive Entry** - suggest food before user types
  - [ ] Based on time of day
  - [ ] Based on location (if permitted)
  - [ ] Based on day of week patterns
- [ ] **Quick-Complete** - finish entries with one tap
- [ ] **Combo Detection** - recognize common food pairings
- [ ] Recipe mode for multi-ingredient meals (advanced users)

### Gentle Nudges (Non-Intrusive)
- [ ] **Smart Reminders** - only when user hasn't logged
- [ ] Time-based gentle prompts (customizable)
- [ ] Quick-log from notification (one tap to app)
- [ ] Streak encouragement (subtle motivation)
- [ ] End-of-day summary (optional)

### Data Insights
- [ ] Weekly/monthly reports
- [ ] Trend analysis with AI
- [ ] Personalized recommendations
- [ ] Progress predictions

## Phase 9: Testing & Optimization

### Testing
- [ ] Unit tests for calculation functions
- [ ] Component testing with React Testing Library
- [ ] E2E testing for critical user flows
- [ ] API error handling tests
- [ ] localStorage fallback tests

### Performance Optimization (Speed is Everything)
- [ ] **Instant app launch** - progressive loading
- [ ] **Optimistic UI updates** - show results before confirmation
- [ ] **Smart caching** - previous foods load instantly
- [ ] **Background processing** - never block user input
- [ ] **Minimal bundle** - under 100KB initial load
- [ ] **Service worker** for offline-first experience
- [ ] **Prefetch common actions** - anticipate user needs
- [ ] Target: First meaningful paint < 1 second
- [ ] Target: Time to interactive < 2 seconds
- [ ] Lighthouse performance score > 95

### Error Handling
- [ ] Graceful API failure handling
- [ ] Offline mode capabilities
- [ ] Data validation and sanitization
- [ ] User-friendly error messages
- [ ] Recovery mechanisms

## Phase 10: Deployment & Documentation

### Deployment Preparation
- [ ] Environment variable setup
- [ ] Build optimization
- [ ] Security audit
- [ ] CORS configuration
- [ ] Rate limiting considerations

### Documentation
- [ ] User guide/help section
- [ ] API key setup instructions
- [ ] Privacy policy (data is local only)
- [ ] Troubleshooting guide
- [ ] Developer documentation

### Launch
- [ ] Deploy to Vercel/Netlify
- [ ] Custom domain setup (optional)
- [ ] Analytics integration (optional)
- [ ] User feedback mechanism
- [ ] Version control and release notes

## Recent Updates

### UI/UX Improvements (2025-09-14)
- [x] **Gram Display Rounding**: All gram values (protein, carbs, fat, sugar) now display as whole numbers throughout the application for cleaner UI
  - Updated FoodEntryList, EnhancedFoodEntryList, DailyProgress, FoodEntry components
  - Updated Statistics component to calculate averages without decimals
  - Updated HistoryChart to round macro values in chart data
  - Ensures consistent whole number display across all components

## Technical Considerations

### Speed & Performance Requirements
- **App launch to logging**: < 3 seconds total
- **Photo to result**: < 5 seconds (including AI processing)
- **Text entry to result**: < 3 seconds
- **All animations**: < 200ms
- **Touch response**: < 50ms (instant feel)
- **Background sync**: Never block UI

### Security
- API key stored locally only
- No server-side data storage
- Optional encryption for sensitive data
- Rate limiting awareness

### Privacy
- All data remains on user's device
- No tracking or analytics by default
- Clear data deletion options
- Transparent data usage

### Accessibility (Without Sacrificing Speed)
- Large touch targets by default
- Voice input as primary option
- High contrast for quick scanning
- Minimal cognitive load
- Screen reader support (secondary)

### Browser Compatibility
- Modern mobile browsers only (Chrome, Safari)
- Progressive Web App for app-like experience
- Offline-first architecture
- Native app feel and performance