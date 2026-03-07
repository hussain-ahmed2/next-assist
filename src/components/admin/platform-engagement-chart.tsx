"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// Mock data for Platform Engagement
const chartData = [
  { date: "2024-04-01", activity: 222, signups: 15 },
  { date: "2024-04-02", activity: 197, signups: 18 },
  { date: "2024-04-03", activity: 167, signups: 12 },
  { date: "2024-04-04", activity: 242, signups: 26 },
  { date: "2024-04-05", activity: 373, signups: 29 },
  { date: "2024-04-06", activity: 301, signups: 34 },
  { date: "2024-04-07", activity: 245, signups: 18 },
  { date: "2024-04-08", activity: 409, signups: 32 },
  { date: "2024-04-09", activity: 159, signups: 11 },
  { date: "2024-04-10", activity: 261, signups: 19 },
  { date: "2024-04-11", activity: 327, signups: 35 },
  { date: "2024-04-12", activity: 292, signups: 21 },
  { date: "2024-04-13", activity: 342, signups: 38 },
  { date: "2024-04-14", activity: 137, signups: 22 },
  { date: "2024-04-15", activity: 120, signups: 17 },
  { date: "2024-04-16", activity: 138, signups: 19 },
  { date: "2024-04-17", activity: 446, signups: 36 },
  { date: "2024-04-18", activity: 364, signups: 41 },
  { date: "2024-04-19", activity: 243, signups: 18 },
  { date: "2024-04-20", activity: 89, signups: 15 },
  { date: "2024-04-21", activity: 137, signups: 20 },
  { date: "2024-04-22", activity: 224, signups: 17 },
  { date: "2024-04-23", activity: 138, signups: 23 },
  { date: "2024-04-24", activity: 387, signups: 29 },
  { date: "2024-04-25", activity: 215, signups: 25 },
  { date: "2024-04-26", activity: 75, signups: 13 },
  { date: "2024-04-27", activity: 383, signups: 42 },
  { date: "2024-04-28", activity: 122, signups: 18 },
  { date: "2024-04-29", activity: 315, signups: 24 },
  { date: "2024-04-30", activity: 454, signups: 38 },
  { date: "2024-05-01", activity: 165, signups: 22 },
  { date: "2024-05-02", activity: 293, signups: 31 },
  { date: "2024-05-03", activity: 247, signups: 19 },
  { date: "2024-05-04", activity: 385, signups: 42 },
  { date: "2024-05-05", activity: 481, signups: 39 },
  { date: "2024-05-06", activity: 498, signups: 52 },
  { date: "2024-05-07", activity: 388, signups: 30 },
  { date: "2024-05-08", activity: 149, signups: 21 },
  { date: "2024-05-09", activity: 227, signups: 18 },
  { date: "2024-05-10", activity: 293, signups: 33 },
  { date: "2024-05-11", activity: 335, signups: 27 },
  { date: "2024-05-12", activity: 197, signups: 24 },
  { date: "2024-05-13", activity: 197, signups: 16 },
  { date: "2024-05-14", activity: 448, signups: 49 },
  { date: "2024-05-15", activity: 473, signups: 38 },
  { date: "2024-05-16", activity: 338, signups: 40 },
  { date: "2024-05-17", activity: 499, signups: 42 },
  { date: "2024-05-18", activity: 315, signups: 35 },
  { date: "2024-05-19", activity: 235, signups: 18 },
  { date: "2024-05-20", activity: 177, signups: 23 },
  { date: "2024-05-21", activity: 82, signups: 14 },
  { date: "2024-05-22", activity: 81, signups: 12 },
  { date: "2024-05-23", activity: 252, signups: 29 },
  { date: "2024-05-24", activity: 294, signups: 22 },
  { date: "2024-05-25", activity: 201, signups: 25 },
  { date: "2024-05-26", activity: 213, signups: 17 },
  { date: "2024-05-27", activity: 420, signups: 46 },
  { date: "2024-05-28", activity: 233, signups: 19 },
  { date: "2024-05-29", activity: 78, signups: 13 },
  { date: "2024-05-30", activity: 340, signups: 28 },
  { date: "2024-05-31", activity: 178, signups: 23 },
  { date: "2024-06-01", activity: 178, signups: 20 },
  { date: "2024-06-02", activity: 470, signups: 41 },
  { date: "2024-06-03", activity: 103, signups: 16 },
  { date: "2024-06-04", activity: 439, signups: 38 },
  { date: "2024-06-05", activity: 88, signups: 14 },
  { date: "2024-06-06", activity: 294, signups: 25 },
  { date: "2024-06-07", activity: 323, signups: 37 },
  { date: "2024-06-08", activity: 385, signups: 32 },
  { date: "2024-06-09", activity: 438, signups: 48 },
  { date: "2024-06-10", activity: 155, signups: 20 },
  { date: "2024-06-11", activity: 92, signups: 15 },
  { date: "2024-06-12", activity: 492, signups: 42 },
  { date: "2024-06-13", activity: 81, signups: 13 },
  { date: "2024-06-14", activity: 426, signups: 38 },
  { date: "2024-06-15", activity: 307, signups: 35 },
  { date: "2024-06-16", activity: 371, signups: 31 },
  { date: "2024-06-17", activity: 475, signups: 52 },
  { date: "2024-06-18", activity: 107, signups: 17 },
  { date: "2024-06-19", activity: 341, signups: 29 },
  { date: "2024-06-20", activity: 408, signups: 45 },
  { date: "2024-06-21", activity: 169, signups: 21 },
  { date: "2024-06-22", activity: 317, signups: 27 },
  { date: "2024-06-23", activity: 480, signups: 53 },
  { date: "2024-06-24", activity: 132, signups: 18 },
  { date: "2024-06-25", activity: 141, signups: 19 },
  { date: "2024-06-26", activity: 434, signups: 38 },
  { date: "2024-06-27", activity: 448, signups: 49 },
  { date: "2024-06-28", activity: 149, signups: 20 },
  { date: "2024-06-29", activity: 103, signups: 16 },
  { date: "2024-06-30", activity: 446, signups: 40 },
];

