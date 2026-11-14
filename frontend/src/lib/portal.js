import {
  BedDouble,
  Bookmark,
  BookOpen,
  Briefcase,
  CalendarCheck,
  CodeXml,
  DoorOpen,
  FileText,
  GraduationCap,
  LifeBuoy,
  MessagesSquare,
  Wallet,
} from 'lucide-react'

// Text for a task's "Open" button. LPU Touch is a phone app, so its link goes to the app store.
export function openLabel(portal) {
  if (!portal) return 'Open'
  return portal.type === 'Mobile App' ? `Get ${portal.name}` : `Open ${portal.name}`
}

// "https://ums.lpu.in/lpuums/..." -> "ums.lpu.in", shown so students can check the address
export function hostOf(url) {
  try {
    return new URL(url).host.replace(/^www\./, '')
  } catch {
    return ''
  }
}

// Label in front of a portal's address: a website has an official address,
// a phone app (LPU Touch) is opened from its app store page.
export function addressLabel(portal) {
  return portal?.type === 'Mobile App' ? 'App store:' : 'Official address:'
}

// One icon per task category (shown on the orange label of each category card)
const categoryIcons = {
  'Assignments & Courses': BookOpen,
  'Attendance & Timetable': CalendarCheck,
  'Coding Practice & Tests': CodeXml,
  'Documents & Certificates': FileText,
  'Examinations & Results': GraduationCap,
  'Fees & Scholarships': Wallet,
  'Hostel & Campus Life': BedDouble,
  'Leave & Applications': DoorOpen,
  'Messages & Notices': MessagesSquare,
  'Placements & Internships': Briefcase,
  'Profile & Help': LifeBuoy,
}

export function categoryIcon(category) {
  return categoryIcons[category] ?? Bookmark
}
