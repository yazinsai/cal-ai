# Calorie Tracker App - Implementation Plan

## Overview
A **lightning-fast**, client-side calorie tracking application designed for **effortless food logging** that takes seconds, not minutes. The app prioritizes an ultra-quick logging experience using AI SDK with GPT-4 Vision to instantly analyze food photos and text descriptions, providing calorie counts and macro breakdowns without friction.

### Core Philosophy: Speed & Simplicity
- **Primary Goal**: Make food logging so quick and easy that users actually do it consistently
- **Target Experience**: Open app → Snap photo/type description → Done (under 10 seconds)
- **Success Metric**: Users open the app multiple times daily because it's faster than any alternative
- **Design Principle**: Every tap, scroll, or input field must justify its existence

## Phase 1: Project Setup & Core Infrastructure

### Dependencies Installation
- [ ] Install Vercel AI SDK (`npm install ai @ai-sdk/openai`)
- [ ] Install Recharts for data visualization (`npm install recharts`)
- [ ] Install date-fns for date handling (`npm install date-fns`)
- [ ] Install Lucide React for icons (`npm install lucide-react`)
- [ ] Install react-webcam for camera functionality (`npm install react-webcam`)
- [ ] Install necessary TypeScript types

### Project Structure
- [ ] Create `src/components/` directory
- [ ] Create `src/lib/` directory for utilities
- [ ] Create `src/types/` directory for TypeScript interfaces
- [ ] Create `src/hooks/` directory for custom React hooks

### Type Definitions
- [ ] Create `types/index.ts` with interfaces for:
  - [ ] UserProfile (age, gender, activityLevel, goal)
  - [ ] FoodEntry (name, calories, protein, carbs, fat, sugar, timestamp, imageUrl?)
  - [ ] DailyTarget (calories, protein, carbs, fat, sugar)
  - [ ] DailyProgress (date, entries, totals)

## Phase 2: AI SDK Integration & Storage Layer

### AI SDK Configuration
- [ ] Create `lib/ai.ts` for AI SDK setup with OpenAI provider
- [ ] Implement secure API key validation
- [ ] Create function to analyze food images using GPT-4 Vision via AI SDK
- [ ] Create function to analyze text descriptions using AI SDK
- [ ] Implement prompt engineering for accurate calorie/macro estimation

### Local Storage Management
- [ ] Create `lib/storage.ts` with functions for:
  - [ ] Storing/retrieving API key (encrypted if possible)
  - [ ] Saving/loading user profile
  - [ ] Managing daily food entries
  - [ ] Handling daily targets
  - [ ] Auto-reset functionality at midnight
  - [ ] Historical data management (30-90 days)

### Custom Hooks
- [ ] Create `hooks/useLocalStorage.ts` for reactive localStorage
- [ ] Create `hooks/useAI.ts` for AI SDK interactions
- [ ] Create `hooks/useDailyReset.ts` for midnight reset logic

## Phase 3: User Profile & Target Setting

### User Profile Component
- [ ] Create `components/UserProfile.tsx`
- [ ] Implement form for:
  - [ ] Age input (number field)
  - [ ] Gender selection (dropdown/radio)
  - [ ] Activity level (sedentary, light, moderate, active, very active)
  - [ ] Goal selection (lose weight, maintain, gain muscle)
  - [ ] Current weight (optional)
  - [ ] Height (optional)

### AI-Powered Target Calculator
- [ ] Create `lib/calculations.ts`
- [ ] Implement function to generate prompt for AI SDK target calculation
- [ ] Parse AI response for daily targets:
  - [ ] Total calories
  - [ ] Protein (grams and percentage)
  - [ ] Carbohydrates (grams and percentage)
  - [ ] Fats (grams and percentage)
  - [ ] Sugar limit (grams)
- [ ] Store calculated targets in localStorage

### API Key Management Component
- [ ] Create `components/ApiKeyInput.tsx`
- [ ] Secure input field with show/hide toggle
- [ ] Validation of API key format
- [ ] Test connection button
- [ ] Clear/reset functionality
- [ ] Visual indicator of API key status

## Phase 4: Food Entry System (Core User Experience)

### Quick-Capture Camera Component
- [ ] Create `components/Camera.tsx`
- [ ] **One-tap camera activation** - instant photo capture
- [ ] Auto-submit option after photo capture (no confirmation needed)
- [ ] Implement webcam capture using react-webcam
- [ ] Smart photo mode - automatically detect and crop food items
- [ ] Add file upload as secondary option
- [ ] Optional preview (can be disabled for speed)
- [ ] Batch photo support for complex meals
- [ ] Background image processing for instant UI response
- [ ] Image compression/resizing for API efficiency

