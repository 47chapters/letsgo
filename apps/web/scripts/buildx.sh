#!/usr/bin/env bash

set -e

DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

rm -rf $DIR/../buildx 
docker buildx build -t letsgo-web:${TURBO_HASH:-unknown} -f $DIR/../Dockerfile $DIR/../../../ 
mkdir -p $DIR/../buildx 
printf "%s" ${TURBO_HASH:-unknown} > $DIR/../buildx/tag
