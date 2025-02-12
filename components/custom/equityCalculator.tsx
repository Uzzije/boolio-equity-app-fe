"use client"

import { useState, useRef, useEffect } from "react"
import { Plus, Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Props {
    breakdownId?: string
}

interface Investor {
  id: string | null
  name?: string
  percentage: number
}

interface Breakdown {
    breakdown_id: string | null;
    breakdown_name?: string;
    total_shares: number;
    investors: Investor[];
  }

const colors = ["hsl(173 58% 39%)", "hsl(12 76% 61%)", "hsl(197 37% 24%)", "hsl(43 74% 66%)", "hsl(27 87% 67%)"]

export default function EquityCalculator({ breakdownId }: Props) {
  const [investors, setInvestors] = useState<Investor[]>([
    { id: null, name: "", percentage: 0 },
  ])
  const [savedBreakdowns, setSavedBreakdowns] = useState<{ name: string; investors: Investor[] }[]>([])
  const [breakdownName, setBreakdownName] = useState("")
  const [totalShares, setTotalShares] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const [sliderWidth, setSliderWidth] = useState(0)

  useEffect(() => {
    if (containerRef.current) {
      setSliderWidth(containerRef.current.offsetWidth - 200) // Subtracting space for name input and buttons
    }
  }, [])

  useEffect(() => {
    if (breakdownId) {
      // TODO: Load breakdown data using breakdownId
      console.log('Loading breakdown:', breakdownId)
    }
  }, [breakdownId])

  const addInvestor = () => {
    setInvestors([...investors, { id: null, name: "", percentage: 0 }])
  }

  const removeInvestor = (index: number) => {
    setInvestors(investors.filter((_, i) => i !== index))
  }

  const updateInvestor = (index: number, field: keyof Investor, value: string | number) => {
    setInvestors(investors.map((investor, i) => (i === index ? { ...investor, [field]: value } : investor)))
  }

  const updatePercentage = (index: number, newPercentage: number) => {
    setInvestors(
      investors.map((investor, i) => {
        if (i === index) {
          return { ...investor, percentage: newPercentage }
        }
        return investor
      }),
    )
  }

  const saveBreakdown = () => {
    if (breakdownName) {
        const breakdownData: Breakdown = {
          breakdown_id: null,
          breakdown_name: breakdownName,
          total_shares: totalShares,
          investors: investors.map(inv => ({
            id: inv.id,
            name: inv.name || "",
            percentage: inv.percentage
          }))
        }
        console.log('Saving breakdown:', breakdownData)
        setSavedBreakdowns([...savedBreakdowns, { name: breakdownName, investors: [...investors] }])
        setBreakdownName("")
      }
    }

  const loadBreakdown = (breakdown: { name: string; investors: Investor[] }) => {
    setInvestors(breakdown.investors)
  }

  const totalPercentage = investors.reduce((sum, investor) => sum + investor.percentage, 0)
  const unassignedPercentage = Math.max(0, 100 - totalPercentage)

  const calculateShares = (percentage: number) => {
    return Math.round((percentage / 100) * totalShares)
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-4xl font-bold tracking-tight">Equity Calculator</h1>
      <Card>
        <CardContent className="space-y-6 pt-6">
          <div className="flex items-center gap-4">
            <Input
              value={breakdownName}
              onChange={(e) => setBreakdownName(e.target.value)}
              placeholder="Breakdown name"
              className="flex-1"
            />
            <Button onClick={saveBreakdown} disabled={!breakdownName}>
              <Save className="h-4 w-4 mr-2" />
              Save Breakdown
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <Input
              type="number"
              value={totalShares}
              onChange={(e) => setTotalShares(Number(e.target.value))}
              className="max-w-[200px]"
              placeholder="Total shares"
            />
            <span className="text-sm text-muted-foreground">Total Shares</span>
          </div>

          <div className="space-y-6" ref={containerRef}>
            {investors.map((investor, index) => (
              <div key={`investor-${index}`} className="space-y-2">
                <div className="flex items-center gap-4">
                  <Input
                    value={investor.name}
                    onChange={(e) => updateInvestor(index, "name", e.target.value)}
                    placeholder="Investor name"
                    className="w-48"
                  />
                  <div className="flex-1">
                  <Slider
                    value={[investor.percentage]}
                    min={0}
                    max={100}
                    step={0.1}
                    onValueChange={([value]) => updatePercentage(index, value)}
                    className="mt-2"
                  />
                  </div>
                  <div className="w-36 text-sm text-muted-foreground">
                    {investor.percentage.toFixed(1)}% ({calculateShares(investor.percentage).toLocaleString()} shares)
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeInvestor(index)}
                    disabled={investors.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <Button onClick={addInvestor} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Investor
            </Button>
            <div className="text-sm">
              Total:{" "}
              <span className={totalPercentage === 100 ? "text-green-500" : "text-red-500"}>
                {totalPercentage.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="relative pt-8">
            <div className="h-8 flex rounded-lg overflow-hidden">
              {investors.map((investor, index) => (
                <div
                  key={`viz-investor-${index}`}
                  style={{
                    width: `${investor.percentage}%`,
                    backgroundColor: colors[index % colors.length],
                  }}
                  className="h-full transition-all flex items-center justify-center"
                >
                  {investor.percentage >= 5 && (
                    <span className="text-xs text-white px-2 truncate">
                      {investor.name} ({investor.percentage.toFixed(1)}% -{" "}
                      {calculateShares(investor.percentage).toLocaleString()})
                    </span>
                  )}
                </div>
              ))}
              {unassignedPercentage > 0 && (
                <div
                  style={{
                    width: `${unassignedPercentage}%`,
                    backgroundColor: "hsl(var(--muted))",
                  }}
                  className="h-full transition-all flex items-center justify-center"
                >
                  {unassignedPercentage >= 5 && (
                    <span className="text-xs text-muted-foreground px-2 truncate">
                      Unassigned ({unassignedPercentage.toFixed(1)}% -{" "}
                      {calculateShares(unassignedPercentage).toLocaleString()})
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {savedBreakdowns.length > 0 && (
            <div className="pt-4">
              <Select
                onValueChange={(value) => {
                  const breakdown = savedBreakdowns.find((b) => b.name === value)
                  if (breakdown) loadBreakdown(breakdown)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Load saved breakdown" />
                </SelectTrigger>
                <SelectContent>
                  {savedBreakdowns.map((breakdown) => (
                    <SelectItem key={breakdown.name} value={breakdown.name}>
                      {breakdown.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


