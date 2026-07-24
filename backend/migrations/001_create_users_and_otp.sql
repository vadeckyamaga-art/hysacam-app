-- Migration 001 : utilisateurs et codes OTP
-- Nécessite l'extension pgcrypto pour gen_random_uuid()

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_role AS ENUM ('citizen', 'agent', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'warned', 'suspended');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(150),
    city VARCHAR(100),
    role user_role NOT NULL DEFAULT 'citizen',
    status user_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_phone ON users (phone);

CREATE TABLE otp_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    attempts INT NOT NULL DEFAULT 0,
    consumed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_otp_user_id ON otp_codes (user_id);

-- Un seul agent/admin de test pour développement local (à retirer en production)
-- INSERT INTO users (phone, name, role) VALUES ('+237600000000', 'Agent Test', 'agent');
