"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardController = void 0;
const CardService_1 = require("../services/CardService");
class CardController {
    static async getCards(req, res) {
        try {
            // In a real app, userId comes from Auth middleware
            // For now, we might expect it in headers or query for testing
            const userId = req.headers['x-user-id']; // Temporary
            if (!userId) {
                return res.status(400).json({ error: 'User ID required' });
            }
            const cards = await CardService_1.CardService.getUserCards(userId);
            res.json(cards);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.CardController = CardController;
