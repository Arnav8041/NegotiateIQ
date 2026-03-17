#!/bin/bash
set -e

PROJECT_ID="${GOOGLE_CLOUD_PROJECT:?Set GOOGLE_CLOUD_PROJECT env var}"
REGION="${GOOGLE_CLOUD_REGION:-us-central1}"
SERVICE_NAME="negotiate-iq-backend"

echo "Deploying NegotiateIQ..."
echo "  Project: ${PROJECT_ID}"
echo "  Region:  ${REGION}"

gcloud run deploy "${SERVICE_NAME}" \
  --source . \
  --region "${REGION}" \
  --allow-unauthenticated \
  --set-env-vars "GOOGLE_CLOUD_PROJECT=${PROJECT_ID}" \
  --update-secrets "GOOGLE_API_KEY=negotiate-iq-gemini-key:latest" \
  --memory 1Gi \
  --cpu 2 \
  --timeout 300 \
  --project="${PROJECT_ID}"

SERVICE_URL=$(gcloud run services describe "${SERVICE_NAME}" \
  --region "${REGION}" --project="${PROJECT_ID}" \
  --format="value(status.url)")

echo ""
echo "Done! Backend: ${SERVICE_URL}"
echo "Update frontend .env.local:"
echo "  NEXT_PUBLIC_WS_URL=${SERVICE_URL/https/wss}/ws/session"
echo "  NEXT_PUBLIC_API_URL=${SERVICE_URL}"
