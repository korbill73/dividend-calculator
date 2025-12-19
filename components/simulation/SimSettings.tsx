"use client";

import { useFinanceStore } from "@/store/useFinanceStore";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SimSettings() {
    const { simSettings, updateSimSettings, updateAccountBalance, updateAccountName } = useFinanceStore();
    const { user } = useAuth();

    // 총 계좌 잔액 계산
    const totalBalance = simSettings.accounts.reduce((sum, acc) => sum + acc.balance, 0);

    // 로그인 여부
    const isReadOnly = !user;

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Simulation Parameters</CardTitle>
                <CardDescription>
                    {isReadOnly
                        ? "샘플 데이터를 확인하세요. 수정하려면 로그인이 필요합니다."
                        : "Configure your assumptions and current status."
                    }
                </CardDescription>
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
                                disabled={isReadOnly}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">End Year (종료년도)</Label>
                            <Input
                                type="number"
                                value={simSettings.endYear ?? 2050}
                                onChange={(e) => updateSimSettings({ endYear: Number(e.target.value) })}
                                className="text-right"
                                disabled={isReadOnly}
                            />
                        </div>
                    </div>
                </div>

                {/* Scenarios - 2행 3열 레이아웃 */}
                <div className="space-y-3">
                    <h3 className="text-sm font-medium leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Target Annual Returns (%)<br />
                        <span className="text-xs text-muted-foreground">(목표 수익률)</span>
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                        {/* 첫 번째 행 */}
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground leading-relaxed">
                                Conservative<br />
                                <span className="text-[10px]">(보수적)</span>
                            </Label>
                            <Input
                                type="number"
                                value={simSettings.scenarios.conservative}
                                onChange={(e) => updateSimSettings({ scenarios: { ...simSettings.scenarios, conservative: Number(e.target.value) } })}
                                className="text-right"
                                disabled={isReadOnly}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground leading-relaxed">
                                Moderate<br />
                                <span className="text-[10px]">(중립적)</span>
                            </Label>
                            <Input
                                type="number"
                                value={simSettings.scenarios.moderate}
                                onChange={(e) => updateSimSettings({ scenarios: { ...simSettings.scenarios, moderate: Number(e.target.value) } })}
                                className="text-right"
                                disabled={isReadOnly}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground leading-relaxed">
                                Aggressive<br />
                                <span className="text-[10px]">(공격적)</span>
                            </Label>
                            <Input
                                type="number"
                                value={simSettings.scenarios.aggressive}
                                onChange={(e) => updateSimSettings({ scenarios: { ...simSettings.scenarios, aggressive: Number(e.target.value) } })}
                                className="text-right"
                                disabled={isReadOnly}
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
                            disabled={isReadOnly}
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
                            <div key={idx} className="grid grid-cols-2 gap-2">
                                {/* 계좌 이름 (편집 가능) */}
                                <Input
                                    type="text"
                                    className="h-8 text-sm"
                                    value={acc.name}
                                    onChange={(e) => updateAccountName(idx, e.target.value)}
                                    placeholder="계좌명"
                                    disabled={isReadOnly}
                                />
                                {/* 잔액 입력 */}
                                <div className="flex items-center gap-1">
                                    <Input
                                        type="number"
                                        className="text-right h-8"
                                        value={acc.balance / 10000}
                                        onChange={(e) => updateAccountBalance(idx, Number(e.target.value) * 10000)}
                                        placeholder="만원"
                                        disabled={isReadOnly}
                                    />
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">만원</span>
                                </div>
                            </div>
                        ))}
                        {/* 총합 표시 */}
                        <div className="pt-2 border-t border-slate-700">
                            <div className="flex justify-between items-center text-sm font-medium">
                                <span>Total (총합)</span>
                                <span className="text-blue-400">
                                    {new Intl.NumberFormat('ko-KR').format(totalBalance)}원
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}
