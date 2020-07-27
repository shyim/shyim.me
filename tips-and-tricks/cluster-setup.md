# Cluster Setup

## What is clustering?

Generally speaking, clustering is a way to link multiple computers for a certain purpose. Usually this purpose is to increase availability and / or performance of the setup and has several benefits:

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

To get them in sync you should consider using an external storage like S3, GCP etc. [See this page for an example configuration](using-external-storage.md). The logs should be aggregated to one place using an tool like FileBeat, Datadog etc. Choose your favorite.

The JWT Certificate is static, this needs to be only shared once.

## Plugins

Plugins should be in the repository or required with Composer using [packages](https://packages.friendsofshopware.com). The admin user should not use the plugin manager to update plugins.

## Known issues

* Workers are still running with old code.
  * The workers can be stopped with the command \`\`bin/console messenger:stop-workers\`\` before/after rolling out the new code.
* 
#### 

