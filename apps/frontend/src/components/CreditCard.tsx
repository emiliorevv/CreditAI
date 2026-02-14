import type { ICardStatus } from '@credit-ai/shared';
import { cn } from '../lib/utils';
import { CreditCard as CardIcon, AlertCircle, CheckCircle } from 'lucide-react';

interface CreditCardProps {
    card: ICardStatus;
}

export function CreditCard({ card }: CreditCardProps) {
    const isHealthy = card.health_status === 'Good';
    const isCritical = card.health_status === 'Critical';

    // Logic: Use payment_status from backend
    const isDueZone = card.payment_status === 'DUE';

    // Calculate color based on User's Rules for Due Date
    let dueColorClass = "text-primary"; // Default for Spending Mode

    if (isDueZone) {
        if (card.days_until_due > 10) {
            dueColorClass = "text-green-300"; // Light Greenish
        } else if (card.days_until_due >= 6) {
            dueColorClass = "text-orange-400"; // Orange
        } else {
            dueColorClass = "text-red-500 animate-pulse"; // Red (Critical)
        }
    }

    // Display Logic
    const cardName = card.card_model?.name || card.name_override || 'Unknown Card';
    const cardIssuer = card.card_model?.issuer || card.issuer_override || 'Unknown Issuer';

    return (
        <div className={cn(
            "relative overflow-hidden rounded-2xl p-6 shadow-xl border border-white/5 transition-transform hover:scale-[1.02]",
            // Change background if in critical due zone? User said "on the rectangles", implying the card bg.
            // Let's enable a subtle red glow/border if critical due
            isDueZone && card.days_until_due <= 5 ? "bg-gradient-to-br from-red-950/30 to-neutral-900 border-red-500/30" : "bg-gradient-to-br from-card to-neutral-900"
        )}>
            {/* Background decoration */}
            <div className={cn(
                "absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl",
                isDueZone && card.days_until_due <= 5 ? "bg-red-500/10" : "bg-primary/10"
            )} />

            <div className="relative z-10 flex flex-col justify-between h-full min-h-[200px]">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-lg text-white tracking-wide">{cardName}</h3>
                        <p className="text-sm text-muted">{cardIssuer}</p>
                    </div>

                    <CardIcon className={cn("w-8 h-8 opacity-80", dueColorClass)} />
                </div>

                {/* Middle: Days Remaining */}
                <div className="my-6">
                    <div className="flex items-baseline gap-2">
                        <span className={cn("text-4xl font-bold transition-colors", isDueZone ? dueColorClass : "text-primary")}>
                            {isDueZone ? card.days_until_due : card.days_remaining}
                        </span>
                        <span className="text-sm text-muted">
                            {isDueZone ? "days to pay" : "days left in cycle"}
                        </span>
                    </div>
                    <p className="text-xs text-muted/60">
                        {isDueZone ? `Due on ${card.next_payment_due_date}` : `Closes on ${card.next_closing_date}`}
                    </p>
                </div>

                {/* Footer: Balance & Status */}
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-xs text-muted mb-1">Current Balance</p>
                        <p className="text-xl font-mono text-white">${card.current_balance.toLocaleString()}</p>
                    </div>

                    <div className={cn(
                        "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border",
                        isHealthy ? "bg-green-500/10 text-green-400 border-green-500/20" :
                            isCritical ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                    )}>
                        {isHealthy ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {card.health_status}
                    </div>
                </div>
            </div>

            {/* ProgressBar */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5">
                <div
                    className={cn("h-full transition-all duration-500", isCritical ? "bg-red-500" : "bg-primary")}
                    style={{ width: `${Math.min(card.utilization_ratio * 100, 100)}%` }}
                />
            </div>
        </div>
    );
}
