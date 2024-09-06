---
id: wolfi-os-for-php
date: 2024-04-06T23:00:00
title: Building PHP docker images in a better way with Wolfi-OS
author: Shyim
author_title: Principal Software Engineer @ Shopware
author_url: https://github.com/shyim
author_image_url: https://avatars3.githubusercontent.com/u/6224096?s=460&u=18be3a2d46f07dd42fc2b6dee9b4b9b68bca28d2&v=4
tags: [php, docker, alpine, wolfi-os, chainguard]
---

Currently, the de-facto standard to Dockerizing PHP applications is to use the [Docker PHP official image](https://hub.docker.com/_/php/). This is maintained by Docker itself and community members and has compiled PHP with no extensions. To install extensions, we have to do this in our Dockerfile:

```dockerfile
FROM php:8.2-cli

RUN docker-php-ext-install pdo pdo_mysql curl
```

The helper script `docker-php-ext-install` does unpack the PHP source code and installs the given extensions. For some extensions like `gd`, we need also libraries installed like `libpng` and so on. So we have to install manually before the library with dev dependencies and remove it afterwards (we need the development headers to compile the extension).

Luckily, this problem has been solved already by the Community with the [docker-php-extension-installer](https://github.com/mlocati/docker-php-extension-installer). So instead we install manually `apt` or `apk` packages, we just use this script, and it takes care of that. The usage looks like this:

```dockerfile
FROM php:8.2-cli

ADD --chmod=0755 https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/

RUN install-php-extensions pdo pdo_mysql gd curl
```

This takes 20s on my machine (I have a high-end gaming machine, not comparable to real CI) and produces a Docker image which is 557MB.

```
❯ docker images
REPOSITORY                     TAG       IMAGE ID       CREATED          SIZE
php                            latest    683c45c057f0   38 seconds ago   557MB
```

Huh, that's much. Usually, the solution which many people are considering is then to use the Alpine variant. The Alpine variant is normally much smaller, but uses a different libc so musl. There already some known [PHP issues to Alpine variant images](https://github.com/php/php-src/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+musl), also there are known performance issues with allocation, see [FrankenPHP issue](https://github.com/dunglas/frankenphp/pull/666#pullrequestreview-1939793858).

But anyway, let's do the same again on alpine to just compare the size. So we added additionally an `-alpine` flag to the base image.

```dockerfile
FROM php:8.2-cli-alpine

ADD --chmod=0755 https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/

RUN install-php-extensions pdo pdo_mysql gd curl
```

and the image is after compiling

```
❯ docker images
REPOSITORY                     TAG       IMAGE ID       CREATED          SIZE
php                            latest    8651ba41dbd1   37 seconds ago   114MB
```

from 557MB to just 114MB, that's really good. The next pain point of the official docker image is building a multi arch image.

## Building multi-arch images

As mentioned, building that image is fast, but usually you want to build the images for multi-arch so for amd64 and arm64 typically. The easiest way for this is to use Docker buildx and QEMU.

```shell
docker buildx build --platform linux/amd64,linux/arm64 -t <image-name> .
```

and this uses QEMU for non-native architecture, and this will make the build so slow. When you have compile intensive extensions like gRPC, ddtrace (Datadog) and many extensions, this can easily make your build time to 10-40 minutes.

Here an example of the building time of Datadog PHP extension:

- Native (amd64): 3m 10s
- QEMU (arm64): 24m 04s

This comes as the emulation of arm64 is already slow and compiling stuff does take a lot of compute power. This can be of course solved by having native arm64 machines in this case, but you need to distribute the build to multiple machines and merge them together which is a annoying task. Also, you need to have arm64 machines, which are not so common as amd64. (GitHub Actions will maybe deliver Q3 2024 arm64 support for public runners)

## Wolfi-OS for rescue

[Wolfi-OS](https://github.com/wolfi-dev) is a Linux (un)distribution for containers by [chainguard](https://chainguard.dev). Or simply a Linux Distrubition, which is designed to be run only in containers. Wolfi uses glibc, produces on build-time SBOM for vulnerability scanning, and packages are designed to be granular to build small docker images. Wolfi takes CVE seriously, so they are patched on daily-base that the resulting image has no CVE's.

![Docker Official vs Wolfi PHP](https://i.imgur.com/l4bFg3x.png)

So let's build a similar image with Wolfi.

```dockerfile
FROM cgr.dev/chainguard/wolfi-base:latest

RUN apk add --no-cache php-8.2 php-8.2-pdo php-8.2-pdo_mysql php-8.2-mysqlnd php-8.2-gd php-8.2-curl
```

and the image is almost instantly build, as we just install the pre-compiled packages.

```
❯ docker images
REPOSITORY                     TAG       IMAGE ID       CREATED          SIZE
php                            latest    c0e8028f2f5f   3 seconds ago    66.1MB
```

and the resulting image is the smallest with just **61MB**, to be sure it is glibc we ran a short check:

```shell
❯ docker run --rm php /lib64/libc.so.6
GNU C Library (GNU libc) stable release version 2.39.
Copyright (C) 2024 Free Software Foundation, Inc.
This is free software; see the source for copying conditions.
There is NO warranty; not even for MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE.
Compiled by GNU CC version 13.2.0.
libc ABIs: UNIQUE IFUNC ABSOLUTE
Minimum supported kernel: 4.9.0
For bug reporting instructions, please see:

<https://www.gnu.org/software/libc/bugs.html>.
```

As the image build step just downloads the pre-compiled packages, the build time is almost instant. Even when we use the multi-arch build, the emulation just have to download packages and not compile them. So the build time is the same for amd64 and arm64.

## How do I find packages?

There is right now not an online package browser.

The simplest way is to use the shell

```shell
docker run --rm -it cgr.dev/chainguard/wolfi-base:latest
apk update
apk search php-8.2

```

When you are missing a package, [you can open a package request in the GitHub repository](https://github.com/wolfi-dev/os/issues/new?assignees=&labels=wolfi-package-request%2Cneeds-triage&projects=&template=new-wolfi-package-request.yml&title=%5BWolfi+Package+Request%5D%3A+%24PACKAGE_NAME). You can also take a look at the existing yaml files and submit a pull request with your package.

## Building image without a package manager (apko)

Chainguard offers an alternative way to build an OCI (Docker image) without using Docker. They build an image builder ([apko](https://github.com/chainguard-dev/apko)), which fetches the apk files and extracts them and builds the expected tar files. This reduces the attack surface of the environment as no package manager is installed.

So the config looks here like:

```yaml
contents:
  keyring:
    - https://packages.wolfi.dev/os/wolfi-signing.rsa.pub
  repositories:
    - https://packages.wolfi.dev/os
  packages:
    - wolfi-base
    - php-8.2
    - php-8.2-curl
    - php-8.2-gd
    - php-8.2-mysqlnd
    - php-8.2-pdo
    - php-8.2-pdo_mysql

# entrypoint of container
entrypoint:
  command: /usr/bin/php

# which architectures should be exported
archs:
  - x86_64
  - aarch64
```

and to build the image, we have to run:

```shell
# syntax: apko build <file.yaml> <image-name> <output-file>
apko build wolfi.yaml php image.tar
docker load < image.tar
docker run --rm php:latest-amd64 -v
```

and the resulting image is **61.4MB**, so ~5MB less as no package manager at all is installed. The next step could be to reference to this image in a `FROM <name>` and copy your project files into it.

## Using proprietary packages or FrankenPHP

[i set up my own repository](https://github.com/shyim/wolfi-php) server which contains proprietary extensions like Blackfire/Relay/Tideways and other extensions. [I am working actively on contributing the extensions back to Wolfi itself](https://github.com/wolfi-dev/os/pulls?q=+is%3Apr+author%3Ashyim+), but until then they can be installed from my repository.

[To use the repository with apk or apko, check out the README of the repository](https://github.com/shyim/wolfi-php?tab=readme-ov-file#installation-of-repository)

We continue to use the Docker image where the repository is already pre-installed:

```dockerfile
FROM ghcr.io/shyim/wolfi-php/base:latest

RUN <<EOF
set -eo pipefail
apk add --no-cache \
    frankenphp-8.2 \
    php-frankenphp-8.2
adduser -u 82 www-data -D
EOF

WORKDIR /var/www/html

USER www-data

EXPOSE 8000

ENTRYPOINT [ "/usr/bin/frankenphp", "run", "--config", "/etc/caddy/Caddyfile" ]

```

so let's compare the official FrankenPHP to our Wolfi based one:

```
❯ docker images
REPOSITORY           TAG          IMAGE ID       CREATED          SIZE
wolfi                frankenphp   e05cfc7587dc   21 seconds ago   97.7MB
dunglas/frankenphp   latest       e5e2a195853c   12 days ago      583MB
```

as both images are based on glibc, we won't encounter unique edge-case bugs :)

I created also a [ghcr.io/shyim/wolfi-php/frankenphp:8.3](https://github.com/shyim/wolfi-php/pkgs/container/wolfi-php%2Ffrankenphp) which is a replacement of dunglas/frankenphp with the same environment variables. Of course, installing extensions is different instead of using `install-php-extensions`, you will have to use `apk add ...`

## Installing extensions for FrankenPHP

FrankenPHP uses the PHP ZTS build and custom flags on PHP, so mostly all available extensions won't work. Therefore, all PHP extensions of Wolfi are compiled again for ZTS. They are all prefixed, so instead of `php-8.2-curl`, we will use here `php-frankenphp-8.2-curl`.

```dockerfile
FROM ghcr.io/shyim/wolfi-php/frankenphp:8.3

RUN apk add --no-cache php-frankenphp-8.3-curl
```

## Base images

I built some Base images with Wolfi for rapid start:

- [FrankenPHP](https://github.com/shyim/wolfi-php/tree/main/images/frankenphp)
- [FPM standalone](https://github.com/shyim/wolfi-php/tree/main/images/fpm)
- [Nginx](https://github.com/shyim/wolfi-php/tree/main/images/nginx)
- [Caddy](https://github.com/shyim/wolfi-php/tree/main/images/caddy)

## Other examples

I took the [Symfony Demo](https://github.com/symfony/demo) application and created examples with FrankenPHP, FPM standalone, Nginx and Caddy.

[You can find them here](https://github.com/shyim/wolfi-php/tree/main/examples)

I have also one example of using Wolfi without a Package manager to [create a small PHP-CS-Fixer docker image](https://github.com/shyim/php-cs-fixer-docker).

## Conclusion

I have been using PHP with Docker since years and struggled with long compile times with multi arch or with the gRPC extension. So Wolfi helped me to fix the problem as the packages are pre-compiled. Of course, you can do the same as using as base image ubuntu or debian, but their packages are bloated and are not optimized to be run in containers. They are expected to be run with systemd, logging to `/var/log` instead of stdout and more.

Also, the handling of the CVE got me really rethinking about not using any official Docker images. A good example here is the caddy image; it has always Vulnerabilities listed on Docker Hub.

![](https://i.imgur.com/HDQzi7D.png)

So Wolfi/Chainguard is really doing a great job here, [you can see on GitHub they are doing much more than just updating the version number.](https://github.com/wolfi-dev/os/commits/main/caddy.yaml)

As you can see from the Commit, the Wolfi devs have automated A LOT, packages updates done by bot, CVE fixes done mostly by a bot. So they build opinionated tooling for checking updates, building packages and a repository, scanning for CVE, and it's awesome when you get used to them.

If you want to learn more about Wolfi, [check out their docs](https://edu.chainguard.dev/open-source/wolfi/overview/). You can find there also information on how you can build with apko an OCI image, or build with melange packages on your own.

Also if you have questions, feel free to use [GitHub Discussions](https://github.com/orgs/wolfi-dev/discussions) or when it's specific to a package of my repository [open an issue here.](https://github.com/shyim/wolfi-php)
