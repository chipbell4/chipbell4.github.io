#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

post_name="$1"

# generate a slug for the post
post_slug=`echo "$post_name" | tr A-Z a-z | sed "s/ /-/g"`

# get the date
short_date=`date +"%Y-%m-%d"`
long_date=`date +"%F %T"`

# Write the file
post_file="_posts/$short_date-$post_slug.md"
echo "---" > $post_file
echo "layout: post" >> $post_file
echo "title: \"$post_name\"" >> $post_file
echo "date: $long_date" >> $post_file
echo "categories:"  >> $post_file
echo "---" >> $post_file

echo "New post file $post_file created"