const chartConfig = {
  visitors: {
    label: "Engagement",
  },
  activity: {
    label: "Active Sessions",
    color: "var(--primary)",
  },
  signups: {
    label: "New Registrations",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export function PlatformEngagementChart() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("30d");
    }
  }, [isMobile]);

  const filteredData = React.useMemo(() => {
    return chartData.filter((item) => {
      const date = new Date(item.date);
      const referenceDate = new Date("2024-06-30");
      let daysToSubtract = 90;
      if (timeRange === "30d") {
        daysToSubtract = 30;
      } else if (timeRange === "7d") {
        daysToSubtract = 7;
      }
      const startDate = new Date(referenceDate);
      startDate.setDate(startDate.getDate() - daysToSubtract);
      return date >= startDate;
    });
  }, [timeRange]);

  return (
    <Card className="@container/card border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle>Platform Engagement</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Tracking active sessions and user growth
          </span>
          <span className="@[540px]/card:hidden">Last 3 months</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(val) => val && setTimeRange(val)}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">90d</ToggleGroupItem>
            <ToggleGroupItem value="30d">30d</ToggleGroupItem>
            <ToggleGroupItem value="7d">7d</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-32 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
            >
              <SelectValue placeholder="Range" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[350px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillActivity" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-activity)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-activity)"
                  stopOpacity={0.05}
                />
              </linearGradient>
              <linearGradient id="fillSignups" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-signups)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-signups)"
                  stopOpacity={0.01}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.1} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="signups"
              type="monotone"
              fill="url(#fillSignups)"
              stroke="var(--color-signups)"
              strokeWidth={1}
              stackId="a"
              opacity={0.5}
            />
            <Area
              dataKey="activity"
              type="monotone"
              fill="url(#fillActivity)"
              stroke="var(--color-activity)"
              strokeWidth={2}
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
