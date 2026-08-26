import type { ReactNode } from "react"

export type IconName = "calendar" | "services" | "users" | "clients" | "pets" | "settings" | "dashboard" | "list" | "user" | "clock" | "cut" | "eye" | "eye-off"

function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  const paths: Record<IconName, ReactNode> = {
    calendar: <><path d="M8 2v4M16 2v4M3 10h18" /><path d="M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" /></>,
    services: <><path d="M7 3h10l1 6H6l1-6Z" /><path d="M6 9h12l-1 12H7L6 9Z" /><path d="M9 13h6" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" /><circle cx="9.5" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
    clients: <><path d="M20 21a8 8 0 1 0-16 0" /><circle cx="12" cy="7" r="4" /></>,
    pets: <><circle cx="5.5" cy="10.5" r="2.5" /><circle cx="18.5" cy="10.5" r="2.5" /><circle cx="9" cy="5" r="2.5" /><circle cx="15" cy="5" r="2.5" /><path d="M7.5 18.5c0-3 2-5.5 4.5-5.5s4.5 2.5 4.5 5.5c0 1.8-1.2 2.5-2.5 2l-2-.7-2 .7c-1.3.5-2.5-.2-2.5-2Z" /></>,
    settings: <><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.36.2.72.6 1 .6h.6a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1.4Z" /></>,
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></>,
    list: <><path d="M8 6h13M8 12h13M8 18h13" /><path d="M3 6h.01M3 12h.01M3 18h.01" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    cut: <><circle cx="6" cy="7" r="3" /><circle cx="6" cy="17" r="3" /><path d="M8.5 8.5 21 21" /><path d="M8.5 15.5 21 3" /></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
    "eye-off": <><path d="m3 3 18 18" /><path d="M10.6 5.2A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7a17.8 17.8 0 0 1-2.1 3.2M6.6 6.6C3.6 8.6 2 12 2 12s3.5 7 10 7a9.8 9.8 0 0 0 5.4-1.6" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>,
  }

  return (
    <svg className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  )
}

export default Icon
