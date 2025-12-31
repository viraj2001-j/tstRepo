"use client"

import React from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface ClientProps {
  data: {
    name: string;
    email: string;
    phone: string;
    website: string;
    address: string;
  };
  update: (fields: Partial<ClientProps['data']>) => void;
}

const ClientInformationCard = ({ data, update }: ClientProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Client Information</CardTitle>
        {/* This button stays for your future "Search Existing Clients" feature */}
        <Button variant="outline" type="button">Select Client</Button>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <Input 
          placeholder="Client Name" 
          value={data.name}
          onChange={(e) => update({ name: e.target.value })}
        />
        <Input 
          placeholder="Email Address" 
          value={data.email}
          onChange={(e) => update({ email: e.target.value })}
        />
        <Input 
          placeholder="Phone Number" 
          value={data.phone}
          onChange={(e) => update({ phone: e.target.value })}
        />
        <Input 
          placeholder="Website" 
          value={data.website}
          onChange={(e) => update({ website: e.target.value })}
        />
        <Input 
          placeholder="Client Address" 
          className="col-span-2" 
          value={data.address}
          onChange={(e) => update({ address: e.target.value })}
        />
      </CardContent>
    </Card>
  )
}

export default ClientInformationCard