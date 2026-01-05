// app/dashboard/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Users, 
  DollarSign, 
  Clock, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardStats {
  totalRevenue: number;
  totalInvoices: number;
  activeClients: number;
  pendingAmount: number;
  revenueGrowth: number;
  invoiceGrowth: number;
  clientGrowth: number;
  overdueCount: number;
}

interface InvoiceStatus {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number; // <- added to satisfy ChartDataInput index signature
}

interface RevenueChartData {
  month: string;
  revenue: number;
  invoices: number;
}

interface RecentInvoice {
  id: string;
  client: string;
  amount: number;
  status: string;
  date: string;
}

interface TopClient {
  name: string;
  revenue: number;
  invoices: number;
}

interface DashboardData {
  stats: DashboardStats;
  invoicesByStatus: InvoiceStatus[];
  revenueChart: RevenueChartData[];
  recentInvoices: RecentInvoice[];
  topClients: TopClient[];
}

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue, 
  color = "blue" 
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: 'up' | 'down';
  trendValue?: number;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}) => {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
    red: "bg-red-500"
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{value}</h3>
          {trend && trendValue !== undefined && (
            <div className="flex items-center gap-1">
              {trend === 'up' ? (
                <ArrowUpRight className="w-4 h-4 text-green-500" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(trendValue).toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500 ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div className={`${colorClasses[color]} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const statusStyles: Record<string, string> = {
    PAID: "bg-green-100 text-green-700 border-green-200",
    SENT: "bg-blue-100 text-blue-700 border-blue-200",
    DRAFT: "bg-gray-100 text-gray-700 border-gray-200",
    OVERDUE: "bg-red-100 text-red-700 border-red-200",
    PARTIAL: "bg-orange-100 text-orange-700 border-orange-200"
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyles[status] || statusStyles.DRAFT}`}>
      {status}
    </span>
  );
};

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState('6m');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/dashboard?timeRange=${timeRange}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-red-600 to-red-800 p-2.5 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">LUCIFER</h1>
                <p className="text-sm text-gray-500">Invoice Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="1m">Last Month</option>
                <option value="3m">Last 3 Months</option>
                <option value="6m">Last 6 Months</option>
                <option value="1y">Last Year</option>
              </select>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                <Calendar className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={`LKR ${data.stats.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            trend={data.stats.revenueGrowth >= 0 ? "up" : "down"}
            trendValue={data.stats.revenueGrowth}
            color="green"
          />
          <StatCard
            title="Total Invoices"
            value={data.stats.totalInvoices}
            icon={FileText}
            trend={data.stats.invoiceGrowth >= 0 ? "up" : "down"}
            trendValue={data.stats.invoiceGrowth}
            color="blue"
          />
          <StatCard
            title="Active Clients"
            value={data.stats.activeClients}
            icon={Users}
            trend={data.stats.clientGrowth >= 0 ? "up" : "down"}
            trendValue={data.stats.clientGrowth}
            color="purple"
          />
          <StatCard
            title="Pending Amount"
            value={`LKR ${data.stats.pendingAmount.toLocaleString()}`}
            icon={Clock}
            color="orange"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Trend */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Revenue Trend</h2>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm text-gray-600">Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-gray-600">Invoices</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.revenueChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', r: 4 }} />
                <Line type="monotone" dataKey="invoices" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Invoice Status Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Invoice Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.invoicesByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.invoicesByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {data.invoicesByStatus.map((status) => (
                <div key={status.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }}></div>
                  <span className="text-sm text-gray-600">{status.name}</span>
                  <span className="text-sm font-semibold text-gray-900 ml-auto">{status.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Invoices */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Recent Invoices</h2>
              <button className="text-sm font-medium text-red-600 hover:text-red-700">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {data.recentInvoices.length > 0 ? (
                data.recentInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="bg-white p-2 rounded-lg border border-gray-200">
                        <Receipt className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{invoice.id}</p>
                        <p className="text-sm text-gray-500">{invoice.client}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">LKR {invoice.amount.toLocaleString()}</p>
                      <StatusBadge status={invoice.status} />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No recent invoices</p>
              )}
            </div>
          </div>

          {/* Top Clients */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Top Clients</h2>
              <button className="text-sm font-medium text-red-600 hover:text-red-700">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {data.topClients.length > 0 ? (
                data.topClients.map((client, index) => (
                  <div key={client.name} className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-lg text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{client.name}</p>
                      <p className="text-sm text-gray-500">{client.invoices} invoices</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">LKR {client.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No client data</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}