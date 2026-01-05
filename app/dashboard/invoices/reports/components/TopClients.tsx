"use client"

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ClientRevenueData {
  name: string;
  value: number;
}

export default function TopClients({ data }: { data: ClientRevenueData[] }) {
  return (
    <Card className="border-none shadow-xl bg-white overflow-hidden">
      <CardHeader className="border-b bg-slate-50/50 py-4">
        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
          Top Clients by Revenue
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            layout="vertical" 
            margin={{ left: 30, right: 30, top: 10, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            
            {/* Value Axis (Hidden for clean SaaS look) */}
            <XAxis type="number" hide />
            
            {/* Client Name Axis */}
            <YAxis 
              dataKey="name" 
              type="category" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} 
              width={120}
            />
            
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              // Formatter uses any to satisfy Recharts internal types, 
              // but handles the LKR currency from your Invoice schema
              formatter={(value: any) => `LKR ${value ? Number(value).toLocaleString() : 0}`}
              contentStyle={{ 
                borderRadius: '8px', 
                border: 'none', 
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                fontSize: '12px',
                fontWeight: 'bold'
              }} 
            />
            
            <Bar 
              dataKey="value" 
              radius={[0, 4, 4, 0]} 
              barSize={20}
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  // Uses your theme colors: Slate-900 for the leader, Slate-700 for others
                  fill={index === 0 ? '#0f172a' : '#334155'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}