### Lightning-Fast Entry Form Component
- [ ] Create `components/FoodEntry.tsx`
- [ ] **Voice-to-text primary input** for hands-free logging
- [ ] Large, prominent text input with smart suggestions
- [ ] Auto-complete from previous entries (predictive typing)
- [ ] Smart portion defaults based on meal type and history
- [ ] Optional detailed fields (collapsed by default):
  - [ ] Portion size adjustment
  - [ ] Additional context (cooking method, ingredients)
- [ ] Auto-detect meal type based on time of day
- [ ] Instant submit with optimistic UI updates
- [ ] Background processing with immediate visual feedback

### Instant AI Analysis Integration
- [ ] Implement parallel image + text analysis for speed
- [ ] **Immediate placeholder values** while processing
- [ ] Progressive enhancement of results as AI responds
- [ ] Display AI response with:
  - [ ] Estimated calories (shown first, largest)
  - [ ] Macro breakdown (protein, carbs, fat)
  - [ ] Sugar content
  - [ ] Confidence indicator (subtle, non-blocking)
- [ ] **Quick-confirm button** - accept and close in one tap
- [ ] Inline adjustment with +/- buttons (no modal)
- [ ] Auto-save to daily log (no confirmation needed)
- [ ] Undo option for last 3 entries (swipe or button)

## Phase 5: Daily Progress Tracking

### Daily Progress Component
- [ ] Create `components/DailyProgress.tsx`
- [ ] Display current date prominently
- [ ] Show progress bars for:
  - [ ] Total calories (with target)
  - [ ] Protein intake
  - [ ] Carbohydrates
  - [ ] Fats
  - [ ] Sugar consumption
- [ ] Percentage and absolute values display
- [ ] Color coding (green/yellow/red) for targets

### Food Entry List Component
- [ ] Create `components/FoodEntryList.tsx`
- [ ] Display today's food entries in chronological order
- [ ] Show meal type, name, calories, and macros
- [ ] Edit functionality for each entry
- [ ] Delete functionality with confirmation
- [ ] Running total at bottom

### Daily Summary Component
- [ ] Create `components/DailySummary.tsx`
- [ ] Calories remaining/over
- [ ] Macro distribution pie chart
- [ ] Suggestions for remaining meals (if under target)
- [ ] Warning indicators for exceeding limits

## Phase 6: Historical Data & Visualization

### History Chart Component
- [ ] Create `components/HistoryChart.tsx`
- [ ] Implement using Recharts library
- [ ] Line chart for calories over time (7/30/90 days)
- [ ] Stacked bar chart for macro distribution
- [ ] Target line overlay
- [ ] Date range selector
- [ ] Hover tooltips with detailed information

### Statistics Component
- [ ] Create `components/Statistics.tsx`
- [ ] Average daily calories (week/month)
- [ ] Macro distribution trends
- [ ] Goal adherence percentage
- [ ] Streak tracking (days meeting targets)
- [ ] Best/worst days highlighting

### Data Export Feature
- [ ] Add export functionality:
  - [ ] CSV export of daily entries
  - [ ] JSON export for backup
  - [ ] PDF report generation (optional)
- [ ] Import functionality for data restoration

## Phase 7: UI/UX Enhancement

### Speed-Optimized App Layout
- [ ] Update `app/page.tsx` with:
  - [ ] **Camera/Input as primary screen** (no navigation needed)
  - [ ] Floating action button for instant capture
  - [ ] Swipe navigation (faster than tabs)
  - [ ] Bottom sheet for quick actions
  - [ ] Mobile-first design (optimized for one-handed use)
  - [ ] Dark mode by default (easier on eyes, saves battery)
  - [ ] Minimal UI - hide non-essential elements

### Component Styling
- [ ] Apply consistent Tailwind CSS styling
- [ ] Create reusable style components
- [ ] Implement loading skeletons
- [ ] Add animations/transitions
- [ ] Error state designs
- [ ] Empty state designs

### Mobile-First Speed Optimization
- [ ] **Extra-large touch targets** for quick tapping
- [ ] Swipe gestures for all actions:
  - [ ] Swipe up to capture photo
  - [ ] Swipe right to confirm
  - [ ] Swipe left to undo
- [ ] Haptic feedback for instant confirmation
- [ ] Responsive image displays
- [ ] Full-screen camera interface
- [ ] PWA with home screen shortcut
- [ ] **Offline-first** - log now, sync later
- [ ] Background sync when connection available
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