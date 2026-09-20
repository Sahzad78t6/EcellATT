import { useEffect } from 'react';

/**
 * Dynamic document title helper
 */
export function useDocumentTitle(title) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title ? `${title} | E-Cell Portal` : 'E-Cell Attendance Portal';
    return () => {
      document.title = prevTitle;
    };
  }, [title]);
}
