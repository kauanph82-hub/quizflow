import { sql } from '@vercel/postgres';

// Database Schema Types
export interface User {
  id: string;
  email: string;
  password_hash: string;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
  subscription_expires_at?: string;
  trial_ends_at?: string;
}

export interface QuizRecord {
  id: string;
  user_id: string;
  title: string;
  description: string;
  slug: string;
  config_json: string; // JSON stringified quiz configuration
  is_published: boolean;
  created_at: string;
  updated_at: string;
  views: number;
  completions: number;
  leads_count: number;
}

export interface LeadRecord {
  id: string;
  quiz_id: string;
  user_id: string;
  name?: string;
  email?: string;
  whatsapp?: string;
  data_json: string; // JSON stringified lead data (answers, score, etc.)
  status: 'partial' | 'complete';
  created_at: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

export interface ABTestRecord {
  id: string;
  quiz_id: string;
  user_id: string;
  variant_name: string;
  config_json: string;
  views: number;
  completions: number;
  conversion_rate: number;
  is_active: boolean;
  created_at: string;
}

// Database Connection and Initialization
export class Database {
  static async initializeTables() {
    try {
      // Users table
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          is_premium BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          subscription_expires_at TIMESTAMP,
          trial_ends_at TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days')
        )
      `;

      // Quizzes table
      await sql`
        CREATE TABLE IF NOT EXISTS quizzes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          slug VARCHAR(100) UNIQUE NOT NULL,
          config_json JSONB NOT NULL,
          is_published BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          views INTEGER DEFAULT 0,
          completions INTEGER DEFAULT 0,
          leads_count INTEGER DEFAULT 0
        )
      `;

      // Leads table
      await sql`
        CREATE TABLE IF NOT EXISTS leads (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          name VARCHAR(255),
          email VARCHAR(255),
          whatsapp VARCHAR(50),
          data_json JSONB NOT NULL,
          status VARCHAR(20) DEFAULT 'partial',
          created_at TIMESTAMP DEFAULT NOW(),
          utm_source VARCHAR(100),
          utm_medium VARCHAR(100),
          utm_campaign VARCHAR(100)
        )
      `;

      // A/B Tests table
      await sql`
        CREATE TABLE IF NOT EXISTS ab_tests (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          variant_name VARCHAR(100) NOT NULL,
          config_json JSONB NOT NULL,
          views INTEGER DEFAULT 0,
          completions INTEGER DEFAULT 0,
          conversion_rate DECIMAL(5,2) DEFAULT 0,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `;

      // Indexes for performance
      await sql`CREATE INDEX IF NOT EXISTS idx_quizzes_user_id ON quizzes(user_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_quizzes_slug ON quizzes(slug)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_leads_quiz_id ON leads(quiz_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at)`;

      console.log('✅ Database tables initialized successfully');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  // User Operations
  static async createUser(email: string, passwordHash: string): Promise<User> {
    const result = await sql`
      INSERT INTO users (email, password_hash)
      VALUES (${email}, ${passwordHash})
      RETURNING *
    `;
    return result.rows[0] as User;
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    const result = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;
    return result.rows[0] as User || null;
  }

  static async getUserById(id: string): Promise<User | null> {
    const result = await sql`
      SELECT * FROM users WHERE id = ${id}
    `;
    return result.rows[0] as User || null;
  }

  static async updateUserPremiumStatus(userId: string, isPremium: boolean, expiresAt?: string): Promise<void> {
    await sql`
      UPDATE users 
      SET is_premium = ${isPremium}, 
          subscription_expires_at = ${expiresAt || null},
          updated_at = NOW()
      WHERE id = ${userId}
    `;
  }

  // Quiz Operations
  static async createQuiz(userId: string, title: string, description: string, slug: string, configJson: string): Promise<QuizRecord> {
    const result = await sql`
      INSERT INTO quizzes (user_id, title, description, slug, config_json)
      VALUES (${userId}, ${title}, ${description}, ${slug}, ${configJson})
      RETURNING *
    `;
    return result.rows[0] as QuizRecord;
  }

  static async getQuizzesByUserId(userId: string): Promise<QuizRecord[]> {
    const result = await sql`
      SELECT * FROM quizzes 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
    return result.rows as QuizRecord[];
  }

  static async getQuizBySlug(slug: string): Promise<QuizRecord | null> {
    const result = await sql`
      SELECT * FROM quizzes WHERE slug = ${slug} AND is_published = TRUE
    `;
    return result.rows[0] as QuizRecord || null;
  }

  static async getQuizById(id: string, userId?: string): Promise<QuizRecord | null> {
    const query = userId 
      ? sql`SELECT * FROM quizzes WHERE id = ${id} AND user_id = ${userId}`
      : sql`SELECT * FROM quizzes WHERE id = ${id}`;
    
    const result = await query;
    return result.rows[0] as QuizRecord || null;
  }

  static async updateQuiz(id: string, userId: string, updates: Partial<QuizRecord>): Promise<void> {
    const setClause = Object.entries(updates)
      .filter(([_, value]) => value !== undefined)
      .map(([key, _]) => `${key} = $${key}`)
      .join(', ');

    if (setClause) {
      await sql`
        UPDATE quizzes 
        SET ${sql.raw(setClause)}, updated_at = NOW()
        WHERE id = ${id} AND user_id = ${userId}
      `;
    }
  }

  static async deleteQuiz(id: string, userId: string): Promise<void> {
    await sql`
      DELETE FROM quizzes 
      WHERE id = ${id} AND user_id = ${userId}
    `;
  }

  static async isSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
    const query = excludeId
      ? sql`SELECT id FROM quizzes WHERE slug = ${slug} AND id != ${excludeId}`
      : sql`SELECT id FROM quizzes WHERE slug = ${slug}`;
    
    const result = await query;
    return result.rows.length === 0;
  }

