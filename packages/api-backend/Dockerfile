FROM php:8.4-fpm

# System dependencies required by PHP extensions, Composer and Nginx
RUN apt-get update && apt-get install -y --no-install-recommends \
        git \
        unzip \
        libpng-dev \
        libjpeg62-turbo-dev \
        libfreetype6-dev \
        libonig-dev \
        libxml2-dev \
        libzip-dev \
        libicu-dev \
        zlib1g-dev \
        nginx \
    && rm -rf /var/lib/apt/lists/*

# PHP extensions used by Laravel and its dependencies.
# json, tokenizer, openssl, curl, fileinfo, ctype and xml are already built in.
RUN docker-php-ext-install \
        pdo_mysql \
        mbstring \
        bcmath \
        zip \
        intl \
        gd

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Let FPM workers inherit the container environment variables
# (DB_HOST=mysql, etc. provided by docker-compose).
RUN sed -i 's/^;clear_env = no/clear_env = no/' /usr/local/etc/php-fpm.d/www.conf

COPY packages/api-backend/docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY packages/api-backend/docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

WORKDIR /var/www

EXPOSE 8000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
