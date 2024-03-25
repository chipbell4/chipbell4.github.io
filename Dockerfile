FROM jekyll/jekyll:latest

COPY Gemfile /srv/jekyll/Gemfile
COPY Gemfile.lock /src/jekyll/Gemfile.lock

RUN bundle install
