"use client";

import { useFinanceStore } from "@/store/useFinanceStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Download, Upload, Trash, Database } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/lib/supabase";

export function SettingsPage() {
    const { exportData, importData, portfolio } = useFinanceStore();
    const { user } = useAuth();
    const [jsonInput, setJsonInput] = useState("");
    const [uploading, setUploading] = useState(false);

    const handleDownload = () => {
        const dataStr = exportData();
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `finance_backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImport = () => {
        if (!jsonInput) return;
        importData(jsonInput);
        alert("Data imported successfully!");
        setJsonInput("");
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            if (evt.target?.result) {
                importData(evt.target.result as string);
                alert("File imported successfully!");
            }
        }
        reader.readAsText(file);
    }

    const handleUploadToSupabase = async () => {
        if (!user) {
            alert('로그인이 필요합니다!');
            return;
        }

        if (portfolio.length === 0) {
            alert('업로드할 데이터가 없습니다!');
            return;
        }

        if (!confirm(`${portfolio.length}개의 종목 데이터를 Supabase에 업로드하시겠습니까?\n기존 Supabase 데이터는 유지되고 새로운 데이터가 추가됩니다.`)) {
            return;
        }

        setUploading(true);

        try {
            let successCount = 0;
            let errorCount = 0;

            for (const item of portfolio) {
                // 1. portfolio_items 삽입
                const { data: portfolioData, error: portfolioError } = await supabase
                    .from('portfolio_items')
                    .insert({
                        user_id: user.id,
                        name: item.name,
                        ticker: item.ticker,
                        quantity: item.quantity,
                        current_price: item.currentPrice,
                        dividend_yield: item.dividendYield,
                        dividend_day: item.dividendDay || null,
                        sector: item.sector || null,
                    })
                    .select()
                    .single();

                if (portfolioError) {
                    console.error('Portfolio insert error:', portfolioError);
                    errorCount++;
                    continue;
                }

                // 2. yearlyDividends 데이터가 있으면 삽입
                if (item.yearlyDividends && portfolioData) {
                    for (const [year, monthlyData] of Object.entries(item.yearlyDividends)) {
                        const { error: dividendError } = await supabase
                            .from('yearly_dividends')
                            .insert({
                                user_id: user.id,
                                portfolio_item_id: portfolioData.id,
                                year: parseInt(year),
                                month_1: monthlyData[0] || 0,
                                month_2: monthlyData[1] || 0,
                                month_3: monthlyData[2] || 0,
                                month_4: monthlyData[3] || 0,
                                month_5: monthlyData[4] || 0,
                                month_6: monthlyData[5] || 0,
                                month_7: monthlyData[6] || 0,
                                month_8: monthlyData[7] || 0,
                                month_9: monthlyData[8] || 0,
                                month_10: monthlyData[9] || 0,
                                month_11: monthlyData[10] || 0,
                                month_12: monthlyData[11] || 0,
                            });

                        if (dividendError) {
                            console.error('Dividend insert error:', dividendError);
                        }
                    }
                }

                successCount++;
            }

            alert(`✅ 업로드 완료!\n성공: ${successCount}개\n실패: ${errorCount}개`);
        } catch (error) {
            console.error('Upload error:', error);
            alert('업로드 중 오류가 발생했습니다.');
        } finally {
            setUploading(false);
        }
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Data Management</CardTitle>
                    <CardDescription>
                        Backup your data or restore from a previous backup. Data is stored in your browser&apos;s LocalStorage by default.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">

                    <div className="flex flex-col space-y-4">
                        <h3 className="text-lg font-medium">Backup</h3>
                        <p className="text-sm text-muted-foreground">Download your current portfolio and simulation settings as a JSON file.</p>
                        <Button onClick={handleDownload} className="w-fit gap-2">
                            <Download className="h-4 w-4" /> Download Backup
                        </Button>
                    </div>

                    <div className="border-t border-border my-4" />

                    {user && (
                        <>
                            <div className="flex flex-col space-y-4">
                                <h3 className="text-lg font-medium">📤 Supabase로 업로드</h3>
                                <p className="text-sm text-muted-foreground">
                                    현재 브라우저(localStorage)에 저장된 배당 데이터를 Supabase 데이터베이스로 업로드합니다.
                                    <br />
                                    업로드 후에는 모든 기기에서 동기화됩니다!
                                </p>
                                <div className="p-4 bg-muted rounded-lg space-y-2">
                                    <p className="text-sm font-medium">현재 localStorage 데이터:</p>
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                        <li>📊 포트폴리오 종목: {portfolio.length}개</li>
                                        <li>👤 업로드될 사용자: {user.email}</li>
                                    </ul>
                                </div>
                                <Button
                                    onClick={handleUploadToSupabase}
                                    className="w-fit gap-2"
                                    disabled={uploading || portfolio.length === 0}
                                >
                                    <Database className="h-4 w-4" />
                                    {uploading ? '업로드 중...' : 'Supabase로 업로드'}
                                </Button>
                            </div>

                            <div className="border-t border-border my-4" />
                        </>
                    )}

                    <div className="flex flex-col space-y-4">
                        <h3 className="text-lg font-medium">Restore</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">Upload a JSON backup file directly.</p>
                                <Input
                                    type="file"
                                    accept=".json"
                                    onChange={handleFileUpload}
                                    className="cursor-pointer"
                                />
                            </div>

                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">Or paste JSON content here:</p>
                                <Textarea
                                    placeholder="Paste JSON here..."
                                    value={jsonInput}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setJsonInput(e.target.value)}
                                    className="font-mono text-xs h-[150px]"
                                />
                                <Button onClick={handleImport} variant="secondary" className="w-full gap-2">
                                    <Upload className="h-4 w-4" /> Import JSON Text
                                </Button>
                            </div>
                        </div>
                    </div>

                </CardContent>
            </Card>

            <Card className="border-destructive/50">
                <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                    <Button variant="destructive" onClick={() => {
                        if (confirm("Are you sure you want to clear all data? This cannot be undone.")) {
                            localStorage.removeItem('finance-storage');
                            window.location.reload();
                        }
                    }}>
                        <Trash className="h-4 w-4 mr-2" /> Reset All Data
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

// Minimal Input wrapper if component not found, but we created it.
// Minimal Textarea wrapper
function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <label className="block">
            <input className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props} />
        </label>
    )
}
