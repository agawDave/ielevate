-- =========================================================
-- iElevate Database Schema
-- Peer-to-peer skill exchange platform
-- =========================================================

CREATE DATABASE IF NOT EXISTS ielevate_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE ielevate_db;

-- ---------------------------------------------------------
-- 1. USERS
-- ---------------------------------------------------------
CREATE TABLE users (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  uuid            CHAR(36) NOT NULL UNIQUE,
  full_name       VARCHAR(150) NOT NULL,
  email           VARCHAR(190) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NULL,              -- NULL if OAuth-only account
  oauth_provider  ENUM('local','google','facebook') NOT NULL DEFAULT 'local',
  oauth_id        VARCHAR(190) NULL,
  avatar_url      VARCHAR(255) NULL,
  bio             TEXT NULL,
  school_or_org   VARCHAR(190) NULL,
  role            ENUM('user','admin','moderator') NOT NULL DEFAULT 'user',
  user_type       ENUM('specialist','beneficiary') NOT NULL DEFAULT 'beneficiary', -- teaches vs. learns focus, chosen at signup
  status          ENUM('active','suspended','banned','deleted') NOT NULL DEFAULT 'active',
  email_verified_at DATETIME NULL,
  wallet_address  VARCHAR(42) NULL,                -- Ethereum/Polygon address for credentials
  last_login_at   DATETIME NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                    ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_status (status),
  INDEX idx_users_oauth (oauth_provider, oauth_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 2. SKILL CATEGORIES (taxonomy, e.g. "Programming" -> "Web Development")
-- ---------------------------------------------------------
CREATE TABLE skill_categories (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  parent_id       INT UNSIGNED NULL,
  name            VARCHAR(120) NOT NULL,
  slug            VARCHAR(140) NOT NULL UNIQUE,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_category_parent FOREIGN KEY (parent_id)
    REFERENCES skill_categories(id) ON DELETE SET NULL,
  INDEX idx_category_parent (parent_id)
) ENGINE=InnoDB;

CREATE TABLE skills (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id     INT UNSIGNED NOT NULL,
  name            VARCHAR(150) NOT NULL,
  slug            VARCHAR(170) NOT NULL UNIQUE,
  is_approved     TINYINT(1) NOT NULL DEFAULT 1,   -- for user-submitted skills pending admin review
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_skill_category FOREIGN KEY (category_id)
    REFERENCES skill_categories(id) ON DELETE CASCADE,
  INDEX idx_skill_category (category_id),
  FULLTEXT INDEX ft_skill_name (name)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 3. USER SKILL PROFILES (bidirectional: teaches vs wants_to_learn)
-- ---------------------------------------------------------
CREATE TABLE user_skills (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         BIGINT UNSIGNED NOT NULL,
  skill_id        INT UNSIGNED NOT NULL,
  relation_type   ENUM('teaches','wants_to_learn') NOT NULL,
  proficiency     ENUM('beginner','intermediate','advanced','expert') NULL, -- relevant for 'teaches'
  years_experience DECIMAL(4,1) NULL,
  description     VARCHAR(500) NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_userskill_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_userskill_skill FOREIGN KEY (skill_id)
    REFERENCES skills(id) ON DELETE CASCADE,
  UNIQUE KEY uq_user_skill_relation (user_id, skill_id, relation_type),
  INDEX idx_userskill_lookup (skill_id, relation_type)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 4. MATCHES (computed/cached bidirectional matches between two users)
-- ---------------------------------------------------------
CREATE TABLE matches (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_a_id         BIGINT UNSIGNED NOT NULL,
  user_b_id         BIGINT UNSIGNED NOT NULL,
  skill_a_teaches   INT UNSIGNED NOT NULL,   -- skill user_a teaches that user_b wants
  skill_b_teaches   INT UNSIGNED NOT NULL,   -- skill user_b teaches that user_a wants
  match_score       DECIMAL(5,2) NOT NULL DEFAULT 0,
  status            ENUM('suggested','accepted','declined','expired') NOT NULL DEFAULT 'suggested',
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                      ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_match_user_a FOREIGN KEY (user_a_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_match_user_b FOREIGN KEY (user_b_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_match_skill_a FOREIGN KEY (skill_a_teaches) REFERENCES skills(id) ON DELETE CASCADE,
  CONSTRAINT fk_match_skill_b FOREIGN KEY (skill_b_teaches) REFERENCES skills(id) ON DELETE CASCADE,
  UNIQUE KEY uq_match_pair (user_a_id, user_b_id, skill_a_teaches, skill_b_teaches),
  INDEX idx_match_status (status)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 5. SKILL EXCHANGES (an accepted match becomes a trackable exchange)
-- ---------------------------------------------------------
CREATE TABLE skill_exchanges (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  match_id        BIGINT UNSIGNED NOT NULL,
  user_a_id       BIGINT UNSIGNED NOT NULL,
  user_b_id       BIGINT UNSIGNED NOT NULL,
  skill_a_id      INT UNSIGNED NOT NULL,       -- what A teaches B
  skill_b_id      INT UNSIGNED NOT NULL,       -- what B teaches A
  status          ENUM('proposed','scheduled','in_progress','completed','cancelled','disputed')
                    NOT NULL DEFAULT 'proposed',
  started_at      DATETIME NULL,
  completed_at    DATETIME NULL,
  user_a_rating   TINYINT UNSIGNED NULL,        -- 1-5, rating given by A about B
  user_b_rating   TINYINT UNSIGNED NULL,        -- 1-5, rating given by B about A
  user_a_feedback VARCHAR(1000) NULL,
  user_b_feedback VARCHAR(1000) NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                    ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_exchange_match FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  CONSTRAINT fk_exchange_user_a FOREIGN KEY (user_a_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_exchange_user_b FOREIGN KEY (user_b_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_exchange_skill_a FOREIGN KEY (skill_a_id) REFERENCES skills(id) ON DELETE CASCADE,
  CONSTRAINT fk_exchange_skill_b FOREIGN KEY (skill_b_id) REFERENCES skills(id) ON DELETE CASCADE,
  INDEX idx_exchange_status (status),
  INDEX idx_exchange_users (user_a_id, user_b_id)
) ENGINE=InnoDB;

-- Scheduled sessions within an exchange (an exchange can have multiple sessions)
CREATE TABLE sessions (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  exchange_id     BIGINT UNSIGNED NOT NULL,
  scheduled_by    BIGINT UNSIGNED NOT NULL,
  title           VARCHAR(190) NULL,
  starts_at       DATETIME NOT NULL,
  ends_at         DATETIME NOT NULL,
  meeting_link    VARCHAR(255) NULL,
  status          ENUM('pending','confirmed','completed','cancelled','no_show')
                    NOT NULL DEFAULT 'pending',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_session_exchange FOREIGN KEY (exchange_id) REFERENCES skill_exchanges(id) ON DELETE CASCADE,
  CONSTRAINT fk_session_scheduler FOREIGN KEY (scheduled_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_session_exchange (exchange_id),
  INDEX idx_session_time (starts_at)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 6. MESSAGING (conversations + messages, backing Socket.io)
-- ---------------------------------------------------------
CREATE TABLE conversations (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_a_id       BIGINT UNSIGNED NOT NULL,
  user_b_id       BIGINT UNSIGNED NOT NULL,
  exchange_id     BIGINT UNSIGNED NULL,        -- optional link to an active exchange
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_conv_user_a FOREIGN KEY (user_a_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_conv_user_b FOREIGN KEY (user_b_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_conv_exchange FOREIGN KEY (exchange_id) REFERENCES skill_exchanges(id) ON DELETE SET NULL,
  UNIQUE KEY uq_conversation_pair (user_a_id, user_b_id)
) ENGINE=InnoDB;

CREATE TABLE messages (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  conversation_id BIGINT UNSIGNED NOT NULL,
  sender_id       BIGINT UNSIGNED NOT NULL,
  body            TEXT NOT NULL,
  attachment_url  VARCHAR(255) NULL,
  read_at         DATETIME NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_message_conversation FOREIGN KEY (conversation_id)
    REFERENCES conversations(id) ON DELETE CASCADE,
  CONSTRAINT fk_message_sender FOREIGN KEY (sender_id)
    REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_message_conversation_time (conversation_id, created_at)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 7. BLOCKCHAIN CREDENTIALS
-- ---------------------------------------------------------
CREATE TABLE credentials (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  exchange_id       BIGINT UNSIGNED NOT NULL,
  recipient_id      BIGINT UNSIGNED NOT NULL,   -- user who "learned" and receives the credential
  skill_id          INT UNSIGNED NOT NULL,
  issuer_id         BIGINT UNSIGNED NOT NULL,   -- user who taught the skill
  token_id          VARCHAR(100) NULL,          -- on-chain NFT/token id, once minted
  contract_address  VARCHAR(42) NULL,
  chain             ENUM('polygon','ethereum','mumbai_testnet','amoy_testnet') NOT NULL DEFAULT 'polygon',
  tx_hash           VARCHAR(66) NULL,
  metadata_uri      VARCHAR(255) NULL,          -- IPFS/Arweave URI for cert metadata
  status            ENUM('pending','minted','failed','revoked') NOT NULL DEFAULT 'pending',
  issued_at         DATETIME NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_credential_exchange FOREIGN KEY (exchange_id) REFERENCES skill_exchanges(id) ON DELETE CASCADE,
  CONSTRAINT fk_credential_recipient FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_credential_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
  CONSTRAINT fk_credential_issuer FOREIGN KEY (issuer_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_credential_recipient (recipient_id),
  INDEX idx_credential_status (status)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 8. DISPUTES (admin module)
-- ---------------------------------------------------------
CREATE TABLE disputes (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  exchange_id     BIGINT UNSIGNED NOT NULL,
  raised_by       BIGINT UNSIGNED NOT NULL,
  reason          VARCHAR(500) NOT NULL,
  details         TEXT NULL,
  status          ENUM('open','under_review','resolved','dismissed') NOT NULL DEFAULT 'open',
  resolved_by     BIGINT UNSIGNED NULL,          -- admin user id
  resolution_notes TEXT NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at     DATETIME NULL,
  CONSTRAINT fk_dispute_exchange FOREIGN KEY (exchange_id) REFERENCES skill_exchanges(id) ON DELETE CASCADE,
  CONSTRAINT fk_dispute_raiser FOREIGN KEY (raised_by) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_dispute_resolver FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_dispute_status (status)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 9. NOTIFICATIONS (in-app)
-- ---------------------------------------------------------
CREATE TABLE notifications (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         BIGINT UNSIGNED NOT NULL,
  type            VARCHAR(60) NOT NULL,        -- 'new_match', 'new_message', 'session_reminder', 'credential_issued', etc.
  payload         JSON NULL,
  read_at         DATETIME NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notification_user_unread (user_id, read_at)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 10. REFRESH TOKENS (JWT refresh-token rotation)
-- ---------------------------------------------------------
CREATE TABLE refresh_tokens (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         BIGINT UNSIGNED NOT NULL,
  token_hash      VARCHAR(255) NOT NULL,
  expires_at      DATETIME NOT NULL,
  revoked_at      DATETIME NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_refresh_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_refresh_user (user_id)
) ENGINE=InnoDB;
