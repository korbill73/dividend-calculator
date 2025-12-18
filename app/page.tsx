"use client";

import { useFinanceStore } from "@/store/useFinanceStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, TrendingUp, PieChart, Wallet } from "lucide-react";

export default function Home() {
  const { portfolio, simSettings } = useFinanceStore();

  const totalAssets = portfolio.reduce((acc, item) => acc + (item.quantity * item.currentPrice), 0);
  const totalSimAssets = simSettings.accounts.reduce((acc, accItem) => acc + accItem.balance, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Dashboard (대시보드)</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">
              Dividend Portfolio Value (배당 포트폴리오 가치)
            </CardTitle>
            <PieChart className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(totalAssets)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Active Holdings (보유 종목)
            </p>
            <Button asChild variant="link" className="px-0 text-yellow-500 hover:text-yellow-400">
              <Link href="/dividends" className="flex items-center gap-1">
                Manage Dividends (배당 관리) <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">
              Total Simulated Assets (시뮬레이션 총 자산)
            </CardTitle>
            <Wallet className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(totalSimAssets)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Across all accounts (Start Balance) (전계좌 시작 잔액)
            </p>
            <Button asChild variant="link" className="px-0 text-blue-400 hover:text-blue-300">
              <Link href="/simulation" className="flex items-center gap-1">
                View Projection (예측 보기) <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">
              Monthly Contribution (월 추가 불입금)
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(simSettings.monthlyContribution)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Target Savings / Month (월 목표 저축액)
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Quick Shortcuts or recent activity could go here */}
        <Card className="col-span-4 bg-card/50">
          <CardHeader>
            <CardTitle>Welcome to FinDash</CardTitle>
            <CardDescription>
              Your personal command center for asset growth and dividend tracking.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Start by adding your stocks in the <strong>Dividend Tracker</strong> or configure your asset inputs in the <strong>Simulation</strong> tab.
            </p>
            <p className="text-sm text-muted-foreground">
              Your data is automatically saved to your local browser storage. Use the <strong>Settings</strong> to backup your data.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
