"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { SimulationDashboard } from "@/components/simulation/SimulationDashboard";

interface GuestSettings {
    startYear: number;
    endYear: number;
    initialAmount: number;
    monthlyContribution: number;
    scenarios: {
        conservative: number;
        moderate: number;
        aggressive: number;
    };
}

const getDefaultGuestSettings = (): GuestSettings => {
    const currentYear = new Date().getFullYear();
    return {
        startYear: currentYear,
        endYear: currentYear + 30,
        initialAmount: 0,
        monthlyContribution: 0,
        scenarios: {
            conservative: 5,
            moderate: 8,
            aggressive: 12,
        },
    };
};

export default function Page() {
    const { user } = useAuth();
    const [guestSettings, setGuestSettings] = useState<GuestSettings>(getDefaultGuestSettings);

    return (
        <SimulationDashboard 
            guestSettings={!user ? guestSettings : undefined}
            onGuestSettingsChange={!user ? setGuestSettings : undefined}
        />
    );
}
