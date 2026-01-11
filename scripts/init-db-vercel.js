#!/usr/bin/env node

/**
 * Database Initialization Script for Vercel
 * Run this after deploying to Vercel to initialize the database
 */

import { createPool } from '@vercel/postgres';

// Get connection string from environment or command line
const connectionString = process.env.POSTGRES_URL || process.argv[2];

if (!connectionString) {
  console.error('❌ Missing database connection string');
  console.log('Usage: node scripts/init-db-vercel.js [POSTGRES_URL]');
  console.log('Or set POSTGRES_URL environment variable');
  process.exit(1);
}

const pool = createPool({ connectionString });

async function initializeTables() {
  try {
    console.log('📋 Creating database tables...');
    
    // Users table
    await pool.sql`
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
    await pool.sql`
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
    await pool.sql`
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
    await pool.sql`
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
    await pool.sql`CREATE INDEX IF NOT EXISTS idx_quizzes_user_id ON quizzes(user_id)`;
    await pool.sql`CREATE INDEX IF NOT EXISTS idx_quizzes_slug ON quizzes(slug)`;
    await pool.sql`CREATE INDEX IF NOT EXISTS idx_leads_quiz_id ON leads(quiz_id)`;
    await pool.sql`CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id)`;
    await pool.sql`CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at)`;

    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('❌ Database table creation failed:', error);
    throw error;
  }
}

