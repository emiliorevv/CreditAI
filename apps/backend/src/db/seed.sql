-- Insert standard card models
INSERT INTO public.card_models (name, issuer, benefits, rewards_type) VALUES
('Gold Card', 'American Express', '{"dining": 4, "groceries": 4, "flights": 3}', 'points'),
('Platinum Card', 'American Express', '{"flights": 5, "hotels": 5}', 'points'),
('Sapphire Preferred', 'Chase', '{"travel": 2, "dining": 3}', 'points'),
('Freedom Unlimited', 'Chase', '{"all": 1.5, "dining": 3}', 'cashback'),
('SavorOne', 'Capital One', '{"dining": 3, "groceries": 3, "entertainment": 3}', 'cashback');
