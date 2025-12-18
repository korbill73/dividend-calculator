"use client";

import { useFinanceStore } from "@/store/useFinanceStore";
import { useMemo } from "react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export function DividendHistory() {
    const { portfolio } = useFinanceStore();

    // Calculate yearly statistics
    const yearlyStats = useMemo(() => {
        const yearsSet = new Set<number>();

        // Collect all years from portfolio
        portfolio.forEach(item => {
            if (item.yearlyDividends) {
                Object.keys(item.yearlyDividends).forEach(year => {
                    yearsSet.add(Number(year));
                });
            }
        });

        const years = Array.from(yearsSet).sort((a, b) => a - b);

        return years.map(year => {
            let totalDividend = 0;
            let totalAsset = 0;

            portfolio.forEach(item => {
                const yearData = item.yearlyDividends?.[year] || Array(12).fill(0);
                const annualDividend = yearData.reduce((a, b) => a + b, 0);
                totalDividend += annualDividend;
                totalAsset += item.quantity * item.currentPrice;
            });

            const yieldRate = totalAsset > 0 ? (totalDividend / totalAsset) * 100 : 0;

            return {
                year,
                totalDividend,
                totalAsset,
                yieldRate,
            };
        });
    }, [portfolio]);

    // Calculate cumulative dividends
    const cumulativeData = useMemo(() => {
        let cumulative = 0;
        return yearlyStats.map(stat => {
            cumulative += stat.totalDividend;
            return {
                year: stat.year,
                cumulative,
                annual: stat.totalDividend,
            };
        });
    }, [yearlyStats]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(val);
    };

    if (yearlyStats.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">연도별 배당 데이터가 없습니다. 배당 관리에서 데이터를 입력해주세요.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">총 연도 수</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">{yearlyStats.length}년</div>
                        <p className="text-xs text-muted-foreground">
                            {yearlyStats[0]?.year} - {yearlyStats[yearlyStats.length - 1]?.year}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">누적 배당금</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">
                            {formatCurrency(cumulativeData[cumulativeData.length - 1]?.cumulative || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">전체 기간 합계</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">평균 연 배당금</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-500">
                            {formatCurrency(
                                yearlyStats.reduce((sum, s) => sum + s.totalDividend, 0) / yearlyStats.length
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">연평균</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">평균 수익률</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-500">
                            {(yearlyStats.reduce((sum, s) => sum + s.yieldRate, 0) / yearlyStats.length).toFixed(2)}%
                        </div>
                        <p className="text-xs text-muted-foreground">연평균 배당수익률</p>
                    </CardContent>
                </Card>
            </div>

            {/* Annual Dividend Trend */}
            <Card>
                <CardHeader>
                    <CardTitle>연도별 배당금 추이</CardTitle>
                    <CardDescription>각 연도의 총 배당금 비교</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={yearlyStats}>
                                <defs>
                                    <linearGradient id="barGradientHistory" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#22c55e" stopOpacity={0.8} />
                                        <stop offset="100%" stopColor="#16a34a" stopOpacity={1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                                <XAxis
                                    dataKey="year"
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
                                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(34, 197, 94, 0.1)' }}
                                    contentStyle={{
                                        backgroundColor: 'rgba(30, 41, 59, 0.95)',
                                        border: '1px solid rgba(34, 197, 94, 0.3)',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
                                        padding: '12px 16px',
                                    }}
                                    labelStyle={{
                                        color: '#22c55e',
                                        fontWeight: 'bold',
                                        marginBottom: '8px',
                                    }}
                                    formatter={(value: number) => [formatCurrency(value), "배당금"]}
                                    labelFormatter={(label) => `${label}년`}
                                />
                                <Bar
                                    dataKey="totalDividend"
                                    fill="url(#barGradientHistory)"
                                    radius={[8, 8, 0, 0]}
                                    maxBarSize={80}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Cumulative Dividend Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>누적 배당금 추이</CardTitle>
                    <CardDescription>시간에 따른 배당금 누적 현황</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={cumulativeData}>
                                <defs>
                                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                                        <stop offset="100%" stopColor="#2563eb" stopOpacity={0.2} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis
                                    dataKey="year"
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
                                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(30, 41, 59, 0.95)',
                                        border: '1px solid rgba(59, 130, 246, 0.3)',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
                                        padding: '12px 16px',
                                    }}
                                    labelStyle={{
                                        color: '#3b82f6',
                                        fontWeight: 'bold',
                                    }}
                                    formatter={(value: number) => [formatCurrency(value), "누적"]}
                                    labelFormatter={(label) => `${label}년`}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="cumulative"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    dot={{ fill: '#3b82f6', r: 5 }}
                                    activeDot={{ r: 8 }}
                                    name="누적 배당금"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="annual"
                                    stroke="#22c55e"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    dot={{ fill: '#22c55e', r: 4 }}
                                    name="연간 배당금"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Yearly Statistics Table */}
            <Card>
                <CardHeader>
                    <CardTitle>연도별 상세 통계</CardTitle>
                    <CardDescription>연도별 배당금 및 수익률 상세 데이터</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-slate-900 text-slate-200 border-b-2 border-blue-500/30">
                                    <th className="p-3 border border-slate-700 text-left font-bold">연도</th>
                                    <th className="p-3 border border-slate-700 text-right font-bold">총 배당금</th>
                                    <th className="p-3 border border-slate-700 text-right font-bold">누적 배당금</th>
                                    <th className="p-3 border border-slate-700 text-right font-bold">배당수익률</th>
                                    <th className="p-3 border border-slate-700 text-right font-bold">전년 대비</th>
                                </tr>
                            </thead>
                            <tbody>
                                {yearlyStats.map((stat, index) => {
                                    const prevYear = index > 0 ? yearlyStats[index - 1] : null;
                                    const growth = prevYear
                                        ? ((stat.totalDividend - prevYear.totalDividend) / prevYear.totalDividend) * 100
                                        : 0;
                                    const isPositive = growth > 0;

                                    return (
                                        <tr key={stat.year} className="hover:bg-slate-800/50 transition-colors">
                                            <td className="p-3 border border-slate-700 font-bold text-blue-300">
                                                {stat.year}
                                            </td>
                                            <td className="p-3 border border-slate-700 text-right text-green-400 font-semibold">
                                                {formatCurrency(stat.totalDividend)}
                                            </td>
                                            <td className="p-3 border border-slate-700 text-right text-blue-400">
                                                {formatCurrency(cumulativeData[index]?.cumulative || 0)}
                                            </td>
                                            <td className="p-3 border border-slate-700 text-right text-yellow-400 font-semibold">
                                                {stat.yieldRate.toFixed(2)}%
                                            </td>
                                            <td className={`p-3 border border-slate-700 text-right font-semibold ${index === 0 ? 'text-slate-500' : isPositive ? 'text-green-400' : 'text-red-400'
                                                }`}>
                                                {index === 0 ? '-' : `${isPositive ? '+' : ''}${growth.toFixed(2)}%`}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr className="bg-gradient-to-b from-slate-800 to-slate-900 text-slate-200 border-t-2 border-blue-500/50">
                                    <td className="p-3 font-bold text-yellow-400">평균/합계</td>
                                    <td className="p-3 text-right font-bold text-green-300">
                                        {formatCurrency(yearlyStats.reduce((sum, s) => sum + s.totalDividend, 0) / yearlyStats.length)}
                                        <div className="text-xs text-slate-400">(연평균)</div>
                                    </td>
                                    <td className="p-3 text-right font-bold text-blue-300">
                                        {formatCurrency(cumulativeData[cumulativeData.length - 1]?.cumulative || 0)}
                                        <div className="text-xs text-slate-400">(총합)</div>
                                    </td>
                                    <td className="p-3 text-right font-bold text-yellow-300">
                                        {(yearlyStats.reduce((sum, s) => sum + s.yieldRate, 0) / yearlyStats.length).toFixed(2)}%
                                        <div className="text-xs text-slate-400">(평균)</div>
                                    </td>
                                    <td className="p-3"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
