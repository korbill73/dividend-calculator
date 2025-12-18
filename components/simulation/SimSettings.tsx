"use client";

import { useFinanceStore } from "@/store/useFinanceStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SimSettings() {
    const { simSettings, updateSimSettings, updateAccountBalance } = useFinanceStore();

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Simulation Parameters</CardTitle>
                <CardDescription>Configure your assumptions and current status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Period Settings */}
                <div className="space-y-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                    <h3 className="text-sm font-medium">Simulation Period (시뮬레이션 기간)</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Start Year (시작년도)</Label>
                            <Input
                                type="number"
                                value={simSettings.startYear ?? 2025}
                                onChange={(e) => updateSimSettings({ startYear: Number(e.target.value) })}
                                className="text-right"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">End Year (종료년도)</Label>
                            <Input
                                type="number"
                                value={simSettings.endYear ?? 2050}
                                onChange={(e) => updateSimSettings({ endYear: Number(e.target.value) })}
                                className="text-right"
                            />
                        </div>
                    </div>
                </div>

                {/* Scenarios */}
                <div className="space-y-3">
                    <h3 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Target Annual Returns (%) (목표 수익률)</h3>
                    <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Conservative (보수적)</Label>
                            <Input
                                type="number"
                                value={simSettings.scenarios.conservative}
                                onChange={(e) => updateSimSettings({ scenarios: { ...simSettings.scenarios, conservative: Number(e.target.value) } })}
                                className="text-right"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Moderate (중립적)</Label>
                            <Input
                                type="number"
                                value={simSettings.scenarios.moderate}
                                onChange={(e) => updateSimSettings({ scenarios: { ...simSettings.scenarios, moderate: Number(e.target.value) } })}
                                className="text-right"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Aggressive (공격적)</Label>
                            <Input
                                type="number"
                                value={simSettings.scenarios.aggressive}
                                onChange={(e) => updateSimSettings({ scenarios: { ...simSettings.scenarios, aggressive: Number(e.target.value) } })}
                                className="text-right"
                            />
                        </div>
                    </div>
                </div>

                {/* Monthly Contribution (in 만원) */}
                <div className="space-y-3">
                    <Label>Monthly Contribution (월 추가 불입금)</Label>
                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            value={simSettings.monthlyContribution / 10000}
                            onChange={(e) => updateSimSettings({ monthlyContribution: Number(e.target.value) * 10000 })}
                            className="text-right"
                            placeholder="만원 단위"
                        />
                        <span className="text-sm text-muted-foreground whitespace-nowrap">만원</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Current: {new Intl.NumberFormat('ko-KR').format(simSettings.monthlyContribution)}원
                    </p>
                </div>

                {/* Accounts Initial Balances (in 만원) */}
                <div className="space-y-3">
                    <h3 className="text-sm font-medium leading-none">Current Account Balances (현재 계좌 잔액)</h3>
                    <p className="text-xs text-muted-foreground">※ 금액은 만원 단위로 입력</p>
                    <div className="space-y-2">
                        {simSettings.accounts.map((acc, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-2">
                                <Label className="w-1/3 text-xs truncate" title={acc.name}>{acc.name}</Label>
                                <div className="flex items-center gap-1 flex-1">
                                    <Input
                                        type="number"
                                        className="text-right h-8"
                                        value={acc.balance / 10000}
                                        onChange={(e) => updateAccountBalance(idx, Number(e.target.value) * 10000)}
                                        placeholder="만원"
                                    />
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">만원</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}
