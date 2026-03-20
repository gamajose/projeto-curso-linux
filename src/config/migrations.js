// src/config/migrations.js
const pool = require('./database');

class DatabaseMigrations {
    
    /**
     * Executa todas as migrations necessárias
     */
    static async runAll() {
        console.log('🔄 Iniciando migrations do banco de dados...');
        
        try {
            await this.createUsersTable();
            await this.createCoursesTable();
            await this.createLessonsTable();
            await this.createUserCourseProgressTable();
            await this.createCertificatesTable();
            await this.createBadgesTable();
            await this.createUserBadgesTable();
            
            console.log('✅ Todas as migrations foram executadas com sucesso!');
            return true;
        } catch (error) {
            console.error('❌ Erro ao executar migrations:', error);
            throw error;
        }
    }

    /**
     * Cria a tabela de usuários
     */
    static async createUsersTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                username VARCHAR(50) UNIQUE,
                is_admin BOOLEAN DEFAULT FALSE,
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
                position VARCHAR(100),
                observations TEXT,
                xp INTEGER DEFAULT 0,
                level INTEGER DEFAULT 1,
                reset_token VARCHAR(255),
                reset_token_expires TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- Criar índices
            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
            CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
        `;

        try {
            await pool.query(query);
            console.log('✅ Tabela "users" verificada/criada');
        } catch (error) {
            console.error('❌ Erro ao criar tabela "users":', error.message);
            throw error;
        }
    }

    /**
     * Cria a tabela de cursos
     */
    static async createCoursesTable() {
        try {
            // Criar tabela se não existir
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS courses (
                    id SERIAL PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `;
            await pool.query(createTableQuery);

            // Adicionar coluna duration se não existir
            const addDurationQuery = `
                DO $$ 
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'courses' AND column_name = 'duration'
                    ) THEN
                        ALTER TABLE courses ADD COLUMN duration VARCHAR(50);
                    END IF;
                END $$;
            `;
            await pool.query(addDurationQuery);

            // Inserir curso padrão se não existir
            const insertCourseQuery = `
                INSERT INTO courses (id, title, description, duration) 
                VALUES (1, 'Introdução ao Linux', 'Aprenda os conceitos fundamentais do sistema operacional Linux, sua história e distribuições.', '2 horas')
                ON CONFLICT (id) DO NOTHING;
            `;
            await pool.query(insertCourseQuery);

