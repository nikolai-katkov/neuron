#!/usr/bin/env bash
set -euo pipefail

# Deploy media assets (videos, vocabulary images) to the media S3 bucket.
# Called by `npm run deploy:media` after CDK deployment.

PROFILE="mom-aba"
STACK_NAME="MomAba"

# Get media bucket name from CloudFormation outputs
MEDIA_BUCKET=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --query 'Stacks[0].Outputs[?OutputKey==`MediaBucketName`].OutputValue' \
  --output text \
  --profile "$PROFILE")

if [ -z "$MEDIA_BUCKET" ] || [ "$MEDIA_BUCKET" = "None" ]; then
  echo "Error: Could not find MediaBucketName output in stack $STACK_NAME"
  exit 1
fi

echo "Media bucket: $MEDIA_BUCKET"

# Sync videos
if [ -d "dist/assets/video" ]; then
  echo "Syncing videos..."
  aws s3 sync dist/assets/video/ "s3://$MEDIA_BUCKET/assets/video/" \
    --profile "$PROFILE" \
    --size-only
  echo "Videos synced."
fi

# Sync vocabulary images
if [ -d "dist/images/vocabulary" ]; then
  echo "Syncing vocabulary images..."
  aws s3 sync dist/images/vocabulary/ "s3://$MEDIA_BUCKET/images/vocabulary/" \
    --profile "$PROFILE" \
    --size-only
  echo "Vocabulary images synced."
fi

echo "Media deployment complete."
