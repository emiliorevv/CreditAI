export interface IUser {
    id: string;
    email: string;
    full_name?: string;
    created_at?: string;
}

export interface ICardBenefits {
    [category: string]: number; // e.g., "dining": 4 (percent or multiplier)
}

export interface ICardModel {
    id: string;
    name: string;
    issuer: string;
    benefits: ICardBenefits;
    rewards_type: 'points' | 'cashback';
    image_url?: string;
}

export interface IUserCard {
    id: string;
    user_id: string;
    model_id: string;
    card_model?: ICardModel; // Populated/Joined data
    current_balance: number;
    credit_limit: number;
    closing_day: number; // 1-31
    due_day: number;     // 1-31
}

// For API Responses where we return calculated dates
export interface ICardStatus extends IUserCard {
    days_remaining: number;
    next_closing_date: string; // ISO Date
    next_payment_due_date: string; // ISO Date
    utilization_ratio: number; // 0-1
    health_status: 'Good' | 'Warning' | 'Critical';
}
