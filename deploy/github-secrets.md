# GitHub Secrets Setup

GitHub → Repository → Settings → Secrets and variables → Actions → New repository secret

## Client (S3 + CloudFront)

| Secret | Value |
|--------|-------|
| `VITE_API_URL` | `https://api.yourdomain.com` |
| `VITE_SOCKET_URL` | `https://api.yourdomain.com` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `S3_BUCKET_CLIENT` | S3 bucket name (e.g. `olx-client`) |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront distribution ID |

## Server (EC2)

| Secret | Value |
|--------|-------|
| `EC2_HOST` | EC2 public IP (e.g. `13.235.x.x`) |
| `EC2_USERNAME` | `ubuntu` |
| `EC2_SSH_KEY` | Contents of your `.pem` private key file |

## AWS (shared)

| Secret | Value |
|--------|-------|
| `AWS_ACCESS_KEY_ID` | IAM user access key |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key |
| `AWS_REGION` | `ap-south-1` |

---

## AWS Setup Steps

### 1. S3 Bucket (Client)
- S3 → Create bucket → name: `olx-client`
- Uncheck "Block all public access"
- Properties → Static website hosting → Enable → index.html / index.html
- Bucket policy → allow public read

### 2. CloudFront
- Create distribution → Origin: S3 bucket
- Default root object: `index.html`
- Error pages → 403/404 → /index.html → 200 (for React Router)

### 3. EC2
- Launch t2.micro → Ubuntu 22.04 → Free tier
- Security group: allow ports 22, 80, 443
- Download .pem key → paste contents in `EC2_SSH_KEY` secret

### 4. IAM User for CI/CD
- IAM → Create user → attach policies:
  - `AmazonS3FullAccess`
  - `CloudFrontFullAccess`
- Create access key → save in `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`
