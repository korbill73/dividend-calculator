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
} from "lucide-react";
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line, Legend } from "recharts";

export default function Home() {
  const { portfolio, simSettings, history } = useFinanceStore();
  const { user, signOut } = useAuth();

  const totalAssets = portfolio.reduce((acc, item) => acc + (item.quantity * item.currentPrice), 0);
  const totalSimAssets = simSettings.accounts.reduce((acc, accItem) => acc + accItem.balance, 0);

  const currentYear = new Date().getFullYear();
  const annualDividend = useMemo(() => {
    return portfolio.reduce((sum, item) => {
      const yearData = item.yearlyDividends?.[currentYear] || Array(12).fill(0);
      return sum + yearData.reduce((a, b) => a + b, 0);
    }, 0);
  }, [portfolio, currentYear]);

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
        <div className="text-sm">
          <p className="text-slate-200 font-semibold">{label}</p>
          <p className="text-green-400 font-bold">{payload[0].value.toLocaleString()}만원</p>
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

  const stats = [
    {
      title: "Actual Assets (현재 자산)",
      value: formatCurrency(totalAssets),
      subtitle: `${portfolio.length}개 종목 보유`,
      icon: PieChart,
      color: "from-amber-500/20 to-orange-500/20",
      borderColor: "border-amber-500",
      iconColor: "text-amber-500",
      link: "/dividends",
      linkText: "배당 관리"
    },
    {
      title: "Simulation Assets (시뮬레이션 자산)",
      value: formatCurrency(totalSimAssets),
      subtitle: `${simSettings.accounts.length}개 계좌`,
      icon: Wallet,
      color: "from-blue-500/20 to-cyan-500/20",
      borderColor: "border-blue-500",
      iconColor: "text-blue-500",
      link: "/simulation",
      linkText: "시뮬레이션"
    },
    {
      title: "Annual Dividend (연간 배당)",
      value: formatCurrency(annualDividend),
      subtitle: `${currentYear}년 예상`,
      icon: DollarSign,
      color: "from-green-500/20 to-emerald-500/20",
      borderColor: "border-green-500",
      iconColor: "text-green-500",
      link: "/dividends/history",
      linkText: "배당 통계"
    },
    {
      title: "Dividend Yield (배당 수익률)",
      value: `${dividendYield.toFixed(2)}%`,
      subtitle: "연간 실현 수익률",
      icon: Percent,
      color: "from-purple-500/20 to-pink-500/20",
      borderColor: "border-purple-500",
      iconColor: "text-purple-500",
      link: "/dividends",
      linkText: "상세 보기"
    },
  ];

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-blue-400 to-purple-400 bg-clip-text text-transparent">
              FinDash
            </h1>
            <p className="text-[10px] md:text-base text-muted-foreground">
              {user ? `안녕하세요, ${user.user_metadata?.full_name || user.email?.split('@')[0]}님` : "환영합니다!"}
            </p>
          </div>
        </div>
        {user ? (
          <Button 
            onClick={() => signOut()} 
            variant="outline"
            className="gap-2 text-xs md:text-sm h-8 md:h-10 px-3 md:px-4"
          >
            <LogOut className="h-3 w-3 md:h-4 md:w-4" />
            로그아웃
          </Button>
        ) : (
          <Link href="/login">
            <Button className="gap-2 text-xs md:text-sm h-8 md:h-10 px-3 md:px-4">
              <LogIn className="h-3 w-3 md:h-4 md:w-4" />
              로그인
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-2 lg:grid-cols-4 md:gap-4">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className={`relative overflow-hidden bg-gradient-to-br ${stat.color} border-l-4 ${stat.borderColor} hover:shadow-xl hover:scale-[1.02] transition-all duration-300 backdrop-blur-sm`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl ${stat.color} opacity-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-2 md:p-6 relative">
              <CardTitle className="text-[9px] md:text-sm font-medium leading-tight">
                {stat.title}
              </CardTitle>
              <div className={`p-1.5 md:p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                <stat.icon className={`h-3 w-3 md:h-5 md:w-5 ${stat.iconColor} flex-shrink-0`} />
              </div>
            </CardHeader>
            <CardContent className="p-2 pt-0 md:p-6 md:pt-0 relative">
              <div className={`text-sm md:text-2xl font-bold ${stat.iconColor} drop-shadow-sm`}>
                {stat.value}
              </div>
              <p className="text-[9px] md:text-xs text-muted-foreground mt-0.5">
                {stat.subtitle}
              </p>
              <Button asChild variant="link" className={`px-0 ${stat.iconColor} h-auto py-0.5 md:py-2 hover:brightness-125`}>
                <Link href={stat.link} className="flex items-center gap-1 text-[9px] md:text-xs mt-0.5 md:mt-2">
                  {stat.linkText} <ArrowRight className="h-2 w-2 md:h-3 md:w-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 shadow-lg shadow-green-500/5 backdrop-blur-sm">
        <CardHeader className="p-3 md:p-6">
          <CardTitle className="flex items-center gap-2 text-sm md:text-lg">
            <div className="p-1.5 rounded-lg bg-green-500/10">
              <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
            </div>
            <span>최근 1년 월별 배당금</span>
            <span className="text-xs text-muted-foreground font-normal">(단위: 만원)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 md:p-6 pt-0">
          <div className="h-[180px] md:h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last12MonthsDividends}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 계좌별 잔고 표시 */}
      <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 shadow-lg shadow-cyan-500/5 backdrop-blur-sm">
        <CardHeader className="p-3 md:p-6">
          <CardTitle className="flex items-center gap-2 text-sm md:text-lg">
            <div className="p-1.5 rounded-lg bg-cyan-500/10">
              <Wallet className="h-4 w-4 md:h-5 md:w-5 text-cyan-500" />
            </div>
            <span>계좌별 잔고 현황</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 md:p-6 pt-0">
          <div className="space-y-2">
            {simSettings.accounts.map((acc, idx) => (
              <div key={idx} className="flex justify-between items-center bg-slate-800/50 rounded-lg p-2 md:p-3">
                <span className="text-xs md:text-sm text-slate-300">{acc.name}</span>
                <span className="text-sm md:text-base font-bold text-cyan-400">{formatCurrency(acc.balance)}</span>
              </div>
            ))}
            <div className="flex justify-between items-center border-t border-slate-700 pt-2 mt-2">
              <span className="text-sm md:text-base font-medium">총 합계</span>
              <span className="text-base md:text-xl font-bold text-blue-400">{formatCurrency(totalSimAssets)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 shadow-lg shadow-blue-500/5 backdrop-blur-sm">
        <CardHeader className="p-3 md:p-6">
          <CardTitle className="flex items-center gap-2 text-sm md:text-lg">
            <div className="p-1.5 rounded-lg bg-blue-500/10">
              <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
            </div>
            <span>시뮬레이션 자산 예상</span>
            <span className="text-xs text-muted-foreground font-normal">(10/20/30년)</span>
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
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
          <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 shadow-lg shadow-green-500/5 backdrop-blur-sm">
            <CardHeader className="p-3 md:p-6">
              <CardTitle className="flex items-center gap-2 text-sm md:text-lg">
                <div className="p-1.5 rounded-lg bg-green-500/10">
                  <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
                </div>
                <span>{currentYear}년 배당 Top 10</span>
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

          <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 shadow-lg shadow-amber-500/5 backdrop-blur-sm">
            <CardHeader className="p-3 md:p-6">
              <CardTitle className="flex items-center gap-2 text-sm md:text-lg">
                <div className="p-1.5 rounded-lg bg-amber-500/10">
                  <PieChart className="h-4 w-4 md:h-5 md:w-5 text-amber-500" />
                </div>
                <span>{currentYear}년 투자 Top 10</span>
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

      <div className="border-t border-slate-700 pt-4 space-y-3">
        <Link href="/manual" className="flex items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors">
          <BookOpen className="h-4 w-4" />
          <span className="text-sm">사용자 매뉴얼 보기</span>
        </Link>
        <div className="flex items-center justify-center gap-2 text-[10px] md:text-xs text-muted-foreground/60">
          <Shield className="h-3 w-3" />
          <span>로그인 시 Google 계정의 이메일 주소와 이름만 수집됩니다</span>
        </div>
      </div>
    </div>
  );
}
