IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'curso')
BEGIN
    CREATE DATABASE curso;
END;

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='certificates' AND xtype='U')
CREATE TABLE certificates (
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
    valido BOOLEAN DEFAULT true,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- INSERT INTO certificates (
--     participant_name, 
--     course_name, 
--     hours, 
--     issue_date, 
--     completion_date, 
--     certificate_id, 
--     modalidade, 
--     organizacao, 
--     instrutor, 
--     diretor, 
--     hash_verificacao,
--     valido
-- ) VALUES
-- ('Jorge Akira', 'Curso de Linux', 20, '2025-10-01', '2025-10-01', 'LINUX2025-001', 'Online', 'Red Innovations', 'José Moraes', 'Danilo Germano', 'a7b9c3d2e1f4', true),
-- ('Matheus Cerqueira', 'Curso de Linux', 20, '2025-10-01', '2025-10-01', 'LINUX2025-002', 'Online', 'Red Innovations', 'José Moraes', 'Danilo Germano', 'b8c4d5e9f2a6', true),
-- ('Matheus Godoy', 'Curso de Linux', 20, '2025-10-01', '2025-10-01', 'LINUX2025-003', 'Online', 'Red Innovations', 'José Moraes', 'Danilo Germano', 'c9d7e3f1b5a8', true),
-- ('Willian Gama', 'Curso de Linux', 20, '2025-10-01', '2025-10-01', 'LINUX2025-004', 'Online', 'Red Innovations', 'José Moraes', 'Danilo Germano', 'd2e4f6a8b1c3', true),
-- ('Brian Mendes', 'Curso de Linux', 20, '2025-10-01', '2025-10-01', 'LINUX2025-005', 'Online', 'Red Innovations', 'José Moraes', 'Danilo Germano', 'e3f5a7b9c1d2', true),
-- ('Vitor Silva', 'Curso de Linux', 20, '2025-10-01', '2025-10-01', 'LINUX2025-006', 'Online', 'Red Innovations', 'José Moraes', 'Danilo Germano', 'f4a6b8c2d0e1', true),
-- ('Newman Neto', 'Curso de Linux', 20, '2025-10-01', '2025-10-01', 'LINUX2025-007', 'Online', 'Red Innovations', 'José Moraes', 'Danilo Germano', 'a5b7c9d1e3f2', true),
-- ('Danilo Germano', 'Curso de Linux', 20, '2025-10-01', '2025-10-01', 'LINUX2025-008', 'Online', 'Red Innovations', 'José Moraes', 'Danilo Germano', 'b6c8d0e2f4a3', true),
-- ('Claudio Moreti', 'Curso de Linux', 20, '2025-10-01', '2025-10-01', 'LINUX2025-009', 'Online', 'Red Innovations', 'José Moraes', 'Danilo Germano', 'c7d9e1f3a5b4', true),
-- ('Robson Silva', 'Curso de Linux', 20, '2025-10-01', '2025-10-01', 'LINUX2025-010', 'Online', 'Red Innovations', 'José Moraes', 'Danilo Germano', 'd8e0f2a4b6c5', true);


CREATE INDEX idx_certificates_participant_name ON certificates(participant_name);
CREATE INDEX idx_certificates_course_name ON certificates(course_name);
CREATE INDEX idx_certificates_certificate_id ON certificates(certificate_id);
CREATE INDEX idx_certificates_hash_verificacao ON certificates(hash_verificacao);
CREATE INDEX idx_certificates_issue_date ON certificates(issue_date);
CREATE INDEX idx_certificates_completion_date ON certificates(completion_date);

CREATE INDEX idx_certificates_valido ON certificates(valido) WHERE valido = 1;

CREATE INDEX idx_certificates_course_issue_date ON certificates(course_name, issue_date);
CREATE INDEX idx_certificates_name_course ON certificates(participant_name, course_name);
CREATE INDEX idx_certificates_org_issue_date ON certificates(organizacao, issue_date);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
    reset_token VARCHAR(255),
    reset_token_expires DATETIMEOFFSET
);

ALTER TABLE users ADD COLUMN avatar_url TEXT;

ALTER TABLE users
ADD COLUMN cpf VARCHAR(11),
ADD COLUMN birth_date DATE,
ADD COLUMN gender VARCHAR(50),
ADD COLUMN phone_fixed VARCHAR(20),
ADD COLUMN phone_mobile VARCHAR(20),
ADD COLUMN address_street VARCHAR(255),
ADD COLUMN address_number VARCHAR(50),
ADD COLUMN address_district VARCHAR(100),
ADD COLUMN address_city VARCHAR(100),
ADD COLUMN address_state VARCHAR(50),
ADD COLUMN address_zipcode VARCHAR(11),
ADD COLUMN linkedin_profile VARCHAR(255),
ADD COLUMN organization VARCHAR(100),
ADD COLUMN "position" VARCHAR(100),
ADD COLUMN observations TEXT;

ALTER TABLE users
ADD COLUMN xp INTEGER DEFAULT 0,
ADD COLUMN level INTEGER DEFAULT 1;

CREATE TABLE user_course_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL,
    lesson_id INTEGER NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id, lesson_id)
);

CREATE TABLE badges (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(255) NOT NULL -- Caminho para a imagem da insígnia
);

CREATE TABLE user_badges (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    badge_id INTEGER REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, badge_id)
);