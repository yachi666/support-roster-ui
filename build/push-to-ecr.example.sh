#!/usr/bin/env bash
set -euo pipefail

AWS_REGION="ap-southeast-1"
AWS_ACCOUNT_ID="123456789012"
ECR_REPOSITORY="support-roster-ui"
IMAGE_TAG="20260317-1"
PLATFORM="linux/amd64"
API_BASE_URL="https://api.example.com/api"
FRONTEND_DOMAIN="https://roster.example.com"

IMAGE_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:${IMAGE_TAG}"

echo "==> AWS region: ${AWS_REGION}"
echo "==> AWS account: ${AWS_ACCOUNT_ID}"
echo "==> ECR repository: ${ECR_REPOSITORY}"
echo "==> Image tag: ${IMAGE_TAG}"
echo "==> API base URL: ${API_BASE_URL}"
echo "==> Frontend domain: ${FRONTEND_DOMAIN}"

echo "==> Checking Docker"
docker --version

echo "==> Checking AWS CLI identity"
aws sts get-caller-identity --region "${AWS_REGION}"

echo "==> Ensuring ECR repository exists"
aws ecr describe-repositories \
  --repository-names "${ECR_REPOSITORY}" \
  --region "${AWS_REGION}" >/dev/null 2>&1 || \
aws ecr create-repository \
  --repository-name "${ECR_REPOSITORY}" \
  --image-scanning-configuration scanOnPush=true \
  --region "${AWS_REGION}"

echo "==> Logging in to ECR"
aws ecr get-login-password --region "${AWS_REGION}" | \
docker login --username AWS --password-stdin "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

echo "==> Building image"
docker build \
  --platform "${PLATFORM}" \
  --build-arg VITE_API_BASE_URL="${API_BASE_URL}" \
  -t "${ECR_REPOSITORY}:${IMAGE_TAG}" \
  .

echo "==> Local smoke test"
CONTAINER_ID="$(docker run -d -p 8081:80 "${ECR_REPOSITORY}:${IMAGE_TAG}")"
cleanup() {
  docker rm -f "${CONTAINER_ID}" >/dev/null 2>&1 || true
}
trap cleanup EXIT

sleep 3
curl -fsS http://127.0.0.1:8081/health

echo "==> Tagging image"
docker tag "${ECR_REPOSITORY}:${IMAGE_TAG}" "${IMAGE_URI}"

echo "==> Pushing image"
docker push "${IMAGE_URI}"

echo "==> Done"
echo "Image URI: ${IMAGE_URI}"
echo "Next step: update ECS service to use this image and verify ${FRONTEND_DOMAIN}"