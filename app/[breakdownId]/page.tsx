"use client"

import { useParams } from "next/navigation"
import EquityCalculator from "@/components/custom/equityCalculator"

export default function BreakdownPage() {
  const params = useParams()
  const breakdownId = params.breakdownId as string

  return <EquityCalculator breakdownId={breakdownId} />
}