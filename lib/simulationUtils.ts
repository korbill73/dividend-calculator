export interface SimulationDataPoint {
    date: string; // "YYYY-MM"
    monthLabel: string; // "2025.09"
    conservative: number;
    moderate: number;
    aggressive: number;
    actual?: number;
    investedCapital: number; // Total principal put in
}

export const generateSimulationData = (
    startBalance: number,
    monthlyContribution: number,
    scenarios: { conservative: number; moderate: number; aggressive: number },
    history: { date: string; value: number }[],
    startYear: number = 2025,
    endYear: number = 2050,
    startMonth: number = 1
): SimulationDataPoint[] => {
    const data: SimulationDataPoint[] = [];

    const startDate = new Date(startYear, startMonth - 1); // Month is 0-indexed
    const endDate = new Date(endYear, 11); // Dec

    const currentDate = new Date(startDate);

    // Track running balances
    let cBal = startBalance;
    let mBal = startBalance;
    let aBal = startBalance;
    let invested = startBalance;

    // Monthly rates
    const cRate = scenarios.conservative / 100 / 12;
    const mRate = scenarios.moderate / 100 / 12;
    const aRate = scenarios.aggressive / 100 / 12;

    // History map for fast lookup
    const historyMap = new Map(history.map(h => [h.date, h.value]));

    while (currentDate <= endDate) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const dateStr = `${year}-${String(month).padStart(2, '0')}`;
        const label = `${year}.${String(month).padStart(2, '0')}`;

        // Look for actual data
        const actual = historyMap.get(dateStr);

        data.push({
            date: dateStr,
            monthLabel: label,
            conservative: cBal,
            moderate: mBal,
            aggressive: aBal,
            actual: actual,
            investedCapital: invested
        });

        // Advance for NEXT month
        // Formula: (Start + Contribution) * (1 + Rate)
        // We apply contribution at start of month (or end, matters little, let's say user adds money then it grows)
        cBal = (cBal + monthlyContribution) * (1 + cRate);
        mBal = (mBal + monthlyContribution) * (1 + mRate);
        aBal = (aBal + monthlyContribution) * (1 + aRate);
        invested += monthlyContribution;

        currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return data;
};
