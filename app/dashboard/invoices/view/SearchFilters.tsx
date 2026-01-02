"use client"

import React, { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Search, Filter, Calendar } from "lucide-react"

interface FilterProps {
  onFilterChange: (filters: { query: string; status: string; timeframe: string }) => void;
}

export default function SearchFilters({ onFilterChange }: FilterProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [timeframe, setTimeframe] = useState("ALL_TIME");

  // This useEffect sends the data back to the 'useInvoiceFilter' hook 
  // whenever a user changes any value.
  useEffect(() => {
    onFilterChange({ query, status, timeframe });
  }, [query, status, timeframe, onFilterChange]);

  return (
    <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
      
      {/* 1. Text Search Input */}
      <div className="relative flex-[2]">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search Invoice #, Client, or Company..."
          className="pl-10 h-10 border-slate-200 focus:ring-blue-500"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* 2. Status Dropdown Filter */}
      <div className="flex-1 flex items-center gap-2 border rounded-md px-3 bg-white border-slate-200">
        <Filter size={14} className="text-slate-400" />
        <select 
          className="w-full h-10 text-sm outline-none bg-transparent cursor-pointer"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="PAID">Paid</option>
          <option value="DRAFT">Draft/Pending</option>
          <option value="SENT">Sent</option>
          <option value="OVERDUE">Overdue</option>
        </select>
      </div>

      {/* 3. Timeframe Dropdown Filter */}
      <div className="flex-1 flex items-center gap-2 border rounded-md px-3 bg-white border-slate-200">
        <Calendar size={14} className="text-slate-400" />
        <select 
          className="w-full h-10 text-sm outline-none bg-transparent cursor-pointer"
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
        >
          <option value="ALL_TIME">All Time</option>
          <option value="THIS_WEEK">This Week</option>
          <option value="THIS_MONTH">This Month</option>
          <option value="LAST_MONTH">Last Month</option>
          <option value="THIS_QUARTER">This Quarter</option>
        </select>
      </div>
    </div>
  )
}