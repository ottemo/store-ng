#!/bin/bash

# build and push storefront image to registry

for i in "$@"
do
case $i in
    version=*)
    version="${i#*=}"
    shift
    ;;
    *)
            # unknown option
    ;;
esac
done

STOREFRONTIMAGE="ottemo/storefront"
MYDIR=$(cd `dirname ${BASH_SOURCE[0]}` && pwd)
STOREREPO="$MYDIR/.."
cd $STOREREPO

BUILD=$(git rev-list origin/develop --count)

if ! [ -n "$version" ] ; then
  date=$(date +%Y%m%d-%H%M%S)
  IMAGE="${STOREFRONTIMAGE}:${date}-${BUILD}"
else
  IMAGE="${STOREFRONTIMAGE}:$version"
fi
echo "use $IMAGE as image name"

echo "build alpine based storefront container"
docker build -t $IMAGE -t ${STOREFRONTIMAGE}:latest .
if [ $? -ne 0 ]; then
  echo "error in build storefront alpine based container"
  exit 2
fi

gcloud docker -- push $IMAGE
if [ $? -ne 0 ]; then
  echo "error in push image"
  exit 2
fi

gcloud docker -- push ${STOREFRONTIMAGE}:latest
if [ $? -ne 0 ]; then
  echo "error in push latest image tag"
  exit 2
fi
