import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ToggleRoleButton } from "@/features/admin/components"
import { getCurrentUser } from "@/auth/nextjs/currentUser"

export default async function SettingsPage() {
  const currentUser = await getCurrentUser({ redirectIfNotFound: true }) // ako nismo autentifikovani redirectIfNotFound: true igra kljuc u redirect
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl mb-8">Settings page: {currentUser.role}</h1>
      <div className="flex gap-2">
        <ToggleRoleButton />
        <Button asChild>
          <Link href="/">Home</Link>
        </Button>
      </div>
    </div>
  )
}
