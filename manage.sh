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
        docker run --rm --volume="$volume" --publish target=4000,published=127.0.0.1:4000,protocol=tcp $image jekyll serve
        ;;
    update)
        docker run --rm --volume="$volume" -it $image bundle update
        ;;
    *)
        echo "Must be one of 'build, serve'"
        ;;
esac
