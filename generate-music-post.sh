#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

type="$1" # arrangement, transcription, composition
name="$2"

post_file="_${1}s/${name}.md"
echo "Generating post in $post_file..."
echo "---" > $post_file
echo "---" >> $post_file
echo "layout: music" >> $post_file
echo "title: $name" >> $post_file
echo "date: 2025-01-02" >> $post_file
echo "instruments:" >> $post_file
echo "downloadable: /assets/scores/$name/$name.pdf" >> $post_file
echo "preview: /assets/scores/$name/$name.mp3" >> $post_file
echo "short_description:" >> $post_file
echo "---" >> $post_file

echo "Generating placeholder assets in assets/scores/$name..."
mkdir "assets/scores/$name"
touch "assets/scores/$name/$name.pdf"
touch "assets/scores/$name/$name.mp3"

echo "Done"
