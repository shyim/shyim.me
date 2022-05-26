---
id: how-we-do-loadtest-shopware
date: 2022-05-26T20:00:00
title: How we do nightly automated load tests at Shopware
author: Shyim
author_title: Developer @ Shopware
author_url: https://github.com/shyim
author_image_url: https://avatars3.githubusercontent.com/u/6224096?s=460&u=18be3a2d46f07dd42fc2b6dee9b4b9b68bca28d2&v=4
tags: [shopware, loadtesting, locust, hetzner]
---

With the Shopware version 6.4.11.0, we improved the performance overall a lot. To make sure that we still improve, we decided to set up a nightly load testing job to ensure that the application performance stays the same. So we have running since a month an automated load test for Shopware 6 running, and in this post, I want to speak about it. To test the Shopware, we use multiple dedicated Cloud Servers from [Hetzner Cloud](https://hetzner.cloud) and wrote some custom tooling around [Ansible](https://www.ansible.com) to spawn the servers before.

## Custom Tooling to spawn VMs

The Go application is there to manage the VMs at Hetzner using API and add some DNS records as we delete the entire infrastructure after execution. The application takes a configuration of how many servers of which type we need for which ansible group.

```yaml
name: benchmark
domain: benchmark-domain.com
location: # create a server of one of the locations, we don't care which one
  - fsn1-dc14 # Falkenstein
  - nbg1-dc3 # Nürnberg
image: 45557056 # debian-11
servers:
  app:
    amount: 3
    type: ccx32 # 8 cpu, 32GB memory
  mysql:
    amount: 3
    type: ccx32 # 8 cpu, 32GB memory
    image: demo-data-snapshot
  elastic:
    amount: 1
    type: ccx32 # 8 cpu, 32GB memory
  redis:
    amount: 1
    type: ccx12 # 2 cpu, 8GB memory
    ansible_vars:
      type: single
      max_memory: '7G'
  redissession:
    amount: 1
    type: ccx12  # 2 cpu, 8GB memory
    ansible_vars:
      type: single
      max_memory: '7G'
  locust:
    amount: 1
    type: cpx51  # 16 vcpu, 32GB memory
  assets: # minio server
    amount: 1
    type: cx21  # 2 vcpu, 4GB memory
    persistent: true
  grafana:
    amount: 1
    type: cx21  # 2 vcpu, 4GB memory
    persistent: true
networks:
  sw6-benchmark:
keys:
  shyim: # give me ssh access
  ci: # give the CI server access
```

The config is inspired from `docker-compose.yml`, but spawns VMs instead of containers. The tool starts all required servers, waits until they are reachable, and runs parallel Ansible with the group. The key in the part of the `servers` is the Ansible group.

## The Database

As we test a specific Dataset, we have created a demo-data set with many products and a second anonymized data set we got from a customer. Instead of importing this dump, we use VM snapshots and restore them as this works faster for us. 

This process is a little bit tricky as we use this one Database snapshot on three servers to spawn a primary replica setup, and MySQL holds some internal configuration that breaks the setup. But there is a rescue!, you have to delete the unique instance id from the MySQL storage. Here is our entire cleanup script to have a good working snapshot.

```shell
# MySQL flushes all data, so we can cleanup later some files to reduce the size
mysql -e 'SET GLOBAL innodb_fast_shutdown=0'

# Drop entire primary replica config
mysql -e 'RESET master'

# Stop MySQL
systemctl stop mysql

# Save some storage
rm -f /var/lib/mysql/ib_logfile*
rm -f /var/lib/mysql/undo_*

# Holds the server uuid, needed to remove to build an cluster
rm -f /var/lib/mysql/auto.cnf

# Remove bind-address from my.cnf as the next restore will have another internal IP
sed -i '/bind-address/d' /etc/mysql/my.cnf
```

## Preparing Shopware for the Load

As we used a snapshot for the Database and use the current Git version, we have to run the new migrations, so the current Git version works again, and also, the Elasticsearch needs to be indexed. Before running the load test, we ensure that the Redis servers are empty (so we run against a not cached website) and that Elasticsearch has completed all internal tasks.

## Running the Load test

We use to do the load test [locust](https://locust.io/). Locust is an open-source Python written load testing tool with the ability to run with many worker nodes. The worker nodes are making the actual HTTP requests, and the master node is aggregating the results, so it's possible to generate a massive amount of concurrent requests. 

Before we can run Locust, [we fetch some information](https://github.com/shopware/platform/blob/trunk/src/Core/DevOps/Locust/setup.php) of the running Shopware installation like product numbers, urls, basic id's like salutation, countries , etc.

So finally we can start Locust with 100 clients and run it in our tests for 10 minutes and save the HTML result file. The resulting file will be uploaded to S3 storage, and we will post a message on our Slack.

![Slack Message](https://i.imgur.com/DFLnU2q.png)

> You might think. Why are the RPS so slow? We always test without HTTP cache as this does not show the actual application performance as we test our caching service. Also, as our Load test runs just for 10 minutes, the Cache TTL is only 120 seconds. 

This job is done then for all our [scenarios](https://github.com/shopware/platform/tree/trunk/src/Core/DevOps/Locust/scenarios).

- [integration-benchmark](https://github.com/shopware/platform/blob/v6.4.11.1/src/Core/DevOps/Locust/scenarios/integration-benchmark.py)
    - Some Users are just surfing
    - Some Users are buying
    - Some Users are buying fast as possible a specific product (Ads)
    - new Product imports, price and stock updates
- [api-benchmark](https://github.com/shopware/platform/blob/v6.4.11.1/src/Core/DevOps/Locust/scenarios/api-benchmark.py)
    - only new Product imports, price and stock updates
- [nvidia-benchmark](https://github.com/shopware/platform/blob/v6.4.11.1/src/Core/DevOps/Locust/scenarios/nvidia-benchmark.py)
    - In this case all users are trying to buy the same product
        - Normally known as Nvidia Graphics Card or PS5 Rush
- [storefront-benchmark](https://github.com/shopware/platform/blob/trunk/src/Core/DevOps/Locust/scenarios/storefront-benchmark.py)
    - All Users are just surfing
- [store-api-benchmark](https://github.com/shopware/platform/blob/trunk/src/Core/DevOps/Locust/scenarios/store-api-benchmark.py)
    - It's similar to the Integreation Benchmark, but all Users are only using the Store-API

## Aggregating Locust results

By default Locust only gives you an HTML result file and a CSV file with the result. To make us easier to review the serval run all days, also with the specific commit, we used Grafana to visualize this for us. Luckily there was already a project for Grafana that we reused named [locust-plugins](https://github.com/SvenskaSpel/locust-plugins). 
That repository contains some Locust extensions and a timescaledb adapter that writes all requests in a Postgres server. 

This database can be directly used in Grafana to visualize the runes and build any Graph/Table you want. The author also delivers many prebuilt Dashboards like a Run overview with a Graph of the RPS. So you don't need to persistent the HTML result files anymore.

Here are some example screenshots:

![Locust overview of all runs](https://github.com/SvenskaSpel/locust-plugins/raw/master/locust_plugins/dashboards/screenshots/testruns.png)

![Single](https://github.com/SvenskaSpel/locust-plugins/raw/master/locust_plugins/dashboards/screenshots/main_dashboard.png)

Besides the Grafana boards, we also have [Tideways](https://tideways.com) configured and can compare the generated profiles between runs when they differ a lot.

## How do we have configured Shopware?

Here are some of our configurations:

```php
// .env.local.php
return [
    'APP_ENV' => 'prod',
    'APP_SECRET' => 'def00000e2deff6ce3fc12a8fc6af13',
    'APP_URL' => 'http://testing-domain.com',
    'MAILER_URL' => 'null://localhost',
    'DATABASE_URL' => 'mysql://{{ benchmark.mysql.shopware.username }}:{{ benchmark.mysql.shopware.password }}@{{ hostvars['mysql-1']['private_server_ip'] }}:3306/shopware',
{% for host in groups['mysql'] %}{% if host != "mysql-1" %}
    'DATABASE_REPLICA_{{ loop.index0 - 1 }}_URL' => 'mysql://{{ benchmark.mysql.shopware.username }}:{{ benchmark.mysql.shopware.password }}@{{ hostvars[host]['private_server_ip'] }}:3306/shopware',
{% endif %}{% endfor %}
    'COMPOSER_HOME' => '/var/www/html/var/cache/composer',
    'INSTANCE_ID' => '53n5gpztNlNxGu6vm8gjZ33T6A0glvQm',
    'BLUE_GREEN_DEPLOYMENT' => 0,
    'SHOPWARE_HTTP_CACHE_ENABLED' => 0,
    'SHOPWARE_HTTP_DEFAULT_TTL' => 7200,
    'SHOPWARE_ES_HOSTS' => '{% for host in groups['elastic'] %}{{ hostvars[host]['private_server_ip'] }},{% endfor %}',
    'SHOPWARE_ES_ENABLED' => 1,
    'SHOPWARE_ES_INDEXING_ENABLED' => 1,
    'SHOPWARE_ES_INDEX_PREFIX' => 'sw',
    'SHOPWARE_ES_THROW_EXCEPTION' => 1,
    'SHOPWARE_CDN_STRATEGY_DEFAULT' => 'id',
    // Cache the products in the cart object
    'FEATURE_NEXT_13250' => 1,
    // Fixed cache id to save a query
    'SHOPWARE_CACHE_ID' => '6a6c3d6fe2894f5d9ca2964a04c35c08',
    // Save a query on any request to set session variables
    'SQL_SET_DEFAULT_SESSION_VARIABLES' => 0,
    // Enable breaking performance optimizations
    'PERFORMANCE_TWEAKS' => 1,
];
```

```yaml
# config/packages/shopware.yml
shopware:
    profiler:
        # get better overview results in Tideways
        integrations: ['Tideways']
    cart:
        redis_url: 'redis://{{ hostvars['redissession-1']['private_server_ip'] }}:6379/0?persistent=1'
    admin_worker:
        enable_admin_worker: false
    mail:
        update_mail_variables_on_send: false
    increment:
        user_activity:
          type: 'array'
        message_queue:
          type: 'array'
    filesystem:
        # A lot of filesystem config for external s3 storage

framework:
    mailer:
        # Send mails over queue
        message_bus: 'messenger.default_bus'
    lock: 'in-memory'
    cache:
        app: cache.adapter.redis
        default_redis_provider: 'redis://{{ hostvars['redis-1']['private_server_ip'] }}:6379/0?persistent=1'
    messenger:
        transports:
            default:
                dsn: "enqueue://redis?queue[name]=messages"

enqueue:
   redis:
       transport:
               dsn: "redis+phpredis://{{ hostvars['redissession-1']['private_server_ip'] }}:6379/0?persistent=1"
       client: ~

# Disable log_entry
monolog:
    handlers:
        business_event_handler_buffer:
            level: error
```

```ini
# php.ini
memory_limit=512M
post_max_size=32M
upload_max_filesize=32M
session.save_handler = redis
session.save_path = "tcp://{{ hostvars['redissession-1']['private_server_ip'] }}:6379/0?persistent=1"
assert.active=0
date.timezone=UTC
opcache.enable_file_override=1
opcache.interned_strings_buffer=20
opcache.preload=/var/www/html/var/cache/opcache-preload.php
opcache.preload_user=nginx
zend.detect_unicode=0
realpath_cache_ttl=3600
redis.clusters.cache_slots = 1
```

