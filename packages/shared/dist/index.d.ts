export interface IUser {
    id: string;
    email: string;
    created_at: string;
}
export interface ICreditCard {
    id: string;
    user_id: string;
    name: string;
    closing_date: number;
    payment_due_date: number;
    limit: number;
    current_balance: number;
    benefits: Record<string, string>;
}
