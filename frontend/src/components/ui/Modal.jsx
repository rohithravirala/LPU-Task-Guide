import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'

/**
 * Accessible modal built on the native <dialog> element (focus trapping,
 * Escape to close and an inert background come from the browser).
 */
export function Modal({ open, onClose, title, description, children, footer, size = 'md' }) {
  const dialogRef = useRef(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  const width = size === 'sm' ? 'max-w-md' : 'max-w-lg'

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose()
      }}
      className={`m-auto w-[calc(100%-2rem)] ${width} rounded-sm border border-line bg-surface p-0 text-charcoal shadow-float backdrop:bg-charcoal/50`}
    >
      {open && (
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id={titleId} className="text-lg font-semibold">
                {title}
              </h2>
              {description && (
                <p id={descriptionId} className="mt-1 text-sm text-stone">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="-m-1 rounded-sm p-1 text-stone hover:bg-paper-deep hover:text-ink"
              aria-label="Close"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
          {children && <div className="mt-5">{children}</div>}
          {footer && <div className="mt-6 flex flex-wrap justify-end gap-3">{footer}</div>}
        </div>
      )}
    </dialog>
  )
}
