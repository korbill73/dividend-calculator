"use client";

import { useFinanceStore } from "@/store/useFinanceStore";
import { useAuth } from "@/components/auth/AuthProvider";
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
    onUpdate,
    disabled = false
}: { date: string, initialValue: number | undefined, onUpdate: (d: string, v: number) => void, disabled?: boolean }) => {
    const [value, setValue] = useState(initialValue?.toString() || "");

    useEffect(() => {
        setValue(initialValue?.toString() || "");
    }, [initialValue]);

    const onBlur = () => {
        if (value && !disabled) {
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
            onChange={(e) => !disabled && setValue(e.target.value)}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            className={`h-8 w-32 text-right bg-slate-800/50 border-slate-600 hover:border-slate-400 focus:border-blue-500 focus:bg-slate-800 ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
            placeholder={disabled ? "로그인 필요" : "입력"}
            disabled={disabled}
        />
    )
}

export function SimulationDashboard() {
    const { simSettings, history, updateHistoryPoint } = useFinanceStore();
    const { user } = useAuth();

    const startBalance = simSettings.accounts.reduce((acc, a) => acc + a.balance, 0);

    // 로그인 여부
    const isReadOnly = !user;

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

    const latestActual = useMemo(() => {
        const actualData = history.filter(h => h.value > 0);
        if (actualData.length === 0) return null;
        return actualData[actualData.length - 1];
    }, [history]);

    const actualDataCount = history.filter(h => h.value > 0).length;

    return (
        <div className="flex flex-col gap-4 md:gap-6 min-h-screen pb-4">
            {/* Actual Data Summary - 상단 추가 */}
            {user && (
                <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/30">
                    <CardHeader className="pb-2 md:pb-3 p-3 md:p-6">
                        <CardTitle className="text-sm md:text-lg flex items-center gap-2">
                            <span className="text-yellow-500">📊</span>
                            실제 성과 요약
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                        <div className="grid grid-cols-3 gap-2 md:gap-4">
                            <div>
                                <p className="text-[10px] md:text-sm text-muted-foreground mb-0.5 md:mb-1">최신 실제값</p>
                                <p className="text-sm md:text-2xl font-bold text-yellow-500">
                                    {latestActual ? formatCurrency(latestActual.value) : '-'}
                                </p>
                                {latestActual && (
                                    <p className="text-[9px] md:text-xs text-muted-foreground mt-0.5 md:mt-1 hidden md:block">{latestActual.date}</p>
                                )}
                            </div>
                            <div>
                                <p className="text-[10px] md:text-sm text-muted-foreground mb-0.5 md:mb-1">입력 데이터</p>
                                <p className="text-sm md:text-2xl font-bold text-blue-400">
                                    {actualDataCount}개월
                                </p>
                                <p className="text-[9px] md:text-xs text-muted-foreground mt-0.5 md:mt-1 hidden md:block">
                                    총 {data.length}개월 중
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] md:text-sm text-muted-foreground mb-0.5 md:mb-1">목표 대비</p>
                                {latestActual ? (
                                    <>
                                        <p className={`text-2xl font-bold ${(() => {
                                            const targetRow = data.find(d => d.date === latestActual.date);
                                            if (!targetRow) return 'text-muted-foreground';
                                            const diff = latestActual.value - targetRow.moderate;
                                            return diff >= 0 ? 'text-green-500' : 'text-red-500';
                                        })()
                                            }`}>
                                            {(() => {
                                                const targetRow = data.find(d => d.date === latestActual.date);
                                                if (!targetRow) return '-';
                                                const diff = latestActual.value - targetRow.moderate;
                                                return (diff >= 0 ? '+' : '') + formatCurrency(diff);
                                            })()}
                                        </p>
                                        <p className="text-[9px] md:text-xs text-muted-foreground mt-0.5 md:mt-1 hidden md:block">
                                            {(() => {
                                                const targetRow = data.find(d => d.date === latestActual.date);
                                                if (!targetRow) return '';
                                                const diff = latestActual.value - targetRow.moderate;
                                                const percentage = (diff / targetRow.moderate) * 100;
                                                return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
                                            })()}
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-sm md:text-2xl font-bold text-muted-foreground">-</p>
                                )}
                            </div>
                        </div>
                        {!latestActual && (
                            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                <p className="text-sm text-yellow-500">
                                    💡 하단 테이블의 <strong>&quot;Actual Result&quot;</strong> 열에서 실제 자산 가치를 입력하세요!
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Top Section: Settings & Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
                {/* Settings Panel */}
                <div className="lg:col-span-3">
                    <SimSettings />
                </div>

                {/* Chart Panel */}
                <Card className="lg:col-span-9 flex flex-col">
                    <CardHeader className="p-3 md:p-6">
                        <CardTitle className="text-sm md:text-base">자산 성장 예측 ({simSettings.startYear}-{simSettings.endYear})</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-[250px] md:min-h-[400px] p-2 md:p-6 pt-0">
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
                                    itemSorter={(item: unknown) => -((item as { value?: number }).value || 0)}
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
                <CardHeader className="p-3 md:p-6">
                    <CardTitle className="text-sm md:text-base flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                        상세 예측 데이터
                        {user && (
                            <span className="text-[10px] md:text-sm font-normal text-muted-foreground">
                                (<span className="text-yellow-500 font-semibold">Actual Result</span>에서 실제 값 입력)
                            </span>
                        )}
                    </CardTitle>
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
                                <TableHead className="text-right bg-yellow-500/10 border-l-2 border-yellow-500">
                                    <div className="flex flex-col items-end">
                                        <span className="text-yellow-500 font-bold">✏️ Actual Result</span>
                                        <span className="text-[10px] font-normal text-muted-foreground">(실제 자산 입력)</span>
                                    </div>
                                </TableHead>
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
                                    <TableCell className="text-right p-0 bg-yellow-500/5 border-l-2 border-yellow-500/30">
                                        <div className="flex justify-end pr-4">
                                            <ActualCell
                                                date={row.date}
                                                initialValue={row.actual}
                                                onUpdate={updateHistoryPoint}
                                                disabled={isReadOnly}
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