            console.log('✅ Tabela "courses" verificada/criada');
        } catch (error) {
            console.error('❌ Erro ao criar tabela "courses":', error.message);
            throw error;
        }
    }

    /**
     * Cria a tabela de aulas
     */
    static async createLessonsTable() {
        try {
            // Criar tabela se não existir
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS lessons (
                    id SERIAL PRIMARY KEY,
                    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
                    title VARCHAR(255) NOT NULL,
                    video_url VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `;
            await pool.query(createTableQuery);

            // Adicionar coluna duration se não existir
            const addDurationQuery = `
                DO $$ 
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'lessons' AND column_name = 'duration'
                    ) THEN
                        ALTER TABLE lessons ADD COLUMN duration VARCHAR(50);
                    END IF;
                END $$;
            `;
            await pool.query(addDurationQuery);

            // Criar índice
            const createIndexQuery = `
                CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
            `;
            await pool.query(createIndexQuery);

            // Inserir aulas padrão se não existirem (com verificação)
            const insertLessonsQuery = `
                INSERT INTO lessons (course_id, id, title, duration, video_url) VALUES
                (1, 1, 'O que é Linux?', '15 min', 'https://www.youtube.com/watch?v=u1xrNaTO1bI'),
                (1, 2, 'História do Linux', '20 min', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
                (1, 3, 'Distribuições Linux', '25 min', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
                (1, 4, 'Instalação do Linux', '30 min', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
                (1, 5, 'Primeiros Passos', '30 min', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
                ON CONFLICT (id) DO NOTHING;
            `;
            await pool.query(insertLessonsQuery);

            console.log('✅ Tabela "lessons" verificada/criada');
        } catch (error) {
            console.error('❌ Erro ao criar tabela "lessons":', error.message);
            throw error;
        }
    }

    /**
     * Cria a tabela de progresso do usuário
     */
    static async createUserCourseProgressTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS user_course_progress (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                course_id INTEGER NOT NULL,
                lesson_id INTEGER NOT NULL,
                completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, course_id, lesson_id)
            );

            -- Criar índices
            CREATE INDEX IF NOT EXISTS idx_progress_user_id ON user_course_progress(user_id);
            CREATE INDEX IF NOT EXISTS idx_progress_course_id ON user_course_progress(course_id);
        `;

        try {
            await pool.query(query);
            console.log('✅ Tabela "user_course_progress" verificada/criada');
        } catch (error) {
            console.error('❌ Erro ao criar tabela "user_course_progress":', error.message);
            throw error;
        }
    }

    /**
     * Cria a tabela de certificados
     */
    static async createCertificatesTable() {
        try {
            // Criar tabela se não existir
            const createTableQuery = `
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
                    organizacao VARCHAR(255) DEFAULT 'Academy Z',
                    hash_verificacao VARCHAR(50) UNIQUE NOT NULL,
                    valido BOOLEAN DEFAULT true,
                    download_count INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `;
            await pool.query(createTableQuery);

            // Adicionar coluna template_type se não existir
            const addTemplateTypeQuery = `
                DO $$ 
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'certificates' AND column_name = 'template_type'
                    ) THEN
                        ALTER TABLE certificates ADD COLUMN template_type VARCHAR(50) DEFAULT 'cert-mod-linux';
                    END IF;
                END $$;
            `;
            await pool.query(addTemplateTypeQuery);

            // Criar índices
            const createIndexesQuery = `
                CREATE INDEX IF NOT EXISTS idx_certificates_participant_name ON certificates(participant_name);
                CREATE INDEX IF NOT EXISTS idx_certificates_course_name ON certificates(course_name);
                CREATE INDEX IF NOT EXISTS idx_certificates_certificate_id ON certificates(certificate_id);
                CREATE INDEX IF NOT EXISTS idx_certificates_hash_verificacao ON certificates(hash_verificacao);
                CREATE INDEX IF NOT EXISTS idx_certificates_issue_date ON certificates(issue_date);
                CREATE INDEX IF NOT EXISTS idx_certificates_completion_date ON certificates(completion_date);
                CREATE INDEX IF NOT EXISTS idx_certificates_name_course ON certificates(participant_name, course_name);
                CREATE INDEX IF NOT EXISTS idx_certificates_org_issue_date ON certificates(organizacao, issue_date);
                CREATE INDEX IF NOT EXISTS idx_certificates_template_type ON certificates(template_type);
            `;
            await pool.query(createIndexesQuery);

            console.log('✅ Tabela "certificates" verificada/criada');
        } catch (error) {
            console.error('❌ Erro ao criar tabela "certificates":', error.message);
            throw error;
        }
    }

    /**
     * Cria a tabela de badges (insígnias)
     */
    static async createBadgesTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS badges (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                image_url VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;

        try {
            await pool.query(query);
            console.log('✅ Tabela "badges" verificada/criada');
        } catch (error) {
            console.error('❌ Erro ao criar tabela "badges":', error.message);
            throw error;
        }
    }

    /**
     * Cria a tabela de badges dos usuários
     */
    static async createUserBadgesTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS user_badges (
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                badge_id INTEGER REFERENCES badges(id) ON DELETE CASCADE,
                earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id, badge_id)
            );

            -- Criar índices
            CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
            CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);
        `;

        try {
            await pool.query(query);
            console.log('✅ Tabela "user_badges" verificada/criada');
        } catch (error) {
            console.error('❌ Erro ao criar tabela "user_badges":', error.message);
            throw error;
        }
    }

    /**
     * Verifica se uma tabela existe
     */
    static async tableExists(tableName) {
        const query = `
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = $1
            );
        `;

        try {
            const result = await pool.query(query, [tableName]);
            return result.rows[0].exists;
        } catch (error) {
            console.error(`❌ Erro ao verificar tabela "${tableName}":`, error.message);
            return false;
        }
    }

    /**
     * Lista todas as tabelas do banco
     */
    static async listTables() {
        const query = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        `;

        try {
            const result = await pool.query(query);
            return result.rows.map(row => row.table_name);
        } catch (error) {
            console.error('❌ Erro ao listar tabelas:', error.message);
            return [];
        }
    }
}

module.exports = DatabaseMigrations;
