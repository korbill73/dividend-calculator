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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SimSettings } from "./SimSettings";
import { Save, Loader2, Check } from "lucide-react";

const AccountCell = ({
    date,
    accountName,
    accountValue,
    onUpdate,
    disabled = false
}: { 
    date: string, 
    accountName: string,
    accountValue: number | undefined, 
    onUpdate: (d: string, accountName: string, v: number) => void, 
    disabled?: boolean 
}) => {
    const displayValue = accountValue !== undefined ? Math.round(accountValue / 10000) : undefined;
    const [value, setValue] = useState(displayValue !== undefined ? displayValue.toString() : "");

    useEffect(() => {
        setValue(displayValue !== undefined ? displayValue.toString() : "");
    }, [displayValue]);

    const onBlur = () => {
        if (value && !disabled) {
            const newValue = Number(value) * 10000;
            onUpdate(date, accountName, newValue);
        }
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            onBlur();
        }
    };

    return (
        <div className="flex items-center justify-end gap-1">
            <Input
                value={value}
                onChange={(e) => !disabled && setValue(e.target.value)}
                onBlur={onBlur}
                onKeyDown={onKeyDown}
                className={`h-8 w-16 text-right bg-slate-900/80 border-slate-600/50 hover:border-cyan-500/50 focus:border-cyan-400 focus:bg-slate-800 text-sm font-medium rounded-md ${disabled ? 'cursor-not-allowed opacity-50' : 'text-white'}`}
                placeholder={disabled ? "-" : ""}
                disabled={disabled}
            />
            <span className="text-xs text-slate-400 min-w-[24px]">만원</span>
        </div>
    )
}

