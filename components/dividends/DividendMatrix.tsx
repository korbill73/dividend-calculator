"use client";

import { useFinanceStore, StockItem } from "@/store/useFinanceStore";
import { useAuth } from "@/components/auth/AuthProvider";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Save, Loader2, Check } from "lucide-react";

// Helper for formatting currency
const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('ko-KR').format(val);
}

interface DividendMatrixProps {
    selectedYear?: number;
    onYearChange?: (year: number) => void;
}

export function DividendMatrix({ selectedYear: propSelectedYear, onYearChange }: DividendMatrixProps = {}) {
    const { portfolio, updateItem, removeItem, addItem, saveToSupabase } = useFinanceStore();
    const { user } = useAuth();
    const [isMounted, setIsMounted] = useState(false);
    const [localSelectedYear, setLocalSelectedYear] = useState(new Date().getFullYear());
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // 로그인 여부
    const isReadOnly = !user;

    // Use prop if provided, otherwise use local state
    const selectedYear = propSelectedYear ?? localSelectedYear;
    const handleYearChange = (year: number) => {
        if (onYearChange) {
            onYearChange(year);
        } else {
            setLocalSelectedYear(year);
        }
    };

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    // Get dividends for current selected year
    const getCurrentYearDividends = (item: StockItem): number[] => {
        if (!item.yearlyDividends || !item.yearlyDividends[selectedYear]) {
            // If no data for this year, return zeros
            return Array(12).fill(0);
        }
        return item.yearlyDividends[selectedYear];
    };

    const handleUpdate = (id: string, field: keyof StockItem, value: string | number) => {
        if (isReadOnly) return;
        updateItem(id, { [field]: value });
    };

    const handleMonthlyUpdate = (id: string, monthIndex: number, value: number) => {
        if (isReadOnly) return;
        const item = portfolio.find(p => p.id === id);
        if (!item) return;

        // Initialize yearlyDividends if not exists
        const yearlyDividends = item.yearlyDividends || {};
        const currentYearData = yearlyDividends[selectedYear] || Array(12).fill(0);

        // Update the specific month
        const newMonthly = [...currentYearData];
        newMonthly[monthIndex] = value;

        // Save back to yearlyDividends
        const updatedYearlyDividends = {
            ...yearlyDividends,
            [selectedYear]: newMonthly
        };

        updateItem(id, { yearlyDividends: updatedYearlyDividends });
    };

    const handleAddStock = () => {
        if (isReadOnly) return;
        const newItem: StockItem = {
            id: crypto.randomUUID(),
            name: "New Stock",
            ticker: "",
            quantity: 0,
            currentPrice: 0,
            dividendYield: 0,
            dividendDay: 1,
            monthlyDividends: Array(12).fill(0),
            yearlyDividends: {
                [selectedYear]: Array(12).fill(0)
            }
        };
        addItem(newItem);
    };

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

    // Calculate Grand Total for Annual (for selected year)
    const grandTotalAnnual = portfolio.reduce((sum, item) => {
        const yearData = getCurrentYearDividends(item);
        return sum + yearData.reduce((a, b) => a + b, 0);
    }, 0);

    // Calculate Total Monthly (Array of 12) for selected year
    const totalMonthly = Array.from({ length: 12 }).map((_, monthIndex) => {
        return portfolio.reduce((sum, item) => {
            const yearData = getCurrentYearDividends(item);
            return sum + (yearData[monthIndex] || 0);
        }, 0);
    });

    // Auto-sort portfolio: 1) dividendDay, 2) total value descending
    const sortedPortfolio = [...portfolio].sort((a, b) => {
        const dayA = a.dividendDay || 99;
        const dayB = b.dividendDay || 99;
        if (dayA !== dayB) return dayA - dayB;
        const valueA = a.quantity * a.currentPrice;
        const valueB = b.quantity * b.currentPrice;
        return valueB - valueA;
    });

    return (
        <div className="space-y-3 md:space-y-4">
            <div className="flex flex-col gap-2">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                    <h2 className="text-base md:text-xl font-bold">나의 배당</h2>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleYearChange(selectedYear - 1)}
                            className="h-6 md:h-7 w-6 md:w-auto px-1 md:px-2"
                        >
                            ←
                        </Button>
                        <span className="px-2 md:px-3 text-xs md:text-sm font-medium">{selectedYear}</span>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleYearChange(selectedYear + 1)}
                            className="h-6 md:h-7 w-6 md:w-auto px-1 md:px-2"
                        >
                            →
                        </Button>
                    </div>
                    <Button
                        onClick={handleAddStock}
                        className="gap-1 md:gap-2 text-xs md:text-sm h-7 md:h-9 px-2 md:px-4"
                        disabled={isReadOnly}
                        title={isReadOnly ? "로그인이 필요합니다" : ""}
                    >
                        <Plus className="h-3 w-3 md:h-4 md:w-4" /> <span className="hidden md:inline">Add Stock</span><span className="md:hidden">추가</span>
                    </Button>
                    {!isReadOnly && (
                        <Button
                            onClick={handleSave}
                            className="gap-1 md:gap-2 text-xs md:text-sm h-7 md:h-9 px-2 md:px-4 bg-orange-500 hover:bg-orange-600 text-white"
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" />
                                    <span className="hidden md:inline">저장 중...</span>
                                </>
                            ) : saveSuccess ? (
                                <>
                                    <Check className="h-3 w-3 md:h-4 md:w-4" />
                                    <span className="hidden md:inline">저장 완료</span>
                                    <span className="md:hidden">완료</span>
                                </>
                            ) : (
                                <>
                                    <Save className="h-3 w-3 md:h-4 md:w-4" />
                                    <span className="hidden md:inline">Save</span>
                                    <span className="md:hidden">저장</span>
                                </>
                            )}
                        </Button>
                    )}
                </div>
                </div>
                <div className="text-[10px] md:text-xs text-slate-400 bg-slate-800/30 rounded p-2 border border-slate-700">
                    {isReadOnly ? (
                        <>
                            <span className="hidden md:inline">💡 로그인하면 나만의 배당 포트폴리오를 관리할 수 있습니다. 가로 스크롤하여 더 많은 종목을 확인하세요.</span>
                            <span className="md:hidden">💡 로그인하면 나만의 배당 관리 가능</span>
                        </>
                    ) : (
                        <>
                            <span className="hidden md:inline">💡 수량과 가격을 입력하면 평가액이 계산됩니다. 월별 배당금은 직접 입력하세요. <strong className="text-orange-400">수정 후 반드시 저장 버튼을 클릭하세요!</strong></span>
                            <span className="md:hidden">💡 수정 후 반드시 저장 버튼 클릭!</span>
                        </>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto border rounded-lg border-slate-700 bg-slate-900/50">
                <table className="w-full border-collapse text-sm">
                    {/* Header Group */}
                    <thead>
                        {/* Row 1: Stock Names */}
                        <tr className="bg-slate-900 text-slate-200 border-b-2 border-yellow-500/30">
                            <th className="min-w-[120px] p-3 border border-slate-700 font-bold bg-gradient-to-br from-slate-800 to-slate-900 text-yellow-400 text-right sticky left-0 z-10">
                                <div className="text-lg">{formatCurrency(grandTotalAnnual)}</div>
                                <div className="text-xs text-slate-400 font-normal">Total Annual (연 합계)</div>
                            </th>
                            {sortedPortfolio.map(stock => (
                                <th key={stock.id} className="min-w-[135px] max-w-[150px] p-2 border border-slate-700 bg-gradient-to-br from-blue-950 to-slate-900 font-medium relative group">
                                    <textarea
                                        className="w-full bg-transparent text-center font-bold text-blue-300 outline-none placeholder:text-slate-600 mb-1 resize-none overflow-hidden text-xs"
                                        value={stock.name}
                                        onChange={(e) => handleUpdate(stock.id, 'name', e.target.value)}
                                        placeholder="Stock Name"
                                        rows={2}
                                        style={{ minHeight: '2.5rem' }}
                                        disabled={isReadOnly}
                                    />
                                    {!isReadOnly && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                            onClick={() => removeItem(stock.id)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    )}
                                </th>
                            ))}
                        </tr>

                        {/* Row 2: Dividend Day & Yield */}
                        <tr className="bg-slate-800/50 border-b border-slate-700">
                            <th className="p-2 border border-slate-700 text-right text-slate-400 text-xs font-medium sticky left-0 z-10 bg-slate-800/90">
                                Info (정보)
                            </th>
                            {sortedPortfolio.map(stock => (
                                <td key={stock.id} className="p-2 border border-slate-700">
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="flex flex-col">
                                            <span className="text-slate-500 mb-1">Day</span>
                                            <input
                                                type="number"
                                                className="w-full bg-slate-800 text-center outline-none rounded px-1 py-0.5 border border-slate-600 focus:border-blue-500"
                                                value={stock.dividendDay || ''}
                                                onChange={(e) => handleUpdate(stock.id, 'dividendDay', Number(e.target.value))}
                                                placeholder="일"
                                                disabled={isReadOnly}
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-slate-500 mb-1">Yield</span>
                                            <div className="flex items-center justify-center gap-0.5">
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    className="w-12 bg-slate-800 text-right outline-none rounded px-1 py-0.5 border border-slate-600 focus:border-blue-500"
                                                    value={stock.dividendYield}
                                                    onChange={(e) => handleUpdate(stock.id, 'dividendYield', Number(e.target.value))}
                                                    disabled={isReadOnly}
                                                />
                                                <span className="text-slate-400">%</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            ))}
                        </tr>

                        {/* Row 3: Total Value (Qty × Price) */}
                        <tr className="bg-slate-800/50 border-b-2 border-yellow-500/30">
                            <th className="p-3 border border-slate-700 text-right font-bold text-yellow-400 sticky left-0 z-10 bg-slate-800/90">
                                <div>{formatCurrency(portfolio.reduce((sum, s) => sum + (s.quantity * s.currentPrice), 0))}</div>
                                <div className="text-xs text-slate-400 font-normal">Total Value (총 평가액)</div>
                            </th>
                            {sortedPortfolio.map(stock => (
                                <td key={stock.id} className="p-2 border border-slate-700">
                                    <div className="flex flex-col text-xs gap-1.5 bg-slate-800/50 rounded p-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500">Qty:</span>
                                            <input
                                                type="number"
                                                className="w-16 bg-slate-900 text-right outline-none rounded px-1 py-0.5 border border-slate-600 focus:border-blue-500"
                                                value={stock.quantity}
                                                onChange={(e) => handleUpdate(stock.id, 'quantity', Number(e.target.value))}
                                                disabled={isReadOnly}
                                            />
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500">Price:</span>
                                            <input
                                                type="number"
                                                className="w-16 bg-slate-900 text-right outline-none rounded px-1 py-0.5 border border-slate-600 focus:border-blue-500"
                                                value={stock.currentPrice}
                                                onChange={(e) => handleUpdate(stock.id, 'currentPrice', Number(e.target.value))}
                                                disabled={isReadOnly}
                                            />
                                        </div>
                                        <div className="text-right font-bold text-blue-300 pt-1.5 border-t border-slate-600 mt-0.5">
                                            {formatCurrency(stock.quantity * stock.currentPrice)}
                                        </div>
                                    </div>
                                </td>
                            ))}
                        </tr>
                    </thead>

                    {/* Body: Months 1-12 */}
                    <tbody className="bg-slate-900/30">
                        {Array.from({ length: 12 }).map((_, i) => {
                            const monthLabel = `${i + 1}월`;
                            const isQuarterEnd = (i + 1) % 3 === 0;
                            return (
                                <tr key={i} className={`hover:bg-slate-800/50 transition-colors ${isQuarterEnd ? 'border-b-2 border-slate-600' : 'border-b border-slate-700/50'}`}>
                                    {/* Monthly Total Column */}
                                    <td className={`p-2 border border-slate-700 font-bold text-right sticky left-0 z-10 ${totalMonthly[i] > 0 ? 'bg-gradient-to-r from-emerald-900/40 to-slate-900/90 text-emerald-300' : 'bg-slate-900/90 text-slate-600'
                                        }`}>
                                        <div className="text-sm">{formatCurrency(totalMonthly[i])}</div>
                                        <div className="text-xs text-slate-500">{monthLabel}</div>
                                    </td>

                                    {/* Stock columns */}
                                    {sortedPortfolio.map(stock => {
                                        const yearData = getCurrentYearDividends(stock);
                                        return (
                                            <td key={stock.id} className="p-0 border border-slate-700 text-right">
                                                <input
                                                    type="text"
                                                    className={`w-full h-full p-2 bg-transparent text-right outline-none transition-colors ${yearData[i] > 0
                                                        ? 'text-slate-200 hover:bg-slate-800/50 focus:bg-slate-800'
                                                        : 'text-slate-600 hover:bg-slate-800/30 focus:bg-slate-800'
                                                        }`}
                                                    value={yearData[i] ? formatCurrency(yearData[i]) : ''}
                                                    onChange={(e) => {
                                                        const rawValue = e.target.value.replace(/[^0-9]/g, '');
                                                        handleMonthlyUpdate(stock.id, i, Number(rawValue) || 0);
                                                    }}
                                                    placeholder="0"
                                                    disabled={isReadOnly}
                                                    readOnly={isReadOnly}
                                                />
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>

                    {/* Footer: Sum per stock */}
                    <tfoot>
                        <tr className="bg-gradient-to-b from-slate-800 to-slate-900 text-slate-200 border-t-2 border-yellow-500/50">
                            <td className="p-3 font-bold text-right text-yellow-400 text-base sticky left-0 z-10 bg-slate-900">
                                <div>{formatCurrency(grandTotalAnnual)}</div>
                                <div className="text-xs text-slate-400 font-normal">Total (합계)</div>
                            </td>
                            {sortedPortfolio.map(stock => (
                                <td key={stock.id} className="p-3 font-bold text-right text-blue-300 border border-slate-700">
                                    {formatCurrency(getCurrentYearDividends(stock).reduce((a, b) => a + b, 0))}
                                </td>
                            ))}
                        </tr>
                    </tfoot>
                </table>
            </div>

        </div>
    );
}
