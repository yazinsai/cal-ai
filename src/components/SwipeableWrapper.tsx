'use client';

import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { cn } from '@/lib/styles';

interface SwipeableWrapperProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  className?: string;
  showIndicator?: boolean;
}

export function SwipeableWrapper({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  className,
  showIndicator = false
}: SwipeableWrapperProps) {
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);
  
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (onSwipeLeft) {
        setSwipeDirection('left');
        onSwipeLeft();
        setTimeout(() => setSwipeDirection(null), 300);
      }
    },
    onSwipedRight: () => {
      if (onSwipeRight) {
        setSwipeDirection('right');
        onSwipeRight();
        setTimeout(() => setSwipeDirection(null), 300);
      }
    },
    onSwipedUp: () => {
      if (onSwipeUp) {
        setSwipeDirection('up');
        onSwipeUp();
        setTimeout(() => setSwipeDirection(null), 300);
      }
    },
    onSwipedDown: () => {
      if (onSwipeDown) {
        setSwipeDirection('down');
        onSwipeDown();
        setTimeout(() => setSwipeDirection(null), 300);
      }
    },
    preventScrollOnSwipe: false,
    trackMouse: false,
    trackTouch: true,
    delta: 50, // Min distance for swipe
    swipeDuration: 500, // Max time for swipe
  });

  const getSwipeAnimation = () => {
    switch (swipeDirection) {
      case 'left':
        return 'animate-[slideLeft_300ms_ease-out]';
      case 'right':
        return 'animate-[slideRight_300ms_ease-out]';
      case 'up':
        return 'animate-[slideUp_300ms_ease-out]';
      case 'down':
        return 'animate-[slideDown_300ms_ease-out]';
      default:
        return '';
    }
  };

  return (
    <div 
      {...handlers}
      className={cn(
        'swipeable relative',
        getSwipeAnimation(),
        className
      )}
    >
      {children}
      
      {showIndicator && swipeDirection && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className={cn(
            'px-4 py-2 rounded-full bg-black/70 text-white text-sm font-medium',
            'animate-in fade-in zoom-in duration-200'
          )}>
            {swipeDirection === 'left' && '← Swiped Left'}
            {swipeDirection === 'right' && 'Swiped Right →'}
            {swipeDirection === 'up' && '↑ Swiped Up'}
            {swipeDirection === 'down' && '↓ Swiped Down'}
          </div>
        </div>
      )}
    </div>
  );
}

interface SwipeableListItemProps {
  children: React.ReactNode;
  onDelete?: () => void;
  onEdit?: () => void;
  className?: string;
}

export function SwipeableListItem({
  children,
  onDelete,
  onEdit,
  className
}: SwipeableListItemProps) {
  const [offset, setOffset] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      if (eventData.dir === 'Left' && onDelete) {
        setOffset(Math.max(eventData.deltaX, -100));
      } else if (eventData.dir === 'Right' && onEdit) {
        setOffset(Math.min(eventData.deltaX, 100));
      }
    },
    onSwipedLeft: () => {
      if (onDelete && Math.abs(offset) > 50) {
        setIsDeleting(true);
        setTimeout(() => {
          onDelete();
        }, 300);
      } else {
        setOffset(0);
      }
    },
    onSwipedRight: () => {
      if (onEdit && offset > 50) {
        onEdit();
      }
      setOffset(0);
    },
    trackMouse: false,
    trackTouch: true,
  });

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Background actions */}
      {onDelete && (
        <div className="absolute inset-y-0 right-0 flex items-center px-4 bg-red-500">
          <span className="text-white font-medium">Delete</span>
        </div>
      )}
      {onEdit && (
        <div className="absolute inset-y-0 left-0 flex items-center px-4 bg-blue-500">
          <span className="text-white font-medium">Edit</span>
        </div>
      )}
      
      {/* Swipeable content */}
      <div
        {...handlers}
        className={cn(
          'relative bg-white dark:bg-gray-900 transition-all duration-200',
          isDeleting && 'opacity-0 scale-95'
        )}
        style={{
          transform: `translateX(${offset}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function SwipeNavigator({
  tabs,
  activeTab,
  onTabChange
}: {
  tabs: string[];
  activeTab: number;
  onTabChange: (index: number) => void;
}) {
  const goToNext = () => {
    if (activeTab < tabs.length - 1) {
      onTabChange(activeTab + 1);
    }
  };

  const goToPrevious = () => {
    if (activeTab > 0) {
      onTabChange(activeTab - 1);
    }
  };

  return (
    <SwipeableWrapper
      onSwipeLeft={goToNext}
      onSwipeRight={goToPrevious}
      className="min-h-[calc(100vh-200px)]"
    >
      <div className="flex gap-1 justify-center mb-4">
        {tabs.map((_, index) => (
          <div
            key={index}
            className={cn(
              'h-1 w-8 rounded-full transition-all duration-300',
              index === activeTab 
                ? 'bg-blue-600 w-12' 
                : 'bg-gray-300 dark:bg-gray-700'
            )}
          />
        ))}
      </div>
    </SwipeableWrapper>
  );
}