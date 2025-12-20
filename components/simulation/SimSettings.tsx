"use client";

import { useFinanceStore } from "@/store/useFinanceStore";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, Check, Loader2, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

export function SimSettings() {
    const { simSettings, updateSimSettings, updateAccountBalance, updateAccountName, addAccount, removeAccount, saveToSupabase } = useFinanceStore();
    const { user } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    
    const [localStartYear, setLocalStartYear] = useState(String(simSettings.startYear ?? 2025));
    const [localStartMonth, setLocalStartMonth] = useState(String(simSettings.startMonth ?? 1));
    
    useEffect(() => {
        setLocalStartYear(String(simSettings.startYear ?? 2025));
        setLocalStartMonth(String(simSettings.startMonth ?? 1));
    }, [simSettings.startYear, simSettings.startMonth]);

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        setSaveSuccess(false);
        const success = await saveToSupabase(user.id);
        setIsSaving(false);
        if (success) {
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);
        }
    };

    // 총 계좌 잔액 계산
    const totalBalance = simSettings.accounts.reduce((sum, acc) => sum + acc.balance, 0);

    // 로그인 여부
    const isReadOnly = !user;

    return (
        <Card className="h-full">
            <CardHeader className="p-3 md:p-6">
                <CardTitle className="text-sm md:text-base">시뮬레이션 설정</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                    {isReadOnly
                        ? "샘플 데이터 확인 중 (수정은 로그인 필요)"
                        : "설정값을 수정하세요"
                    }
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6 p-3 pt-0 md:p-6 md:pt-0">

                {/* Save Button */}
                {user && (
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                저장 중...
                            </>
                        ) : saveSuccess ? (
                            <>
                                <Check className="h-4 w-4 mr-2" />
                                저장 완료!
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                설정 저장
                            </>
                        )}
                    </Button>
                )}

                {/* Period Settings */}
                <div className="space-y-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                    <h3 className="text-sm font-medium">Simulation Period (시뮬레이션 기간)</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Birth Year (출생년도)</Label>
                            <Input
                                type="number"
                                value={simSettings.birthYear ?? ''}
                                onChange={(e) => updateSimSettings({ birthYear: e.target.value ? Number(e.target.value) : undefined })}
                                className="text-right"
                                placeholder="예: 1985"
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
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">시작년도</Label>
                            <Input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={localStartYear}
                                onChange={(e) => setLocalStartYear(e.target.value)}
                                onBlur={() => {
                                    const num = parseInt(localStartYear, 10);
                                    if (!isNaN(num)) {
                                        updateSimSettings({ startYear: num });
                                    } else {
                                        setLocalStartYear(String(simSettings.startYear ?? 2025));
                                    }
                                }}
                                className="text-right"
                                disabled={isReadOnly}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">시작월</Label>
                            <Input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={localStartMonth}
                                onChange={(e) => setLocalStartMonth(e.target.value)}
                                onBlur={() => {
                                    const num = parseInt(localStartMonth, 10);
                                    if (!isNaN(num)) {
                                        updateSimSettings({ startMonth: Math.min(12, Math.max(1, num)) });
                                    } else {
                                        setLocalStartMonth(String(simSettings.startMonth ?? 1));
                                    }
                                }}
                                className="text-right"
                                placeholder="1-12"
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
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium leading-none">초기 금액 (시작 잔액)</h3>
                        {!isReadOnly && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addAccount()}
                                className="h-7 text-xs"
                            >
                                <Plus className="h-3 w-3 mr-1" />
                                계좌 추가
                            </Button>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">※ 금액은 만원 단위로 입력</p>
                    <div className="space-y-2">
                        {simSettings.accounts.map((acc, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                {/* 계좌 이름 (편집 가능) */}
                                <Input
                                    type="text"
                                    className="h-8 text-sm flex-1"
                                    value={acc.name}
                                    onChange={(e) => updateAccountName(idx, e.target.value)}
                                    placeholder="계좌명"
                                    disabled={isReadOnly}
                                />
                                {/* 잔액 입력 */}
                                <div className="flex items-center gap-1 flex-1">
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
                                {/* 삭제 버튼 */}
                                {!isReadOnly && simSettings.accounts.length > 1 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeAccount(idx)}
                                        className="h-8 w-8 p-0 text-red-400 hover:text-red-500 hover:bg-red-500/10"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
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
