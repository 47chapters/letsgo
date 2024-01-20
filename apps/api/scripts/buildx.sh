#!/usr/bin/env bash

set -e

DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
VENDOR_PREFIX=$(node -p "require('$DIR/../../../packages/constants').VendorPrefix")

rm -rf $DIR/../buildx 
docker buildx build -t ${VENDOR_PREFIX}-api:${TURBO_HASH:-unknown} -f $DIR/../Dockerfile $DIR/../../../ 
mkdir -p $DIR/../buildx 
printf "%s" ${TURBO_HASH:-unknown} > $DIR/../buildx/tag
