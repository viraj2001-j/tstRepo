"use client"

import { useState, useMemo } from 'react'
import { isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, startOfQuarter, endOfQuarter } from 'date-fns'

interface FilterParams {
  query: string;
  status: string;
  timeframe: string;
}

export function useInvoiceFilter(initialInvoices: any[]) {
  const [filters, setFilters] = useState<FilterParams>({
    query: "",
    status: "ALL",
    timeframe: "ALL_TIME"
  });

  const filteredData = useMemo(() => {
    let list = [...initialInvoices];

    // 1. Text Search
    if (filters.query) {
      const q = filters.query.toLowerCase();
      list = list.filter(inv => 
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.client.name.toLowerCase().includes(q) ||
        inv.company?.name?.toLowerCase().includes(q)
      );
    }

    // 2. Status Logic
    if (filters.status !== "ALL") {
      if (filters.status === "OVERDUE") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        list = list.filter(inv => 
          inv.status === "OVERDUE" || 
          (inv.status !== "PAID" && new Date(inv.dueDate) < today)
        );
      } else {
        list = list.filter(inv => inv.status === filters.status);
      }
    }

    // 3. Timeframe Logic
    const now = new Date();
    if (filters.timeframe !== "ALL_TIME") {
      list = list.filter(inv => {
        const date = new Date(inv.createdAt);
        if (filters.timeframe === "THIS_WEEK") return isWithinInterval(date, { start: startOfWeek(now), end: endOfWeek(now) });
        if (filters.timeframe === "THIS_MONTH") return isWithinInterval(date, { start: startOfMonth(now), end: endOfMonth(now) });
        if (filters.timeframe === "LAST_MONTH") {
          const lastMonth = subMonths(now, 1);
          return isWithinInterval(date, { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) });
        }
        if (filters.timeframe === "THIS_QUARTER") return isWithinInterval(date, { start: startOfQuarter(now), end: endOfQuarter(now) });
        return true;
      });
    }

    return list;
  }, [initialInvoices, filters]);

  return { filteredData, setFilters };
}