  static async incrementQuizViews(quizId: string): Promise<void> {
    await sql`
      UPDATE quizzes 
      SET views = views + 1 
      WHERE id = ${quizId}
    `;
  }

  static async incrementQuizCompletions(quizId: string): Promise<void> {
    await sql`
      UPDATE quizzes 
      SET completions = completions + 1 
      WHERE id = ${quizId}
    `;
  }

  // Lead Operations
  static async createLead(
    quizId: string, 
    userId: string, 
    leadData: {
      name?: string;
      email?: string;
      whatsapp?: string;
      dataJson: string;
      status: 'partial' | 'complete';
      utmSource?: string;
      utmMedium?: string;
      utmCampaign?: string;
    }
  ): Promise<LeadRecord> {
    const result = await sql`
      INSERT INTO leads (
        quiz_id, user_id, name, email, whatsapp, 
        data_json, status, utm_source, utm_medium, utm_campaign
      )
      VALUES (
        ${quizId}, ${userId}, ${leadData.name || null}, ${leadData.email || null}, 
        ${leadData.whatsapp || null}, ${leadData.dataJson}, ${leadData.status},
        ${leadData.utmSource || null}, ${leadData.utmMedium || null}, ${leadData.utmCampaign || null}
      )
      RETURNING *
    `;

    // Update quiz leads count
    await sql`
      UPDATE quizzes 
      SET leads_count = leads_count + 1 
      WHERE id = ${quizId}
    `;

    return result.rows[0] as LeadRecord;
  }

  static async getLeadsByQuizId(quizId: string, userId: string): Promise<LeadRecord[]> {
    const result = await sql`
      SELECT * FROM leads 
      WHERE quiz_id = ${quizId} AND user_id = ${userId}
      ORDER BY created_at DESC
    `;
    return result.rows as LeadRecord[];
  }

  static async getLeadsByUserId(userId: string, limit = 100): Promise<LeadRecord[]> {
    const result = await sql`
      SELECT l.*, q.title as quiz_title 
      FROM leads l
      JOIN quizzes q ON l.quiz_id = q.id
      WHERE l.user_id = ${userId}
      ORDER BY l.created_at DESC
      LIMIT ${limit}
    `;
    return result.rows as LeadRecord[];
  }

  // A/B Testing Operations
  static async createABTest(
    quizId: string, 
    userId: string, 
    variantName: string, 
    configJson: string
  ): Promise<ABTestRecord> {
    const result = await sql`
      INSERT INTO ab_tests (quiz_id, user_id, variant_name, config_json)
      VALUES (${quizId}, ${userId}, ${variantName}, ${configJson})
      RETURNING *
    `;
    return result.rows[0] as ABTestRecord;
  }

  static async getABTestsByQuizId(quizId: string, userId: string): Promise<ABTestRecord[]> {
    const result = await sql`
      SELECT * FROM ab_tests 
      WHERE quiz_id = ${quizId} AND user_id = ${userId}
      ORDER BY created_at DESC
    `;
    return result.rows as ABTestRecord[];
  }

  static async updateABTestStats(testId: string, views: number, completions: number): Promise<void> {
    const conversionRate = views > 0 ? (completions / views) * 100 : 0;
    
    await sql`
      UPDATE ab_tests 
      SET views = ${views}, 
          completions = ${completions}, 
          conversion_rate = ${conversionRate}
      WHERE id = ${testId}
    `;
  }

  // Analytics Operations
  static async getQuizAnalytics(quizId: string, userId: string) {
    const quizResult = await sql`
      SELECT views, completions, leads_count, created_at
      FROM quizzes 
      WHERE id = ${quizId} AND user_id = ${userId}
    `;

    const leadsResult = await sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as leads,
        COUNT(CASE WHEN status = 'complete' THEN 1 END) as complete_leads
      FROM leads 
      WHERE quiz_id = ${quizId} AND user_id = ${userId}
      AND created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;

    return {
      quiz: quizResult.rows[0],
      dailyLeads: leadsResult.rows
    };
  }

  static async getUserStats(userId: string) {
    const result = await sql`
      SELECT 
        COUNT(DISTINCT q.id) as total_quizzes,
        SUM(q.views) as total_views,
        SUM(q.completions) as total_completions,
        SUM(q.leads_count) as total_leads,
        COUNT(DISTINCT l.id) as leads_this_month
      FROM quizzes q
      LEFT JOIN leads l ON q.id = l.quiz_id AND l.created_at >= NOW() - INTERVAL '30 days'
      WHERE q.user_id = ${userId}
    `;

    return result.rows[0];
  }
}

// Initialize database on module load
if (typeof window === 'undefined') {
  Database.initializeTables().catch(console.error);
}