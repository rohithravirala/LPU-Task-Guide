import { useEffect } from 'react'

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · LPU-Uni-Path` : 'LPU-Uni-Path'
  }, [title])
}
