"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  PieChart, Pie, Cell,
} from "recharts";

const PALETTE = ["#1877F2", "#E1306C", "#000000", "#FF0000", "#0ea5e9"];

export function PlatformBars({ data }: { data: { platform: string; reach: number; viewers: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="platform" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="reach" fill="#0ea5e9" />
        <Bar dataKey="viewers" fill="#6366f1" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CampaignBars({ data }: { data: { name: string; viewers: number; reach: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(280, data.length * 28)}>
      <BarChart data={data} layout="vertical" margin={{ top: 10, right: 20, bottom: 0, left: 120 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis type="category" dataKey="name" width={180} />
        <Tooltip />
        <Legend />
        <Bar dataKey="viewers" fill="#6366f1" />
        <Bar dataKey="reach" fill="#0ea5e9" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PlatformShare({ data }: { data: { platform: string; viewers: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} dataKey="viewers" nameKey="platform" innerRadius={60} outerRadius={100} paddingAngle={2}>
          {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
