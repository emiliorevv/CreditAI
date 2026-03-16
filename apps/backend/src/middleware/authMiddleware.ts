import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import type { User } from '@supabase/supabase-js';

export interface AuthRequest extends Request {
    user?: User;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Missing Authorization header' });
    }

    if (!authHeader.startsWith('Bearer ')) {
        console.error('[AuthMiddleware] Invalid header format');
        return res.status(401).json({ error: 'Invalid Authorization header format' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        console.error('[AuthMiddleware] No token found');
        return res.status(401).json({ error: 'Invalid Authorization header format' });
    }

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            console.error('[AuthMiddleware] Auth failed:', error?.message);
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        if (process.env.NODE_ENV === 'development' || process.env.DEBUG) {
            const maskedId = user.id ? `${user.id.substring(0, 4)}...` : 'unknown';
            console.debug(`[AuthMiddleware] Auth OK: ${maskedId} | ${req.method} ${req.path}`);
        }

        req.user = user;
        next();
    } catch (error: any) {
        console.error('[AuthMiddleware] Unexpected error', error);
        return res.status(500).json({ error: 'Authentication failed' });
    }
};
