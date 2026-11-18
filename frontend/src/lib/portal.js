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

export function openLabel(portal) {
  if (!portal) return 'Open'
  return portal.type === 'Mobile App' ? `Get ${portal.name}` : `Open ${portal.name}`
}

export function hostOf(url) {
  try {
    return new URL(url).host.replace(/^www\./, '')
  } catch {
    return ''
  }
}

export function addressLabel(portal) {
  return portal?.type === 'Mobile App' ? 'App store:' : 'Official address:'
}

export function countTasks(tasks, portalSlug) {
  return tasks.filter((task) => task.portal?.slug === portalSlug).length
}

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
