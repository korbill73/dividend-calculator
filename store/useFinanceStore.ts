import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DividendMonth {
    month: number;
    amount: number;
}

export interface StockItem {
    id: string;
    name: string;
    ticker: string;
    quantity: number;
    currentPrice: number;
    dividendYield: number; // in %
    dividendDay?: number; // Day of month
    sector?: string;
    monthlyDividends: number[]; // Array of 12 numbers for current/default year
    yearlyDividends?: { [year: number]: number[] }; // e.g., { 2025: [...12 numbers], 2026: [...12 numbers] }
}

interface SimulatorSettings {
    scenarios: {
        conservative: number;
        moderate: number;
        aggressive: number;
    };
    accounts: {
        name: string;
        balance: number;
    }[];
    monthlyContribution: number;
    startDate: string; // "2025-09-01"
    startYear: number; // 2025
    endYear: number;   // 2050
}

interface FinanceStore {
    // Dividend Tracker
    portfolio: StockItem[];
    addItem: (item: StockItem) => void;
    updateItem: (id: string, updates: Partial<StockItem>) => void;
    removeItem: (id: string) => void;
    setPortfolio: (items: StockItem[]) => void;

    // Simulator
    simSettings: SimulatorSettings;
    updateSimSettings: (updates: Partial<SimulatorSettings>) => void;
    updateAccountBalance: (index: number, newBalance: number) => void;
    updateAccountName: (index: number, newName: string) => void;

    // Global Actions
    importData: (data: string) => void; // Import JSON string
    exportData: () => string; // Return JSON string
    loadFromSupabase: (userId: string) => Promise<void>; // Load from Supabase

    // History for Actual Performance tracking
    history: { date: string; value: number }[]; // YYYY-MM
    addHistoryPoint: (date: string, value: number) => void;
    updateHistoryPoint: (date: string, value: number) => void; // Update if exists
}

// 비로그인 사용자를 위한 샘플 히스토리 데이터 생성 (2020-2024, 5년)
const generateSampleHistory = () => {
    const sampleHistory = [];
    const startBalance = 50000000; // 5천만원 시작
    const monthlyContribution = 1000000; // 월 100만원
    const annualReturn = 0.08; // 연 8% 수익률
    const monthlyReturn = Math.pow(1 + annualReturn, 1 / 12) - 1;

    let currentBalance = startBalance;

    for (let year = 2020; year <= 2024; year++) {
        for (let month = 1; month <= 12; month++) {
            // 월별 수익률 적용 + 월 불입금
            currentBalance = currentBalance * (1 + monthlyReturn) + monthlyContribution;

            const dateStr = `${year}-${String(month).padStart(2, '0')}`;
            sampleHistory.push({
                date: dateStr,
                value: Math.round(currentBalance)
            });
        }
    }

    return sampleHistory;
};

const DEFAULT_SIM_SETTINGS: SimulatorSettings = {
    scenarios: {
        conservative: 5,
        moderate: 8,
        aggressive: 12,
    },
    accounts: [
        { name: "Hantu IRP", balance: 15000000 },
        { name: "NAMU IRP", balance: 10000000 },
        { name: "ISA", balance: 12000000 },
        { name: "Personal Pension", balance: 8000000 },
        { name: "General Account", balance: 5000000 },
    ],
    monthlyContribution: 1000000,
    startDate: "2020-01-01",
    startYear: 2020,
    endYear: 2045,
};

