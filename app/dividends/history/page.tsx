"use client";

import { DividendHistory } from "@/components/dividends/DividendHistory";

export default function DividendHistoryPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dividend History</h1>
                <p className="text-muted-foreground">
                    연도별 배당금 비교 및 통계 분석
                </p>
            </div>
            <DividendHistory />
        </div>
    );
}