export function SimulationDashboard() {
    const { simSettings, history, updateAccountHistoryPoint, saveToSupabase } = useFinanceStore();
    const { user } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const startBalance = simSettings.accounts.reduce((acc, a) => acc + a.balance, 0);
    const isReadOnly = !user;
    const currentYear = new Date().getFullYear();

    const data = useMemo(() => {
        return generateSimulationData(
            startBalance,
            simSettings.monthlyContribution,
            simSettings.scenarios,
            history,
            simSettings.startYear ?? 2025,
            simSettings.endYear ?? 2050,
            simSettings.startMonth ?? 1
        );
    }, [startBalance, simSettings.monthlyContribution, simSettings.scenarios, history, simSettings.startYear, simSettings.endYear, simSettings.startMonth]);

    const formatMan = (val: number) => {
        const man = Math.round(val / 10000);
        return `${man.toLocaleString()}`;
    }

    const yearEndData = useMemo(() => {
        const decemberDate = `${currentYear}-12`;
        const decemberData = data.find(d => d.date === decemberDate);
        if (decemberData) return decemberData;
        
        const currentYearData = data.filter(d => d.date.startsWith(`${currentYear}-`));
        if (currentYearData.length > 0) {
            return currentYearData[currentYearData.length - 1];
        }
        
        const pastData = data.filter(d => {
            const year = parseInt(d.date.split('-')[0]);
            return year <= currentYear;
        });
        if (pastData.length > 0) {
            return pastData[pastData.length - 1];
        }
        return null;
    }, [data, currentYear]);

    const currentYearActual = useMemo(() => {
        const yearActuals = history.filter(h => h.value > 0 && h.date.startsWith(currentYear.toString()));
        if (yearActuals.length === 0) return null;
        return yearActuals[yearActuals.length - 1];
    }, [history, currentYear]);

    const achievementRate = useMemo(() => {
        if (!currentYearActual || !yearEndData || !yearEndData.moderate || yearEndData.moderate === 0) return null;
        return (currentYearActual.value / yearEndData.moderate) * 100;
    }, [currentYearActual, yearEndData]);

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        setSaveSuccess(false);
        
        try {
            const success = await saveToSupabase(user.id);
            if (success) {
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 2000);
            }
        } catch (error) {
            console.error('Save failed:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 md:gap-6 min-h-screen pb-4">
            {/* 올해의 목표 */}
            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
                <CardHeader className="pb-2 md:pb-3 p-3 md:p-6">
                    <CardTitle className="text-sm md:text-lg flex items-center gap-2">
                        <span className="text-blue-400">🎯</span>
                        {currentYear}년 목표
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                    {/* Mobile: 3 cards in one row */}
                    <div className="grid grid-cols-3 gap-2 md:hidden">
                        <div className="bg-yellow-500/10 rounded-lg p-2 border border-yellow-500/30">
                            <p className="text-[8px] text-muted-foreground mb-0.5">현재실적</p>
                            <p className="text-[11px] font-bold text-yellow-400 leading-tight">
                                {currentYearActual ? `${formatMan(currentYearActual.value)}만` : '-'}
                            </p>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-2 border border-blue-500/30">
                            <p className="text-[8px] text-muted-foreground mb-0.5">중립(목표)</p>
                            <p className="text-[11px] font-bold text-blue-400 leading-tight">
                                {yearEndData ? `${formatMan(yearEndData.moderate)}만` : '-'}
                            </p>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-2">
                            <p className="text-[8px] text-muted-foreground mb-0.5">목표대비</p>
                            <p className={`text-[11px] font-bold leading-tight ${currentYearActual && yearEndData && currentYearActual.value >= yearEndData.moderate ? 'text-green-400' : 'text-orange-400'}`}>
                                {currentYearActual && yearEndData ? `${currentYearActual.value >= yearEndData.moderate ? '+' : ''}${formatMan(currentYearActual.value - yearEndData.moderate)}만` : '-'}
                            </p>
                        </div>
                    </div>
                    {/* Desktop: 5 cards */}
                    <div className="hidden md:grid md:grid-cols-5 gap-4">
                        <div className="bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/30">
                            <p className="text-xs text-muted-foreground mb-1">현재 실적</p>
                            <p className="text-xl font-bold text-yellow-400">
                                {currentYearActual ? `${formatMan(currentYearActual.value)}만원` : '-'}
                            </p>
                            {achievementRate && (
                                <p className={`text-xs mt-1 font-semibold ${achievementRate >= 100 ? 'text-green-400' : 'text-orange-400'}`}>
                                    달성률 {achievementRate.toFixed(1)}%
                                </p>
                            )}
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1">보수적</p>
                            <p className="text-lg font-bold text-red-400">
                                {yearEndData ? `${formatMan(yearEndData.conservative)}만원` : '-'}
                            </p>
                            <p className="text-xs text-muted-foreground">{currentYear}년 12월</p>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-3 border border-blue-500/30">
                            <p className="text-xs text-muted-foreground mb-1">중립적 (목표)</p>
                            <p className="text-lg font-bold text-blue-400">
                                {yearEndData ? `${formatMan(yearEndData.moderate)}만원` : '-'}
                            </p>
                            <p className="text-xs text-muted-foreground">{currentYear}년 12월</p>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1">공격적</p>
                            <p className="text-lg font-bold text-green-400">
                                {yearEndData ? `${formatMan(yearEndData.aggressive)}만원` : '-'}
                            </p>
                            <p className="text-xs text-muted-foreground">{currentYear}년 12월</p>
                        </div>
                        {currentYearActual && yearEndData && (
                            <div className="bg-slate-800/50 rounded-lg p-3">
                                <p className="text-xs text-muted-foreground mb-1">목표 대비</p>
                                <p className={`text-lg font-bold ${currentYearActual.value >= yearEndData.moderate ? 'text-green-400' : 'text-orange-400'}`}>
                                    {currentYearActual.value >= yearEndData.moderate ? '+' : ''}{formatMan(currentYearActual.value - yearEndData.moderate)}만원
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Settings & Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
                <div className="lg:col-span-3">
                    <SimSettings />
                </div>
                <Card className="lg:col-span-9 flex flex-col">
                    <CardHeader className="p-3 md:p-6">
                        <CardTitle className="text-sm md:text-base">자산 성장 예측 ({simSettings.startYear}-{simSettings.endYear})</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-[250px] md:min-h-[400px] p-2 md:p-6 pt-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis
                                    dataKey="monthLabel"
                                    stroke="#888"
                                    minTickGap={50}
                                    tickFormatter={(value) => {
                                        if (!simSettings.birthYear) return value;
                                        const year = parseInt(value.split('.')[0]);
                                        const age = year - simSettings.birthYear;
                                        return `${value} (${age}세)`;
                                    }}
                                />
                                <YAxis
                                    stroke="#888"
                                    tickFormatter={(val) => `${(val / 100000000).toFixed(1)}억`}
                                    width={60}
                                />
                                <Tooltip
                                    cursor={false}
                                    wrapperStyle={{ outline: 'none' }}
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            const sortedPayload = [...payload].sort((a: any, b: any) => (b.value || 0) - (a.value || 0));
                                            return (
                                                <div className="text-sm space-y-1">
                                                    <p className="text-slate-200 font-semibold">{label}</p>
                                                    {sortedPayload.map((entry: any, index: number) => (
                                                        <p key={index} style={{ color: entry.color }} className="font-bold">
                                                            {entry.name}: {formatMan(entry.value || 0)}만원
                                                        </p>
                                                    ))}
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="conservative" name="보수적" stroke="#ef4444" strokeDasharray="5 5" dot={false} />
                                <Line type="monotone" dataKey="moderate" name="중립적" stroke="#3b82f6" strokeDasharray="5 5" dot={false} />
                                <Line type="monotone" dataKey="aggressive" name="공격적" stroke="#22c55e" strokeDasharray="5 5" dot={false} />
                                <Line type="monotone" dataKey="actual" name="실적" stroke="#eab308" strokeWidth={3} activeDot={{ r: 6 }} connectNulls />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Data Grid */}
            <Card className="flex-1 overflow-hidden flex flex-col">
                <CardHeader className="p-3 md:p-6">
                    <div className="flex flex-row items-center justify-between gap-2">
                        <CardTitle className="text-sm md:text-base flex items-center gap-2">
                            상세 예측 데이터
                            <span className="text-[10px] md:text-xs font-normal text-muted-foreground">(단위: 만원)</span>
                        </CardTitle>
                        {!isReadOnly && (
                            <Button
                                onClick={handleSave}
                                size="sm"
                                className="gap-1 text-xs h-7 px-3 bg-orange-500 hover:bg-orange-600 text-white"
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : saveSuccess ? (
                                    <><Check className="h-3 w-3" /> 완료</>
                                ) : (
                                    <><Save className="h-3 w-3" /> 저장</>
                                )}
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <div className="flex-1 overflow-auto p-0">
                    <Table>
                        <TableHeader className="sticky top-0 bg-card z-10">
                            <TableRow>
                                <TableHead className="whitespace-nowrap">날짜</TableHead>
                                {simSettings.accounts.map((acc, idx) => (
                                    <TableHead key={idx} className="text-right whitespace-nowrap bg-yellow-500/10 border-x border-yellow-500/30 min-w-[100px]">
                                        <span className="text-yellow-500 font-bold text-xs">{acc.name}</span>
                                    </TableHead>
                                ))}
                                <TableHead className="text-right whitespace-nowrap bg-cyan-500/10 border-x border-cyan-500/30">
                                    <span className="text-cyan-400 font-bold">합계</span>
                                </TableHead>
                                <TableHead className="text-right whitespace-nowrap">차이</TableHead>
                                <TableHead className="text-right whitespace-nowrap text-blue-400">중립적</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[...data].reverse().map((row) => (
                                <TableRow key={row.date}>
                                    <TableCell className="font-medium text-muted-foreground whitespace-nowrap">{row.monthLabel}</TableCell>
                                    {simSettings.accounts.map((acc, idx) => (
                                        <TableCell key={idx} className="text-right p-1 bg-yellow-500/5 border-x border-yellow-500/20">
                                            <AccountCell
                                                date={row.date}
                                                accountName={acc.name}
                                                accountValue={row.accountValues?.[acc.name]}
                                                onUpdate={updateAccountHistoryPoint}
                                                disabled={isReadOnly}
                                            />
                                        </TableCell>
                                    ))}
                                    <TableCell className="text-right whitespace-nowrap bg-cyan-500/5 border-x border-cyan-500/20 font-bold text-cyan-400">
                                        {row.actual ? formatMan(row.actual) : '-'}
                                    </TableCell>
                                    <TableCell className={`text-right whitespace-nowrap ${row.actual ? (row.actual - row.moderate >= 0 ? 'text-green-500' : 'text-red-500') : 'text-muted-foreground'}`}>
                                        {row.actual ? `${row.actual - row.moderate >= 0 ? '+' : ''}${formatMan(row.actual - row.moderate)}` : '-'}
                                    </TableCell>
                                    <TableCell className="text-right whitespace-nowrap">{formatMan(row.moderate)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    );
}
