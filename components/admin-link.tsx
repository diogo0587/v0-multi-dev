"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"

export function AdminLink() {
  return (
    <Link href="/admin">
      <Button variant="outline" size="sm" className="gap-2 bg-transparent">
        <Settings className="h-4 w-4" />
        Admin
      </Button>
    </Link>
  )
}
