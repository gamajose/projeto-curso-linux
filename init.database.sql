-- init.postgres.sql
-- Script PostgreSQL para o projeto curso

-- Conectar ao banco (faça isso manualmente antes)
-- \c curso

-- Criação da tabela certificates
CREATE TABLE IF NOT EXISTS certificates (
    id SERIAL PRIMARY KEY,
    participant_name VARCHAR(255) NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    hours INTEGER NOT NULL,
    issue_date DATE NOT NULL,
    completion_date DATE NOT NULL,
    certificate_id VARCHAR(50) UNIQUE NOT NULL,
    modalidade VARCHAR(100) DEFAULT 'Online',
    instrutor VARCHAR(255) DEFAULT 'José Moraes',
    diretor VARCHAR(255) DEFAULT 'Danilo Germano',
    organizacao VARCHAR(255) DEFAULT 'Red Innovations',
    hash_verificacao VARCHAR(50) UNIQUE NOT NULL,
    valido BOOLEAN DEFAULT TRUE,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_certificates_participant_name ON certificates(participant_name);
CREATE INDEX IF NOT EXISTS idx_certificates_course_name ON certificates(course_name);
CREATE INDEX IF NOT EXISTS idx_certificates_certificate_id ON certificates(certificate_id);
CREATE INDEX IF NOT EXISTS idx_certificates_hash_verificacao ON certificates(hash_verificacao);
CREATE INDEX IF NOT EXISTS idx_certificates_issue_date ON certificates(issue_date);
CREATE INDEX IF NOT EXISTS idx_certificates_completion_date ON certificates(completion_date);
CREATE INDEX IF NOT EXISTS idx_certificates_valido ON certificates(valido) WHERE valido = TRUE;
CREATE INDEX IF NOT EXISTS idx_certificates_course_issue_date ON certificates(course_name, issue_date);
CREATE INDEX IF NOT EXISTS idx_certificates_name_course ON certificates(participant_name, course_name);
CREATE INDEX IF NOT EXISTS idx_certificates_org_issue_date ON certificates(organizacao, issue_date);

-- Tabela users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP WITH TIME ZONE,
    avatar_url TEXT,
    cpf VARCHAR(11),
    birth_date DATE,
    gender VARCHAR(50),
    phone_fixed VARCHAR(20),
    phone_mobile VARCHAR(20),
    address_street VARCHAR(255),
    address_number VARCHAR(50),
    address_district VARCHAR(100),
    address_city VARCHAR(100),
    address_state VARCHAR(50),
    address_zipcode VARCHAR(11),
    linkedin_profile VARCHAR(255),
    organization VARCHAR(100),
    "position" VARCHAR(100),
    observations TEXT,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1
);

-- Tabela user_course_progress
CREATE TABLE IF NOT EXISTS user_course_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL,
    lesson_id INTEGER NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id, lesson_id)
);

-- Tabela badges
CREATE TABLE IF NOT EXISTS badges (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(255) NOT NULL
);

-- Tabela user_badges
CREATE TABLE IF NOT EXISTS user_badges (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    badge_id INTEGER REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, badge_id)
);