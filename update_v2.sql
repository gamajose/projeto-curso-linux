-- Adiciona um nome de usuário único e um campo de admin à tabela de usuários
ALTER TABLE users
ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Cria a tabela de Cursos
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration VARCHAR(50)
);

-- Cria a tabela de Aulas, ligada aos Cursos
CREATE TABLE IF NOT EXISTS lessons (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    duration VARCHAR(50),
    video_url VARCHAR(255)
);

-- Insere os dados dos seus cursos e aulas (executar apenas uma vez)
-- (O comando ON CONFLICT garante que não haverá duplicatas se você rodar o script novamente)
INSERT INTO courses (id, title, description, duration) VALUES
(1, 'Introdução ao Linux', 'Aprenda os conceitos fundamentais do sistema operacional Linux, sua história e distribuições.', '2 horas') ON CONFLICT (id) DO NOTHING;

INSERT INTO lessons (course_id, id, title, duration, video_url) VALUES
(1, 1, 'O que é Linux?', '15 min', '/videos/video1.mp4'),
(1, 2, 'História do Linux', '20 min', '/videos/video2.mp4'),
(1, 3, 'Distribuições Linux', '25 min', '/videos/video3.mp4'),
(1, 4, 'Instalação do Linux', '30 min', '/videos/video4.mp4'),
(1, 5, 'Primeiros Passos', '30 min', '/videos/video5.mp4') ON CONFLICT (course_id, id) DO NOTHING;



-- Exemplo para a primeira aula (ID = 1)
UPDATE lessons SET video_url = 'https://www.youtube.com/watch?v=u1xrNaTO1bI&list=RDu1xrNaTO1bI&start_radio=1' WHERE id = 1;

-- Exemplo para a segunda aula (ID = 2)
UPDATE lessons SET video_url = 'https://www.youtube.com/watch?v=SEU_CODIGO_DO_VIDEO_2' WHERE id = 2;



-- ... e assim por diante para todas as suas 20 aulas.