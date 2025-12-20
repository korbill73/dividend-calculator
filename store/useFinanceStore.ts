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
    startMonth: number; // 1-12 (시작월)
    endYear: number;   // 2050
    birthYear?: number; // 출생년도 (나이 계산용)
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
    addAccount: (name?: string) => void;
    removeAccount: (index: number) => void;

    // Global Actions
    importData: (data: string) => void; // Import JSON string
    exportData: () => string; // Return JSON string
    loadFromSupabase: (userId: string) => Promise<void>; // Load from Supabase
    saveToSupabase: (userId: string) => Promise<boolean>; // Save to Supabase
    resetToSampleData: () => void; // Reset to sample data (for logout)

    // History for Actual Performance tracking
    history: { date: string; value: number; accountValues?: { [accountName: string]: number } }[]; // YYYY-MM
    addHistoryPoint: (date: string, value: number) => void;
    updateHistoryPoint: (date: string, value: number) => void; // Update if exists
    updateAccountHistoryPoint: (date: string, accountName: string, value: number) => void; // Update per-account value
}

// 비로그인 사용자를 위한 샘플 히스토리 데이터 생성 (2021-2025, 5년)
const SAMPLE_ACCOUNTS = [
    { name: "Hantu IRP", balance: 45000000 },
    { name: "NAMU", balance: 32000000 },
    { name: "KAKAO", balance: 28000000 },
    { name: "ISA", balance: 18000000 },
];

const generateSampleHistory = (): { date: string; value: number; accountValues?: { [accountName: string]: number } }[] => {
    const sampleHistory: { date: string; value: number; accountValues?: { [accountName: string]: number } }[] = [];
    
    // 각 계좌별 시작 잔액과 월별 증가율 설정
    const accountSettings = [
        { name: "Hantu IRP", startBalance: 15000000, monthlyGrowth: 0.008, monthlyContrib: 300000 },
        { name: "NAMU", startBalance: 10000000, monthlyGrowth: 0.007, monthlyContrib: 200000 },
        { name: "KAKAO", startBalance: 8000000, monthlyGrowth: 0.009, monthlyContrib: 150000 },
        { name: "ISA", startBalance: 5000000, monthlyGrowth: 0.006, monthlyContrib: 100000 },
    ];
    
    const currentBalances = accountSettings.map(a => a.startBalance);
    
    for (let year = 2021; year <= 2025; year++) {
        for (let month = 1; month <= 12; month++) {
            // 2025년은 현재 월까지만
            if (year === 2025 && month > new Date().getMonth() + 1) break;
            
            const dateStr = `${year}-${String(month).padStart(2, '0')}`;
            const accountValues: { [accountName: string]: number } = {};
            let totalValue = 0;
            
            accountSettings.forEach((acc, idx) => {
                // 월별 변동 (수익률 + 적립금 + 약간의 랜덤 변동)
                const randomFactor = 1 + (Math.random() - 0.5) * 0.02; // +-1% 랜덤
                currentBalances[idx] = Math.round(
                    currentBalances[idx] * (1 + acc.monthlyGrowth * randomFactor) + acc.monthlyContrib
                );
                accountValues[acc.name] = currentBalances[idx];
                totalValue += currentBalances[idx];
            });
            
            sampleHistory.push({
                date: dateStr,
                value: totalValue,
                accountValues
            });
        }
    }
    
    return sampleHistory;
};

const DEFAULT_SIM_SETTINGS: SimulatorSettings = {
    scenarios: {
        conservative: 7,
        moderate: 10,
        aggressive: 15,
    },
    accounts: SAMPLE_ACCOUNTS,
    monthlyContribution: 750000,
    startDate: "2025-01-01",
    startYear: 2025,
    startMonth: 1,
    endYear: 2050,
    birthYear: 1985,
};

