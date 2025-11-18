# AWS Hosting Playbook for TradeFlow

This guide distills the minimum work required to run TradeFlow/ApexForge on the AWS Free Tier (or the lowest-cost options) and explains the information you need to collect before provisioning infrastructure.

## 1. High-Level Review Summary

During the latest pass we focused on deployment readiness and observability:

- ✅ Added an `/api/system/health` endpoint so load balancers (ALB, App Runner, API Gateway) can verify the backend is responsive and that the in-memory storage layer is operational.
- ✅ Hardened the CORS middleware to understand comma-separated `ALLOWED_ORIGINS`, which removes the typical "blocked by CORS" errors when the app sits behind AWS Amplify, CloudFront, or custom domains.
- ✅ Documented the AWS-specific deployment path (this file) so that future contributors can follow an audited procedure.

## 2. Recommended Free-Tier Architecture

| Layer | AWS Service | Notes |
| --- | --- | --- |
| Static assets + SPA | **AWS Amplify Hosting** (continuous deploy from GitHub) | Free tier covers 1000 build minutes + 5 GB served/month. Automatically issues SSL certs via ACM.
| API / SSR server | **AWS App Runner** (or Elastic Beanstalk single Docker) | App Runner supports containerized Node apps, auto HTTPS, scaling to zero not yet GA but per-minute billing is low. Alternative: EC2 t4g.small on free tier credits.
| Database | **Amazon RDS PostgreSQL** (db.t4g.micro) or external Neon/Supabase free tier | If you do not need persistence yet, keep using in-memory storage. For production, point `DATABASE_URL` to RDS.
| Email | **Resend** (existing integration) or **Amazon SES** | Resend is simpler. For SES you must verify domains and move out of sandbox.
| Domain | **Route 53** (hosted zone) + ACM certificate | Route 53 is ~$0.50/month per hosted zone. If you want entirely free, keep the default Amplify subdomain.

## 3. Step-by-Step Deployment

1. **Prepare the repository**
   - `npm install`
   - `npm run build`
   - Commit the generated `dist` (already ignored) is not required because App Runner runs `npm install && npm run build` by default.

2. **Create container image (for App Runner)**
   - Add a simple `Dockerfile` (if you prefer containers) or use the built-in Node runtime. Example Dockerfile:
     ```dockerfile
     FROM node:20-alpine AS deps
     WORKDIR /app
     COPY package*.json ./
     RUN npm ci

     FROM deps AS build
     COPY . .
     RUN npm run build

     FROM node:20-alpine AS runner
     WORKDIR /app
     ENV NODE_ENV=production
     COPY --from=build /app/dist ./dist
     COPY --from=deps /app/node_modules ./node_modules
     COPY package*.json ./
     EXPOSE 5000
     CMD ["npm", "start"]
     ```
   - Push the image to Amazon ECR (public or private). This stays inside the free tier when using ≤ 50 GB storage/month.

3. **Provision database (optional now, required for persistence)**
   - Launch RDS PostgreSQL (db.t4g.micro) inside the default VPC.
   - Enable public access or create App Runner VPC connector.
   - Note the connection string: `postgresql://<user>:<password>@<endpoint>:5432/<db>`.

4. **Create App Runner service**
   - Source: ECR image or GitHub repo (App Runner will build via AWS CodeBuild).
   - Runtime: Node.js 20 or "Provide container image" if using Dockerfile.
   - Environment variables:
     | Variable | Example |
     | --- | --- |
     | `PORT` | `5000` |
     | `NODE_ENV` | `production` |
     | `ALLOWED_ORIGINS` | `https://main.<your-amplify-domain>.amplifyapp.com,https://app.example.com` |
     | `RESEND_API_KEY` | `re_xxx` (or SES credentials) |
     | `DATABASE_URL` | `postgresql://...` (optional until persistence needed) |
     | `SESSION_SECRET` | random 32+ char string |
   - Health check path: `/api/system/health` (added in this change).
   - Auto scaling: 0.5 vCPU / 1 GB RAM is sufficient for testing.

5. **Deploy the frontend**
   - Connect the GitHub repo to Amplify Hosting.
   - Build command: `npm install && npm run build`
   - Output directory: `dist/public`
   - Add environment variables so Vite knows where to reach the API (e.g., `VITE_API_BASE_URL=https://<apprunner-default-domain>`).
   - After the first deploy, note the Amplify domain (e.g., `https://main.d12345.amplifyapp.com`).

6. **Wire up DNS (optional)**
   - Create a hosted zone in Route 53 (e.g., `apexforge.dev`).
   - Request an ACM certificate in us-east-1 for `app.apexforge.dev` and `api.apexforge.dev`.
   - Map CNAME/ALIAS records to Amplify + App Runner custom domains.

7. **Configure email**
   - For Resend: generate API key and put it in App Runner env vars.
   - For SES: verify `From` domain, move SES out of sandbox, replace `sendEmail` helper to use AWS SDK (future work).

8. **Smoke test**
   - Hit `https://<api-domain>/api/system/health` → expect `{ status: "ok", ... }`.
   - Load Amplify front-end and sign up. Confirm CORS is clean (because of the new dynamic origin parser).

## 4. Information Checklist

Before provisioning AWS resources, gather:

1. **Source control** – GitHub repo URL and a deploy key or GitHub App connection for Amplify/App Runner.
2. **Domain preference** – Decide whether you will use the free Amplify domain or map Route 53/third-party DNS.
3. **Email provider** – Resend API key, or SES SMTP username/password and the verified domain.
4. **Database credentials** – Only needed if you are moving beyond the in-memory store. Capture hostname, port, DB name, username, password, and preferred VPC/subnet for security groups.
5. **Environment values** – `SESSION_SECRET`, `JWT_SECRET`, webhook secrets, analytics keys, etc. Store them in AWS Secrets Manager or Systems Manager Parameter Store if possible.
6. **Regional constraints** – Default region (e.g., `us-east-1`) to keep all services co-located and inside free-tier allowances.

## 5. Next Steps / Open Items

- Add infrastructure-as-code (CDK or Terraform) to make App Runner + Amplify provisioning repeatable.
- Replace in-memory storage with Drizzle ORM connected to Postgres for true multi-user persistence.
- Create GitHub Actions workflow that builds the Docker image, pushes to ECR, and triggers App Runner deploys automatically.

## 6. Guided setup script and required inputs

To streamline the initial provisioning, run `scripts/aws-bootstrap.sh`. The script collects the minimum data points we cannot infer from source control and writes two environment files:

```bash
./scripts/aws-bootstrap.sh
```

You will be prompted for:

1. **App Runner URL** – the HTTPS endpoint AWS assigns to the backend (used by the SPA as `VITE_API_BASE_URL`).
2. **Amplify/CloudFront URL** – becomes the default `ALLOWED_ORIGINS` entry for CORS.
3. **AWS Region** – stored so `/api/system/health` can echo regional metadata.
4. **Email provider key** – Resend or SES credential injected into `.env.production` for outbound mail.
5. **JWT/session secret** – the script can generate a strong random string for you if you leave this blank.

Outputs:

- `.env.production` – load this into App Runner (or your container orchestrator) so the API knows its origins, region, and secrets.
- `client/.env.production` – hand to Amplify so the browser bundles talk to the correct API host.

If you plan to use Route 53 custom domains, supply the vanity URLs during the prompt so the generated env files already reference the final hosts. Otherwise accept the defaults and update the files later.

With the changes in this repo and the checklist above, you can bring TradeFlow online in AWS using only free-tier resources plus Route 53 (if you want a vanity domain).