export const useFinanceStore = create<FinanceStore>()(
    persist(
        (set, get) => ({
            history: generateSampleHistory(), // 샘플 데이터로 초기화
            addHistoryPoint: (date, value) => set((state) => ({ history: [...state.history, { date, value }] })),
            updateHistoryPoint: (date, value) => set((state) => {
                const exists = state.history.find(h => h.date === date);
                if (exists) {
                    return { history: state.history.map(h => h.date === date ? { ...h, value } : h) };
                }
                return { history: [...state.history, { date, value }] };
            }),

            portfolio: [
                {
                    id: 'sample-1',
                    name: 'JPMorgan Equity Premium Income ETF',
                    ticker: 'JEPI',
                    quantity: 50,
                    currentPrice: 58000,
                    dividendYield: 7.8,
                    dividendDay: 5,
                    sector: 'Covered Call',
                    monthlyDividends: [450000, 420000, 440000, 430000, 460000, 445000, 455000, 440000, 450000, 435000, 460000, 470000],
                    yearlyDividends: {
                        2020: [320000, 310000, 330000, 325000, 340000, 335000, 345000, 330000, 335000, 320000, 340000, 350000],
                        2021: [350000, 340000, 360000, 355000, 370000, 365000, 375000, 360000, 365000, 350000, 370000, 380000],
                        2022: [390000, 380000, 400000, 395000, 410000, 405000, 415000, 400000, 405000, 390000, 410000, 420000],
                        2023: [420000, 410000, 430000, 425000, 440000, 435000, 445000, 430000, 435000, 420000, 440000, 450000],
                        2024: [450000, 420000, 440000, 430000, 460000, 445000, 455000, 440000, 450000, 435000, 460000, 470000]
                    }
                },
                {
                    id: 'sample-2',
                    name: 'JPMorgan Nasdaq Equity Premium Income',
                    ticker: 'JEPQ',
                    quantity: 45,
                    currentPrice: 54000,
                    dividendYield: 9.2,
                    dividendDay: 8,
                    sector: 'Covered Call',
                    monthlyDividends: [480000, 460000, 490000, 470000, 500000, 485000, 495000, 475000, 490000, 465000, 500000, 510000],
                    yearlyDividends: {
                        2020: [280000, 270000, 290000, 280000, 300000, 290000, 300000, 285000, 290000, 275000, 295000, 305000],
                        2021: [350000, 340000, 360000, 350000, 370000, 360000, 370000, 355000, 365000, 345000, 370000, 380000],
                        2022: [420000, 410000, 430000, 420000, 440000, 430000, 440000, 425000, 435000, 415000, 440000, 450000],
                        2023: [450000, 440000, 460000, 450000, 470000, 460000, 470000, 455000, 465000, 445000, 470000, 480000],
                        2024: [480000, 460000, 490000, 470000, 500000, 485000, 495000, 475000, 490000, 465000, 500000, 510000]
                    }
                },
                {
                    id: 'sample-3',
                    name: 'Global X S&P 500 Covered Call ETF',
                    ticker: 'XYLD',
                    quantity: 60,
                    currentPrice: 48000,
                    dividendYield: 11.5,
                    dividendDay: 3,
                    sector: 'Covered Call',
                    monthlyDividends: [520000, 500000, 530000, 510000, 540000, 525000, 535000, 515000, 530000, 505000, 540000, 550000],
                    yearlyDividends: {
                        2020: [350000, 340000, 360000, 350000, 370000, 360000, 370000, 355000, 365000, 345000, 370000, 380000],
                        2021: [400000, 390000, 410000, 400000, 420000, 410000, 420000, 405000, 415000, 395000, 420000, 430000],
                        2022: [460000, 450000, 470000, 460000, 480000, 470000, 480000, 465000, 475000, 455000, 480000, 490000],
                        2023: [490000, 480000, 500000, 490000, 510000, 500000, 510000, 495000, 505000, 485000, 510000, 520000],
                        2024: [520000, 500000, 530000, 510000, 540000, 525000, 535000, 515000, 530000, 505000, 540000, 550000]
                    }
                },
                {
                    id: 'sample-4',
                    name: 'Global X Nasdaq 100 Covered Call ETF',
                    ticker: 'QYLD',
                    quantity: 55,
                    currentPrice: 45000,
                    dividendYield: 12.3,
                    dividendDay: 25,
                    sector: 'Covered Call',
                    monthlyDividends: [550000, 530000, 560000, 540000, 570000, 555000, 565000, 545000, 560000, 535000, 570000, 580000],
                    yearlyDividends: {
                        2020: [340000, 330000, 350000, 340000, 360000, 350000, 360000, 345000, 355000, 335000, 360000, 370000],
                        2021: [410000, 400000, 420000, 410000, 430000, 420000, 430000, 415000, 425000, 405000, 430000, 440000],
                        2022: [480000, 470000, 490000, 480000, 500000, 490000, 500000, 485000, 495000, 475000, 500000, 510000],
                        2023: [520000, 510000, 530000, 520000, 540000, 530000, 540000, 525000, 535000, 515000, 540000, 550000],
                        2024: [550000, 530000, 560000, 540000, 570000, 555000, 565000, 545000, 560000, 535000, 570000, 580000]
                    }
                },
                {
                    id: 'sample-5',
                    name: 'Amplify CWP Enhanced Dividend Income',
                    ticker: 'DIVO',
                    quantity: 40,
                    currentPrice: 42000,
                    dividendYield: 5.8,
                    dividendDay: 20,
                    sector: 'Dividend Growth',
                    monthlyDividends: [0, 0, 250000, 0, 0, 280000, 0, 0, 290000, 0, 0, 300000],
                    yearlyDividends: {
                        2020: [0, 0, 180000, 0, 0, 190000, 0, 0, 200000, 0, 0, 210000],
                        2021: [0, 0, 200000, 0, 0, 220000, 0, 0, 230000, 0, 0, 240000],
                        2022: [0, 0, 220000, 0, 0, 240000, 0, 0, 250000, 0, 0, 260000],
                        2023: [0, 0, 240000, 0, 0, 260000, 0, 0, 270000, 0, 0, 280000],
                        2024: [0, 0, 250000, 0, 0, 280000, 0, 0, 290000, 0, 0, 300000]
                    }
                },
                {
                    id: 'sample-6',
                    name: 'Schwab U.S. Dividend Equity ETF',
                    ticker: 'SCHD',
                    quantity: 35,
                    currentPrice: 85000,
                    dividendYield: 3.5,
                    dividendDay: 28,
                    sector: 'Dividend Aristocrats',
                    monthlyDividends: [0, 0, 350000, 0, 0, 380000, 0, 0, 390000, 0, 0, 420000],
                    yearlyDividends: {
                        2020: [0, 0, 220000, 0, 0, 240000, 0, 0, 250000, 0, 0, 270000],
                        2021: [0, 0, 260000, 0, 0, 280000, 0, 0, 290000, 0, 0, 310000],
                        2022: [0, 0, 300000, 0, 0, 320000, 0, 0, 330000, 0, 0, 360000],
                        2023: [0, 0, 330000, 0, 0, 360000, 0, 0, 370000, 0, 0, 400000],
                        2024: [0, 0, 350000, 0, 0, 380000, 0, 0, 390000, 0, 0, 420000]
                    }
                },
                {
                    id: 'sample-7',
                    name: 'Global X Russell 2000 Covered Call',
                    ticker: 'RYLD',
                    quantity: 65,
                    currentPrice: 40000,
                    dividendYield: 10.8,
                    dividendDay: 15,
                    sector: 'Covered Call',
                    monthlyDividends: [430000, 410000, 440000, 420000, 450000, 435000, 445000, 425000, 440000, 415000, 450000, 460000],
                    yearlyDividends: {
                        2020: [280000, 270000, 290000, 280000, 300000, 290000, 300000, 285000, 290000, 275000, 300000, 310000],
                        2021: [340000, 330000, 350000, 340000, 360000, 350000, 360000, 345000, 355000, 335000, 360000, 370000],
                        2022: [380000, 370000, 390000, 380000, 400000, 390000, 400000, 385000, 395000, 375000, 400000, 410000],
                        2023: [410000, 400000, 420000, 410000, 430000, 420000, 430000, 415000, 425000, 405000, 430000, 440000],
                        2024: [430000, 410000, 440000, 420000, 450000, 435000, 445000, 425000, 440000, 415000, 450000, 460000]
                    }
                }
            ],

            addItem: (item) => set((state) => ({ portfolio: [...state.portfolio, item] })),

            updateItem: (id, updates) => set((state) => ({
                portfolio: state.portfolio.map((item) =>
                    item.id === id ? { ...item, ...updates } : item
                )
            })),

            removeItem: (id) => set((state) => ({
                portfolio: state.portfolio.filter((item) => item.id !== id)
            })),

            setPortfolio: (items) => set({ portfolio: items }),

            simSettings: DEFAULT_SIM_SETTINGS,

            updateSimSettings: (updates) => set((state) => ({
                simSettings: { ...state.simSettings, ...updates }
            })),

            updateAccountBalance: (index, newBalance) => set((state) => {
                const newAccounts = [...state.simSettings.accounts];
                newAccounts[index] = { ...newAccounts[index], balance: newBalance };
                return { simSettings: { ...state.simSettings, accounts: newAccounts } };
            }),

            updateAccountName: (index, newName) => set((state) => {
                const newAccounts = [...state.simSettings.accounts];
                newAccounts[index] = { ...newAccounts[index], name: newName };
                return { simSettings: { ...state.simSettings, accounts: newAccounts } };
            }),

            importData: (jsonStr) => {
                try {
                    const data = JSON.parse(jsonStr);
                    if (data.portfolio && data.simSettings) {
                        set({ portfolio: data.portfolio, simSettings: data.simSettings });
                    }
                } catch (e) {
                    console.error("Failed to import data", e);
                }
            },

            exportData: () => {
                const state = get();
                return JSON.stringify({
                    portfolio: state.portfolio,
                    simSettings: state.simSettings
                }, null, 2);
            },

            loadFromSupabase: async (userId: string) => {
                try {
                    // Import supabase dynamically to avoid circular dependency
                    const { supabase } = await import('@/lib/supabase');

                    // 1. Load portfolio items
                    const { data: portfolioItems, error: portfolioError } = await supabase
                        .from('portfolio_items')
                        .select('*')
                        .eq('user_id', userId);

                    if (portfolioError) {
                        console.error('Error loading portfolio:', portfolioError);
                        return;
                    }

                    if (!portfolioItems || portfolioItems.length === 0) {
                        // No data in Supabase, keep localStorage data or empty
                        return;
                    }

                    // 2. Load yearly dividends for all portfolio items
                    const portfolioIds = portfolioItems.map(item => item.id);
                    const { data: yearlyDividendsData, error: dividendsError } = await supabase
                        .from('yearly_dividends')
                        .select('*')
                        .in('portfolio_item_id', portfolioIds);

                    if (dividendsError) {
                        console.error('Error loading dividends:', dividendsError);
                    }

                    // 3. Transform to StockItem format
                    const transformedPortfolio: StockItem[] = portfolioItems.map(item => {
                        // Get yearly dividends for this item
                        const itemDividends = yearlyDividendsData?.filter(d => d.portfolio_item_id === item.id) || [];

                        // Build yearlyDividends object
                        const yearlyDividends: { [year: number]: number[] } = {};
                        itemDividends.forEach(dividend => {
                            yearlyDividends[dividend.year] = [
                                dividend.month_1,
                                dividend.month_2,
                                dividend.month_3,
                                dividend.month_4,
                                dividend.month_5,
                                dividend.month_6,
                                dividend.month_7,
                                dividend.month_8,
                                dividend.month_9,
                                dividend.month_10,
                                dividend.month_11,
                                dividend.month_12,
                            ];
                        });

                        // Get current year dividends (default to 2025 or first available year)
                        const currentYear = new Date().getFullYear();
                        const monthlyDividends = yearlyDividends[currentYear] || yearlyDividends[2025] || Array(12).fill(0);

                        return {
                            id: item.id,
                            name: item.name,
                            ticker: item.ticker,
                            quantity: item.quantity,
                            currentPrice: item.current_price,
                            dividendYield: item.dividend_yield,
                            dividendDay: item.dividend_day || undefined,
                            sector: item.sector || undefined,
                            monthlyDividends,
                            yearlyDividends,
                        };
                    });

                    // 4. Update store
                    set({ portfolio: transformedPortfolio });

                    console.log(`✅ Loaded ${transformedPortfolio.length} items from Supabase`);
                } catch (error) {
                    console.error('Error in loadFromSupabase:', error);
                }
            }
        }),
        {
            name: 'finance-storage-v6', // v6: Real ETF samples (JEPI, JEPQ, XYLD, QYLD, DIVO, SCHD, RYLD) with 2020-2024 data
        }
    )
);
