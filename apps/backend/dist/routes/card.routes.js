"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CardController_1 = require("../controllers/CardController");
const router = (0, express_1.Router)();
router.get('/', CardController_1.CardController.getCards);
exports.default = router;
