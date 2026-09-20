import React from 'react';
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Search } from 'lucide-react';
import { SkeletonLoader } from './SkeletonLoader';
import { EmptyState } from './EmptyState';
import clsx from 'clsx';

export const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  pagination = null,
  onPageChange = null,
  search = '',
  onSearchChange = null,
  searchPlaceholder = 'Search records...',
  sortBy = '',
  sortOrder = 'asc',
  onSort = null,
  actions = null,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items matching your criteria.'
}) => {
  return (
    <div className="surface-card overflow-hidden flex flex-col border border-border-subtle shadow-depth-2 rounded-2xl">
      {/* Header Controls (Search & Action Buttons) */}
      {(onSearchChange || actions) && (
        <div className="p-4 sm:p-5 border-b border-border-subtle/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-2/40">
          {onSearchChange && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="input-3d w-full pl-10 pr-4 text-sm"
              />
            </div>
          )}
          {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}

      {/* Desktop Table View (>= 768px) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm text-text-secondary">
          <thead className="bg-surface-2/80 text-[11px] uppercase font-bold text-text-muted border-b border-border-subtle tracking-wider">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  className={clsx(
                    'px-5 py-3.5',
                    col.sortable && 'cursor-pointer select-none hover:text-text-primary transition',
                    col.className
                  )}
                  onClick={() => col.sortable && onSort && onSort(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.title}</span>
                    {col.sortable && (
                      <span className="text-text-muted">
                        {sortBy === col.key ? (
                          sortOrder === 'asc' ? (
                            <ArrowUp className="w-3.5 h-3.5 text-brand-bright" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-brand-bright" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 opacity-40 hover:opacity-100" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle/50">
            {loading ? (
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx}>
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="px-5 py-4">
                      <SkeletonLoader className="h-5 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12">
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={row._id || rowIdx}
                  className="hover:bg-surface-2/60 transition-all group relative"
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={col.key || colIdx}
                      className={clsx(
                        'px-5 py-4 text-text-primary transition',
                        col.cellClassName
                      )}
                    >
                      {col.render ? col.render(row, rowIdx) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Card View (< 768px) */}
      <div className="md:hidden divide-y divide-border-subtle/60">
        {loading ? (
          Array.from({ length: 4 }).map((_, rIdx) => (
            <div key={rIdx} className="p-4 space-y-3">
              <SkeletonLoader className="h-5 w-2/3" />
              <SkeletonLoader className="h-4 w-1/2" />
              <SkeletonLoader className="h-4 w-full" />
            </div>
          ))
        ) : data.length === 0 ? (
          <div className="py-10">
            <EmptyState title={emptyTitle} description={emptyDescription} />
          </div>
        ) : (
          data.map((row, rowIdx) => (
            <div
              key={row._id || rowIdx}
              className="p-4 space-y-2.5 hover:bg-surface-2/40 transition"
            >
              {columns.map((col, colIdx) => {
                const cellContent = col.render ? col.render(row, rowIdx) : row[col.key];
                if (!cellContent && cellContent !== 0) return null;

                return (
                  <div
                    key={col.key || colIdx}
                    className="flex items-start justify-between gap-3 text-xs"
                  >
                    <span className="font-semibold text-text-muted shrink-0 min-w-[90px]">
                      {col.title}
                    </span>
                    <div className="text-right font-medium text-text-primary break-all">
                      {cellContent}
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="p-4 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-secondary bg-surface-2/40">
          <div className="tabular-nums">
            Showing <span className="font-bold text-text-primary">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
            <span className="font-bold text-text-primary">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            of <span className="font-bold text-text-primary">{pagination.total}</span> entries
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange && onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              aria-label="Previous page"
              className="p-2 rounded-xl border border-border-subtle bg-surface-2 text-text-primary hover:bg-surface-3 disabled:opacity-35 disabled:cursor-not-allowed transition shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-text-primary px-2 tabular-nums">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => onPageChange && onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              aria-label="Next page"
              className="p-2 rounded-xl border border-border-subtle bg-surface-2 text-text-primary hover:bg-surface-3 disabled:opacity-35 disabled:cursor-not-allowed transition shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
