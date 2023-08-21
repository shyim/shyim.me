---
id: shopware-cli-project-ci
date: 2023-08-22T08:00:00
title: Building your Shopware project in the CI using shopware-cli
author: Shyim
author_title: Principal Software Engineer @ Shopware
author_url: https://github.com/shyim
author_image_url: https://avatars3.githubusercontent.com/u/6224096?s=460&u=18be3a2d46f07dd42fc2b6dee9b4b9b68bca28d2&v=4
tags: [shopware, shopware-cli, project, ci]
---

In this short blog post, I will show you how you can use [shopware-cli](https://github.com/FriendsOfShopware/shopware-cli) to build your Shopware project and deploy it later with Deployer, Docker image whatever you want.

## But first what is Shopware-CLI?

Shopware-CLI is a command line application written in Go. It's not the same application as `bin/console` in your Project. It's kinda a Swiss knife for the Shopware ecosystem. Likewise, it can do a lot of things like:
- Build the assets of your extensions
- Generate change log for the Shopware Store
- Upload the extension to the store
- Run multiple workers easily locally
- MySQL dumps without MySQL binaries and compatible between MariaDB and MySQL
- many things...
- Build your Shopware project

## Building your project

Before you deploy your project to the external service, you normally run some scripts in you favorite CI service. Things like:
- Run composer install
- Build Administration and Storefront
- Warm up maybe the container

This config is always different for every project or used CI service. So with the new shopware-cli command we can build it with one single command and customize it when needed with YAML configuration. So it's CI service neutral and can do more things than just some scripts.

## Build your project with shopware-cli

First you will have to install shopware-cli in your CI. If you use GitHub Action, you can use our own action for this:

```yaml
- name: Install shopware-cli
  uses: FriendsOfShopware/shopware-cli-action@v1
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

For any other CI service, we provide multi-arch (amd64/arm64) Docker images. You can find them on [Docker Hub](https://hub.docker.com/r/friendsofshopware/shopware-cli) or [GitHub](https://github.com/FriendsOfShopware/shopware-cli/pkgs/container/shopware-cli).

After you installed shopware-cli, you can run the following command to build your project:

```bash
> shopware-cli project ci <path-to-root>
```

So the Command will build Shopware and run a lot of optimizations:

- Run composer install with optimized class loader and [classmap-authoritative](https://getcomposer.org/doc/articles/autoloader-optimization.md#what-does-it-do--2) (Composer cannot find dynamic generated classes anymore, safes performance)
- Builds Administration and Storefront when required
    - Checks which extensions require what build
    - Runs npm install for all extensions
    - Commands like `bin/console bundle:dump` etc. are rewritten in Go and requires so less PHP execution (better as we don't have our Database in our CI).
- Deleting many unnecessary files to save space 
    - Whole Administration source code after build
    - Many fonts from TCPDF (Shopware uses DomPDF, TCPDF is only used to merge PDF files)
    - All administration source code from all installed extensions ([Requires at least Shopware 6.5.1.0](https://github.com/shopware/platform/commit/d5798c87037e25624c25f895cfbce5e8cef4be9a))
    - Deletes node_modules folders
- Optimize snippets in Administration
    - Developers save their Administration snippets always to the same folder to their modules. With that style we get in the Administration a lot of snippet files. To clean this up and optimize the performance, we merge all snippets into one file.

Size difference:

**Normal Shopware:** 276 MB
**Shopware with shopware-cli:** 181 MB

The size matters for the deployment time and the disk space on the server. When Docker is used, the image size will be also much smaller.

I think this is just the beginning, and we can do a lot more in the future. The goal is it with the command to make your life deploying Shopware easy as possible and have one common way to do it regardless what your target platform is.

## Configuration

The command is configurable with a YAML file. The config looks like this:

```yaml
# .shopware-project.yml
build:
  # deletes all public source folders of all extensions, can be only used when /bundles is served from local and not external CDN
  remove_extension_assets: false
  # skips the bin/console asset:install part
  disable_asset_copy: false
  # delete additional paths after build
  cleanup_paths:
    - path
```

Checkout the [Shopware project yaml configuration reference page](https://sw-cli.fos.gg/shopware-project-yml-schema/) for all possible configurations.

## Conclusion

I hope you like the new command, and it helps you to build your project in the CI. You can check out also [production-docker](https://github.com/FriendsOfShopware/production-docker) from FriendsOfShopware where we use that command to build docker images for production.
If you have any questions or feedback, feel free to contact me in the [Community Slack](https://slack.shopware.com) (#friendsofshopware channel) or [open an issue on GitHub](https://github.com/FriendsOfShopware/shopware-cli/issues).
