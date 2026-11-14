import {
  BookOpen,
  Building,
  CalendarCheck,
  ClipboardList,
  FileBadge,
  FileText,
  Folder,
  GraduationCap,
  Landmark,
  LifeBuoy,
  Megaphone,
  Wallet,
} from 'lucide-react'

// Keep in sync with CATEGORY_ICONS in backend/src/models/constants.js
const ICONS = {
  'graduation-cap': GraduationCap,
  'calendar-check': CalendarCheck,
  'clipboard-list': ClipboardList,
  wallet: Wallet,
  'life-buoy': LifeBuoy,
  'file-text': FileText,
  'file-badge': FileBadge,
  landmark: Landmark,
  'book-open': BookOpen,
  building: Building,
  megaphone: Megaphone,
  folder: Folder,
}

export function CategoryIcon({ name, className = 'size-4' }) {
  const Icon = ICONS[name] ?? Folder
  return <Icon className={className} aria-hidden="true" />
}
