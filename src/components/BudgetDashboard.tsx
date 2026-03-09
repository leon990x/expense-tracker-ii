"use client";

import { useState } from "react";
import BudgetCard from "@/components/BudgetCard";
import { BudgetCategoryRow } from "@/types/budget";

type BudgetTileId = "today" | "week" | "month";

interface BudgetDashboardProps {
  dailyRows: BudgetCategoryRow[];
  weeklyRows: BudgetCategoryRow[];
  monthlyRows: BudgetCategoryRow[];
}

const BudgetDashboard = ({
  dailyRows,
  weeklyRows,
  monthlyRows,
}: BudgetDashboardProps) => {
  const [expandedTiles, setExpandedTiles] = useState<Set<BudgetTileId>>(
    new Set(["today"]),
  );

  const toggleTile = (tileId: BudgetTileId) => {
    setExpandedTiles((current) => {
      const next = new Set(current);

      if (next.has(tileId)) {
        next.delete(tileId);
      } else {
        next.add(tileId);
      }

      return next;
    });
  };

  return (
    <section className="flex flex-col gap-5">
      <BudgetCard
        id="today"
        title="Today"
        timeframe="daily"
        rows={dailyRows}
        isExpanded={expandedTiles.has("today")}
        onToggle={toggleTile}
      />
      <BudgetCard
        id="week"
        title="This Week"
        timeframe="weekly"
        rows={weeklyRows}
        isExpanded={expandedTiles.has("week")}
        onToggle={toggleTile}
      />
      <BudgetCard
        id="month"
        title="This Month"
        timeframe="monthly"
        rows={monthlyRows}
        isExpanded={expandedTiles.has("month")}
        onToggle={toggleTile}
      />
    </section>
  );
};

export default BudgetDashboard;
