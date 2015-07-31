FROM debian:jessie

MAINTAINER Jean-Philippe Briend <jeanphilippe.briend@gmail.com> (@jpbriend)

ENV NGINX_VERSION 1.9.2

# Install dependency packages
RUN apt-get update && \
    apt-get install -y \
        curl \
        make \
        gcc \
        libssl-dev \
        libpcre3 \
        libpcre3-dev \
        libssl-dev

# Fetch and unarchive nginx source
RUN curl -L http://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz > /tmp/nginx-${NGINX_VERSION}.tar.gz && \
    cd /tmp && \
    tar zxf nginx-${NGINX_VERSION}.tar.gz

# Compile nginx
RUN cd /tmp/nginx-${NGINX_VERSION} && \
    ./configure \
      --prefix=/opt/nginx \
      --conf-path=/etc/nginx/nginx.conf \
      --sbin-path=/opt/nginx/sbin/nginx \
      --error-log-path=/var/log/nginx/error.log \
      --http-log-path=/var/log/nginx/access.log \
      --with-pcre \
      --with-http_spdy_module \
      --with-http_ssl_module \
      --with-http_realip_module \
      --with-http_addition_module \
      --with-http_sub_module \
      --with-http_dav_module \
      --with-http_flv_module \
      --with-http_mp4_module \
      --with-http_gunzip_module \
      --with-http_gzip_static_module \
      --with-http_random_index_module \
      --with-http_secure_link_module \
      --with-http_stub_status_module \
      --with-mail \
      --with-mail_ssl_module && \
    make && \
    make install && \
    rm -rf /tmp/*

RUN mkdir -p /etc/nginx && \
    mkdir -p /var/run && \
    mkdir -p /etc/nginx/conf.d

# forward request and error logs to docker log collector
RUN ln -sf /dev/stdout /var/log/nginx/access.log
RUN ln -sf /dev/stderr /var/log/nginx/error.log

# Add config files
COPY files/nginx.conf   /etc/nginx/nginx.conf
COPY files/ssl/*        /etc/nginx/ssl/

EXPOSE 80 443

CMD ["/opt/nginx/sbin/nginx", "-g", "daemon off;"]