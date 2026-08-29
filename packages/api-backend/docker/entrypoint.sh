#!/bin/sh
set -e

cd /var/www

# Install PHP dependencies (vendor is persisted in the api_vendor volume)
if [ ! -d "vendor" ] || [ ! -f "vendor/autoload.php" ]; then
    composer install --no-interaction --prefer-dist --optimize-autoloader
fi

# Ensure storage & bootstrap/cache are writable by the web server (www-data)
chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || true
chmod -R 777 storage bootstrap/cache 2>/dev/null || true


# Drop any config cache from the host mount so the container always reads
# live environment variables (e.g. DB_HOST=mysql from docker-compose).
php artisan config:clear 2>/dev/null || true

# Make sure the application key exists (only generate if missing)
if [ -f .env ] && ! grep -q "^APP_KEY=base64:" .env; then
    php artisan key:generate --force
fi

# Run database migrations
php artisan migrate --force

# Start PHP-FPM in the background, then run Nginx in the foreground.
php-fpm -D
exec nginx -g 'daemon off;'
