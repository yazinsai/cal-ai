export const styles = {
  // Buttons
  button: {
    base: 'inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95',
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-500',
    size: {
      sm: 'px-3 py-1.5 text-sm rounded-md',
      md: 'px-4 py-2 text-base rounded-lg',
      lg: 'px-6 py-3 text-lg rounded-lg min-h-[48px]', // Touch-friendly
      xl: 'px-8 py-4 text-xl rounded-xl min-h-[56px]', // Extra touch-friendly
    },
  },
  
  // Cards
  card: {
    base: 'bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800',
    interactive: 'hover:shadow-md transition-shadow cursor-pointer',
    padding: {
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    },
  },
  
  // Inputs
  input: {
    base: 'w-full px-4 py-3 rounded-lg border bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
    default: 'border-gray-300 dark:border-gray-700',
    error: 'border-red-500 focus:ring-red-500',
    success: 'border-green-500 focus:ring-green-500',
    size: {
      sm: 'text-sm py-2',
      md: 'text-base py-3',
      lg: 'text-lg py-4 min-h-[56px]', // Touch-friendly
    },
  },
  
  // Labels
  label: {
    base: 'block text-sm font-medium mb-2',
    default: 'text-gray-700 dark:text-gray-300',
    required: 'after:content-["*"] after:ml-0.5 after:text-red-500',
  },
  
  // Progress bars
  progress: {
    container: 'w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden',
    bar: 'h-full transition-all duration-300 ease-out rounded-full',
    height: {
      sm: 'h-2',
      md: 'h-3',
      lg: 'h-4',
    },
    colors: {
      blue: 'bg-blue-600',
      green: 'bg-green-600',
      yellow: 'bg-yellow-500',
      red: 'bg-red-600',
    },
  },
  
  // Badges
  badge: {
    base: 'inline-flex items-center font-medium rounded-full',
    size: {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base',
    },
    variant: {
      default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    },
  },
  
  // Sections
  section: {
    base: 'space-y-4',
    title: 'text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4',
    subtitle: 'text-sm text-gray-600 dark:text-gray-400 mt-1',
  },
  
  // Animations
  animation: {
    fadeIn: 'animate-in fade-in duration-200',
    slideUp: 'animate-in slide-in-from-bottom-2 duration-200',
    slideDown: 'animate-in slide-in-from-top-2 duration-200',
    pulse: 'animate-pulse',
    spin: 'animate-spin',
  },
  
  // Skeleton loaders
  skeleton: {
    base: 'animate-pulse bg-gray-200 dark:bg-gray-800 rounded',
    text: 'h-4 w-full rounded',
    title: 'h-6 w-3/4 rounded',
    button: 'h-10 w-24 rounded-lg',
    card: 'h-32 w-full rounded-xl',
    image: 'aspect-square w-full rounded-lg',
  },
  
  // States
  state: {
    error: 'text-red-600 dark:text-red-400 text-sm mt-1',
    success: 'text-green-600 dark:text-green-400 text-sm mt-1',
    warning: 'text-yellow-600 dark:text-yellow-400 text-sm mt-1',
    info: 'text-blue-600 dark:text-blue-400 text-sm mt-1',
  },
  
  // Empty states
  empty: {
    container: 'flex flex-col items-center justify-center py-12 px-4 text-center',
    icon: 'w-16 h-16 mb-4 text-gray-400',
    title: 'text-lg font-medium text-gray-900 dark:text-gray-100 mb-2',
    description: 'text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-sm',
  },
  
  // Mobile optimizations
  mobile: {
    touchTarget: 'min-h-[44px] min-w-[44px]', // iOS Human Interface Guidelines
    safeArea: 'pb-safe pt-safe px-safe', // For PWA with notch
    bottomSheet: 'fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-2xl shadow-xl',
  },
};

// Helper function to combine classes
export function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}