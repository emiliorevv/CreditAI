"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardService = void 0;
const supabase_1 = require("../config/supabase");
const date_fns_1 = require("date-fns");
class CardService {
    static async getUserCards(userId) {
        const { data, error } = await supabase_1.supabase
            .from('user_cards')
            .select('*, card_model:card_models(*)')
            .eq('user_id', userId);
        if (error)
            throw new Error(error.message);
        // Transform data with calculated fields
        return data.map(card => this.calculateCardStatus(card));
    }
    static calculateCardStatus(card) {
        const today = new Date();
        const closingDay = card.closing_day;
        const dueDay = card.due_day;
        // 1. Calculate Next Closing Date
        // Set the day of the month to the Card's closing day
        let nextClosingDate = (0, date_fns_1.setDate)(today, closingDay);
        // If that date has already passed this month (and it's not today), 
        // it means the next closing date is next month.
        if ((0, date_fns_1.isPast)(nextClosingDate) && !this.isToday(nextClosingDate)) {
            nextClosingDate = (0, date_fns_1.addMonths)(nextClosingDate, 1);
        }
        // 2. Calculate Next Payment Due Date
        // Usually payment due date is in the month FOLLOWING the closing date
        // If dueDay < closingDay, it's definitely next month relative to closing date
        // (e.g. Closes 15th, Due 5th of next month)
        let nextDueDate = (0, date_fns_1.setDate)(nextClosingDate, dueDay);
        if (nextDueDate < nextClosingDate) {
            // If the due date calculation resulted in a date BEFORE the closing date,
            // it must be the following month.
            nextDueDate = (0, date_fns_1.addMonths)(nextDueDate, 1);
        }
        // 3. Days Remaining (to closing date)
        const daysRemaining = (0, date_fns_1.differenceInDays)(nextClosingDate, today);
        // 4. Utilization & Health
        const utilization = card.current_balance / card.credit_limit;
        let health = 'Good';
        if (utilization > 0.3)
            health = 'Warning';
        if (utilization > 0.8)
            health = 'Critical';
        return {
            ...card,
            days_remaining: daysRemaining,
            next_closing_date: (0, date_fns_1.format)(nextClosingDate, 'yyyy-MM-dd'),
            next_payment_due_date: (0, date_fns_1.format)(nextDueDate, 'yyyy-MM-dd'),
            utilization_ratio: Number(utilization.toFixed(2)),
            health_status: health
        };
    }
    static isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    }
}
exports.CardService = CardService;
