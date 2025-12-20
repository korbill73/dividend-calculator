"use client";

import { useFinanceStore } from "@/store/useFinanceStore";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useMemo, useState } from "react";

import { DividendMatrix } from "@/components/dividends/DividendMatrix";

export function DividendPage() {
    const { portfolio } = useFinanceStore();
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const summary = useMemo(() => {
        let totalAsset = 0;
        let annualDividend = 0;
        const monthlyData = Array(12).fill(0).map((_, i) => ({
            month: `${i + 1}`,
            amount: 0
        }));

        portfolio.forEach((item) => {
            const itemVal = item.quantity * item.currentPrice;
            totalAsset += itemVal;

            // Get dividends for selected year
            const yearData = item.yearlyDividends?.[selectedYear] || Array(12).fill(0);

            // Annual dividend for selected year
            const itemAnnual = yearData.reduce((a, b) => a + b, 0);
            annualDividend += itemAnnual;

            yearData.forEach((amount, idx) => {
                monthlyData[idx].amount += amount;
            });
        });

        const yieldRate = totalAsset > 0 ? (annualDividend / totalAsset) * 100 : 0;

        return { totalAsset, annualDividend, yieldRate, monthlyData };
    }, [portfolio, selectedYear]);

    // Format currency
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(val);
    }

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-3 gap-2 md:gap-4">
                <Card>
                    <CardHeader className="pb-1 md:pb-2 p-2 md:p-6">
                        <CardTitle className="text-[10px] md:text-sm font-medium">Total Assets</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2 pt-0 md:p-6 md:pt-0">
                        <div className="text-sm md:text-2xl font-bold text-primary">{formatCurrency(summary.totalAsset)}</div>
                        <p className="text-[9px] md:text-xs text-muted-foreground hidden md:block">Portfolio Value</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-1 md:pb-2 p-2 md:p-6">
                        <CardTitle className="text-[10px] md:text-sm font-medium">Annual Div</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2 pt-0 md:p-6 md:pt-0">
                        <div className="text-sm md:text-2xl font-bold text-green-500">{formatCurrency(summary.annualDividend)}</div>
                        <p className="text-[9px] md:text-xs text-muted-foreground hidden md:block">Est. Yearly Income</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-1 md:pb-2 p-2 md:p-6">
                        <CardTitle className="text-[10px] md:text-sm font-medium">Yield</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2 pt-0 md:p-6 md:pt-0">
                        <div className="text-sm md:text-2xl font-bold text-yellow-500">{summary.yieldRate.toFixed(2)}%</div>
                        <p className="text-[9px] md:text-xs text-muted-foreground hidden md:block">Realized Yield</p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4 md:space-y-6">
                <Card className="w-full overflow-hidden">
                    <CardHeader className="p-3 md:p-6">
                        <CardTitle className="text-base md:text-lg">Dividend Portfolio</CardTitle>
                        <CardDescription className="text-xs md:text-sm">종목 관리 및 배당 일정</CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-x-auto p-2 md:p-6 pt-0">
                        <DividendMatrix
                            selectedYear={selectedYear}
                            onYearChange={setSelectedYear}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="p-3 md:p-6">
                        <CardTitle className="text-base md:text-lg">Monthly Distribution - {selectedYear}</CardTitle>
                        <CardDescription className="text-xs md:text-sm">월별 예상 배당금</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-0 md:pl-2 p-2 md:p-6 pt-0">
                        <div className="h-[200px] md:h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={summary.monthlyData}>
                                    <defs>
                                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.8} />
                                            <stop offset="100%" stopColor="#eab308" stopOpacity={1} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                                    <XAxis
                                        dataKey="month"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(251, 191, 36, 0.1)' }}
                                        contentStyle={{
                                            backgroundColor: 'rgba(30, 41, 59, 0.95)',
                                            border: '1px solid rgba(251, 191, 36, 0.3)',
                                            borderRadius: '12px',
                                            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
                                            padding: '12px 16px',
                                            backdropFilter: 'blur(10px)'
                                        }}
                                        labelStyle={{
                                            color: '#fbbf24',
                                            fontWeight: 'bold',
                                            marginBottom: '8px',
                                            fontSize: '14px'
                                        }}
                                        itemStyle={{
                                            color: '#f3f4f6',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            padding: '4px 0'
                                        }}
                                        formatter={(value: number | undefined) => [
                                            formatCurrency(value || 0),
                                            "배당금"
                                        ]}
                                        labelFormatter={(label) => `${label}월`}
                                    />
                                    <Bar
                                        dataKey="amount"
                                        fill="url(#barGradient)"
                                        radius={[8, 8, 0, 0]}
                                        maxBarSize={60}
                                        animationDuration={800}
                                        animationBegin={0}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
