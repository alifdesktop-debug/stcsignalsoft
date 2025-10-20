"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function UnauthorizedDevicePage() {
  const router = useRouter()

  const handleGoHome = () => {
    localStorage.removeItem("stc_unique_code")
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-4">
      <Card className="bg-slate-900/80 border-red-900/50 backdrop-blur max-w-md w-full">
        <CardContent className="py-12 text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">Unauthorized Device</h1>
            <p className="text-red-300">
              This signal page can only be accessed from the device where the account was activated.
            </p>
          </div>

          <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-4">
            <p className="text-sm text-red-200">
              For security reasons, each signal page is locked to a specific device. If you need to access this account
              from a different device, please contact the admin.
            </p>
          </div>

          <Button onClick={handleGoHome} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            Return to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
