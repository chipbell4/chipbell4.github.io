#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

JEKYLL_VERSION=latest
image="jekyll/jekyll:$JEKYLL_VERSION"

volume="$PWD:/srv/jekyll:Z"

case $1 in
    build)
        echo "Running build"
        ;;
    serve)
        docker run --rm --volume="$volume" --publish [::1]:4000:4000 $image jekyll serve
        ;;
    update)
        docker run --rm --volume="$volume" -it $image bundle update
        ;;
    *)
        echo "Must be one of 'build, serve'"
        ;;
esac
