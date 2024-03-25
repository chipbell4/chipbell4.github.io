#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

image="site"

volume="$PWD:/srv/jekyll:Z"

case $1 in
    image)
        docker build . -t $image
        ;;
    build)
        docker run --rm --volume="$volume" $image jekyll build --trace
        ;;
    serve)
        docker run --rm --volume="$volume" --publish target=4000,published=127.0.0.1:4000,protocol=tcp $image jekyll serve
        ;;
    update)
        docker run --rm --volume="$volume" -it $image bundle update
        ;;
    *)
        echo "Must be one of 'image, build, serve, update'"
        ;;
esac
