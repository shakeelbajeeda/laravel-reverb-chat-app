# Use the Composer image to set up dependencies and PHP extensions
FROM composer:2.7 as base
WORKDIR /home/app
COPY . /home/app

# Install PHP dependencies and Node.js packages
RUN apk update \
	&& apk upgrade \
	&& apk add nodejs npm \
	&& chmod -R 777 /home/app/storage \
    && mkdir /tmp/php-opcache \
    && composer install --ignore-platform-reqs \
    && npm install \
    && npm run build

# Build the final image based on Alpine
FROM alpine:3.18

# Install Supervisor and PHP dependencies
RUN apk update \
    && apk upgrade \
    && apk add \
        php82 php82-cli php82-bcmath php82-phar php82-tokenizer php82-curl \
        php82-json php82-openssl php82-zip php82-pdo php82-mysqli php82-pdo_mysql \
        php82-mysqlnd php82-dom php82-mbstring php82-session php82-fileinfo php82-gd \
        php82-calendar php82-xml php82-xmlwriter php82-pcntl php82-posix php82-sockets \
        php82-simplexml php82-xmlreader php82-exif php82-opcache php82-pecl-swoole \
        php82-sodium php82-intl php82-gettext php82-pecl-mongodb nodejs npm \
        supervisor \
    && ln -s /usr/bin/php82 /usr/bin/php \
    && mkdir /tmp/php-opcache \
    && adduser -D -s /bin/sh -u 1000 appuser

# Configure Supervisor
COPY supervisor.conf /etc/supervisor/conf.d/supervisor.conf

# Configure PHP settings
RUN printf "\n\
php /home/app/artisan reverb:install \n\
" >> /usr/bin/entrypoint \
    && printf "\n\
enable_dl = Yes \n\
memory_limit = 2048M \n\
max_execution_time = 600 \n\
error_reporting = E_ALL & ~E_STRICT & ~E_WARNING & ~E_DEPRECATED & ~E_NOTICE \n\
display_errors = Off \n\
date.timezone = America/New_York \n\
expose_php = Off \n\
upload_max_filesize = 10M \n\
post_max_size = 64M \n\
" >> /etc/php82/conf.d/app.ini \
    && printf "\n\
[opcache]\n\
opcache.enable=1\n\
opcache.enable_cli=1\n\
;opcache.memory_consumption=512\n\
;opcache.jit_buffer_size=400M\n\
opcache.interned_strings_buffer=64\n\
opcache.max_accelerated_files=32531\n\
opcache.validate_timestamps=0\n\
opcache.save_comments=1\n\
opcache.fast_shutdown=0\n\
opcache.file_cache=/tmp/php-opcache\n\
;opcache.file_cache_only=1\n\
" >> /etc/php82/conf.d/app-opcache.ini \
    && chmod a+x /usr/bin/entrypoint

# Set ownership for application files
COPY --from=base /home/app /home/app
RUN chown -R appuser:appuser /home/app && \
     mkdir -p /var/log/supervisor \
       && chown -R appuser:appuser /var/log/supervisor

# Expose ports
EXPOSE 8000 8080

# Switch to non-root user and run Supervisor
USER appuser
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisor.conf"]
