---
id: shopware-environment-windows
title: Setting up a Shopware Environment with Windows
author: Shyim
author_title: Developer @ Shopware
author_url: https://github.com/shyim
author_image_url: https://avatars3.githubusercontent.com/u/6224096?s=460&u=18be3a2d46f07dd42fc2b6dee9b4b9b68bca28d2&v=4
tags: [shopware]
---

I use at work mostly Linux, but at Home I prefer Windows (Gaming). In this short Tutorial I would like to share my Setup with you.

## My recommanded Setup:

* WSL 2
* Docker Desktop for Windows
* Ubuntu / Debian
* [GWSL](https://www.microsoft.com/en-us/p/gwsl/9nl6kd1h33v3) (X-Server at Windows)
* Development Docker Setup or My own Docker Setup. (Will use my own here)

At first we need to Install WSL 2 and Docker Desktop. Please follow the Tutorial from below.
- https://docs.microsoft.com/en-us/windows/wsl/install-win10
- https://hub.docker.com/editions/community/docker-ce-desktop-windows

## After Installation of GWSL and Docker we need to configure them both

### GWSL:

* Click on the Taskbar Icon
* GWSL Distro Tools
* Enable Auto-Export Display

### Docker Desktop:

- Enable Integration for Distro in Settings:
![Docker Desktop](https://i.imgur.com/pAMS60y.png)

## Installing PhpStorm

We can now start the Ubuntu Shell and download [PhpStorm for Linux](https://www.jetbrains.com/phpstorm/download/#section=linux) and unpack it in a Fflder where we want like `~/Apps/PhpStorm`.
To start PhpStorm you can run after unpacking the file `bin/phpstorm.sh` in the unpacked folder. And we see PhpStorm running with the GUI in Windows. PhpStorm will stop when you close this Ubuntu Shell.
You can use GWSL also to create a Windows Shortcut to launch PhpStorm. See their Docs.

To fix the Markdown Viewer we need to install some dependencies for the Browser:
```bash
sudo apt install libnss3 libnspr4 libxcursor1 libpangocairo-1.0-0 libxss1 libatk1.0-0 libgbm1 libatspi2.0-0 libcups2 libatk-bridge2.0-0
```

## Installing SWDC (Shopware Docker Control)

At first we need to clone the Repository

```bash
# Cloning into $HOME/Apps/shopware-docker
git clone https://github.com/shyim/shopware-docker ~/Apps/shopware-docker

# Creating an Shortcut to just use `swdc` everywhere
sudo ln -s /home/REPLACE YOUR LINUX USERNAME/Apps/shopware-docker/swdc /usr/local/bin/swdc
```

And we have an installed swdc. Next we will install one example SW6 Installation:

```
# Clone Production Repository
# sw6 is the project identifier. You can have more installations parallel
git clone https://github.com/shopware/production.git ~/Code/sw6

# Start SWDC
swdc up

# This installs Shopware 6 automated for you, Credentials for Administration are admin / shopware
swdc build sw6
```

After this step we have Shopware 6 installed at `sw6.dev.localhost`. You will may need to create a hosts entry to reach the Domain (127.0.0.1). Adminer is running at `db.localhost`

The swdc command-line contains some helpers like:

```bash
# Install NPM dependencies for Administration
swdc admin-init sw6

# Start admin watcher
swdc admin-watch sw6
# Running at localhost:8181
```

```bash
# Install NPM dependencies for Storefront
swdc storefront-init sw6

# Start storefront watcher
swdc storefront-watch sw6

# Running at localhost:9998
```

## Conclusion

We have a running WSL2 with Docker, X-Server and SWDC. We can open the Shop, use the admin watcher, storefront watcher. To see all capabilities of swdc see [Repository](https://github.com/shyim/shopware-docker).

If you have Questions feel free to write me at [Twitter](https://twitter.com/Shyim97) or [Shopware Community Slack](https://slack.shopware.com).
