-- Seed Data for Proph Study Hub

-- 1. Initial Universities
INSERT INTO universities (id, name, acronym, location, logo) VALUES
(uuid_generate_v4(), 'Federal University of Agriculture, Abeokuta', 'FUNAAB', 'Abeokuta, Ogun State', 'https://picsum.photos/seed/funaab/200/200'),
(uuid_generate_v4(), 'University of Ibadan', 'UI', 'Ibadan, Oyo State', 'https://picsum.photos/seed/ui/200/200'),
(uuid_generate_v4(), 'University of Lagos', 'UNILAG', 'Akoka, Lagos State', 'https://picsum.photos/seed/unilag/200/200'),
(uuid_generate_v4(), 'Obafemi Awolowo University', 'OAU', 'Ile-Ife, Osun State', 'https://picsum.photos/seed/oau/200/200'),
(uuid_generate_v4(), 'University of Nigeria, Nsukka', 'UNN', 'Nsukka, Enugu State', 'https://picsum.photos/seed/unn/200/200')
ON CONFLICT (acronym) DO NOTHING;

-- 2. Default System Config
INSERT INTO system_config (id, config) VALUES
('default', '{
  "is_ai_enabled": true,
  "is_upload_enabled": true,
  "is_withdrawal_enabled": true,
  "is_maintenance_mode": false,
  "is_community_enabled": true,
  "is_ads_enabled": true,
  "is_user_ads_enabled": true,
  "naira_per_point": 10,
  "ad_pricing": {
    "banner": 5000,
    "popup": 10000,
    "native": 7500
  },
  "premium_tiers": {
    "monthly": 2000,
    "yearly": 15000
  },
  "payment_account": {
    "bankName": "Proph Bank",
    "accountNumber": "0123456789",
    "accountName": "Proph Academic Node"
  }
}')
ON CONFLICT (id) DO UPDATE SET config = EXCLUDED.config;

-- 3. Default Admin User (Optional, user will likely sign up)
-- Note: In Supabase, users are usually created via Auth. 
-- This is just a placeholder for the public.users table if needed.
-- INSERT INTO users (email, name, nickname, role, is_admin) 
-- VALUES ('admin@proph.com', 'Proph Admin', 'proph_admin', 'admin', true)
-- ON CONFLICT (email) DO NOTHING;
