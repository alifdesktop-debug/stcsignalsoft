"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { getUserByUniqueCode } from "@/lib/firebase-admin"
import type { User, SignalEntry } from "@/lib/firebase-admin"
import { currencyPairs, getMarketStatus, formatPairName } from "@/lib/currency-pairs"
import type { Signal } from "@/lib/signal-generator"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, History, Eye, EyeOff } from "lucide-react"
import { TerminalAnimation } from "@/components/terminal-animation"
import { SignalCard } from "@/components/signal-card"
import { generateSignal, generateMultipleSignals } from "@/lib/signal-generator"

export default function SignalDashboard() {
  const router = useRouter()
  const params = useParams()
  const uniqueCode = params.uniquecode as string

  const [user, setUser] = useState<User | null>(null)
  const [selectedPair, setSelectedPair] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [signals, setSignals] = useState<Signal[]>([])
  const [signalType, setSignalType] = useState<"live" | "future" | null>(null)
  const [marketCooldowns, setMarketCooldowns] = useState<Record<string, number>>({})
  const [view, setView] = useState<"generate" | "history">("generate")
  const [signalHistory, setSignalHistory] = useState<SignalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showSessionInfo, setShowSessionInfo] = useState(false)
  const cooldownIntervalsRef = useRef<Record<string, NodeJS.Timeout>>({})

  useEffect(() => {
    if (!selectedPair) return

    const loadCooldownFromStorage = () => {
      const storedCooldowns = localStorage.getItem(`cooldowns_${uniqueCode}`)
      if (storedCooldowns) {
        const cooldowns = JSON.parse(storedCooldowns)
        const cooldownExpiry = cooldowns[selectedPair]

        if (cooldownExpiry) {
          const now = Date.now()
          const remainingMs = cooldownExpiry - now
          const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000))

          console.log(
            `[v0] Pair: ${selectedPair}, Cooldown expires at: ${new Date(cooldownExpiry).toLocaleTimeString()}, Remaining: ${remainingSeconds}s`,
          )

          setMarketCooldowns((prev) => ({
            ...prev,
            [selectedPair]: remainingSeconds,
          }))

          // Clear existing interval for this pair
          if (cooldownIntervalsRef.current[selectedPair]) {
            clearInterval(cooldownIntervalsRef.current[selectedPair])
          }

          // Start countdown if cooldown is active
          if (remainingSeconds > 0) {
            let countdown = remainingSeconds
            const interval = setInterval(() => {
              countdown--
              setMarketCooldowns((prev) => ({
                ...prev,
                [selectedPair]: Math.max(0, countdown),
              }))

              if (countdown <= 0) {
                clearInterval(interval)
                delete cooldownIntervalsRef.current[selectedPair]
                // Remove from localStorage when expired
                const stored = localStorage.getItem(`cooldowns_${uniqueCode}`)
                if (stored) {
                  const cooldowns = JSON.parse(stored)
                  delete cooldowns[selectedPair]
                  localStorage.setItem(`cooldowns_${uniqueCode}`, JSON.stringify(cooldowns))
                }
              }
            }, 1000)

            cooldownIntervalsRef.current[selectedPair] = interval
          }
        } else {
          setMarketCooldowns((prev) => ({
            ...prev,
            [selectedPair]: 0,
          }))
        }
      }
    }

    loadCooldownFromStorage()

    return () => {
      if (cooldownIntervalsRef.current[selectedPair]) {
        clearInterval(cooldownIntervalsRef.current[selectedPair])
      }
    }
  }, [selectedPair, uniqueCode])

  useEffect(() => {
    const loadUser = async () => {
      try {
        const foundUser = await getUserByUniqueCode(uniqueCode)

        if (!foundUser) {
          // Clear all localStorage data for this user
          localStorage.removeItem(`stc_unique_code`)
          localStorage.removeItem(`cooldowns_${uniqueCode}`)
          localStorage.removeItem(`history_${uniqueCode}`)

          // Redirect to login page
          router.push("/")
          return
        }

        if (foundUser.isBanned) {
          router.push("/yourban")
          return
        }

        setUser(foundUser)

        const storedHistory = localStorage.getItem(`history_${uniqueCode}`)
        if (storedHistory) {
          try {
            const history = JSON.parse(storedHistory)
            setSignalHistory(history)
          } catch (e) {
            console.error("[v0] Error parsing history from localStorage:", e)
            setSignalHistory([])
          }
        } else {
          setSignalHistory([])
        }

        setLoading(false)
      } catch (error) {
        console.error("[v0] Error loading user:", error)
        localStorage.removeItem(`stc_unique_code`)
        localStorage.removeItem(`cooldowns_${uniqueCode}`)
        localStorage.removeItem(`history_${uniqueCode}`)
        router.push("/")
      }
    }

    loadUser()
  }, [router, uniqueCode])

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  const selectedPairData = currencyPairs.find((p) => p.id === selectedPair)
  const marketStatus = selectedPairData ? getMarketStatus(selectedPairData.type) : null
  const currentCooldown = selectedPair ? marketCooldowns[selectedPair] || 0 : 0

  const handleGenerateSignal = async (type: "live" | "future") => {
    if (!selectedPair || !user) return

    if (currentCooldown > 0) {
      alert(`This market is in cooldown. Please wait ${currentCooldown} seconds before generating another signal.`)
      return
    }

    setIsGenerating(true)
    setSignalType(type)
    setSignals([])
  }

  const handleTerminalComplete = async () => {
    if (!selectedPair || !user) return

    let generatedSignals: Signal[]
    if (signalType === "live") {
      generatedSignals = [generateSignal(selectedPair)]
    } else {
      generatedSignals = generateMultipleSignals(selectedPair, 7)
    }

    setSignals(generatedSignals)
    setIsGenerating(false)

    const historyEntry: SignalEntry = {
      id: Math.random().toString(36).substring(7),
      userId: user.id,
      pair: selectedPair,
      type: signalType || "live",
      signals: generatedSignals,
      generatedAt: new Date().toISOString(),
    }

    try {
      const firstSignal = generatedSignals[0]

      const entryTimeDate = new Date(firstSignal.entryTime)
      const now = new Date()
      const entryTimeMinutes = Math.ceil((entryTimeDate.getTime() - now.getTime()) / (60 * 1000))
      const duration = firstSignal.duration || 30
      const cooldownMinutes = entryTimeMinutes + duration
      const cooldownMs = cooldownMinutes * 60 * 1000
      const cooldownExpiry = Date.now() + cooldownMs

      console.log(
        `[v0] Setting cooldown for ${selectedPair}: ${cooldownMinutes} minutes (${entryTimeMinutes}min entry + ${duration}min duration)`,
      )
      console.log(`[v0] Cooldown expires at: ${new Date(cooldownExpiry).toLocaleTimeString()}`)

      // Save cooldown to localStorage
      const storedCooldowns = localStorage.getItem(`cooldowns_${uniqueCode}`)
      const cooldowns = storedCooldowns ? JSON.parse(storedCooldowns) : {}
      cooldowns[selectedPair] = cooldownExpiry
      localStorage.setItem(`cooldowns_${uniqueCode}`, JSON.stringify(cooldowns))

      // Update UI immediately
      setMarketCooldowns((prev) => ({
        ...prev,
        [selectedPair]: cooldownMinutes * 60,
      }))

      // Start countdown
      if (cooldownIntervalsRef.current[selectedPair]) {
        clearInterval(cooldownIntervalsRef.current[selectedPair])
      }

      let countdown = cooldownMinutes * 60
      const interval = setInterval(() => {
        countdown--
        setMarketCooldowns((prev) => ({
          ...prev,
          [selectedPair]: Math.max(0, countdown),
        }))

        if (countdown <= 0) {
          clearInterval(interval)
          delete cooldownIntervalsRef.current[selectedPair]
        }
      }, 1000)

      cooldownIntervalsRef.current[selectedPair] = interval

      setSignalHistory((prev) => {
        const updated = [historyEntry, ...prev]
        localStorage.setItem(`history_${uniqueCode}`, JSON.stringify(updated))
        return updated
      })

      console.log("[v0] Signal entry saved to localStorage")
    } catch (error) {
      console.error("[v0] Error saving signal entry:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      <header className="border-b border-blue-900/50 bg-slate-900/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">STC Signal Software</h1>
              <p className="text-sm text-blue-300">Welcome, {user.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setView(view === "generate" ? "history" : "generate")}
              className={`${
                view === "history"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "border-blue-900/50 text-blue-300 hover:bg-blue-950/50 bg-transparent"
              }`}
              variant={view === "history" ? "default" : "outline"}
            >
              <History className="w-4 h-4 mr-2" />
              {view === "history" ? "Back to Generate" : "History"}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {view === "generate" ? (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <Card className="bg-slate-900/80 border-blue-900/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-white">Select Currency Pair</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={selectedPair} onValueChange={setSelectedPair}>
                    <SelectTrigger className="bg-slate-950/50 border-blue-900/50 text-white">
                      <SelectValue placeholder="Choose a pair" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-blue-900/50">
                      {currencyPairs.map((pair) => (
                        <SelectItem key={pair.id} value={pair.id} className="text-white">
                          {pair.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedPairData && (
                    <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded-lg">
                      <span className="text-blue-300 text-sm">Market Status</span>
                      <Badge
                        variant={marketStatus === "open" ? "default" : "secondary"}
                        className={marketStatus === "open" ? "bg-emerald-600" : "bg-slate-700"}
                      >
                        {marketStatus === "open" ? "Open" : "Closed"}
                      </Badge>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Button
                      onClick={() => handleGenerateSignal("live")}
                      disabled={!selectedPair || isGenerating || currentCooldown > 0}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {currentCooldown > 0
                        ? `Cooldown: ${Math.floor(currentCooldown / 60)}m ${currentCooldown % 60}s`
                        : "Generate Live Signal"}
                    </Button>

                    <Button
                      onClick={() => handleGenerateSignal("future")}
                      disabled={!selectedPair || isGenerating}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Generate Future Signals (7)
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/80 border-blue-900/50 backdrop-blur">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-sm">Session Info</CardTitle>
                    <button
                      onClick={() => setShowSessionInfo(!showSessionInfo)}
                      className="p-1 hover:bg-slate-800 rounded transition-colors"
                      aria-label={showSessionInfo ? "Hide session info" : "Show session info"}
                    >
                      {showSessionInfo ? (
                        <Eye className="w-4 h-4 text-blue-400" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-slate-500" />
                      )}
                    </button>
                  </div>
                </CardHeader>
                {showSessionInfo && (
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-300">Telegram</span>
                      <span className="text-white">@{user.telegram}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-300">Key</span>
                      <span className="text-white font-mono text-xs">{user.activationKey}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-300">Unique Code</span>
                      <span className="text-white font-mono text-xs">{uniqueCode}</span>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>

            <div className="lg:col-span-2">
              {isGenerating && signalType && (
                <TerminalAnimation type={signalType} onComplete={handleTerminalComplete} />
              )}

              {!isGenerating && signals.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-white">
                    {signals.length === 1 ? "Live Signal" : "Future Signals"}
                  </h2>
                  <div className="grid gap-4">
                    {signals.map((signal) => (
                      <SignalCard key={signal.id} signal={signal} />
                    ))}
                  </div>
                </div>
              )}

              {!isGenerating && signals.length === 0 && (
                <Card className="bg-slate-900/80 border-blue-900/50 backdrop-blur">
                  <CardContent className="py-16 text-center">
                    <TrendingUp className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Signals Yet</h3>
                    <p className="text-blue-300">Select a currency pair and generate signals to get started</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Signal History</h2>
            {signalHistory.length === 0 ? (
              <Card className="bg-slate-900/80 border-blue-900/50 backdrop-blur">
                <CardContent className="py-16 text-center">
                  <History className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No History Yet</h3>
                  <p className="text-blue-300">Generate signals to see them here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {signalHistory.map((entry) => (
                  <Card key={entry.id} className="bg-slate-900/80 border-blue-900/50 backdrop-blur">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-white">{formatPairName(entry.pair)}</CardTitle>
                          <p className="text-sm text-blue-300 mt-1">{new Date(entry.generatedAt).toLocaleString()}</p>
                        </div>
                        <Badge
                          className={entry.type === "live" ? "bg-blue-600 text-white" : "bg-emerald-600 text-white"}
                        >
                          {entry.type === "live" ? "Live Signal" : "Future Signals"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3">
                        {entry.signals.map((signal: Signal) => (
                          <SignalCard key={signal.id} signal={signal} />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
