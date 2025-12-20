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

    // Calculate monthly dividend trend by year
    const monthlyTrendData = useMemo(() => {
        const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
        const yearsSet = new Set<number>();
        
        portfolio.forEach(item => {
            if (item.yearlyDividends) {
                Object.keys(item.yearlyDividends).forEach(year => {
                    yearsSet.add(Number(year));
                });
            }
        });
        
        const years = Array.from(yearsSet).sort((a, b) => a - b);
        
        return months.map((month, monthIndex) => {
            const dataPoint: { month: string; [key: string]: string | number } = { month };
            
            years.forEach(year => {
                let monthTotal = 0;
                portfolio.forEach(item => {
                    const yearData = item.yearlyDividends?.[year] || Array(12).fill(0);
                    monthTotal += yearData[monthIndex] || 0;
                });
                dataPoint[year.toString()] = Math.round(monthTotal / 10000);
            });
            
            return dataPoint;
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

    const yearColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

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
        <div className="space-y-4 md:space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-2 md:gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-1 md:pb-2 p-2 md:p-6">
                        <CardTitle className="text-[10px] md:text-sm font-medium">총 연도</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2 pt-0 md:p-6 md:pt-0">
                        <div className="text-lg md:text-2xl font-bold text-primary">{yearlyStats.length}년</div>
                        <p className="text-[9px] md:text-xs text-muted-foreground hidden md:block">
                            {yearlyStats[0]?.year} - {yearlyStats[yearlyStats.length - 1]?.year}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-1 md:pb-2 p-2 md:p-6">
                        <CardTitle className="text-[10px] md:text-sm font-medium">누적 배당</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2 pt-0 md:p-6 md:pt-0">
                        <div className="text-sm md:text-2xl font-bold text-green-500">
                            {formatCurrency(cumulativeData[cumulativeData.length - 1]?.cumulative || 0)}
                        </div>
                        <p className="text-[9px] md:text-xs text-muted-foreground hidden md:block">전체 기간 합계</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-1 md:pb-2 p-2 md:p-6">
                        <CardTitle className="text-[10px] md:text-sm font-medium">연평균 배당</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2 pt-0 md:p-6 md:pt-0">
                        <div className="text-sm md:text-2xl font-bold text-blue-500">
                            {formatCurrency(
                                yearlyStats.reduce((sum, s) => sum + s.totalDividend, 0) / yearlyStats.length
                            )}
                        </div>
                        <p className="text-[9px] md:text-xs text-muted-foreground hidden md:block">연평균</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-1 md:pb-2 p-2 md:p-6">
                        <CardTitle className="text-[10px] md:text-sm font-medium">평균 수익률</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2 pt-0 md:p-6 md:pt-0">
                        <div className="text-lg md:text-2xl font-bold text-yellow-500">
                            {(yearlyStats.reduce((sum, s) => sum + s.yieldRate, 0) / yearlyStats.length).toFixed(2)}%
                        </div>
                        <p className="text-[9px] md:text-xs text-muted-foreground hidden md:block">연평균 배당수익률</p>
                    </CardContent>
                </Card>
            </div>

            {/* Monthly Dividend Trend by Year */}
            <Card>
                <CardHeader className="p-3 md:p-6">
                    <CardTitle className="text-base md:text-lg">연도별 월별 배당금 추이</CardTitle>
                    <CardDescription className="text-xs md:text-sm">각 연도의 월별 배당금 비교 (단위: 만원)</CardDescription>
                </CardHeader>
                <CardContent className="p-2 md:p-6 pt-0">
                    <div className="h-[250px] md:h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyTrendData}>
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
                                    tickFormatter={(value) => `${value}`}
                                />
                                <Tooltip
                                    cursor={false}
                                    wrapperStyle={{ outline: 'none' }}
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="text-sm space-y-1">
                                                    <p className="text-slate-200 font-semibold">{label}</p>
                                                    {payload.map((entry: any, index: number) => (
                                                        <p key={index} style={{ color: entry.color }} className="font-bold">
                                                            {entry.name}년: {Number(entry.value).toLocaleString()}만원
                                                        </p>
                                                    ))}
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Legend />
                                {years.map((year, index) => (
                                    <Bar
                                        key={year}
                                        dataKey={year.toString()}
                                        name={year.toString()}
                                        fill={yearColors[index % yearColors.length]}
                                        radius={[4, 4, 0, 0]}
                                        maxBarSize={40}
                                    />
                                ))}
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
                                    tickFormatter={(value) => `${Math.round(value / 10000)}만`}
                                />
                                <Tooltip
                                    cursor={false}
                                    wrapperStyle={{ outline: 'none' }}
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="text-sm">
                                                    <p className="text-slate-200 font-semibold">{label}년</p>
                                                    <p className="text-green-400 font-bold">{Math.round(Number(payload[0].value) / 10000).toLocaleString()}만원</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
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
                <CardHeader className="p-3 md:p-6">
                    <CardTitle className="text-base md:text-lg">누적 배당금 추이</CardTitle>
                    <CardDescription className="text-xs md:text-sm">시간에 따른 배당금 누적 현황</CardDescription>
                </CardHeader>
                <CardContent className="p-2 md:p-6 pt-0">
                    <div className="h-[200px] md:h-[350px] w-full">
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
                                    cursor={false}
                                    wrapperStyle={{ outline: 'none' }}
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="text-sm space-y-1">
                                                    <p className="text-slate-200 font-semibold">{label}년</p>
                                                    {payload.map((entry: any, index: number) => (
                                                        <p key={index} style={{ color: entry.color }} className="font-bold">
                                                            {entry.name}: {Math.round(Number(entry.value) / 10000).toLocaleString()}만원
                                                        </p>
                                                    ))}
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
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
