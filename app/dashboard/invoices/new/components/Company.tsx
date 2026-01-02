"use client"

import React from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

/**
 * @param data - The current company state from the parent
 * @param update - Function to update the parent's state
 */
interface CompanyProps {
  data: {
    name: string;
    project: string;
    phone: string;
    email: string;
    address: string;
  };
  update: (fields: Partial<CompanyProps['data']>) => void;
}

const Company = ({ data, update }: CompanyProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Company</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <Input 
          placeholder="Company Name" 
          value={data.name}
          onChange={(e) => update({ name: e.target.value })}
        />
        <Input 
          placeholder="Project Name" 
          value={data.project}
          onChange={(e) => update({ project: e.target.value })}
        />
        <Input 
          placeholder="Phone Number" 
          value={data.phone}
          onChange={(e) => update({ phone: e.target.value })}
        />
        <Input 
          placeholder="Email Address" 
          value={data.email}
          onChange={(e) => update({ email: e.target.value })}
        />
        <Input 
          placeholder="Company Address" 
          className="col-span-2" 
          value={data.address}
          onChange={(e) => update({ address: e.target.value })}
        />
      </CardContent>
    </Card>
  )
}

export default Company