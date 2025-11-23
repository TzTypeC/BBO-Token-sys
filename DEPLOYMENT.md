# Vercel Deployment Guide

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. A PostgreSQL database (you can use Vercel Postgres, Neon, Supabase, or any PostgreSQL provider)
3. Your project pushed to GitHub, GitLab, or Bitbucket (optional, but recommended)

## Step 1: Prepare Your Database

Make sure your database is set up and all migrations are applied:

```bash
# Run migrations locally first to ensure everything is up to date
npx prisma migrate deploy
```

Or if you're using a new database, apply all migrations:

```bash
npx prisma migrate deploy
```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/new
2. Import your Git repository (GitHub, GitLab, or Bitbucket)
3. Vercel will auto-detect Next.js
4. Configure your project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (already configured)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

5. **Add Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add: `DATABASE_URL` with your PostgreSQL connection string
     - Format: `postgresql://user:password@host:port/database?sslmode=require`
   - Make sure to add it for all environments (Production, Preview, Development)

6. Click **Deploy**

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Follow the prompts and add your `DATABASE_URL` environment variable when asked.

5. For production deployment:
   ```bash
   vercel --prod
   ```

## Step 3: Verify Deployment

After deployment, test your API endpoints:

- `https://your-project.vercel.app/api/user/create` (POST)
- `https://your-project.vercel.app/api/token/generate` (POST)
- `https://your-project.vercel.app/api/token/validate` (GET)

## Important Notes

1. **Prisma Client Generation**: The `postinstall` script in `package.json` will automatically generate the Prisma client during Vercel's build process.

2. **Database Migrations**: If you need to run migrations on your production database, you can:
   - Use Vercel's deployment hooks
   - Run migrations manually: `npx prisma migrate deploy`
   - Use a migration service

3. **Environment Variables**: Make sure `DATABASE_URL` is set in Vercel's environment variables for all environments.

4. **Build Time**: The first build may take longer as it generates the Prisma client.

## Troubleshooting

- **Build fails with Prisma errors**: Make sure `DATABASE_URL` is set in Vercel environment variables
- **API routes return 500**: Check Vercel function logs and ensure database connection is working
- **Prisma client not found**: The `postinstall` script should handle this, but you can verify in build logs

## Database Providers for Vercel

Recommended PostgreSQL providers:
- **Vercel Postgres**: https://vercel.com/docs/storage/vercel-postgres
- **Neon**: https://neon.tech
- **Supabase**: https://supabase.com
- **Railway**: https://railway.app
- **Render**: https://render.com

