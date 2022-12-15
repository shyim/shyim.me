---
id: shopware-6-symfony-cli-macos-install
date: 2022-02-27T00:00:00
title: Easy and fast local Shopware 6 Development on Mac with Symfony CLI
author: Shyim
author_title: Principal Software Engineer @ Shopware
author_url: https://github.com/shyim
author_image_url: https://avatars3.githubusercontent.com/u/6224096?s=460&u=18be3a2d46f07dd42fc2b6dee9b4b9b68bca28d2&v=4
tags: [shopware, symfony, php]
---

I switched a month ago to macOS as of the M1 hype and wanted to try out the entire Apple ecosystem when I have an iPhone, iPad, and Mac. To get Shopware 6 running, I looked into some Guides for Mac and found out for myself: Why is this all so complicated, and why the hell is anyone using Docker for that.

## Docker on Mac

I saw that many people are using `Dockware` for their Setup. (Dockware is a Docker image with all the Tools/Servers included to run Shopware 6). 
Docker runs not native on macOS and uses a Virtual machine to emulate a Linux kernel and all the containers below it. 
So obviously, the filesystem would be slow, and many people using, for this reason, SFTP or other tools like `docker-sync` to hold the same state between host and container.
This is one of the most significant disadvantages for me. Like me, the dumb user has to run a tool to have this synchronized. I know that tools like PhpStorm can do this for me automatically, but when it doesn't work, I will waste so much time to find this out.

### tldr

- Don't want to emulate stuff
- Don't want to think about file sync/copying tasks
- Expect it to work without Rosetta 2 (the Intel emulation)
    - Better battery usage

## My current Setup

I use [symfony-cli](https://symfony.com/doc/current/setup/symfony_server.html) as Webserver. It is compelling and works out of the box (if you have PHP already installed) for any Symfony project. Shopware 6 is based on Symfony. We can use it without any configuration. It also has various options for:

- Enabling SSL certificates
- Different PHP Version using a `.php-version` file
- Custom PHP configuration
- Local proxy for domains instead of ports in URL

### Install packages

To get started, we need to install first all packages using Homebrew.

```bash
brew install symfony-cli/tap/symfony-cli php mysql node composer
```

### Configure MySQL (first time)

On the first installation of MySQL, you have to start MySQL first with `brew services start mysql` and configure a password for MySQL using the `mysql_secure_installation` command.

### Configure PHP.ini

It would be best if you increase the `memory_limit` in the `/opt/homebrew/etc/php/8.1/php.ini` (or other used PHP version) to a minimum 512MB, so Shopware works better or create in your project a `php.ini` with `memory_limit=512M`

### Run the Webserver

As we configured PHP and MySQL, we can now just run the Webserver. We need to go to our Shopware Project folder and run `symfony server:start`. The default port of the Server is 8000 and will increase if it's already in use. In default, the command shows the Symfony log and the access log. You can also use `-d` to run it in the background. See also other commands like `server:stop` (Stops the background running server), `server:status` (Shows the current state of the server) or `server:log` for the logs. Run `symfony` without arguments to see all available commands.

### How to install other PHP extensions?

PHP extensions can be installed using pecl. Example: `pecl install redis`

### Example for Setting up a project for Contribution

Run these commands in your Terminal, and we have a running Shop of the `trunk` version of Shopware 6.

```bash
# Clones Shopware 6
git clone https://github.com/shopware/platform.git
cd platform

# Install dependencies

composer install

# Create a .env file (APP_URL is by default http://localhost:8000)
./bin/console system:setup

# Installs Shopware
composer run setup

# Start our Symnfony Webserver
symfony server:start -d
```

### Example for Setting up a project for production

```bash
# Clones Shopware 6
git clone https://github.com/shopware/production.git
cd production

# Install dependencies

composer install

# Create a .env file (APP_URL is by default http://localhost:8000)
./bin/console system:setup

# Installs Shopware
./bin/console system:install --create-database --basic-setup

# Start our Symnfony Webserver
symfony server:start -d
```
