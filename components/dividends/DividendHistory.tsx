"use client";

import { useFinanceStore } from "@/store/useFinanceStore";
import { useMemo, useState } from "react";
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
import { Button } from "@/components/ui/button";

export function DividendHistory() {
    const { portfolio } = useFinanceStore();
    const currentYear = new Date().getFullYear();
    const [selectedTrendYear, setSelectedTrendYear] = useState(currentYear);

    const yearlyStats = useMemo(() => {
        const yearsSet = new Set<number>();
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

            return { year, totalDividend, totalAsset, yieldRate };
        });
    }, [portfolio]);

    const years = useMemo(() => {
        const yearsSet = new Set<number>();
        portfolio.forEach(item => {
            if (item.yearlyDividends) {
                Object.keys(item.yearlyDividends).forEach(year => {
                    yearsSet.add(Number(year));
                });
            }
        });
        return Array.from(yearsSet).sort((a, b) => a - b);
    }, [portfolio]);

    const singleYearMonthlyData = useMemo(() => {
        const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
        return months.map((month, monthIndex) => {
            let monthTotal = 0;
            portfolio.forEach(item => {
                const yearData = item.yearlyDividends?.[selectedTrendYear] || Array(12).fill(0);
                monthTotal += yearData[monthIndex] || 0;
            });
            return { month, amount: monthTotal };
        });
    }, [portfolio, selectedTrendYear]);

    const cumulativeData = useMemo(() => {
        let cumulative = 0;
        return yearlyStats.map(stat => {
            cumulative += stat.totalDividend;
            return { year: stat.year, cumulative, annual: stat.totalDividend };
        });
    }, [yearlyStats]);

    const formatMan = (val: number) => `${Math.round(val / 10000).toLocaleString()}만원`;

    if (yearlyStats.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">연도별 배당 데이터가 없습니다. 배당 관리에서 데이터를 입력해주세요.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-2 md:gap-4">
                <Card>
                    <CardHeader className="pb-1 md:pb-2 p-2 md:p-6">
                        <CardTitle className="text-[10px] md:text-sm font-medium">당해년도 누적 배당</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2 pt-0 md:p-6 md:pt-0">
                        <div className="text-sm md:text-2xl font-bold text-cyan-400">
                            {formatMan(yearlyStats.find(s => s.year === currentYear)?.totalDividend || 0)}
                        </div>
                        <p className="text-[9px] md:text-xs text-muted-foreground hidden md:block">{currentYear}년 배당 합계</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-1 md:pb-2 p-2 md:p-6">
                        <CardTitle className="text-[10px] md:text-sm font-medium">전체 누적 배당</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2 pt-0 md:p-6 md:pt-0">
                        <div className="text-sm md:text-2xl font-bold text-sky-400">
                            {formatMan(cumulativeData[cumulativeData.length - 1]?.cumulative || 0)}
                        </div>
                        <p className="text-[9px] md:text-xs text-muted-foreground hidden md:block">
                            {yearlyStats[0]?.year} - {yearlyStats[yearlyStats.length - 1]?.year} ({yearlyStats.length}년간)
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Monthly Dividend Trend - Single Year Selection */}
            <Card>
                <CardHeader className="p-3 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div>
                            <CardTitle className="text-base md:text-lg">월별 배당금 추이</CardTitle>
                            <CardDescription className="text-xs md:text-sm">{selectedTrendYear}년 월별 배당금</CardDescription>
                        </div>
                        <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelectedTrendYear(y => Math.max(years[0] || currentYear, y - 1))}
                                className="h-6 md:h-7 w-6 md:w-auto px-1 md:px-2"
                                disabled={selectedTrendYear <= (years[0] || currentYear)}
                            >
                                ←
                            </Button>
                            <span className="px-2 md:px-3 text-xs md:text-sm font-medium min-w-[50px] text-center">{selectedTrendYear}</span>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelectedTrendYear(y => Math.min(years[years.length - 1] || currentYear, y + 1))}
                                className="h-6 md:h-7 w-6 md:w-auto px-1 md:px-2"
                                disabled={selectedTrendYear >= (years[years.length - 1] || currentYear)}
                            >
                                →
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-2 md:p-6 pt-0">
                    <div className="h-[200px] md:h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={singleYearMonthlyData}>
                                <defs>
                                    <linearGradient id="barGradientMonthly" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.8} />
                                        <stop offset="100%" stopColor="#eab308" stopOpacity={1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                                <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${Math.round(v / 10000)}`} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(251, 191, 36, 0.1)' }}
                                    wrapperStyle={{ outline: 'none' }}
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="text-sm">
                                                    <p className="text-slate-200 font-semibold">{label}</p>
                                                    <p className="text-yellow-400 font-bold">{formatMan(payload[0].value as number)}</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="amount" fill="url(#barGradientMonthly)" radius={[8, 8, 0, 0]} maxBarSize={60} animationDuration={800} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Annual Dividend Trend */}
            <Card>
                <CardHeader className="p-3 md:p-6">
                    <CardTitle className="text-base md:text-lg">연도별 총 배당금</CardTitle>
                    <CardDescription className="text-xs md:text-sm">각 연도의 총 배당금 비교</CardDescription>
                </CardHeader>
                <CardContent className="p-2 md:p-6 pt-0">
                    <div className="h-[200px] md:h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={yearlyStats}>
                                <defs>
                                    <linearGradient id="barGradientHistory" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.9} />
                                        <stop offset="100%" stopColor="#0ea5e9" stopOpacity={1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                                <XAxis dataKey="year" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${Math.round(v / 10000)}만`} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(34, 211, 238, 0.1)' }}
                                    wrapperStyle={{ outline: 'none' }}
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="text-sm">
                                                    <p className="text-slate-200 font-semibold">{label}년</p>
                                                    <p className="text-cyan-400 font-bold">{formatMan(payload[0].value as number)}</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="totalDividend" fill="url(#barGradientHistory)" radius={[8, 8, 0, 0]} maxBarSize={80} animationDuration={800} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Cumulative Dividend Chart */}
            <Card>
                <CardHeader className="p-3 md:p-6">
                    <CardTitle className="text-base md:text-lg">누적 배당금 추이</CardTitle>
                    <CardDescription className="text-xs md:text-sm">시간에 따른 배당금 누적 현황 (단위: 만원)</CardDescription>
                </CardHeader>
                <CardContent className="p-2 md:p-6 pt-0">
                    <div className="h-[200px] md:h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={cumulativeData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="year" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${Math.round(v / 10000)}`} />
                                <Tooltip
                                    cursor={false}
                                    wrapperStyle={{ outline: 'none' }}
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="text-sm space-y-1">
                                                    <p className="text-slate-200 font-semibold">{label}년</p>
                                                    {payload.map((entry: any, index: number) => (
                                                        <p key={index} style={{ color: entry.color }} className="font-bold">
                                                            {entry.name}: {formatMan(entry.value)}
                                                        </p>
                                                    ))}
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="cumulative" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 5 }} activeDot={{ r: 8 }} name="누적 배당금" />
                                <Line type="monotone" dataKey="annual" stroke="#22c55e" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#22c55e', r: 4 }} name="연간 배당금" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Yearly Statistics Table */}
            <Card>
                <CardHeader className="p-3 md:p-6">
                    <CardTitle className="text-base md:text-lg">연도별 상세 통계</CardTitle>
                    <CardDescription className="text-xs md:text-sm">연도별 배당금 및 수익률 상세 데이터</CardDescription>
                </CardHeader>
                <CardContent className="p-2 md:p-6 pt-0">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-xs md:text-sm">
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
                                    const growth = prevYear ? ((stat.totalDividend - prevYear.totalDividend) / prevYear.totalDividend) * 100 : 0;
                                    const isPositive = growth > 0;

                                    return (
                                        <tr key={stat.year} className="hover:bg-slate-800/50 transition-colors">
                                            <td className="p-3 border border-slate-700 font-bold text-blue-300">{stat.year}</td>
                                            <td className="p-3 border border-slate-700 text-right text-green-400 font-semibold">{formatMan(stat.totalDividend)}</td>
                                            <td className="p-3 border border-slate-700 text-right text-blue-400">{formatMan(cumulativeData[index]?.cumulative || 0)}</td>
                                            <td className="p-3 border border-slate-700 text-right text-yellow-400 font-semibold">{stat.yieldRate.toFixed(2)}%</td>
                                            <td className={`p-3 border border-slate-700 text-right font-semibold ${index === 0 ? 'text-slate-500' : isPositive ? 'text-green-400' : 'text-red-400'}`}>
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
                                        {formatMan(yearlyStats.reduce((sum, s) => sum + s.totalDividend, 0) / yearlyStats.length)}
                                        <div className="text-xs text-slate-400">(연평균)</div>
                                    </td>
                                    <td className="p-3 text-right font-bold text-blue-300">
                                        {formatMan(cumulativeData[cumulativeData.length - 1]?.cumulative || 0)}
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
