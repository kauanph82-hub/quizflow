# 🗄️ Database Setup - QuizFlow SaaS

## 📋 Pré-requisitos

- Banco Neon Postgres conectado na Vercel como `quizflow-db`
- Projeto deployado na Vercel

## 🚀 Configuração Rápida

### 1. Obter a URL do Banco

1. Acesse seu projeto na Vercel
2. Vá em **Settings** → **Storage** 
3. Clique em `quizflow-db`
4. Copie a `POSTGRES_URL`

### 2. Executar Inicialização

**Opção A: Via Vercel CLI (Recomendado)**
```bash
# Instalar Vercel CLI se não tiver
npm i -g vercel

# Fazer login
vercel login

# Executar script no ambiente da Vercel
vercel env pull .env.local
npm run db:push
```

**Opção B: Manualmente com URL**
```bash
node scripts/init-db-vercel.js "sua-postgres-url-aqui"
```

**Opção C: Via Variável de Ambiente**
```bash
# Criar .env.local
echo "POSTGRES_URL=sua-postgres-url-aqui" > .env.local

# Executar
npm run db:push
```

## ✅ Verificação

Após executar, você deve ver:

```
🎉 Database initialization completed successfully!

📊 Database Status:
- Tables: ✅ Created
- Demo User: ✅ Available (demo@quizflow.com / password)
- Demo Quiz: ✅ Available (/v/perfil-investidor-demo)
- Sample Data: ✅ Populated

🚀 Ready for production!
```

## 🏗️ Estrutura do Banco

### Tabelas Criadas:

- **users** - Usuários do sistema
- **quizzes** - Quizzes criados pelos usuários  
- **leads** - Leads capturados pelos quizzes
- **ab_tests** - Testes A/B dos quizzes

### Dados de Demonstração:

- **Usuário Demo**: `demo@quizflow.com` / `password`
- **Quiz Demo**: `/v/perfil-investidor-demo`
- **2 Leads de Exemplo** com dados realistas

## 🔧 Troubleshooting

### Erro: "missing_connection_string"
- Verifique se a variável `POSTGRES_URL` está configurada
- Confirme se o banco está ativo na Vercel

### Erro: "relation already exists"
- Normal se executar múltiplas vezes
- As tabelas usam `IF NOT EXISTS`

### Erro de conexão
- Verifique se a URL do banco está correta
- Confirme se o banco Neon está ativo

## 🔄 Re-executar Setup

O script é idempotente - pode ser executado múltiplas vezes sem problemas:
- Tabelas existentes não são alteradas
- Dados demo só são criados se não existirem

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do Vercel
2. Confirme a conexão com o banco Neon
3. Teste a URL do banco diretamente