import React from 'react';
import { Inbox } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'There is no data to display right now.',
  action = null
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
        <Icon className="w-8 h-8" />
      </div>
      <div className="space-y-1 max-w-sm">
        <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200">{title}</h4>
        <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
};
