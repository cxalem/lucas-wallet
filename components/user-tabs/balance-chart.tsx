"use client";

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const data = [
  { month: "Jan", value: 40 },
  { month: "Feb", value: 60 },
  { month: "Mar", value: 45 },
  { month: "Apr", value: 40 },
  { month: "May", value: 35 },
  { month: "Jun", value: 45 },
  { month: "Jul", value: 50 },
  { month: "Aug", value: 80 },
];

export default function RevenueCard() {
  return (
    <Card className="w-full bg-gradient-to-b border border-neutral-100/20 from-neutral-900/50 via-neutral-600/30 to-neutral-900/50 backdrop-blur-md rounded-2xl shadow-lg shadow-neutral-400/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-muted-foreground">
          Total Revenue
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-4xl font-bold">$15,231.89</div>
          <p className="text-sm text-muted-foreground mt-1">
            +20.1% from last month
          </p>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            >
              <CartesianGrid vertical={false} className="stroke-neutral-100/10" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                width={30}
                tickFormatter={(value) => `$${value}k`}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#dcfce760"
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2, fill: "white" }}
                isAnimationActive={true}
              />{" "}
              <Line
                type="monotone"
                dataKey="value"
                stroke="#dcfce760"
                className="blur-sm"
                strokeWidth={2}
                dot={{ r: 1, strokeWidth: 2, fill: "white" }}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
