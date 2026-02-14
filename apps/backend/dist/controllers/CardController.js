"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardController = void 0;
const CardService_1 = require("../services/CardService");
class CardController {
    static getUserId(req) {
        const userIdHeader = req.headers['x-user-id'];
        const userId = Array.isArray(userIdHeader) ? userIdHeader[0] : userIdHeader;
        return userId || null;
    }
    static async getCards(req, res) {
        try {
            const userId = CardController.getUserId(req);
            if (!userId)
                return res.status(400).json({ error: 'User ID required' });
            const cards = await CardService_1.CardService.getUserCards(userId);
            res.json(cards); // Returns ICardStatus[]
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async getModels(req, res) {
        try {
            const models = await CardService_1.CardService.getCardModels();
            res.json(models);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async createCard(req, res) {
        try {
            const userId = CardController.getUserId(req);
            if (!userId)
                return res.status(400).json({ error: 'User ID required' });
            const newCard = await CardService_1.CardService.createCard(userId, req.body);
            res.status(201).json(newCard);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.CardController = CardController;
