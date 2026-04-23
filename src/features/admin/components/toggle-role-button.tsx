"use client"

import { toggleRole } from "@/features/admin/actions"
import { Button } from "@/components/ui/button"

export function ToggleRoleButton() {
  return <Button onClick={toggleRole}>Toggle Role</Button>
}
