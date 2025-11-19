#!/usr/bin/env bash
set -euo pipefail

prompt() {
  local var_name="$1"
  local prompt_text="$2"
  local default_value="${3:-}"
  local value
  if [[ -n "$default_value" ]]; then
    if ! read -r -p "$prompt_text [$default_value]: " value; then
      echo "Error: Failed to read input" >&2
      exit 1
    fi
    value="${value:-$default_value}"
  else
    if ! read -r -p "$prompt_text: " value; then
      echo "Error: Failed to read input" >&2
      exit 1
    fi
    while [[ -z "$value" ]]; do
      if ! read -r -p "Please provide a value for $var_name: " value; then
        echo "Error: Failed to read input" >&2
        exit 1
      fi
    done
  fi
  printf -v "$var_name" '%s' "$value"
}

API_URL_DEFAULT="https://your-app-runner-service.aws.com"
FRONTEND_URL_DEFAULT="https://main.<hash>.amplifyapp.com"
REGION_DEFAULT="us-east-1"

prompt API_URL "App Runner / API base URL" "$API_URL_DEFAULT"
prompt FRONTEND_URL "Amplify or CloudFront frontend URL" "$FRONTEND_URL_DEFAULT"
prompt AWS_REGION "AWS region" "$REGION_DEFAULT"
prompt RESEND_KEY "Resend (or SES) API key" "re_********************************"

if ! read -r -p "JWT/Session secret (leave blank to auto-generate): " JWT_SECRET; then
  echo "Error: Failed to read input" >&2
  exit 1
fi
if [[ -z "$JWT_SECRET" ]]; then
  if command -v openssl >/dev/null 2>&1; then
    JWT_SECRET=$(openssl rand -hex 32)
  elif [[ -e /dev/urandom ]]; then
    JWT_SECRET=$(head -c 32 /dev/urandom | hexdump -ve '1/1 "%02x"')
  else
    echo "Error: Unable to auto-generate secret. Please provide a secret manually." >&2
    exit 1
  fi
  echo "Generated JWT secret: $JWT_SECRET"
fi

SESSION_SECRET="$JWT_SECRET"

cat <<ENV > .env.production
NODE_ENV=production
PORT=5000
ALLOWED_ORIGINS=${FRONTEND_URL}
AWS_REGION=${AWS_REGION}
JWT_SECRET=${JWT_SECRET}
SESSION_SECRET=${SESSION_SECRET}
RESEND_API_KEY=${RESEND_KEY}
ENV

echo "Created .env.production"

mkdir -p client
cat <<ENV > client/.env.production
VITE_API_BASE_URL=${API_URL}
ENV

echo "Created client/.env.production"

echo "Summary"
echo "--------"
echo "API URL: ${API_URL}"
echo "Frontend URL: ${FRONTEND_URL}"
echo "Region: ${AWS_REGION}"
echo "Secrets stored in .env.production"
echo "You can now deploy the API to App Runner (load env file) and the SPA to Amplify with the generated client env file."
