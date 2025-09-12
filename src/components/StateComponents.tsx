import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info, Database, Search, Camera, Utensils } from 'lucide-react';
import { styles, cn } from '@/lib/styles';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  icon?: React.ReactNode;
}

export function ErrorState({ 
  title = 'Something went wrong', 
  message, 
  onRetry,
  icon 
}: ErrorStateProps) {
  return (
    <div className={cn(styles.empty.container, 'animate-in fade-in')}>
      {icon || <AlertCircle className={cn(styles.empty.icon, 'text-red-500')} />}
      <h3 className={styles.empty.title}>{title}</h3>
      <p className={styles.empty.description}>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className={cn(
            styles.button.base,
            styles.button.primary,
            styles.button.size.md,
            'touch-feedback'
          )}
        >
          Try Again
        </button>
      )}
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
}

export function EmptyState({ title, message, action, icon }: EmptyStateProps) {
  return (
    <div className={cn(styles.empty.container, 'animate-in fade-in')}>
      {icon}
      <h3 className={styles.empty.title}>{title}</h3>
      <p className={styles.empty.description}>{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className={cn(
            styles.button.base,
            styles.button.primary,
            styles.button.size.lg,
            'touch-feedback'
          )}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export function NoFoodEntriesState({ onAddEntry }: { onAddEntry: () => void }) {
  return (
    <EmptyState
      icon={<Utensils className={cn(styles.empty.icon, 'text-gray-400')} />}
      title="No food entries yet"
      message="Start tracking your meals by taking a photo or describing what you ate"
      action={{
        label: "Add Your First Meal",
        onClick: onAddEntry
      }}
    />
  );
}

export function NoHistoryState() {
  return (
    <EmptyState
      icon={<Database className={cn(styles.empty.icon, 'text-gray-400')} />}
      title="No history available"
      message="Start logging your meals to see your progress over time"
    />
  );
}

export function NoSearchResultsState({ query }: { query: string }) {
  return (
    <EmptyState
      icon={<Search className={cn(styles.empty.icon, 'text-gray-400')} />}
      title="No results found"
      message={`We couldn't find any entries matching "${query}"`}
    />
  );
}

export function CameraPermissionError({ onRetry }: { onRetry: () => void }) {
  return (
    <ErrorState
      icon={<Camera className={cn(styles.empty.icon, 'text-yellow-500')} />}
      title="Camera access denied"
      message="Please enable camera permissions to take food photos"
      onRetry={onRetry}
    />
  );
}

interface WarningStateProps {
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function WarningState({ title, message, action }: WarningStateProps) {
  return (
    <div className={cn(
      styles.card.base,
      styles.card.padding.md,
      'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
      'animate-in slide-up'
    )}>
      <div className="flex gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium text-yellow-900 dark:text-yellow-100">{title}</h4>
          <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">{message}</p>
          {action && (
            <button
              onClick={action.onClick}
              className={cn(
                styles.button.base,
                styles.button.size.sm,
                'bg-yellow-600 text-white hover:bg-yellow-700 mt-3'
              )}
            >
              {action.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface SuccessStateProps {
  title: string;
  message?: string;
  onDismiss?: () => void;
}

export function SuccessState({ title, message, onDismiss }: SuccessStateProps) {
  React.useEffect(() => {
    if (onDismiss) {
      const timer = setTimeout(onDismiss, 3000);
      return () => clearTimeout(timer);
    }
  }, [onDismiss]);

  return (
    <div className={cn(
      styles.card.base,
      styles.card.padding.md,
      'border-green-500 bg-green-50 dark:bg-green-900/20',
      'animate-in slide-down'
    )}>
      <div className="flex gap-3">
        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium text-green-900 dark:text-green-100">{title}</h4>
          {message && (
            <p className="text-sm text-green-800 dark:text-green-200 mt-1">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}

interface InfoStateProps {
  title: string;
  message: string;
}

export function InfoState({ title, message }: InfoStateProps) {
  return (
    <div className={cn(
      styles.card.base,
      styles.card.padding.md,
      'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
      'animate-in fade-in'
    )}>
      <div className="flex gap-3">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium text-blue-900 dark:text-blue-100">{title}</h4>
          <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">{message}</p>
        </div>
      </div>
    </div>
  );
}