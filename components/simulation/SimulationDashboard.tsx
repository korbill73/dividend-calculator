"use client";

import { useFinanceStore } from "@/store/useFinanceStore";
import { generateSimulationData } from "@/lib/simulationUtils";
import { useMemo, useState, useEffect } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SimSettings } from "./SimSettings";

// --- Editable Actual Cell ---
const ActualCell = ({
    date,
    initialValue,
    onUpdate
}: { date: string, initialValue: number | undefined, onUpdate: (d: string, v: number) => void }) => {
    const [value, setValue] = useState(initialValue?.toString() || "");

    useEffect(() => {
        setValue(initialValue?.toString() || "");
    }, [initialValue]);

    const onBlur = () => {
        if (value) {
            onUpdate(date, Number(value));
        }
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            onBlur();
        }
    };

    return (
        <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            className="h-8 w-32 text-right bg-transparent border-transparent hover:border-input focus:border-input"
            placeholder="-"
        />
    )
}

export function SimulationDashboard() {
    const { simSettings, history, updateHistoryPoint } = useFinanceStore();

    const startBalance = simSettings.accounts.reduce((acc, a) => acc + a.balance, 0);

    const data = useMemo(() => {
        return generateSimulationData(
            startBalance,
            simSettings.monthlyContribution,
            simSettings.scenarios,
            history,
            simSettings.startYear ?? 2025,
            simSettings.endYear ?? 2050
        );
    }, [startBalance, simSettings.monthlyContribution, simSettings.scenarios, history, simSettings.startYear, simSettings.endYear]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(val);
    }

    return (
        <div className="flex flex-col gap-6 h-[calc(100vh-100px)]">
            {/* Top Section: Settings & Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
                {/* Settings Panel */}
                <div className="lg:col-span-3">
                    <SimSettings />
                </div>

                {/* Chart Panel */}
                <Card className="lg:col-span-9 flex flex-col">
                    <CardHeader>
                        <CardTitle>Asset Growth Projection (2025-2050)</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={data}
                                margin={{
                                    top: 5,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis
                                    dataKey="monthLabel"
                                    stroke="#888"
                                    minTickGap={50} // Show fewer ticks
                                />
                                <YAxis
                                    stroke="#888"
                                    tickFormatter={(val) => `${(val / 100000000).toFixed(1)}억`}
                                    width={60}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }}
                                    itemStyle={{ color: '#f3f4f6' }}
                                    formatter={(value: number | undefined) => [formatCurrency(value || 0), "Amount"]}
                                    labelStyle={{ color: '#9ca3af' }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="conservative"
                                    name="Conservative"
                                    stroke="#ef4444" // Red
                                    strokeDasharray="5 5"
                                    dot={false}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="moderate"
                                    name="Moderate"
                                    stroke="#3b82f6" // Blue
                                    strokeDasharray="5 5"
                                    dot={false}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="aggressive"
                                    name="Aggressive"
                                    stroke="#22c55e" // Green
                                    strokeDasharray="5 5"
                                    dot={false}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="actual"
                                    name="Actual"
                                    stroke="#eab308" // Yellow/Gold
                                    strokeWidth={3}
                                    activeDot={{ r: 6 }}
                                    connectNulls
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Section: Data Grid */}
            <Card className="flex-1 overflow-hidden flex flex-col">
                <CardHeader>
                    <CardTitle>Detailed Projection Data</CardTitle>
                </CardHeader>
                <div className="flex-1 overflow-auto p-0">
                    <Table>
                        <TableHeader className="sticky top-0 bg-card z-10">
                            <TableRow>
                                <TableHead className="w-[120px]">Date</TableHead>
                                <TableHead className="text-right">Invested Capital</TableHead>
                                <TableHead className="text-right">Conservative</TableHead>
                                <TableHead className="text-right">Moderate</TableHead>
                                <TableHead className="text-right">Aggressive</TableHead>
                                <TableHead className="text-right text-yellow-500 font-bold">Actual Result</TableHead>
                                <TableHead className="text-right">Difference (vs Mod)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((row) => (
                                <TableRow key={row.date}>
                                    <TableCell className="font-medium text-muted-foreground">{row.monthLabel}</TableCell>
                                    <TableCell className="text-right text-muted-foreground">{formatCurrency(row.investedCapital)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(row.conservative)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(row.moderate)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(row.aggressive)}</TableCell>
                                    <TableCell className="text-right p-0">
                                        <div className="flex justify-end pr-4">
                                            <ActualCell
                                                date={row.date}
                                                initialValue={row.actual}
                                                onUpdate={updateHistoryPoint}
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className={`text-right ${row.actual ? (row.actual - row.moderate >= 0 ? 'text-green-500' : 'text-red-500') : 'text-muted-foreground'}`}>
                                        {row.actual ? formatCurrency(row.actual - row.moderate) : '-'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    );
}