const SAMPLE_PORTFOLIO: StockItem[] = [
    {
        id: 'sample-1',
        name: 'JPMorgan Equity Premium Income ETF',
        ticker: 'JEPI',
        quantity: 50,
        currentPrice: 58000,
        dividendYield: 7.8,
        dividendDay: 5,
        sector: 'Covered Call',
        monthlyDividends: [480000, 450000, 470000, 460000, 490000, 475000, 485000, 470000, 480000, 465000, 490000, 500000],
        yearlyDividends: {
            2020: [320000, 310000, 330000, 325000, 340000, 335000, 345000, 330000, 335000, 320000, 340000, 350000],
            2021: [350000, 340000, 360000, 355000, 370000, 365000, 375000, 360000, 365000, 350000, 370000, 380000],
            2022: [390000, 380000, 400000, 395000, 410000, 405000, 415000, 400000, 405000, 390000, 410000, 420000],
            2023: [420000, 410000, 430000, 425000, 440000, 435000, 445000, 430000, 435000, 420000, 440000, 450000],
            2024: [450000, 420000, 440000, 430000, 460000, 445000, 455000, 440000, 450000, 435000, 460000, 470000],
            2025: [480000, 450000, 470000, 460000, 490000, 475000, 485000, 470000, 480000, 465000, 490000, 500000]
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
        monthlyDividends: [510000, 490000, 520000, 500000, 530000, 515000, 525000, 505000, 520000, 495000, 530000, 540000],
        yearlyDividends: {
            2020: [280000, 270000, 290000, 280000, 300000, 290000, 300000, 285000, 290000, 275000, 295000, 305000],
            2021: [350000, 340000, 360000, 350000, 370000, 360000, 370000, 355000, 365000, 345000, 370000, 380000],
            2022: [420000, 410000, 430000, 420000, 440000, 430000, 440000, 425000, 435000, 415000, 440000, 450000],
            2023: [450000, 440000, 460000, 450000, 470000, 460000, 470000, 455000, 465000, 445000, 470000, 480000],
            2024: [480000, 460000, 490000, 470000, 500000, 485000, 495000, 475000, 490000, 465000, 500000, 510000],
            2025: [510000, 490000, 520000, 500000, 530000, 515000, 525000, 505000, 520000, 495000, 530000, 540000]
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
        monthlyDividends: [550000, 530000, 560000, 540000, 570000, 555000, 565000, 545000, 560000, 535000, 570000, 580000],
        yearlyDividends: {
            2020: [350000, 340000, 360000, 350000, 370000, 360000, 370000, 355000, 365000, 345000, 370000, 380000],
            2021: [400000, 390000, 410000, 400000, 420000, 410000, 420000, 405000, 415000, 395000, 420000, 430000],
            2022: [460000, 450000, 470000, 460000, 480000, 470000, 480000, 465000, 475000, 455000, 480000, 490000],
            2023: [490000, 480000, 500000, 490000, 510000, 500000, 510000, 495000, 505000, 485000, 510000, 520000],
            2024: [520000, 500000, 530000, 510000, 540000, 525000, 535000, 515000, 530000, 505000, 540000, 550000],
            2025: [550000, 530000, 560000, 540000, 570000, 555000, 565000, 545000, 560000, 535000, 570000, 580000]
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
        monthlyDividends: [580000, 560000, 590000, 570000, 600000, 585000, 595000, 575000, 590000, 565000, 600000, 610000],
        yearlyDividends: {
            2020: [340000, 330000, 350000, 340000, 360000, 350000, 360000, 345000, 355000, 335000, 360000, 370000],
            2021: [410000, 400000, 420000, 410000, 430000, 420000, 430000, 415000, 425000, 405000, 430000, 440000],
            2022: [480000, 470000, 490000, 480000, 500000, 490000, 500000, 485000, 495000, 475000, 500000, 510000],
            2023: [520000, 510000, 530000, 520000, 540000, 530000, 540000, 525000, 535000, 515000, 540000, 550000],
            2024: [550000, 530000, 560000, 540000, 570000, 555000, 565000, 545000, 560000, 535000, 570000, 580000],
            2025: [580000, 560000, 590000, 570000, 600000, 585000, 595000, 575000, 590000, 565000, 600000, 610000]
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
        monthlyDividends: [0, 0, 270000, 0, 0, 300000, 0, 0, 310000, 0, 0, 320000],
        yearlyDividends: {
            2020: [0, 0, 180000, 0, 0, 190000, 0, 0, 200000, 0, 0, 210000],
            2021: [0, 0, 200000, 0, 0, 220000, 0, 0, 230000, 0, 0, 240000],
            2022: [0, 0, 220000, 0, 0, 240000, 0, 0, 250000, 0, 0, 260000],
            2023: [0, 0, 240000, 0, 0, 260000, 0, 0, 270000, 0, 0, 280000],
            2024: [0, 0, 250000, 0, 0, 280000, 0, 0, 290000, 0, 0, 300000],
            2025: [0, 0, 270000, 0, 0, 300000, 0, 0, 310000, 0, 0, 320000]
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
        monthlyDividends: [0, 0, 370000, 0, 0, 400000, 0, 0, 410000, 0, 0, 440000],
        yearlyDividends: {
            2020: [0, 0, 220000, 0, 0, 240000, 0, 0, 250000, 0, 0, 270000],
            2021: [0, 0, 260000, 0, 0, 280000, 0, 0, 290000, 0, 0, 310000],
            2022: [0, 0, 300000, 0, 0, 320000, 0, 0, 330000, 0, 0, 360000],
            2023: [0, 0, 330000, 0, 0, 360000, 0, 0, 370000, 0, 0, 400000],
            2024: [0, 0, 350000, 0, 0, 380000, 0, 0, 390000, 0, 0, 420000],
            2025: [0, 0, 370000, 0, 0, 400000, 0, 0, 410000, 0, 0, 440000]
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
        monthlyDividends: [460000, 440000, 470000, 450000, 480000, 465000, 475000, 455000, 470000, 445000, 480000, 490000],
        yearlyDividends: {
            2020: [280000, 270000, 290000, 280000, 300000, 290000, 300000, 285000, 290000, 275000, 300000, 310000],
            2021: [340000, 330000, 350000, 340000, 360000, 350000, 360000, 345000, 355000, 335000, 360000, 370000],
            2022: [380000, 370000, 390000, 380000, 400000, 390000, 400000, 385000, 395000, 375000, 400000, 410000],
            2023: [410000, 400000, 420000, 410000, 430000, 420000, 430000, 415000, 425000, 405000, 430000, 440000],
            2024: [430000, 410000, 440000, 420000, 450000, 435000, 445000, 425000, 440000, 415000, 450000, 460000],
            2025: [460000, 440000, 470000, 450000, 480000, 465000, 475000, 455000, 470000, 445000, 480000, 490000]
        }
    }
];

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

            updateAccountHistoryPoint: (date, accountName, value) => set((state) => {
                const existingPoint = state.history.find(h => h.date === date);
                if (existingPoint) {
                    return {
                        history: state.history.map(h => {
                            if (h.date === date) {
                                const newAccountValues = { ...(h.accountValues ?? {}), [accountName]: value };
                                const totalValue = Object.values(newAccountValues).reduce((sum, v) => sum + v, 0);
                                return { ...h, value: totalValue, accountValues: newAccountValues };
                            }
                            return h;
                        })
                    };
                }
                const newAccountValues = { [accountName]: value };
                return { history: [...state.history, { date, value, accountValues: newAccountValues }] };
            }),

            portfolio: SAMPLE_PORTFOLIO,

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

            addAccount: (name) => set((state) => {
                const newAccount = { name: name || `계좌 ${state.simSettings.accounts.length + 1}`, balance: 0 };
                return { simSettings: { ...state.simSettings, accounts: [...state.simSettings.accounts, newAccount] } };
            }),

            removeAccount: (index) => set((state) => {
                if (state.simSettings.accounts.length <= 1) return state; // Keep at least one account
                const newAccounts = state.simSettings.accounts.filter((_, i) => i !== index);
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

                    // 2. Load simulation settings (regardless of portfolio state)
                    const { data: simSettingsData, error: simSettingsError } = await supabase
                        .from('user_sim_settings')
                        .select('*')
                        .eq('user_id', userId)
                        .single();

                    if (simSettingsError && simSettingsError.code !== 'PGRST116') {
                        console.error('Error loading sim settings:', simSettingsError);
                    }

                    // Load simSettings if available
                    let loadedSimSettings: SimulatorSettings | null = null;
                    if (simSettingsData) {
                        loadedSimSettings = {
                            scenarios: simSettingsData.scenarios as SimulatorSettings['scenarios'],
                            accounts: simSettingsData.accounts as SimulatorSettings['accounts'],
                            monthlyContribution: simSettingsData.monthly_contribution,
                            startDate: simSettingsData.start_date,
                            startYear: simSettingsData.start_year,
                            startMonth: simSettingsData.start_month || 1,
                            endYear: simSettingsData.end_year,
                            birthYear: simSettingsData.birth_year || undefined,
                        };
                    }

                    // 2.5. Load history data
                    const { data: historyData, error: historyError } = await supabase
                        .from('user_history')
                        .select('*')
                        .eq('user_id', userId)
                        .order('date', { ascending: true });

                    if (historyError && historyError.code !== 'PGRST116') {
                        console.error('Error loading history:', historyError);
                    }

                    // 2.6. Load account history data
                    const { data: accountHistoryData, error: accountHistoryError } = await supabase
                        .from('user_account_history')
                        .select('*')
                        .eq('user_id', userId);

                    if (accountHistoryError && accountHistoryError.code !== 'PGRST116') {
                        console.error('Error loading account history:', accountHistoryError);
                    }

                    // Build accountValues map by date
                    const accountValuesByDate: { [date: string]: { [accountName: string]: number } } = {};
                    accountHistoryData?.forEach(ah => {
                        if (!accountValuesByDate[ah.date]) {
                            accountValuesByDate[ah.date] = {};
                        }
                        accountValuesByDate[ah.date][ah.account_name] = Number(ah.value);
                    });

                    const loadedHistory = historyData?.map(h => ({
                        date: h.date,
                        value: Number(h.value),
                        accountValues: accountValuesByDate[h.date] || undefined
                    })) || [];

                    if (!portfolioItems || portfolioItems.length === 0) {
                        // No portfolio data, but still apply simSettings and history if loaded
                        const updates: Partial<FinanceStore> = {};
                        if (loadedSimSettings) updates.simSettings = loadedSimSettings;
                        if (loadedHistory.length > 0) updates.history = loadedHistory;
                        
                        if (Object.keys(updates).length > 0) {
                            set(updates as any);
                            console.log('✅ Loaded sim settings/history from Supabase (no portfolio data)');
                        }
                        return;
                    }

                    // 3. Load yearly dividends for all portfolio items
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

                    // 4. Update store with portfolio, simSettings, and history
                    const finalUpdates: any = { portfolio: transformedPortfolio };
                    if (loadedSimSettings) finalUpdates.simSettings = loadedSimSettings;
                    if (loadedHistory.length > 0) finalUpdates.history = loadedHistory;
                    
                    set(finalUpdates);
                    console.log(`✅ Loaded ${transformedPortfolio.length} items, sim settings, and ${loadedHistory.length} history points from Supabase`);
                } catch (error) {
                    console.error('Error in loadFromSupabase:', error);
                }
            },

            saveToSupabase: async (userId: string) => {
                try {
                    const { supabase } = await import('@/lib/supabase');
                    const state = get();
                    
                    // 1. Upsert portfolio items
                    for (const item of state.portfolio) {
                        const portfolioData = {
                            id: item.id,
                            user_id: userId,
                            name: item.name,
                            ticker: item.ticker,
                            quantity: item.quantity,
                            current_price: item.currentPrice,
                            dividend_yield: item.dividendYield,
                            dividend_day: item.dividendDay || null,
                            sector: item.sector || null,
                        };
                        
                        const { error: portfolioError } = await supabase
                            .from('portfolio_items')
                            .upsert(portfolioData, { onConflict: 'id' });
                        
                        if (portfolioError) {
                            console.error('Error saving portfolio item:', portfolioError);
                            continue;
                        }
                        
                        // 2. Upsert yearly dividends for this item
                        if (item.yearlyDividends) {
                            for (const [yearStr, months] of Object.entries(item.yearlyDividends)) {
                                const year = parseInt(yearStr);
                                const dividendData = {
                                    user_id: userId,
                                    portfolio_item_id: item.id,
                                    year: year,
                                    month_1: months[0] || 0,
                                    month_2: months[1] || 0,
                                    month_3: months[2] || 0,
                                    month_4: months[3] || 0,
                                    month_5: months[4] || 0,
                                    month_6: months[5] || 0,
                                    month_7: months[6] || 0,
                                    month_8: months[7] || 0,
                                    month_9: months[8] || 0,
                                    month_10: months[9] || 0,
                                    month_11: months[10] || 0,
                                    month_12: months[11] || 0,
                                };
                                
                                // Check if record exists
                                const { data: existing } = await supabase
                                    .from('yearly_dividends')
                                    .select('id')
                                    .eq('portfolio_item_id', item.id)
                                    .eq('year', year)
                                    .single();
                                
                                if (existing) {
                                    // Update existing record
                                    const { error } = await supabase
                                        .from('yearly_dividends')
                                        .update(dividendData)
                                        .eq('id', existing.id);
                                    
                                    if (error) console.error('Error updating yearly dividends:', error);
                                } else {
                                    // Insert new record
                                    const { error } = await supabase
                                        .from('yearly_dividends')
                                        .insert(dividendData);
                                    
                                    if (error) console.error('Error inserting yearly dividends:', error);
                                }
                            }
                        }
                    }
                    
                    // 3. Save simulation settings
                    const simSettingsData = {
                        user_id: userId,
                        scenarios: state.simSettings.scenarios,
                        accounts: state.simSettings.accounts,
                        monthly_contribution: state.simSettings.monthlyContribution,
                        start_date: state.simSettings.startDate,
                        start_year: state.simSettings.startYear,
                        start_month: state.simSettings.startMonth,
                        end_year: state.simSettings.endYear,
                        birth_year: state.simSettings.birthYear || null,
                        updated_at: new Date().toISOString(),
                    };

                    // Check if sim settings exist
                    const { data: existingSimSettings } = await supabase
                        .from('user_sim_settings')
                        .select('id')
                        .eq('user_id', userId)
                        .single();

                    if (existingSimSettings) {
                        const { error: simError } = await supabase
                            .from('user_sim_settings')
                            .update(simSettingsData)
                            .eq('user_id', userId);

                        if (simError) console.error('Error updating sim settings:', simError);
                    } else {
                        const { error: simError } = await supabase
                            .from('user_sim_settings')
                            .insert(simSettingsData);

                        if (simError) console.error('Error inserting sim settings:', simError);
                    }

                    // 4. Save history data (upsert each point)
                    for (const point of state.history) {
                        const historyData = {
                            user_id: userId,
                            date: point.date,
                            value: point.value,
                        };

                        const { error: historyError } = await supabase
                            .from('user_history')
                            .upsert(historyData, { onConflict: 'user_id,date' });

                        if (historyError) {
                            console.error('Error saving history point:', historyError);
                        }

                        // 4.1. Save account history data if exists
                        if (point.accountValues) {
                            for (const [accountName, value] of Object.entries(point.accountValues)) {
                                const accountHistoryData = {
                                    user_id: userId,
                                    date: point.date,
                                    account_name: accountName,
                                    value: value,
                                };

                                const { error: accountHistoryError } = await supabase
                                    .from('user_account_history')
                                    .upsert(accountHistoryData, { onConflict: 'user_id,date,account_name' });

                                if (accountHistoryError) {
                                    console.error('Error saving account history point:', accountHistoryError);
                                }
                            }
                        }
                    }
                    
                    console.log('✅ Saved to Supabase successfully');
                    return true;
                } catch (error) {
                    console.error('Error in saveToSupabase:', error);
                    return false;
                }
            },

            resetToSampleData: () => {
                set({
                    portfolio: SAMPLE_PORTFOLIO,
                    simSettings: DEFAULT_SIM_SETTINGS,
                    history: generateSampleHistory()
                });
                console.log('✅ Reset to sample data');
            }
        }),
        {
            name: 'finance-storage-v10', // v10: Added per-account history tracking
        }
    )
);
