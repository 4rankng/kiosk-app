import { useEffect } from 'react'

const BASE_TITLE = 'TingTing Kiosk'

/**
 * Set the browser tab/document title for the lifetime of the calling page.
 * Restores the base title when the page unmounts.
 */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${BASE_TITLE}` : BASE_TITLE
    return () => {
      document.title = BASE_TITLE
    }
  }, [title])
}
