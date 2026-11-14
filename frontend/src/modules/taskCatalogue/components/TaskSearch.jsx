import { useEffect, useId, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CornerDownLeft, LoaderCircle, Search, X } from 'lucide-react'
import { CategoryCode } from '../../../components/ui/Tag'
import { MIN_QUERY_LENGTH, useTaskSearch } from '../hooks/useTaskSearch'

function isEditable(target) {
  return target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
}

/**
 * Task search with live suggestions (combobox pattern).
 * Enter opens the full results page; choosing a suggestion opens that task.
 * Keyboard: ↑/↓ to move, Enter to choose, Esc to close, "/" focuses the compact search.
 */
export default function TaskSearch({ variant = 'hero', initialQuery = '', placeholder, autoFocus = false }) {
  const navigate = useNavigate()
  const listId = useId()
  const inputRef = useRef(null)
  const containerRef = useRef(null)
  const [value, setValue] = useState(initialQuery)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const { data, loading, enabled, isTyping, error } = useTaskSearch(value, { limit: 6, debounce: 200 })
  const trimmed = value.trim()
  const suggestions = enabled ? (data?.items ?? []) : []
  const options = trimmed.length >= MIN_QUERY_LENGTH ? [...suggestions, { _id: 'all-results', seeAll: true }] : []
  const showList = open && options.length > 0
  const compact = variant === 'compact'

  useEffect(() => {
    if (!compact) return undefined
    const onKeyDown = (event) => {
      if (event.key === '/' && !event.metaKey && !event.ctrlKey && !isEditable(event.target)) {
        event.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [compact])

  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const showAllResults = () => {
    if (!trimmed) return
    setOpen(false)
    inputRef.current?.blur()
    // The results page has its own search box, so the compact (navbar) one resets.
    if (compact) setValue('')
    navigate(`/tasks?q=${encodeURIComponent(trimmed)}`)
  }

  const openTask = (task) => {
    setOpen(false)
    setValue('')
    navigate(`/tasks/${task.slug}`)
  }

  const choose = (option) => (option?.seeAll || !option ? showAllResults() : openTask(option))

  const onKeyDown = (event) => {
    if (event.key === 'ArrowDown' && options.length) {
      event.preventDefault()
      setOpen(true)
      setActiveIndex((index) => (index + 1) % options.length)
    } else if (event.key === 'ArrowUp' && options.length) {
      event.preventDefault()
      setOpen(true)
      setActiveIndex((index) => (index <= 0 ? options.length - 1 : index - 1))
    } else if (event.key === 'Escape') {
      if (showList) {
        event.preventDefault()
        setOpen(false)
      } else if (value) {
        setValue('')
      }
    }
  }

  const statusText = (() => {
    if (!enabled) return null
    if (loading || isTyping) return 'Searching…'
    if (error) return 'Search is unavailable right now'
    if (!suggestions.length) return `No tasks match “${trimmed}”. Try another word, such as “fees” or “exam”.`
    return null
  })()

  return (
    <div ref={containerRef} className="relative w-full">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault()
          choose(showList ? options[activeIndex] : null)
        }}
        className={`flex items-center rounded-sm border bg-surface transition-colors focus-within:border-ink focus-within:ring-2 focus-within:ring-ink/15 ${
          compact ? 'h-10 border-line-strong' : 'h-14 border-ink/70'
        }`}
      >
        <label htmlFor={`${listId}-input`} className="sr-only">
          Search university tasks
        </label>
        <Search className={`ml-3 shrink-0 text-stone-deep ${compact ? 'size-4' : 'size-5'}`} aria-hidden="true" />
        <input
          ref={inputRef}
          id={`${listId}-input`}
          type="search"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList && activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined}
          autoComplete="off"
          autoFocus={autoFocus}
          maxLength={80}
          value={value}
          placeholder={placeholder ?? (compact ? 'Search tasks' : 'What do you need to do? e.g. “check attendance”')}
          onChange={(event) => {
            setValue(event.target.value)
            setActiveIndex(-1)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className={`h-full min-w-0 flex-1 bg-transparent px-3 text-charcoal placeholder:text-stone focus:outline-none [&::-webkit-search-cancel-button]:hidden ${
            compact ? 'text-sm' : 'text-base'
          }`}
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              setValue('')
              inputRef.current?.focus()
            }}
            className="mr-1 rounded-sm p-1.5 text-stone hover:text-ink"
            aria-label="Clear search"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        )}
        {compact ? (
          !value && (
            <kbd className="num-mono mr-2 hidden rounded-xs border border-line-strong px-1.5 text-[11px] text-stone-deep sm:block">
              /
            </kbd>
          )
        ) : (
          <button
            type="submit"
            className="mr-1.5 inline-flex h-11 items-center gap-2 rounded-sm bg-ink px-4 text-sm font-medium text-paper hover:bg-ink-deep"
          >
            Search
          </button>
        )}
      </form>

      {showList && (
        <div className="absolute inset-x-0 top-full z-40 mt-1.5 overflow-hidden rounded-sm border border-line bg-surface shadow-float">
          {suggestions.length > 0 && <p className="label-mono px-4 pt-3 pb-1 text-stone-deep">Suggested tasks</p>}
          <ul id={listId} role="listbox" aria-label="Search suggestions">
            {options.map((option, index) => {
              const active = index === activeIndex
              const base = `flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left ${active ? 'bg-paper-deep' : 'hover:bg-paper'}`
              if (option.seeAll) {
                return (
                  <li
                    key={option._id}
                    id={`${listId}-option-${index}`}
                    role="option"
                    aria-selected={active}
                    onPointerDown={(event) => event.preventDefault()}
                    onClick={showAllResults}
                    className={`${base} border-t border-line text-sm text-ink`}
                  >
                    <CornerDownLeft className="size-4 text-stone-deep" aria-hidden="true" />
                    <span>
                      See all results for <strong className="font-semibold">“{trimmed}”</strong>
                    </span>
                  </li>
                )
              }
              return (
                <li
                  key={option._id}
                  id={`${listId}-option-${index}`}
                  role="option"
                  aria-selected={active}
                  onPointerDown={(event) => event.preventDefault()}
                  onClick={() => openTask(option)}
                  className={base}
                >
                  <CategoryCode code={option.category?.code} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">{option.title}</span>
                    <span className="block truncate text-[12px] text-stone">
                      {option.primaryService?.name ? `${option.primaryService.name} · ` : ''}
                      {option.stepCount} steps
                    </span>
                  </span>
                </li>
              )
            })}
          </ul>
          {statusText && (
            <p className="flex items-center gap-2 border-t border-line px-4 py-2.5 text-[13px] text-stone-deep" role="status">
              {(loading || isTyping) && <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />}
              {statusText}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
