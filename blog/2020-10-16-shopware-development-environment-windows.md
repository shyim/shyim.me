---
id: shopware-environment-windows
title: Setting up a Shopware Environment with Windows
author: Shyim
author_title: Developer @ Shopware
author_url: https://github.com/shyim
author_image_url: https://avatars3.githubusercontent.com/u/6224096?s=460&u=18be3a2d46f07dd42fc2b6dee9b4b9b68bca28d2&v=4
tags: [shopware]
---

At work I mostly use Linux, but at home I prefer Windows due to gaming. In this short Tutorial I would like to share my Windows setup with you.

## My recommended setup includes:

* WSL 2
* Docker Desktop for Windows
* Ubuntu / Debian
* [GWSL](https://www.microsoft.com/en-us/p/gwsl/9nl6kd1h33v3) (X-Server for Windows)
* PhpStorm
* Development Docker setup or my own Docker setup. (We will use my own in this tutorial)

At first we need to install WSL 2 and Docker Desktop. Please follow the tutorials below.
- https://docs.microsoft.com/en-us/windows/wsl/install-win10
- https://hub.docker.com/editions/community/docker-ce-desktop-windows

## Configuration adjustments for GWSL and Docker

### GWSL:

* Click on the GWSL taskbar icon
* Choose GWSL Distro Tools
* Enable Auto-Export Display

and Configure Firewall like in [Documentation](https://opticos.github.io/gwsl/tutorials/manual.html#installing-gwsl)

### Docker Desktop:

- Enable integration for additional distros in Docker settings:
![Docker Desktop settings](https://i.imgur.com/pAMS60y.png)

## Install PhpStorm

We can now start the Ubuntu shell and download [PhpStorm for Linux](https://www.jetbrains.com/phpstorm/download/#section=linux) and unpack it in a suitable folder e.g. `~/Apps/PhpStorm`.
In order to start PhpStorm, run the shell script `bin/phpstorm.sh` in the unpacked folder from the Ubuntu shell (e.g. `~/Apps/PhpStorm/bin/phpstorm.sh`). After that you should see the PhpStorm GUI running within Windows. PhpStorm will stop when you close this Ubuntu shell.
You can use GWSL also to create a Windows Shortcut to launch PhpStorm. For more information refer to the GWSL documentation.

To fix the Markdown viewer you will need to install some additional dependencies for the browser in Ubuntu:
```bash
sudo apt install libnss3 libnspr4 libxcursor1 libpangocairo-1.0-0 libxss1 libatk1.0-0 libgbm1 libatspi2.0-0 libcups2 libatk-bridge2.0-0
```

## Install SWDC (Shopware Docker Control)

At first we need to clone the repository

```bash
# Clone shopware-docker into $HOME/Apps/shopware-docker
git clone https://github.com/shyim/shopware-docker ~/Apps/shopware-docker

# Create an shortcut to be able to run `swdc` everywhere
sudo ln -s /home/<REPLACE YOUR LINUX USERNAME>/Apps/shopware-docker/swdc /usr/local/bin/swdc
```

That should be all to have an installed `swdc`. Next we will install one example SW6 setup with the production template:

```
# Clone the production repository
# sw6 is the project identifier. You can have more than one SW6 setup.
git clone https://github.com/shopware/production.git ~/Code/sw6

# Start SWDC
swdc up

# Automatically install Shopware 6. Credentials for administration are admin / shopware
swdc build sw6
```

After this step we have Shopware 6 installed at `sw6.dev.localhost`. You may need to create a hosts entry to reach the domain (127.0.0.1). Adminer is running at `db.localhost`

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

We have a running WSL 2 with Docker, X-Server and SWDC. We can open the shop in the browser and use the admin and storefront watcher. To see all capabilities of `swdc` see [Repository](https://github.com/shyim/shopware-docker).

If you have Questions feel free to write me at [Twitter](https://twitter.com/Shyim97) or [Shopware Community Slack](https://slack.shopware.com).