async function createSeedData() {
  try {
    // Check if demo user exists
    const existingUser = await pool.sql`SELECT id FROM users WHERE email = 'demo@quizflow.com'`;
    
    if (existingUser.rows.length > 0) {
      console.log('✅ Demo data already exists, skipping seed');
      return;
    }

    console.log('👤 Creating demo user...');
    
    // Simple password hash for demo (in production, use proper bcrypt)
    const hashedPassword = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // "password"
    
    const userResult = await pool.sql`
      INSERT INTO users (email, password_hash)
      VALUES ('demo@quizflow.com', ${hashedPassword})
      RETURNING id
    `;
    
    const userId = userResult.rows[0].id;
    console.log(`✅ Demo user created with ID: ${userId}`);
    
    // Create demo quiz
    console.log('📝 Creating demo quiz...');
    const demoQuizConfig = {
      title: 'Descubra seu Perfil de Investidor',
      description: 'Responda 5 perguntas rápidas e descubra qual estratégia de investimento combina com você',
      slug: 'perfil-investidor-demo',
      isPublished: true,
      elements: [
        {
          id: 'welcome',
          type: 'welcome',
          title: '🎯 Descubra seu Perfil de Investidor',
          description: 'Em apenas 3 minutos, você vai descobrir qual estratégia de investimento combina perfeitamente com seu perfil e objetivos.',
          required: false,
        },
        {
          id: 'q1',
          type: 'multiple-choice',
          title: 'Qual é o seu principal objetivo financeiro?',
          description: 'Escolha a opção que mais se aproxima da sua realidade atual',
          required: true,
          options: [
            { id: 'q1_a', text: 'Guardar dinheiro para emergências', points: 10, tags: ['conservador'] },
            { id: 'q1_b', text: 'Comprar um imóvel ou carro', points: 20, tags: ['moderado'] },
            { id: 'q1_c', text: 'Aposentadoria tranquila', points: 30, tags: ['moderado', 'longo-prazo'] },
            { id: 'q1_d', text: 'Multiplicar meu patrimônio rapidamente', points: 40, tags: ['agressivo', 'empreendedor'] },
          ],
        },
        {
          id: 'q2',
          type: 'multiple-choice',
          title: 'Como você reagiria se seus investimentos caíssem 20% em um mês?',
          required: true,
          options: [
            { id: 'q2_a', text: 'Ficaria muito preocupado e venderia tudo', points: 10, tags: ['conservador'] },
            { id: 'q2_b', text: 'Ficaria ansioso mas manteria os investimentos', points: 20, tags: ['moderado'] },
            { id: 'q2_c', text: 'Manteria a calma e esperaria a recuperação', points: 30, tags: ['moderado', 'experiente'] },
            { id: 'q2_d', text: 'Aproveitaria para comprar mais', points: 40, tags: ['agressivo', 'experiente'] },
          ],
        },
        {
          id: 'lead-capture',
          type: 'lead-form',
          title: '📱 Quase lá! Vamos personalizar ainda mais',
          description: 'Para criar sua estratégia personalizada, precisamos de alguns dados básicos',
          required: true,
          fields: ['name', 'email', 'whatsapp'],
        },
        {
          id: 'result',
          type: 'result',
          title: 'Seu Perfil Está Pronto!',
          description: 'Baseado nas suas respostas, criamos uma estratégia personalizada para você',
          required: false,
        },
      ],
      resultRules: [
        {
          id: 'rule1',
          condition: { type: 'score', minScore: 0, maxScore: 80 },
          title: 'Investidor Conservador',
          description: 'Você prioriza segurança e estabilidade nos seus investimentos',
          profile: 'Conservador',
          redirectUrl: 'https://exemplo.com/curso-conservador?price=197',
        },
        {
          id: 'rule2',
          condition: { type: 'score', minScore: 81, maxScore: 300 },
          title: 'Investidor Agressivo',
          description: 'Você está disposto a assumir riscos maiores por retornos superiores',
          profile: 'Agressivo',
          redirectUrl: 'https://exemplo.com/curso-agressivo?price=997',
        },
      ],
      designSystem: {
        fontFamily: 'inter',
        primaryColor: 'hsl(174, 72%, 56%)',
        buttonRoundness: 16,
        glassmorphism: 80,
        darkMode: true,
      },
      tracking: {
        facebookPixelId: '',
        webhookUrl: '',
        events: [
          { elementId: 'welcome', eventName: 'ViewContent', eventType: 'ViewContent' },
          { elementId: 'lead-capture', eventName: 'Lead', eventType: 'Lead' },
          { elementId: 'result', eventName: 'CompleteRegistration', eventType: 'Purchase' },
        ],
      },
      isDraft: false,
    };
    
    const quizResult = await pool.sql`
      INSERT INTO quizzes (user_id, title, description, slug, config_json, is_published)
      VALUES (${userId}, ${demoQuizConfig.title}, ${demoQuizConfig.description}, ${demoQuizConfig.slug}, ${JSON.stringify(demoQuizConfig)}, true)
      RETURNING id
    `;
    
    const quizId = quizResult.rows[0].id;
    console.log(`✅ Demo quiz created with ID: ${quizId}`);
    
    // Create sample leads
    console.log('👥 Creating sample leads...');
    const sampleLeads = [
      {
        name: 'João Silva',
        email: 'joao@exemplo.com',
        whatsapp: '11999999999',
        dataJson: JSON.stringify({
          answers: { q1: 'q1_c', q2: 'q2_b' },
          score: 50,
          tags: ['moderado', 'longo-prazo']
        }),
        status: 'complete'
      },
      {
        name: 'Maria Santos',
        email: 'maria@exemplo.com',
        whatsapp: '11888888888',
        dataJson: JSON.stringify({
          answers: { q1: 'q1_d', q2: 'q2_d' },
          score: 80,
          tags: ['agressivo', 'empreendedor']
        }),
        status: 'complete'
      }
    ];
    
    for (const leadData of sampleLeads) {
      await pool.sql`
        INSERT INTO leads (quiz_id, user_id, name, email, whatsapp, data_json, status)
        VALUES (${quizId}, ${userId}, ${leadData.name}, ${leadData.email}, ${leadData.whatsapp}, ${leadData.dataJson}, ${leadData.status})
      `;
      
      // Update quiz leads count
      await pool.sql`UPDATE quizzes SET leads_count = leads_count + 1 WHERE id = ${quizId}`;
    }
    
    console.log(`✅ Created ${sampleLeads.length} sample leads`);
    
  } catch (error) {
    console.error('❌ Seed data creation failed:', error);
    throw error;
  }
}

async function initializeDatabase() {
  console.log('🚀 Initializing QuizFlow Database on Vercel...');
  console.log(`📡 Connecting to: ${connectionString.replace(/:[^:@]*@/, ':****@')}`);
  
  try {
    // Initialize tables
    await initializeTables();
    
    // Create seed data
    console.log('🌱 Creating seed data...');
    await createSeedData();
    
    console.log('🎉 Database initialization completed successfully!');
    console.log('');
    console.log('📊 Database Status:');
    console.log('- Tables: ✅ Created');
    console.log('- Demo User: ✅ Available (demo@quizflow.com / password)');
    console.log('- Demo Quiz: ✅ Available (/v/perfil-investidor-demo)');
    console.log('- Sample Data: ✅ Populated');
    console.log('');
    console.log('🚀 Ready for production!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run initialization
initializeDatabase();