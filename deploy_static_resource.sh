#!/bin/sh

set -e -a

PROFILE=${PROFILE:-jaws-admin}
stage=${1:-dev}
BUCKET_NAME=$(jaws env get $stage all BUCKET_NAME | grep -v JAWS: | awk '{print $2}')

S3="aws --profile "$PROFILE" s3"

# copy env.js
$S3 cp --acl public-read public/config/${stage}/ s3://${BUCKET_NAME}/${stage}/ --exclude '.gitkeep' --recursive

# copy other resources
$S3 sync --acl public-read public/ s3://${BUCKET_NAME}/${stage}/ --exclude 'config/*' --exclude '*.tmpl' --exclude 'env.js'

