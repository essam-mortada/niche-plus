-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT,
  role VARCHAR(50) DEFAULT 'public',
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Suppliers table
CREATE TABLE suppliers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255),
  bio TEXT,
  website VARCHAR(255),
  socials JSONB DEFAULT '{}',
  kyc_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  supplier_id INTEGER REFERENCES suppliers(id) ON DELETE CASCADE,
  plan_name VARCHAR(100),
  price_usd INTEGER,
  status VARCHAR(50) DEFAULT 'inactive',
  credits_total INTEGER DEFAULT 0,
  credits_used INTEGER DEFAULT 0,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(supplier_id)
);

-- Ad Categories table
CREATE TABLE ad_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Marketplace Ads table
CREATE TABLE marketplace_ads (
  id SERIAL PRIMARY KEY,
  supplier_id INTEGER REFERENCES suppliers(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255),
  category_id INTEGER REFERENCES ad_categories(id) ON DELETE SET NULL,
  short_desc TEXT,
  long_desc TEXT,
  media JSONB DEFAULT '[]',
  price_label VARCHAR(100),
  location VARCHAR(255),
  cta_quote BOOLEAN DEFAULT false,
  cta_whatsapp BOOLEAN DEFAULT false,
  whatsapp_number VARCHAR(50),
  status VARCHAR(50) DEFAULT 'draft',
  moderation_reason TEXT,
  go_live_at TIMESTAMP,
  expire_at TIMESTAMP,
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Awards table
CREATE TABLE awards (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  country VARCHAR(100),
  city VARCHAR(100),
  venue VARCHAR(255),
  event_date DATE,
  cover_image TEXT,
  summary TEXT,
  long_description TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  seo_title VARCHAR(255),
  seo_description TEXT,
  recap_links JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Nominations table
CREATE TABLE nominations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  award_id INTEGER REFERENCES awards(id) ON DELETE CASCADE,
  nomination_type VARCHAR(50) DEFAULT 'self',
  company_name VARCHAR(255) NOT NULL,
  business_description TEXT NOT NULL,
  achievements TEXT,
  supporting_documents JSONB DEFAULT '[]',
  status VARCHAR(50) DEFAULT 'pending',
  payment_status VARCHAR(50) DEFAULT 'unpaid',
  stripe_session_id VARCHAR(255),
  reviewed_at TIMESTAMP,
  reviewed_by INTEGER REFERENCES users(id),
  rejection_reason TEXT,
  score INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Articles table
CREATE TABLE articles (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  summary TEXT,
  body_richtext TEXT NOT NULL,
  hero_image TEXT,
  author VARCHAR(255),
  tags JSONB DEFAULT '[]',
  featured BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'draft',
  seo_title VARCHAR(255),
  seo_description TEXT,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Payments table
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50),
  amount INTEGER NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  status VARCHAR(50),
  stripe_payment_intent_id VARCHAR(255),
  stripe_session_id VARCHAR(255) UNIQUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Concierge Requests table
CREATE TABLE concierge_requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  message TEXT,
  source VARCHAR(50) DEFAULT 'app',
  status VARCHAR(50) DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Auth tables (for NextAuth/AuthJS)
CREATE TABLE auth_users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  "emailVerified" TIMESTAMP,
  image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE auth_accounts (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER REFERENCES auth_users(id) ON DELETE CASCADE,
  provider VARCHAR(255) NOT NULL,
  type VARCHAR(255) NOT NULL,
  "providerAccountId" VARCHAR(255) NOT NULL,
  access_token TEXT,
  expires_at INTEGER,
  refresh_token TEXT,
  id_token TEXT,
  scope TEXT,
  session_state TEXT,
  token_type TEXT,
  password TEXT,
  UNIQUE("provider", "providerAccountId")
);

CREATE TABLE auth_sessions (
  id SERIAL PRIMARY KEY,
  "sessionToken" VARCHAR(255) UNIQUE NOT NULL,
  "userId" INTEGER REFERENCES auth_users(id) ON DELETE CASCADE,
  expires TIMESTAMP NOT NULL
);

CREATE TABLE auth_verification_token (
  identifier VARCHAR(255) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires TIMESTAMP NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- Create indexes for better performance
CREATE INDEX idx_marketplace_ads_supplier ON marketplace_ads(supplier_id);
CREATE INDEX idx_marketplace_ads_status ON marketplace_ads(status);
CREATE INDEX idx_marketplace_ads_category ON marketplace_ads(category_id);
CREATE INDEX idx_nominations_user ON nominations(user_id);
CREATE INDEX idx_nominations_award ON nominations(award_id);
CREATE INDEX idx_nominations_status ON nominations(status);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_session ON payments(stripe_session_id);
