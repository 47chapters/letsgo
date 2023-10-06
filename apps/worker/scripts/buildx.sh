#!/usr/bin/env bash

set -e

DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

rm -rf $DIR/../buildx 
docker buildx build --platform linux/amd64 -t letsgo-worker:${TURBO_HASH:-unknown} -f $DIR/../Dockerfile $DIR/../../../ 
mkdir -p $DIR/../buildx 
printf "%s" ${TURBO_HASH:-unknown} > $DIR/../buildx/tag
