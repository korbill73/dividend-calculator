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

    // Global Actions
    importData: (data: string) => void; // Import JSON string
    exportData: () => string; // Return JSON string
    loadFromSupabase: (userId: string) => Promise<void>; // Load from Supabase

    // History for Actual Performance tracking
    history: { date: string; value: number }[]; // YYYY-MM
    addHistoryPoint: (date: string, value: number) => void;
    updateHistoryPoint: (date: string, value: number) => void; // Update if exists
}

const DEFAULT_SIM_SETTINGS: SimulatorSettings = {
    scenarios: {
        conservative: 5,
        moderate: 8,
        aggressive: 12,
    },
    accounts: [
        { name: "Hantu IRP", balance: 0 },
        { name: "NAMU IRP", balance: 0 },
        { name: "ISA", balance: 0 },
        { name: "Personal Pension", balance: 0 },
        { name: "General Account", balance: 0 },
    ],
    monthlyContribution: 1000000,
    startDate: "2025-09-01",
    startYear: 2025,
    endYear: 2050,
};

export const useFinanceStore = create<FinanceStore>()(
    persist(
        (set, get) => ({
            history: [],
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
                    name: 'SAMPLE 글로벌배당 ETF',
                    ticker: 'SAMPLE',
                    quantity: 100,
                    currentPrice: 12500,
                    dividendYield: 8.5,
                    dividendDay: 15,
                    sector: 'ETF',
                    monthlyDividends: [420000, 380000, 450000, 390000, 410000, 430000, 400000, 440000, 460000, 420000, 410000, 450000],
                    yearlyDividends: {
                        2023: [350000, 320000, 380000, 360000, 340000, 370000, 330000, 380000, 390000, 360000, 350000, 380000],
                        2024: [380000, 350000, 410000, 390000, 370000, 400000, 360000, 410000, 420000, 390000, 380000, 410000],
                        2025: [420000, 380000, 450000, 390000, 410000, 430000, 400000, 440000, 460000, 420000, 410000, 450000]
                    }
                },
                {
                    id: 'sample-2',
                    name: 'SAMPLE 미국배당귀족',
                    ticker: 'SAMPLE',
                    quantity: 80,
                    currentPrice: 15000,
                    dividendYield: 7.2,
                    dividendDay: 10,
                    sector: 'Dividend Aristocrats',
                    monthlyDividends: [280000, 320000, 310000, 290000, 330000, 300000, 340000, 310000, 290000, 320000, 330000, 300000],
                    yearlyDividends: {
                        2023: [240000, 280000, 270000, 250000, 290000, 260000, 300000, 270000, 250000, 280000, 290000, 260000],
                        2024: [260000, 300000, 290000, 270000, 310000, 280000, 320000, 290000, 270000, 300000, 310000, 280000],
                        2025: [280000, 320000, 310000, 290000, 330000, 300000, 340000, 310000, 290000, 320000, 330000, 300000]
                    }
                },
                {
                    id: 'sample-3',
                    name: 'SAMPLE 고배당주식',
                    ticker: 'SAMPLE',
                    quantity: 120,
                    currentPrice: 10000,
                    dividendYield: 9.8,
                    dividendDay: 5,
                    sector: 'High Dividend',
                    monthlyDividends: [480000, 450000, 490000, 470000, 500000, 460000, 480000, 490000, 470000, 450000, 480000, 500000],
                    yearlyDividends: {
                        2023: [400000, 370000, 410000, 390000, 420000, 380000, 400000, 410000, 390000, 370000, 400000, 420000],
                        2024: [440000, 410000, 450000, 430000, 460000, 420000, 440000, 450000, 430000, 410000, 440000, 460000],
                        2025: [480000, 450000, 490000, 470000, 500000, 460000, 480000, 490000, 470000, 450000, 480000, 500000]
                    }
                },
                {
                    id: 'sample-4',
                    name: 'SAMPLE 월배당 펀드',
                    ticker: 'SAMPLE',
                    quantity: 150,
                    currentPrice: 8000,
                    dividendYield: 10.5,
                    dividendDay: 20,
                    sector: 'Fund',
                    monthlyDividends: [350000, 370000, 360000, 380000, 350000, 390000, 370000, 360000, 380000, 350000, 370000, 390000],
                    yearlyDividends: {
                        2023: [280000, 300000, 290000, 310000, 280000, 320000, 300000, 290000, 310000, 280000, 300000, 320000],
                        2024: [315000, 335000, 325000, 345000, 315000, 355000, 335000, 325000, 345000, 315000, 335000, 355000],
                        2025: [350000, 370000, 360000, 380000, 350000, 390000, 370000, 360000, 380000, 350000, 370000, 390000]
                    }
                },
                {
                    id: 'sample-5',
                    name: 'SAMPLE 리츠 ETF',
                    ticker: 'SAMPLE',
                    quantity: 90,
                    currentPrice: 13000,
                    dividendYield: 8.0,
                    dividendDay: 25,
                    sector: 'REITs',
                    monthlyDividends: [410000, 430000, 400000, 440000, 420000, 410000, 450000, 430000, 420000, 400000, 430000, 440000],
                    yearlyDividends: {
                        2023: [340000, 360000, 330000, 370000, 350000, 340000, 380000, 360000, 350000, 330000, 360000, 370000],
                        2024: [375000, 395000, 365000, 405000, 385000, 375000, 415000, 395000, 385000, 365000, 395000, 405000],
                        2025: [410000, 430000, 400000, 440000, 420000, 410000, 450000, 430000, 420000, 400000, 430000, 440000]
                    }
                },
                {
                    id: 'sample-6',
                    name: 'SAMPLE 채권혼합',
                    ticker: 'SAMPLE',
                    quantity: 110,
                    currentPrice: 11000,
                    dividendYield: 7.5,
                    dividendDay: 12,
                    sector: 'Mixed',
                    monthlyDividends: [300000, 330000, 310000, 340000, 320000, 330000, 310000, 300000, 340000, 320000, 310000, 330000],
                    yearlyDividends: {
                        2023: [250000, 280000, 260000, 290000, 270000, 280000, 260000, 250000, 290000, 270000, 260000, 280000],
                        2024: [275000, 305000, 285000, 315000, 295000, 305000, 285000, 275000, 315000, 295000, 285000, 305000],
                        2025: [300000, 330000, 310000, 340000, 320000, 330000, 310000, 300000, 340000, 320000, 310000, 330000]
                    }
                },
                {
                    id: 'sample-7',
                    name: 'SAMPLE 커버드콜',
                    ticker: 'SAMPLE',
                    quantity: 70,
                    currentPrice: 16000,
                    dividendYield: 12.0,
                    dividendDay: 8,
                    sector: 'Covered Call',
                    monthlyDividends: [460000, 490000, 470000, 480000, 500000, 460000, 490000, 470000, 480000, 500000, 470000, 490000],
                    yearlyDividends: {
                        2023: [380000, 410000, 390000, 400000, 420000, 380000, 410000, 390000, 400000, 420000, 390000, 410000],
                        2024: [420000, 450000, 430000, 440000, 460000, 420000, 450000, 430000, 440000, 460000, 430000, 450000],
                        2025: [460000, 490000, 470000, 480000, 500000, 460000, 490000, 470000, 480000, 500000, 470000, 490000]
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
            name: 'finance-storage-v5', // v5: Demo data with 7 sample stocks (2023-2025)
        }
    )
);
