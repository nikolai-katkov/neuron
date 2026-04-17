#!/usr/bin/env bash
set -euo pipefail

# Deploy media assets (videos, vocabulary images) to the media S3 bucket.
# Called by `npm run deploy:media` after CDK deployment.

PROFILE="mom-aba"
STACK_NAME="MomAba"

get_output() {
  aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query "Stacks[0].Outputs[?OutputKey==\`$1\`].OutputValue" \
    --output text \
    --profile "$PROFILE"
}

MEDIA_BUCKET=$(get_output MediaBucketName)
DISTRIBUTION_ID=$(get_output DistributionId)

if [ -z "$MEDIA_BUCKET" ] || [ "$MEDIA_BUCKET" = "None" ]; then
  echo "Error: Could not find MediaBucketName output in stack $STACK_NAME"
  exit 1
fi

echo "Media bucket: $MEDIA_BUCKET"

# Sync entire public dir to media bucket (images, videos, etc.)
echo "Syncing src/public/ to media bucket..."
aws s3 sync src/public/ "s3://$MEDIA_BUCKET/" \
  --profile "$PROFILE" \
  --size-only \
  --exclude "*/.*" \
  --exclude "LICENSE"

# Invalidate CloudFront cache for media paths
if [ -n "$DISTRIBUTION_ID" ] && [ "$DISTRIBUTION_ID" != "None" ]; then
  echo "Invalidating CloudFront cache for media paths..."
  aws cloudfront create-invalidation \
    --distribution-id "$DISTRIBUTION_ID" \
    --paths "/images/*" "/assets/video/*" \
    --profile "$PROFILE" \
    --no-cli-pager
fi

echo "Media deployment complete."
