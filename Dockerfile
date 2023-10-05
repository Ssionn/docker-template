ARG NODE_VERSION=${NODE_VERSION:-17.7.2}
ARG PHP_VERSION=${PHP_VERSION:-8.1-4.28.4}

FROM node:${NODE_VERSION}-alpine AS node

FROM wodby/php:${PHP_VERSION}
COPY --link --from=node /usr/local/lib/node_modules/ /usr/local/lib/node_modules/
COPY --link --from=node /usr/local/bin/node /usr/local/bin/
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm
RUN ln -s /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

COPY --chown=nobody . /var/www/html

EXPOSE 3000 9000
