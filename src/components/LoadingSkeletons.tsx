import React from 'react';
import { styles, cn } from '@/lib/styles';

export function FoodEntrySkeleton() {
  return (
    <div className={cn(styles.card.base, styles.card.padding.md, 'space-y-4')}>
      <div className="space-y-3">
        <div className={cn(styles.skeleton.base, styles.skeleton.title)} />
        <div className={cn(styles.skeleton.base, styles.skeleton.text, 'w-2/3')} />
      </div>
      <div className="flex gap-3">
        <div className={cn(styles.skeleton.base, styles.skeleton.button)} />
        <div className={cn(styles.skeleton.base, styles.skeleton.button)} />
      </div>
    </div>
  );
}

export function DailyProgressSkeleton() {
  return (
    <div className={cn(styles.card.base, styles.card.padding.lg, 'space-y-6')}>
      <div className={cn(styles.skeleton.base, styles.skeleton.title)} />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="space-y-2">
          <div className="flex justify-between">
            <div className={cn(styles.skeleton.base, 'h-4 w-20')} />
            <div className={cn(styles.skeleton.base, 'h-4 w-16')} />
          </div>
          <div className={cn(styles.skeleton.base, 'h-3 w-full rounded-full')} />
        </div>
      ))}
    </div>
  );
}

export function FoodListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className={cn(styles.card.base, styles.card.padding.md, 'flex justify-between items-center')}>
          <div className="flex-1 space-y-2">
            <div className={cn(styles.skeleton.base, styles.skeleton.text, 'w-3/4')} />
            <div className={cn(styles.skeleton.base, 'h-3 w-1/2')} />
          </div>
          <div className={cn(styles.skeleton.base, 'h-8 w-16 rounded')} />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className={cn(styles.card.base, styles.card.padding.lg)}>
      <div className={cn(styles.skeleton.base, styles.skeleton.title, 'mb-6')} />
      <div className={cn(styles.skeleton.base, 'h-64 w-full rounded-lg')} />
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className={cn(styles.card.base, styles.card.padding.md)}>
          <div className={cn(styles.skeleton.base, 'h-3 w-20 mb-2')} />
          <div className={cn(styles.skeleton.base, 'h-8 w-24')} />
        </div>
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className={cn(styles.card.base, styles.card.padding.lg, 'space-y-4')}>
      <div className={cn(styles.skeleton.base, styles.skeleton.title)} />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-2">
          <div className={cn(styles.skeleton.base, 'h-4 w-24')} />
          <div className={cn(styles.skeleton.base, 'h-10 w-full rounded-lg')} />
        </div>
      ))}
      <div className={cn(styles.skeleton.base, styles.skeleton.button, 'w-full h-12 rounded-lg')} />
    </div>
  );
}