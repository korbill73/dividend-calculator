"use client";

import { useFinanceStore } from "@/store/useFinanceStore";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowRight,
  TrendingUp,
  PieChart,
  Wallet,
  DollarSign,
  BarChart3,
  Percent,
  BookOpen,
  LogIn,
  LogOut,
  Sparkles,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line, Legend } from "recharts";

export default function Home() {
  const { portfolio, simSettings, history } = useFinanceStore();
  const { user, signOut } = useAuth();
  const [selectedAccountForChart, setSelectedAccountForChart] = useState<string>("전체");

  const totalAssets = portfolio.reduce((acc, item) => acc + (item.quantity * item.currentPrice), 0);
  const totalSimAssets = simSettings.accounts.reduce((acc, accItem) => acc + accItem.balance, 0);

  const currentYear = new Date().getFullYear();
  const annualDividend = useMemo(() => {
    return portfolio.reduce((sum, item) => {
      const yearData = item.yearlyDividends?.[currentYear] || Array(12).fill(0);
      return sum + yearData.reduce((a, b) => a + b, 0);
    }, 0);
  }, [portfolio, currentYear]);

  const cumulativeDividend = useMemo(() => {
    return portfolio.reduce((sum, item) => {
      if (!item.yearlyDividends) return sum;
      return sum + Object.values(item.yearlyDividends).reduce((yearSum, yearData) => {
        return yearSum + (yearData as number[]).reduce((a, b) => a + b, 0);
      }, 0);
    }, 0);
  }, [portfolio]);

  const dividendYield = totalAssets > 0 ? (annualDividend / totalAssets) * 100 : 0;

  const last12MonthsDividends = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const monthTotal = portfolio.reduce((sum, item) => {
        const yearData = item.yearlyDividends?.[year] || Array(12).fill(0);
        return sum + (yearData[month] || 0);
      }, 0);
      months.push({
        name: `${month + 1}월`,
        value: Math.round(monthTotal / 10000),
      });
    }
    return months;
  }, [portfolio]);

  const dividendRankingData = useMemo(() => {
    return portfolio
      .map(item => {
        const yearData = item.yearlyDividends?.[currentYear] || Array(12).fill(0);
        const totalDividend = yearData.reduce((a, b) => a + b, 0);
        return {
          name: item.name.length > 8 ? item.name.slice(0, 8) + '...' : item.name,
          fullName: item.name,
          value: totalDividend,
          displayValue: Math.round(totalDividend / 10000),
        };
      })
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [portfolio, currentYear]);

  const simulationProjections = useMemo(() => {
    const { conservative, moderate, aggressive } = simSettings.scenarios;
    const calculate = (rate: number, years: number) => {
      let balance = totalSimAssets;
      const monthly = simSettings.monthlyContribution;
      const monthlyRate = Math.pow(1 + rate / 100, 1 / 12) - 1;
      for (let m = 0; m < years * 12; m++) {
        balance = balance * (1 + monthlyRate) + monthly;
      }
      return Math.round(balance);
    };

    const projections = [10, 20, 30].map(years => ({
      years,
      conservative: calculate(conservative, years),
      moderate: calculate(moderate, years),
      aggressive: calculate(aggressive, years),
    }));

    const chartData = [];
    for (let y = 0; y <= 30; y += 5) {
      chartData.push({
        year: `${y}년`,
        conservative: Math.round(calculate(conservative, y) / 10000),
        moderate: Math.round(calculate(moderate, y) / 10000),
        aggressive: Math.round(calculate(aggressive, y) / 10000),
      });
    }

    return { projections, chartData };
  }, [totalSimAssets, simSettings]);

  const latestAccountBalances = useMemo(() => {
    const sortedHistory = [...history].sort((a, b) => {
      return b.date.localeCompare(a.date);
    });
    const latestWithAccountValues = sortedHistory.find(h => h.accountValues && Object.keys(h.accountValues).length > 0);
    return latestWithAccountValues?.accountValues || {};
  }, [history]);

  const totalCurrentBalance = useMemo(() => {
    let total = 0;
    for (const acc of simSettings.accounts) {
      const currentBalance = latestAccountBalances[acc.name] ?? acc.balance;
      total += currentBalance;
    }
    return total;
  }, [simSettings.accounts, latestAccountBalances]);

  const accountTrendChartData = useMemo(() => {
    const historyWithAccountValues = history.filter(h => h.accountValues && Object.keys(h.accountValues).length > 0);
    const sortedHistory = [...historyWithAccountValues].sort((a, b) => a.date.localeCompare(b.date));
    
    return sortedHistory.map(h => {
      const [year, month] = h.date.split('-');
      const dataPoint: { [key: string]: string | number } = {
        name: `${year.slice(2)}.${month}`,
      };
      
      if (selectedAccountForChart === "전체") {
        let total = 0;
        for (const acc of simSettings.accounts) {
          const val = h.accountValues?.[acc.name] ?? 0;
          dataPoint[acc.name] = Math.round(val / 10000);
          total += val;
        }
        dataPoint["합계"] = Math.round(total / 10000);
      } else {
        dataPoint[selectedAccountForChart] = Math.round((h.accountValues?.[selectedAccountForChart] ?? 0) / 10000);
      }
      
      return dataPoint;
    });
  }, [history, selectedAccountForChart, simSettings.accounts]);

  const accountColors = useMemo(() => {
    const colors = ['#22d3ee', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#22c55e'];
    const colorMap: { [key: string]: string } = {};
    simSettings.accounts.forEach((acc, idx) => {
      colorMap[acc.name] = colors[idx % colors.length];
    });
    colorMap["합계"] = '#60a5fa';
    return colorMap;
  }, [simSettings.accounts]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(val);
  };

  const formatMan = (val: number) => {
    return `${val.toLocaleString()}만원`;
  };

  const formatEok = (val: number) => {
    const eok = val / 100000000;
    if (eok >= 1) {
      return `${eok.toFixed(1)}억`;
    }
    return `${Math.round(val / 10000).toLocaleString()}만원`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="text-sm bg-slate-900/95 border border-amber-500/20 rounded-lg px-3 py-2 shadow-lg">
          <p className="text-slate-200 font-semibold">{label}</p>
          <p className="text-amber-400 font-bold">{payload[0].value.toLocaleString()}만원</p>
        </div>
      );
    }
    return null;
  };

  const SimLineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="text-sm space-y-1">
          <p className="text-slate-200 font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="font-bold">
              {entry.name}: {Number(entry.value).toLocaleString()}만원
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500">
      {/* Premium Header Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/20 shadow-2xl shadow-amber-500/10 p-4 md:p-6">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-amber-500/5" />
        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <img src="/logo-gold.png" alt="Findash" className="w-24 h-24 md:w-36 md:h-36 object-contain drop-shadow-lg" />
            <div>
              <h1 className="text-xl md:text-3xl font-bold tracking-tight text-amber-400 drop-shadow-sm">
                Findash Dashboard
              </h1>
              <p className="text-[10px] md:text-sm text-slate-400">
                {user ? `안녕하세요, ${user.user_metadata?.full_name || user.email?.split('@')[0]}님` : "환영합니다!"}
              </p>
            </div>
          </div>
          {user ? (
            <Button 
              onClick={() => signOut()} 
              variant="outline"
              className="gap-2 text-xs md:text-sm h-8 md:h-10 px-3 md:px-4 border-amber-500/30 hover:bg-amber-500/10 hover:border-amber-500/50"
            >
              <LogOut className="h-3 w-3 md:h-4 md:w-4" />
              로그아웃
            </Button>
          ) : (
            <Link href="/login">
              <Button className="gap-2 text-xs md:text-sm h-8 md:h-10 px-3 md:px-4 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-900 font-semibold shadow-lg shadow-amber-500/25">
                <LogIn className="h-3 w-3 md:h-4 md:w-4" />
                로그인
              </Button>
            </Link>
          )}
        </div>

        {/* Total Balance Display */}
        <div className="relative mt-4 md:mt-6 pt-4 md:pt-6 border-t border-amber-500/20">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
            <div>
              <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider mb-1">총 자산 현황</p>
              <div className="text-2xl md:text-4xl font-bold text-amber-400">
                {formatCurrency(totalCurrentBalance)}
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] md:text-xs text-slate-400">
              <Shield className="h-3 w-3 md:h-4 md:w-4 text-amber-500" />
              <span>시뮬레이션 기준 최신 잔고</span>
            </div>
          </div>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/10 shadow-lg shadow-amber-500/5 backdrop-blur-sm">
        <CardHeader className="p-3 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-sm md:text-lg">
              <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-amber-500" />
              </div>
              <span className="text-slate-200">최근 1년 월별 배당금</span>
              <span className="text-xs text-slate-500 font-normal">(단위: 만원)</span>
            </CardTitle>
            <div className="flex items-center gap-3 md:gap-4">
              <div className="flex items-center gap-1.5">
                <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-green-400" />
                <span className="text-[10px] md:text-xs text-slate-400">올해</span>
                <span className="text-xs md:text-sm font-bold text-green-400">{formatCurrency(annualDividend)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-cyan-400" />
                <span className="text-[10px] md:text-xs text-slate-400">누적</span>
                <span className="text-xs md:text-sm font-bold text-cyan-400">{formatCurrency(cumulativeDividend)}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2 md:p-6 pt-0">
          <div className="h-[180px] md:h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last12MonthsDividends}>
                <defs>
                  <linearGradient id="dashboardBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(251, 191, 36, 0.1)' }} />
                <Bar dataKey="value" fill="url(#dashboardBarGradient)" radius={[8, 8, 0, 0]} maxBarSize={60} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 종목별 배당 랭킹 */}
      {dividendRankingData.length > 0 && (
        <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/10 shadow-lg shadow-amber-500/5 backdrop-blur-sm">
          <CardHeader className="p-3 md:p-6">
            <CardTitle className="flex items-center gap-2 text-sm md:text-lg">
              <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <PieChart className="h-4 w-4 md:h-5 md:w-5 text-amber-500" />
              </div>
              <span className="text-slate-200">{currentYear}년 종목별 배당 랭킹</span>
              <span className="text-xs text-slate-500 font-normal">(단위: 만원)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 md:p-6 pt-0">
            <div className="h-[200px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dividendRankingData} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <defs>
                    <linearGradient id="rankingBarGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={70} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(34, 197, 94, 0.1)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="text-sm bg-slate-900/95 border border-green-500/20 rounded-lg px-3 py-2 shadow-lg">
                            <p className="text-slate-200 font-semibold">{data.fullName}</p>
                            <p className="text-green-400 font-bold">{formatCurrency(data.value)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="displayValue" fill="url(#rankingBarGradient)" radius={[0, 8, 8, 0]} maxBarSize={30} animationDuration={800} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 계좌별 잔고 표시 */}
      <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/10 shadow-lg shadow-amber-500/5 backdrop-blur-sm">
        <CardHeader className="p-3 md:p-6">
          <CardTitle className="flex items-center gap-2 text-sm md:text-lg">
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Wallet className="h-4 w-4 md:h-5 md:w-5 text-amber-500" />
            </div>
            <span className="text-slate-200">계좌별 잔고 현황</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 md:p-6 pt-0">
          <div className="space-y-2">
            <div className="hidden md:grid md:grid-cols-4 gap-2 text-xs text-muted-foreground mb-2 px-3">
              <span>계좌명</span>
              <span className="text-right">초기 잔고</span>
              <span className="text-right">현재 잔고</span>
              <span className="text-right">증감</span>
            </div>
            {simSettings.accounts.map((acc, idx) => {
              const initialBalance = acc.balance;
              const currentBalance = latestAccountBalances[acc.name] ?? initialBalance;
              const change = currentBalance - initialBalance;
              const hasChange = Object.keys(latestAccountBalances).length > 0;
              return (
                <div key={idx} className="bg-slate-800/50 rounded-lg p-2 md:p-3">
                  <div className="md:hidden space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-300">{acc.name}</span>
                      <span className="text-sm font-bold text-amber-400">{formatCurrency(currentBalance)}</span>
                    </div>
                    {hasChange && change !== 0 && (
                      <div className="flex justify-end items-center gap-1">
                        {change > 0 ? (
                          <ArrowUpRight className="h-3 w-3 text-green-400" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 text-red-400" />
                        )}
                        <span className={`text-[10px] ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {change > 0 ? '+' : ''}{formatCurrency(change)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="hidden md:grid md:grid-cols-4 gap-2 items-center">
                    <span className="text-sm text-slate-300">{acc.name}</span>
                    <span className="text-sm text-right text-slate-400">{formatCurrency(initialBalance)}</span>
                    <span className="text-sm text-right font-bold text-amber-400">{formatCurrency(currentBalance)}</span>
                    <div className="flex justify-end items-center gap-1">
                      {hasChange && change !== 0 ? (
                        <>
                          {change > 0 ? (
                            <ArrowUpRight className="h-4 w-4 text-green-400" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-red-400" />
                          )}
                          <span className={`text-sm font-medium ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {change > 0 ? '+' : ''}{formatCurrency(change)}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm text-slate-500">-</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 items-center border-t border-slate-700 pt-2 mt-2 px-2 md:px-3">
              <span className="text-sm md:text-base font-medium">총 합계</span>
              <span className="hidden md:block text-sm text-right text-slate-400">{formatCurrency(totalSimAssets)}</span>
              <span className="text-base md:text-xl font-bold text-amber-400 text-right md:text-right">{formatCurrency(totalCurrentBalance)}</span>
              <div className="hidden md:flex justify-end items-center gap-1">
                {(() => {
                  const totalChange = totalCurrentBalance - totalSimAssets;
                  const hasChange = Object.keys(latestAccountBalances).length > 0;
                  if (hasChange && totalChange !== 0) {
                    return (
                      <>
                        {totalChange > 0 ? (
                          <ArrowUpRight className="h-4 w-4 text-green-400" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-400" />
                        )}
                        <span className={`text-sm font-medium ${totalChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {totalChange > 0 ? '+' : ''}{formatCurrency(totalChange)}
                        </span>
                      </>
                    );
                  }
                  return <span className="text-sm text-slate-500">-</span>;
                })()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 계좌별 월별 변동추이 그래프 */}
      {accountTrendChartData.length > 0 && (
        <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/10 shadow-lg shadow-amber-500/5 backdrop-blur-sm">
          <CardHeader className="p-3 md:p-6">
            <CardTitle className="flex items-center gap-2 text-sm md:text-lg">
              <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-amber-500" />
              </div>
              <span className="text-slate-200">계좌별 월별 변동추이</span>
              <span className="text-xs text-slate-500 font-normal">(단위: 만원)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 md:p-6 pt-0 space-y-3">
            <div className="flex flex-wrap gap-1 md:gap-2">
              <Button
                size="sm"
                variant={selectedAccountForChart === "전체" ? "default" : "outline"}
                onClick={() => setSelectedAccountForChart("전체")}
                className="h-7 text-xs px-2 md:px-3"
              >
                전체
              </Button>
              {simSettings.accounts.map((acc) => (
                <Button
                  key={acc.name}
                  size="sm"
                  variant={selectedAccountForChart === acc.name ? "default" : "outline"}
                  onClick={() => setSelectedAccountForChart(acc.name)}
                  className="h-7 text-xs px-2 md:px-3"
                >
                  {acc.name}
                </Button>
              ))}
            </div>
            <div className="h-[200px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={accountTrendChartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={(v) => v >= 10000 ? `${(v/10000).toFixed(1)}억` : `${v}만`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                    labelStyle={{ color: '#e2e8f0' }}
                    cursor={{ strokeDasharray: '3 3' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  {selectedAccountForChart === "전체" ? (
                    <>
                      {simSettings.accounts.map((acc) => (
                        <Line
                          key={acc.name}
                          type="monotone"
                          dataKey={acc.name}
                          stroke={accountColors[acc.name]}
                          strokeWidth={1.5}
                          dot={false}
                          strokeOpacity={0.7}
                        />
                      ))}
                      <Line
                        key="합계"
                        type="monotone"
                        dataKey="합계"
                        stroke={accountColors["합계"]}
                        strokeWidth={3}
                        dot={false}
                        name="합계"
                      />
                    </>
                  ) : (
                    <Line
                      type="monotone"
                      dataKey={selectedAccountForChart}
                      stroke={accountColors[selectedAccountForChart]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/10 shadow-lg shadow-amber-500/5 backdrop-blur-sm">
        <CardHeader className="p-3 md:p-6">
          <CardTitle className="flex items-center gap-2 text-sm md:text-lg">
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-amber-500" />
            </div>
            <span className="text-slate-200">시뮬레이션 자산 예상</span>
            <span className="text-xs text-slate-500 font-normal">(10/20/30년)</span>
          </CardTitle>
          <CardDescription className="text-xs md:text-sm text-slate-400">
            현재 자산 {formatCurrency(totalSimAssets)} + 월 {formatCurrency(simSettings.monthlyContribution)} 적립 기준
          </CardDescription>
        </CardHeader>
        <CardContent className="p-2 md:p-6 pt-0 space-y-4">
          <div className="grid grid-cols-3 gap-2 md:gap-4">
            {simulationProjections.projections.map((p) => (
              <div key={p.years} className="bg-slate-800/50 rounded-lg p-2 md:p-4 text-center">
                <div className="text-xs md:text-sm text-muted-foreground mb-1">
                  {p.years}년 후 <span className="text-primary">({currentYear + p.years}년)</span>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] md:text-xs">
                    <span className="text-blue-400">보수적:</span>
                    <span className="font-bold ml-1">{formatEok(p.conservative)}</span>
                  </div>
                  <div className="text-[10px] md:text-xs">
                    <span className="text-green-400">중립적:</span>
                    <span className="font-bold ml-1">{formatEok(p.moderate)}</span>
                  </div>
                  <div className="text-[10px] md:text-xs">
                    <span className="text-orange-400">공격적:</span>
                    <span className="font-bold ml-1">{formatEok(p.aggressive)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="h-[180px] md:h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={simulationProjections.chartData}>
                <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={(v) => v >= 10000 ? `${(v/10000).toFixed(1)}억` : `${v}만`} />
                <Tooltip content={<SimLineTooltip />} cursor={false} wrapperStyle={{ outline: 'none' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="conservative" stroke="#3b82f6" name="보수적" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="moderate" stroke="#22c55e" name="중립적" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="aggressive" stroke="#f97316" name="공격적" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {portfolio.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/10 shadow-lg shadow-amber-500/5 backdrop-blur-sm">
            <CardHeader className="p-3 md:p-6">
              <CardTitle className="flex items-center gap-2 text-sm md:text-lg">
                <div className="p-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                  <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
                </div>
                <span className="text-slate-200">{currentYear}년 배당 Top 10</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 md:p-6 pt-0">
              <div className="space-y-1.5">
                {[...portfolio]
                  .map(stock => {
                    const yearDividend = (stock.yearlyDividends?.[currentYear] || Array(12).fill(0)).reduce((a: number, b: number) => a + b, 0);
                    return { ...stock, yearDividend };
                  })
                  .sort((a, b) => b.yearDividend - a.yearDividend)
                  .slice(0, 10)
                  .map((stock, index) => {
                    const percentage = annualDividend > 0 ? (stock.yearDividend / annualDividend) * 100 : 0;
                    return (
                      <div key={stock.id} className="flex items-center justify-between p-1.5 md:p-2 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 font-bold text-[10px] md:text-xs">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-[10px] md:text-xs truncate">{stock.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-[10px] md:text-xs text-green-400">{formatCurrency(stock.yearDividend)}</p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/10 shadow-lg shadow-amber-500/5 backdrop-blur-sm">
            <CardHeader className="p-3 md:p-6">
              <CardTitle className="flex items-center gap-2 text-sm md:text-lg">
                <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <PieChart className="h-4 w-4 md:h-5 md:w-5 text-amber-500" />
                </div>
                <span className="text-slate-200">{currentYear}년 투자 Top 10</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 md:p-6 pt-0">
              <div className="space-y-1.5">
                {[...portfolio]
                  .map(stock => ({
                    ...stock,
                    totalValue: stock.quantity * stock.currentPrice
                  }))
                  .sort((a, b) => b.totalValue - a.totalValue)
                  .slice(0, 10)
                  .map((stock, index) => {
                    const percentage = totalAssets > 0 ? (stock.totalValue / totalAssets) * 100 : 0;
                    return (
                      <div key={stock.id} className="flex items-center justify-between p-1.5 md:p-2 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold text-[10px] md:text-xs">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-[10px] md:text-xs truncate">{stock.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-[10px] md:text-xs text-amber-400">{formatCurrency(stock.totalValue)}</p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="border-t border-amber-500/10 pt-4 space-y-3">
        <Link href="/manual" className="flex items-center justify-center gap-2 text-slate-400 hover:text-amber-400 transition-colors">
          <BookOpen className="h-4 w-4" />
          <span className="text-sm">사용자 매뉴얼 보기</span>
        </Link>
        <div className="flex items-center justify-center gap-2 text-[10px] md:text-xs text-slate-500">
          <Shield className="h-3 w-3" />
          <span>로그인 시 Google 계정의 이메일 주소와 이름만 수집됩니다</span>
        </div>
      </div>
    </div>
  );
}
