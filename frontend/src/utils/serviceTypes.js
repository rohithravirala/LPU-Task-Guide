import { Building2, Globe, Headset, Monitor, Smartphone } from 'lucide-react'

// Keep keys in sync with SERVICE_TYPES in backend/src/models/constants.js
export const SERVICE_TYPES = {
  portal: { icon: Monitor, label: 'Web portal' },
  mobile_app: { icon: Smartphone, label: 'Mobile app' },
  department: { icon: Building2, label: 'Department' },
  help_desk: { icon: Headset, label: 'Help desk' },
  other: { icon: Globe, label: 'Service' },
}

export function serviceTypeLabel(type) {
  return (SERVICE_TYPES[type] ?? SERVICE_TYPES.other).label
}
