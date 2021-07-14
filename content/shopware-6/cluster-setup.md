---
title: Cluster Setup
description: This guide assumes you are using Shopware 6.3.0.0 or later
aliases:
    - /docs/shopware-6/cluster-setup
    - /v/shopware6/tips-and-tricks/cluster-setup
    - /docs/next/cluster-setup
---

## What is clustering?

Generally speaking, clustering is a way to link multiple containers and / or servers for a certain job in the setup. The purpose is usually to increase the availability and / or performance of the setup and has amongst other things the following benefits:

* you can introduce redundancy for any single component \(e.g. cache, appserver or database\). Even if a component fails, the shop will still work, as there is no "single point of failure"
* the load \(i.e. the users\) can be distributed across the cluster. So there is not a single appserver that will need to handle all users - but all users are distributed across all available appservers.
* scaling the setup becomes easier: As any component is layed out in a redundant manner, you can easily add another varnish server or appserver on the fly once your shop is confronted with more traffic \(e.g. after an TV advertisement\).

## In which folders does Shopware write?

By default Shopware writes in following folders:

| Path | Description | Can be saved in external Storage by default |
| :--- | :--- | :--- |
| custom/plugins | Plugins from Plugin Manager | No |
| config/jwt | JWT Certificate | No |
| files | Documents and other private files | Yes |
| var/log | Logs | No |
| var/cache | Cache \(**DON'T SHARE IT**\) | No |
| public/theme | Compiled theme files | Yes |
| public/media | Media | Yes |
| public/bundles | Plugin Assets | Yes |
| public/sitemap | Sitemap | Yes |
| public/thumbnail | Media Thumbnails | Yes |
|  |  |  |

## The example traditional setup

* Load Balancer \(LB\)
  * It will handle all requests and forward it to the app servers
* App Servers
  * Runs Shopware 6
  * Runs worker for the queue
* Admin Server
  * Handles the administration \(/admin\)
  * Deployment
  * Jumphost
* Redis Cluster
  * Sharing sessions
  * Sharing application cache
  * Sharing http cache
* MySQL Cluster
  * Persistent storage for store related data

## The example container setup

* Load Balancer \(LB\)
  * It will handle all requests and forward it to the app containers
* App Container\(s\)
  * Runs Shopware 6
* Worker Container\(s\)
  * Handles tasks from Queue
* Scheduled Task Container
  * Triggers Scheduled Task to the Queue
* MySQL Container\(s\)
* Redis Container\(s\)

## App Server / Container

To get them in sync you should consider using an external storage like S3, GCP etc. [See this page for an example configuration](cluster-setup.md). The logs should be aggregated to one place using an tool like FileBeat, Datadog etc. Choose your favorite.

The JWT Certificate is static, this needs to be only shared once.

### Example Storage Configuration

{% code title="config/packages/storage.yaml" %}
```yaml
shopware:
    filesystem:
        private:
            type: "amazon-s3"
            config:
                bucket: "documents"
                endpoint: "http://minio:9000"
                use_path_style_endpoint: true
                region: 'local'
                credentials:
                    key: AKIAIOSFODNN7EXAMPLE
                    secret: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
                options:
                    visibility: "private"
        public:
            type: "amazon-s3"
            url: 'http://s3.localhost/media'
            config:
                bucket: "media"
                endpoint: "http://minio:9000"
                use_path_style_endpoint: true
                region: 'local'
                credentials:
                    key: AKIAIOSFODNN7EXAMPLE
                    secret: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
                options:
                    visibility: "public"
        theme:
            type: "amazon-s3"
            url: 'http://s3.localhost/theme'
            config:
                bucket: "theme"
                endpoint: "http://minio:9000"
                use_path_style_endpoint: true
                region: 'local'
                credentials:
                    key: AKIAIOSFODNN7EXAMPLE
                    secret: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
                options:
                    visibility: "public"
        asset:
            type: "amazon-s3"
            url: 'http://s3.localhost/asset'
            config:
                bucket: "asset"
                endpoint: "http://minio:9000"
                use_path_style_endpoint: true
                region: 'local'
                credentials:
                    key: AKIAIOSFODNN7EXAMPLE
                    secret: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
                options:
                    visibility: "public"
        sitemap:
            type: "amazon-s3"
            url: 'http://s3.localhost/sitemap'
            config:
                bucket: "sitemap"
                endpoint: "http://minio:9000"
                use_path_style_endpoint: true
                region: 'local'
                credentials:
                    key: AKIAIOSFODNN7EXAMPLE
                    secret: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
                options:
                    visibility: "public"
```
{% endcode %}

### Example Cache Configuration

This config assumes you have the env variables "REDIS\_CACHE\_HOST", "REDIS\_CACHE\_PORT" and "REDIS\_CACHE\_DATABASE"

{% code title="config/packages/redis.yaml" %}
```yaml
framework:
    cache:
        app: cache.adapter.redis
        system: cache.adapter.redis
        pools:
            serializer:
                adapter: cache.adapter.redis
            annotations:
                adapter: cache.adapter.redis
            property_info:
                adapter: cache.adapter.redis
            messenger:
                adapter: cache.adapter.redis
            property_access:
                adapter: cache.adapter.redis
        default_redis_provider: "redis://%env(REDIS_CACHE_HOST)%:%env(REDIS_CACHE_PORT)%/%env(REDIS_CACHE_DATABASE)%"
```
{% endcode %}

### Example Session Configuration

You will need first to install the Redis PHP Extension.

{% code title="php.ini" %}
```text
session.save_handler = redis
session.save_path = "tcp://REDIS_HOST:REDIS_PORT?database=DB"
```
{% endcode %}

### Disabling Admin Worker

Shopware runs by default on any open Administration an long running HTTP Call to handle Messages in this Request. This should be disabled when multiple users are working in the Administration. With the following config can this be disabled

{% code title="config/packages/worker.yaml" %}
```yaml
shopware:
  admin_worker:
    enable_admin_worker: false
```
{% endcode %}

### Logging into Stderr

Logging into stderr makes it easier to catch all logs, when Shopware is running as containers.

{% code title="config/packages/log.yaml" %}
```yaml
monolog:
    channels: ['customchannel']
    handlers:
        main:
            type: fingers_crossed
            action_level: warning
            handler: nested
        customchannel:
            type: fingers_crossed
            action_level: info
            handler: nested
            channels: ['customchannel']
        nested:
            type:  stream
            path:  "php://stderr"
            level: debug
        console:
            type:  console
```
{% endcode %}

## Plugins

Plugins should be in the repository or required with Composer using [packages](https://packages.friendsofshopware.com). The admin user should not use the plugin manager to update plugins.

## Elasticsearch

The Elasticsearch Indexing can fill very fast the Queue. So you should take care, that the Queue will be processed with the right amount of workers.

## Known issues

* Workers are still running with old code.
  * The workers can be stopped with the command \`\`bin/console messenger:stop-workers\`\` before/after rolling out the new code.
* Shopware does not work when its mounted as read only filesystem
* When Plugins are not using the correct asset package, urls with result in 404 when external storage is configured
  * Contact the plugin manufacturer to correct the asset usage
* Request IP is wrong or requests are made with HTTP
  * You need to configure [TRUSTED\_PROXIES](https://symfony.com/doc/current/deployment/proxies.html)
* The Shopware Core does not support Primary / Replica for MySQL by default
* Sitemap cannot be generated with active Elasticsearch without fallback to DBAL
