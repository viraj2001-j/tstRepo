"use client";

import { useEffect, useState } from "react";

type Invoice = {
  id: number;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  status: string;
  currency: string;
  subtotal: number;
  taxAmount: number;
  discountValue: number;
  total: number;
  client: {
    name: string;
    email: string;
  };
  company?: {
    name: string;
  };
  createdBy: {
    username: string;
    role: string;
  };
};

export default function InvoiceTable() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/test")
      .then((res) => res.json())
      .then((data) => {
        setInvoices(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading invoices...</p>;

  return (
    <div className="overflow-x-auto">
       
      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Invoice #</th>
            <th className="p-2 border">Client</th>
            <th className="p-2 border">Company</th>
            <th className="p-2 border">Issued</th>
            <th className="p-2 border">Due</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Total</th>
            <th className="p-2 border">Created By</th>
          </tr>
        </thead>

        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="text-center">
              <td className="p-2 border">{invoice.invoiceNumber}</td>
              <td className="p-2 border">
                {invoice.client.name}
                <br />
                <span className="text-xs text-gray-500">
                  {invoice.client.email}
                </span>
              </td>
              <td className="p-2 border">
                {invoice.company?.name ?? "—"}
              </td>
              <td className="p-2 border">
                {new Date(invoice.invoiceDate).toLocaleDateString()}
              </td>
              <td className="p-2 border">
                {new Date(invoice.dueDate).toLocaleDateString()}
              </td>
              <td className="p-2 border">
                <span
                  className={`px-2 py-1 rounded text-white text-xs ${
                    invoice.status === "PAID"
                      ? "bg-green-600"
                      : invoice.status === "OVERDUE"
                      ? "bg-red-600"
                      : "bg-yellow-500"
                  }`}
                >
                  {invoice.status}
                </span>
              </td>
              <td className="p-2 border">
                {invoice.currency} {invoice.total.toFixed(2)}
              </td>
              <td className="p-2 border">
                {invoice.createdBy.username}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
