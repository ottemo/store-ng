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

MYDIR=$(cd `dirname ${BASH_SOURCE[0]}` && pwd)
STOREREPO="$MYDIR/.."
cd $STOREREPO

if ! [ -n "$version" ] ; then
  date=$(date +%Y%m%d-%H%M%S)
  IMAGE="gcr.io/ottemo-kube/storefront:${date}"
else
  IMAGE="gcr.io/ottemo-kube/storefront:$version"
fi
echo "use $IMAGE as image name"

echo "build alpine based storefront container"
docker build -t $IMAGE -t gcr.io/ottemo-kube/storefront .
if [ $? -ne 0 ]; then
  echo "error in build storefront alpine based container"
  exit 2
fi

gcloud docker -- push $IMAGE
if [ $? -ne 0 ]; then
  echo "error in push image"
  exit 2
fi

gcloud docker -- push gcr.io/ottemo-kube/storefront
if [ $? -ne 0 ]; then
  echo "error in push latest image tag"
  exit 2
fi
