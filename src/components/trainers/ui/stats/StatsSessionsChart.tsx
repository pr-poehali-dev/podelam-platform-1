import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type BarDataItem = {
  name: string;
  sessions: number;
};

type Props = {
  barData: BarDataItem[];
  mounted: boolean;
};

export default function StatsSessionsChart({ barData, mounted }: Props) {
  return (
    <div
      className={`
        bg-card rounded-2xl p-5 md:p-6 border border-border/50 shadow-sm mb-8
        transition-all duration-500 ease-out delay-300
        ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}
    >
      <h2 className="font-bold text-foreground mb-4">
        Сессии по тренажерам
      </h2>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={barData}
          margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{
              fontSize: 12,
              fill: "hsl(var(--muted-foreground))",
            }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{
              fontSize: 12,
              fill: "hsl(var(--muted-foreground))",
            }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "12px",
              fontSize: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
            formatter={(value: number) => [
              `${value}`,
              "Сессий",
            ]}
          />
          <Bar
            dataKey="sessions"
            fill="hsl(var(--primary))"
            radius={[8, 8, 0, 0]}
            maxBarSize={48}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}