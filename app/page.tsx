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
  Calendar,
  BarChart3,
  Percent,
  Target,
  Zap,
  Activity,
  BookOpen,
  LogIn,
  Sparkles,
} from "lucide-react";
import { useMemo } from "react";

export default function Home() {
  const { portfolio, simSettings, history } = useFinanceStore();
  const { user } = useAuth();

  // Portfolio calculations
  const totalAssets = portfolio.reduce((acc, item) => acc + (item.quantity * item.currentPrice), 0);
  const totalSimAssets = simSettings.accounts.reduce((acc, accItem) => acc + accItem.balance, 0);

  // Annual dividend calculation (current year)
  const currentYear = new Date().getFullYear();
  const annualDividend = useMemo(() => {
    return portfolio.reduce((sum, item) => {
      const yearData = item.yearlyDividends?.[currentYear] || Array(12).fill(0);
      return sum + yearData.reduce((a, b) => a + b, 0);
    }, 0);
  }, [portfolio, currentYear]);

  // Dividend yield
  const dividendYield = totalAssets > 0 ? (annualDividend / totalAssets) * 100 : 0;

  // Next month dividend
  const currentMonth = new Date().getMonth();
  const nextMonthDividend = portfolio.reduce((sum, item) => {
    const yearData = item.yearlyDividends?.[currentYear] || Array(12).fill(0);
    return sum + (yearData[currentMonth] || 0);
  }, 0);

  // Recent history
  const recentHistory = useMemo(() => {
    return history.slice(-3).reverse();
  }, [history]);

  // Quick stats
  const stats = [
    {
      title: "Dividend Portfolio (배당 포트폴리오)",
      value: new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(totalAssets),
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
      value: new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(totalSimAssets),
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
      value: new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(annualDividend),
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

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            {user ? `안녕하세요, ${user.user_metadata?.full_name || user.email?.split('@')[0]}님` : "환영합니다! 로그인하여 시작하세요"}
          </p>
        </div>
        {!user && (
          <Link href="/login">
            <Button className="gap-2">
              <LogIn className="h-4 w-4" />
              로그인
            </Button>
          </Link>
        )}
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className={`relative overflow-hidden bg-gradient-to-br ${stat.color} border-l-4 ${stat.borderColor} hover:shadow-lg hover:shadow-${stat.borderColor}/20 transition-all duration-300 hover:scale-105`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.iconColor}`}>
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.subtitle}
              </p>
              <Button asChild variant="link" className={`px-0 ${stat.iconColor} hover:${stat.iconColor}/80`}>
                <Link href={stat.link} className="flex items-center gap-1 text-xs mt-2">
                  {stat.linkText} <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </CardContent>
            <div className="absolute -right-6 -bottom-6 opacity-10">
              <stat.icon className="h-24 w-24" />
            </div>
          </Card>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Contribution (월 불입금)
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {formatCurrency(simSettings.monthlyContribution)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              매월 정기 투자금
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Next Month Dividend (다음달 배당)
            </CardTitle>
            <Calendar className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-400">
              {formatCurrency(nextMonthDividend)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {currentMonth + 2}월 예상 배당금
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Target Period (목표 기간)
            </CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              {simSettings.endYear - simSettings.startYear}년
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {simSettings.startYear} - {simSettings.endYear}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Welcome Card */}
        <Card className="col-span-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-yellow-500" />
              <CardTitle className="text-2xl">FinDash에 오신 것을 환영합니다!</CardTitle>
            </div>
            <CardDescription className="text-base">
              개인 자산 성장과 배당 추적을 위한 통합 대시보드
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user ? (
              <>
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-green-400 font-semibold mb-2">
                    <Activity className="h-5 w-5" />
                    시작하기
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <strong>Dividend Tracker</strong>에서 보유 종목 추가
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <strong>Simulation</strong>에서 장기 목표 설정
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      매월 실제 성과를 기록하여 목표와 비교
                    </li>
                  </ul>
                </div>
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-400 font-semibold mb-2">
                    <Zap className="h-5 w-5" />
                    자동 저장
                  </div>
                  <p className="text-sm text-muted-foreground">
                    모든 데이터는 Supabase에 자동으로 저장됩니다. 다른 기기에서도 로그인하여 동일한 데이터에 접근할 수 있습니다.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold mb-2">
                    <Activity className="h-5 w-5" />
                    샘플 데이터로 체험하기
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      7개 유명 ETF 샘플 데이터 확인
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      2020-2024년 5개년 시뮬레이션 확인
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      모든 기능을 미리 체험해보세요
                    </li>
                  </ul>
                </div>
                <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                  <div className="flex items-center gap-2 text-primary font-semibold mb-2">
                    <LogIn className="h-5 w-5" />
                    로그인하여 시작하기
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    로그인하시면 데이터를 수정하고 저장할 수 있습니다.
                  </p>
                  <Link href="/login">
                    <Button className="w-full gap-2">
                      <LogIn className="h-4 w-4" />
                      Google로 로그인
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-3 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Quick Actions
            </CardTitle>
            <CardDescription>자주 사용하는 기능</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/dividends">
              <Button variant="outline" className="w-full justify-start gap-2 hover:bg-amber-500/10 hover:border-amber-500/50">
                <PieChart className="h-4 w-4 text-amber-500" />
                배당 포트폴리오 관리
              </Button>
            </Link>
            <Link href="/simulation">
              <Button variant="outline" className="w-full justify-start gap-2 hover:bg-blue-500/10 hover:border-blue-500/50">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                자산 시뮬레이션
              </Button>
            </Link>
            <Link href="/dividends/history">
              <Button variant="outline" className="w-full justify-start gap-2 hover:bg-green-500/10 hover:border-green-500/50">
                <BarChart3 className="h-4 w-4 text-green-500" />
                배당 통계 확인
              </Button>
            </Link>
            <Link href="/manual">
              <Button variant="outline" className="w-full justify-start gap-2 hover:bg-purple-500/10 hover:border-purple-500/50">
                <BookOpen className="h-4 w-4 text-purple-500" />
                사용자 매뉴얼
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Overview & Recent Activity */}
      {portfolio.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-amber-500" />
                Top Holdings
              </CardTitle>
              <CardDescription>상위 보유 종목</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {portfolio.slice(0, 5).map((stock, index) => {
                  const value = stock.quantity * stock.currentPrice;
                  const percentage = (value / totalAssets) * 100;
                  return (
                    <div key={stock.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{stock.name}</p>
                          <p className="text-xs text-muted-foreground">{stock.ticker}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(value)}</p>
                        <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {recentHistory.length > 0 && (
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-500" />
                  Recent Performance
                </CardTitle>
                <CardDescription>최근 실제 성과</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentHistory.map((record, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div>
                        <p className="font-medium">{record.date}</p>
                        <p className="text-xs text-muted-foreground">기록된 자산</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-400">{formatCurrency(record.value)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
