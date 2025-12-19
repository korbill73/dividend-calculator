"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Download, FileText, HelpCircle, Shield, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function ManualPage() {
    const sections = [
        {
            title: "시작하기",
            icon: BookOpen,
            items: [
                { title: "개요 및 주요 기능", href: "#overview" },
                { title: "비로그인 vs 로그인 사용자", href: "#users" },
                { title: "첫 시작 가이드", href: "#getting-started" },
            ]
        },
        {
            title: "배당 포트폴리오 관리",
            icon: TrendingUp,
            items: [
                { title: "포트폴리오 개요", href: "#portfolio-overview" },
                { title: "종목 추가/수정/삭제", href: "#manage-stocks" },
                { title: "배당 매트릭스 사용법", href: "#dividend-matrix" },
                { title: "연도별 데이터 관리", href: "#yearly-data" },
            ]
        },
        {
            title: "자산 시뮬레이션",
            icon: TrendingUp,
            items: [
                { title: "시뮬레이션 개요", href: "#simulation-overview" },
                { title: "설정 패널", href: "#settings-panel" },
                { title: "그래프 분석", href: "#chart-analysis" },
                { title: "실제 성과 입력", href: "#actual-performance" },
            ]
        },
        {
            title: "데이터 관리",
            icon: Shield,
            items: [
                { title: "자동 저장 및 동기화", href: "#auto-save" },
                { title: "데이터 백업", href: "#backup" },
                { title: "데이터 복원", href: "#restore" },
            ]
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">사용자 매뉴얼</h1>
                    <p className="text-muted-foreground mt-2">
                        FinDash 사용 방법을 단계별로 안내합니다
                    </p>
                </div>
                <Link
                    href="/USER_MANUAL.md"
                    download
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <Download className="h-4 w-4" />
                    상세 매뉴얼 다운로드
                </Link>
            </div>

            {/* Quick Start Guide */}
            <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-lg">
                            <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle>빠른 시작 가이드</CardTitle>
                            <CardDescription>FinDash를 처음 사용하시나요?</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 bg-card rounded-lg border">
                            <h3 className="font-semibold mb-2">🎯 비로그인 사용자</h3>
                            <ul className="text-sm space-y-1 text-muted-foreground">
                                <li>✅ 샘플 데이터로 기능 체험</li>
                                <li>✅ 7개 유명 ETF 데이터 확인</li>
                                <li>✅ 5개년 시뮬레이션 확인</li>
                                <li>❌ 데이터 수정 불가</li>
                            </ul>
                        </div>
                        <div className="p-4 bg-card rounded-lg border border-primary/50">
                            <h3 className="font-semibold mb-2">🔐 로그인 사용자</h3>
                            <ul className="text-sm space-y-1 text-muted-foreground">
                                <li>✅ 모든 데이터 수정 가능</li>
                                <li>✅ 종목 추가/삭제</li>
                                <li>✅ 자동 저장 및 동기화</li>
                                <li>✅ 여러 기기에서 사용</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Main Sections */}
            <div className="grid md:grid-cols-2 gap-6">
                {sections.map((section) => (
                    <Card key={section.title}>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <section.icon className="h-5 w-5 text-primary" />
                                </div>
                                <CardTitle className="text-lg">{section.title}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {section.items.map((item) => (
                                    <li key={item.title}>
                                        <a
                                            href={item.href}
                                            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                                            {item.title}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Detailed Sections */}
            <div className="space-y-8 mt-8">
                {/* Overview */}
                <section id="overview" className="scroll-mt-20">
                    <Card>
                        <CardHeader>
                            <CardTitle>📝 개요</CardTitle>
                            <CardDescription>FinDash는 개인 투자자를 위한 통합 자산 관리 플랫폼입니다</CardDescription>
                        </CardHeader>
                        <CardContent className="prose prose-invert max-w-none">
                            <h3>주요 기능</h3>
                            <ul>
                                <li><strong>배당 포트폴리오 관리</strong>: 월별 배당금 추적 및 시각화</li>
                                <li><strong>자산 성장 시뮬레이션</strong>: 다양한 수익률 시나리오 비교</li>
                                <li><strong>데이터 백업</strong>: 로그인 시 자동 저장 및 동기화</li>
                                <li><strong>상세한 분석</strong>: 배당 수익률, 총 자산, 연간 배당 등</li>
                            </ul>
                        </CardContent>
                    </Card>
                </section>

                {/* Users */}
                <section id="users" className="scroll-mt-20">
                    <Card>
                        <CardHeader>
                            <CardTitle>👥 사용자 유형</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="font-semibold text-lg mb-3">비로그인 사용자 (샘플 모드)</h3>
                                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                                    <p className="text-sm"><strong>샘플 데이터:</strong></p>
                                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                                        <li>• JEPI, JEPQ, XYLD, QYLD, DIVO, SCHD, RYLD (7개 ETF)</li>
                                        <li>• 2020-2024년 5개년 월별 배당금 데이터</li>
                                        <li>• 5천만원 시작, 월 100만원 투자 시뮬레이션</li>
                                    </ul>
                                    <p className="text-sm text-amber-500 mt-3">⚠️ 모든 데이터는 조회만 가능하며 수정할 수 없습니다</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-3">로그인 사용자</h3>
                                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                                    <p className="text-sm mb-2"><strong>모든 기능 사용 가능:</strong></p>
                                    <ul className="text-sm space-y-1 ml-4">
                                        <li>✅ 종목 추가/수정/삭제</li>
                                        <li>✅ 시뮬레이션 설정 변경</li>
                                        <li>✅ 실제 성과 데이터 입력</li>
                                        <li>✅ Supabase 클라우드 자동 저장</li>
                                        <li>✅ 여러 기기에서 동기화</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Portfolio Management */}
                <section id="manage-stocks" className="scroll-mt-20">
                    <Card>
                        <CardHeader>
                            <CardTitle>💼 종목 관리</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold mb-2">종목 추가하기 (로그인 필요)</h4>
                                <ol className="text-sm space-y-2 ml-4">
                                    <li>1. <strong>Add Stock (종목 추가)</strong> 버튼 클릭</li>
                                    <li>2. 종목 정보 입력:
                                        <ul className="ml-4 mt-1 text-muted-foreground">
                                            <li>• 종목명: ETF/주식 이름</li>
                                            <li>• 수량: 보유 주식 수</li>
                                            <li>• 가격: 현재 주가</li>
                                            <li>• 배당일: 월 배당일 (1-31)</li>
                                            <li>• 수익률: 배당 수익률 (%)</li>
                                        </ul>
                                    </li>
                                    <li>3. 월별 배당금 입력 (각 월 셀 클릭)</li>
                                </ol>
                            </div>
                            <div className="bg-muted/50 p-4 rounded-lg">
                                <h4 className="font-semibold mb-2">💡 팁</h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>• 배당금은 쉼표 없이 숫자만 입력하세요 (예: 450000)</li>
                                    <li>• 입력 즉시 총액이 자동 계산됩니다</li>
                                    <li>• ← → 버튼으로 연도를 이동할 수 있습니다</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Simulation */}
                <section id="simulation-overview" className="scroll-mt-20">
                    <Card>
                        <CardHeader>
                            <CardTitle>📊 시뮬레이션 사용법</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold mb-2">목표 수익률 설정</h4>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                        <p className="font-semibold text-red-400">Conservative</p>
                                        <p className="text-sm text-muted-foreground">5-7% (보수적)</p>
                                    </div>
                                    <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                        <p className="font-semibold text-blue-400">Moderate</p>
                                        <p className="text-sm text-muted-foreground">8-10% (중립적)</p>
                                    </div>
                                    <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                                        <p className="font-semibold text-green-400">Aggressive</p>
                                        <p className="text-sm text-muted-foreground">12-15% (공격적)</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-muted/50 p-4 rounded-lg">
                                <h4 className="font-semibold mb-2">실제 성과 입력하기</h4>
                                <ol className="text-sm space-y-1 ml-4 text-muted-foreground">
                                    <li>1. 하단 "Detailed Projection Data" 테이블로 이동</li>
                                    <li>2. "Actual Result" 열에서 해당 월 클릭</li>
                                    <li>3. 실제 자산 가치 입력</li>
                                    <li>4. Enter 키 또는 다른 셀 클릭 시 자동 저장</li>
                                </ol>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* FAQ */}
                <section id="faq" className="scroll-mt-20">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <HelpCircle className="h-6 w-6 text-primary" />
                                <CardTitle>자주 묻는 질문 (FAQ)</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                {
                                    q: "샘플 데이터를 내 데이터로 바꿀 수 있나요?",
                                    a: "로그인하시면 모든 샘플 데이터를 삭제하고 본인의 데이터를 입력하실 수 있습니다."
                                },
                                {
                                    q: "데이터가 사라질까 걱정됩니다.",
                                    a: "로그인 사용자는 모든 데이터가 Supabase에 자동 저장됩니다. 브라우저 캐시가 삭제되어도 로그인하면 복원됩니다."
                                },
                                {
                                    q: "모바일에서도 사용 가능한가요?",
                                    a: "네, 반응형 디자인으로 모바일/태블릿에서도 사용 가능합니다. 배당 매트릭스는 가로 스크롤이 필요할 수 있습니다."
                                },
                                {
                                    q: "시뮬레이션이 정확한가요?",
                                    a: "시뮬레이션은 단순 복리 계산 기반입니다. 실제 투자는 변동성, 세금, 수수료 등 다양한 요인의 영향을 받으므로 참고용으로만 사용하세요."
                                },
                            ].map((faq, index) => (
                                <div key={index} className="border-l-2 border-primary/30 pl-4">
                                    <h4 className="font-semibold text-sm mb-1">Q: {faq.q}</h4>
                                    <p className="text-sm text-muted-foreground">A: {faq.a}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </section>
            </div>

            {/* Download Section */}
            <Card className="border-primary/50">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-lg">상세 매뉴얼 다운로드</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                전체 매뉴얼을 Markdown 파일로 다운로드할 수 있습니다
                            </p>
                        </div>
                        <Link
                            href="/USER_MANUAL.md"
                            download
                            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            <Download className="h-5 w-5" />
                            다운로드
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
