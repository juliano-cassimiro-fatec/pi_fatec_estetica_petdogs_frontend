import type { UserRole } from "../shared/types"

export type Permission =
  | "schedule:create" | "schedule:edit" | "schedule:cancel"
  | "service:manage" | "professional:manage" | "customer:manage" | "pet:manage"

const permissions: Record<UserRole, Permission[]> = {
  admin: ["schedule:edit", "schedule:cancel", "service:manage", "professional:manage", "customer:manage", "pet:manage"],
  cliente: ["schedule:create", "schedule:edit", "schedule:cancel", "pet:manage"],
  profissional: [],
}

export function can(role: UserRole | undefined, permission: Permission) {
  return role ? permissions[role].includes(permission) : false
}
