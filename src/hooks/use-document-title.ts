'use client';

import { useEffect } from 'react';

/**
 * Sets `document.title` to `<title> · Luna Care` while the component is mounted,
 * restoring whatever was there before on unmount.
 */
export function useDocumentTitle(title: string | null | undefined) {
  useEffect(() => {
    if (!title) return;
    const previous = document.title;
    document.title = `${title} · Luna Care`;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
