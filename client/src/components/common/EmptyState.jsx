import React from 'react';
import { Inbox } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'There is no data to display right now.',
  action = null
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center space-y-4">
      <div className="relative">
        {/* Ambient Glow */}
        <div
          className="absolute inset-0 rounded-full bg-brand-primary/20 blur-xl scale-125"
          aria-hidden="true"
        />
        {/* 3D Glass Orb */}
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-surface-3 via-surface-2 to-surface-1 border border-border-bright flex items-center justify-center text-brand-glow shadow-depth-2">
          <Icon className="w-8 h-8" />
        </div>
      </div>

      <div className="space-y-1.5 max-w-sm">
        <h4 className="text-base font-bold font-heading text-text-primary">
          {title}
        </h4>
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
          {description}
        </p>
      </div>

      {action && <div className="pt-2">{action}</div>}
    </div>
  );
};
