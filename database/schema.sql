CREATE DATABASE IF NOT EXISTS zelo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'zelo_app'@'localhost' IDENTIFIED BY 'troque_esta_senha';
GRANT SELECT, INSERT, UPDATE, DELETE ON zelo.* TO 'zelo_app'@'localhost';
FLUSH PRIVILEGES;
USE zelo;

CREATE TABLE usuarios (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 nome VARCHAR(150) NOT NULL,
 email VARCHAR(180) NOT NULL UNIQUE,
 senha_hash VARCHAR(255) NOT NULL,
 tipo ENUM('paciente','profissional','cuidador','responsavel') NOT NULL DEFAULT 'paciente',
 status ENUM('ativo','inativo','bloqueado') NOT NULL DEFAULT 'ativo',
 ultimo_login DATETIME NULL,
 criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE perfis_profissionais (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 usuario_id BIGINT UNSIGNED NOT NULL UNIQUE,
 registro_profissional VARCHAR(80),
 especialidade VARCHAR(120),
 FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
CREATE TABLE vinculos_cuidado (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 paciente_id BIGINT UNSIGNED NOT NULL,
 usuario_id BIGINT UNSIGNED NOT NULL,
 papel ENUM('cuidador','responsavel','profissional') NOT NULL,
 permissoes JSON NULL,
 status ENUM('pendente','ativo','revogado') NOT NULL DEFAULT 'pendente',
 criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE KEY uq_vinculo(paciente_id,usuario_id,papel),
 FOREIGN KEY(paciente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
 FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
CREATE TABLE medicamentos (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 paciente_id BIGINT UNSIGNED NOT NULL,
 nome VARCHAR(180) NOT NULL,
 dose VARCHAR(120), horario VARCHAR(80), frequencia VARCHAR(120), observacoes TEXT,
 criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(paciente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
 INDEX idx_med_paciente(paciente_id)
);
CREATE TABLE consultas (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 paciente_id BIGINT UNSIGNED NOT NULL,
 data_hora DATETIME NOT NULL,
 tipo VARCHAR(120), local VARCHAR(180), profissional VARCHAR(180),
 status ENUM('agendada','confirmada','realizada','cancelada') NOT NULL DEFAULT 'agendada',
 observacoes TEXT,
 FOREIGN KEY(paciente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
 INDEX idx_consulta_paciente_data(paciente_id,data_hora)
);
CREATE TABLE exames (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 paciente_id BIGINT UNSIGNED NOT NULL,
 nome VARCHAR(180) NOT NULL,
 data_realizacao DATE,
 status VARCHAR(100),
 laudo LONGTEXT,
 observacoes TEXT,
 criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(paciente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
 INDEX idx_exame_paciente(paciente_id)
);
CREATE TABLE evolucoes_clinicas (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 paciente_id BIGINT UNSIGNED NOT NULL,
 profissional_id BIGINT UNSIGNED NULL,
 data_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 tipo VARCHAR(100),
 descricao LONGTEXT NOT NULL,
 FOREIGN KEY(paciente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
 FOREIGN KEY(profissional_id) REFERENCES usuarios(id) ON DELETE SET NULL,
 INDEX idx_evolucao_paciente_data(paciente_id,data_hora)
);
CREATE TABLE procedimentos (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 paciente_id BIGINT UNSIGNED NOT NULL,
 profissional_id BIGINT UNSIGNED NULL,
 nome VARCHAR(180) NOT NULL,
 data_hora DATETIME,
 descricao TEXT,
 status VARCHAR(80),
 FOREIGN KEY(paciente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
 FOREIGN KEY(profissional_id) REFERENCES usuarios(id) ON DELETE SET NULL
);
CREATE TABLE orientacoes (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 paciente_id BIGINT UNSIGNED NOT NULL,
 profissional_id BIGINT UNSIGNED NULL,
 titulo VARCHAR(180) NOT NULL,
 conteudo LONGTEXT NOT NULL,
 ativa BOOLEAN NOT NULL DEFAULT TRUE,
 criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(paciente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
 FOREIGN KEY(profissional_id) REFERENCES usuarios(id) ON DELETE SET NULL
);
CREATE TABLE preferencias_usuario (
 usuario_id BIGINT UNSIGNED PRIMARY KEY,
 fonte_ampliada BOOLEAN NOT NULL DEFAULT FALSE,
 alto_contraste BOOLEAN NOT NULL DEFAULT FALSE,
 leitura_voz BOOLEAN NOT NULL DEFAULT FALSE,
 interface_simplificada BOOLEAN NOT NULL DEFAULT FALSE,
 FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
CREATE TABLE auditoria (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 usuario_id BIGINT UNSIGNED NULL,
 acao VARCHAR(80) NOT NULL,
 entidade VARCHAR(80) NOT NULL,
 entidade_id BIGINT UNSIGNED NULL,
 ip VARCHAR(64),
 criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
 INDEX idx_auditoria_usuario_data(usuario_id,criado_em)
);
