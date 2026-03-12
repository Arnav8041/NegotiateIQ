#!/bin/bash
set -e

PROJECT_ID="${GOOGLE_CLOUD_PROJECT:?Set GOOGLE_CLOUD_PROJECT env var}"
REGION="${GOOGLE_CLOUD_REGION:-us-central1}"
SERVICE_NAME="negotiate-iq-backend"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "Deploying NegotiateIQ..."
echo "  Project: ${PROJECT_ID}"
echo "  Region:  ${REGION}"

gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  aiplatform.googleapis.com \
  --project="${PROJECT_ID}"

gcloud builds submit --tag "${IMAGE_NAME}" --project="${PROJECT_ID}"

gcloud run deploy "${SERVICE_NAME}" \
  --image "${IMAGE_NAME}" \
  --platform managed \
  --region "${REGION}" \
  --allow-unauthenticated \
  --set-env-vars "GOOGLE_CLOUD_PROJECT=${PROJECT_ID}" \
  --memory 1Gi \
  --cpu 2 \
  --timeout 300 \
  --project="${PROJECT_ID}"

SERVICE_URL=$(gcloud run services describe "${SERVICE_NAME}" \
  --platform managed --region "${REGION}" --project="${PROJECT_ID}" \
  --format="value(status.url)")

echo ""
echo "Done! Backend: ${SERVICE_URL}"
echo "Update frontend .env.local:"
echo "  NEXT_PUBLIC_WS_URL=${SERVICE_URL/https/wss}/ws/session"
echo "  NEXT_PUBLIC_API_URL=${SERVICE_URL}"
