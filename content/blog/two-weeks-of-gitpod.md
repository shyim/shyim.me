---
id: two-weeks-of-gitpod
date: 2022-10-17T18:00:00
title: Two weeks after using Gitpod only for development
author: Shyim
author_title: Developer @ Shopware
author_url: https://github.com/shyim
author_image_url: https://avatars3.githubusercontent.com/u/6224096?s=460&u=18be3a2d46f07dd42fc2b6dee9b4b9b68bca28d2&v=4
tags: [gitpod, cloud, development, vscode, jetbrains]
---

I am working together with [pumpi](https://github.com/pumpi) on a project named [shopmon](https://github.com/FriendsOfShopware/shopmon) (will be annoucned when it's done) and he is lazy to setup a local development environment and I was lazy to show him that. So I gave him a instance of VSCode running on Web on my personal VPS.
Everything was fine until I broke somehow IPv6 networking with Docker containers (I really hate networking), so we looked for an alternative.

## Stackblitz

We tried [Stackblitz](https://stackblitz.com/) first, but it was really working fine for us. Until we wanted to collaborate and work together with Git branches on GitHub. Stackblitz is not made really for that, so we had to find an alternative.

## Gitpod

So I remembered that we talked at the [Barcamp](https://www.kellerkinder.de/barcamp) (must visit event if you are interested into Shopware) about Gitpod. So we tried it and it was really nice. We could start a development environment for a GitHub repository with a single click. It was really fast and we could start coding directly. We also had a preview environment for each branch and pull request. So we could test our changes directly in the browser by starting a Gitpod for that branch.

The project itself is a Vitejs project with Vue 3 and TypeScript. So not really a big project. A default Gitpod has 6 vCPUs and 12GB of RAM. So it was more than enough for this simple project.

So lets quickly look into how our `.gitpod.yml` looks like:

```yml
ports:
  - name: Frontend
    port: 3000
    onOpen: open-browser
  - name: API
    port: 5789
    onOpen: ignore

vscode:
  extensions:
    - lukashass.volar
    - johnsoncodehk.vscode-typescript-vue-plugin
    - redhat.vscode-xml
```

First we can define ports that should be opened. We can also open them in the browser directly. We also can define extensions that should be installed. We have to use the extension ID from the marketplace. We can also define a `tasks` section, but we didn't need it for this project. It is not required to define the ports, if a port listens you get a notification that you can open it in the browser. But the list of ports is shown in the UI and can automatically open a Window if the port is listening.

The UI looks like:

![Exposed ports](https://i.imgur.com/pNlErng.png)

## Complexer project

Setting up a Gitpod for a Vue project is simple. But what if you have a more complex project? For example a Shopware project with a MySQL database. For this I tried to add Gitpod to one of my Shopware Extensions on GitHub. So the tasks are basically:

- Start a MySQL Server
- Clone Shopware
- Install Shopware
- Install Extension

So to start a MySQL server I decided to use the official MySQL Docker image. So I created a new "task" in the `.gitpod.yml`. Tasks are Shell scripts that are executed in the container. They have three entrypoints:

- `before` is executed before the workspace is started
- `init` is executed after the workspace is started
- `command` is executed after the workspace is started and the init command is finished

```yml
image:
  file: .gitpod.Dockerfile

tasks:
  - name: Shopware
    init: |
      # Move my cloned Extension repo
      EXTENSION_NAME=$(basename $PWD)
      TMP_DIR=$(mktemp -d)
      
      mv * .* "$TMP_DIR" || true

      # Run MySQL
      docker run --restart always -d --name=mysql -p 127.0.0.1:3306:3306 -e MYSQL_ROOT_PASSWORD=root mysql:8

      # Create a new Shopware project
      composer create-project shopware/production:dev-flex . -n

      # Configure environment variables
      sed -i -e 's;DATABASE_URL=.*$;DATABASE_URL=mysql://root:root@127.0.0.1:3306/shopware;' .env
      sed -i -e "s;APP_URL=.*$;APP_URL=$(gp url 8000);" .env
      echo "TRUSTED_PROXIES=192.168.0.0/16" >> .env

      ./bin/console system:install --basic-setup --create-database --drop-database

      # Move actual repository
      mv "$TMP_DIR" "custom/plugins/$EXTENSION_NAME"
    command: |
      # Gitpod registers the ports on first docker command
      docker ps
      
      # Wait for port open
      gp ports await 3306
      
      # Wait until MySQL is reachable
      until mysqladmin ping; do
          sleep 1
      done
      
      # Update domain url
      ./bin/console sales-channel:update:domain $(gp url 8000 | awk -F[/:] '{print $4}')
      
      # Start Webserver
      symfony server:start --port 8000 -d
```

So what we do is in the init step:

- Start a MySQL Server
- Create a new Shopware 6 project using Symfony Flex template
- Adjust some environment variables
    - The `gp url 8000` command returns the URL of the Gitpod workspace when something listens on port **8000**
    - Allow trusted proxies for gitpod network
- Install Shopware
- Move our extension repository to the right folder

As you can prebuild a workspace. Which means that the workspace is started and the init command is executed. So the next time you start a workspace, the init command is skipped and the command part is executed. So you have a quicker up time for your workspace.

In the command part we do:

- `docker ps` is used to register the ports of the before running MySQL server
- `gp ports await 3306` waits until the port is open
- `until mysqladmin ping; do sleep 1; done` waits until the MySQL server is reachable
- Update the sales channel domain to our current gitpod domain
- Start the Symfony webserver

You may ask now is Symfony CLI preinstalled? Nope, but you can install it with a custom docker file referenced with `image.file` like the first line in our yaml.

## Installing additional software

So we can install additional software with a custom docker file. So we can install the Symfony CLI and the MySQL client. So we can use the MySQL client in the terminal and the Symfony CLI to start the webserver.

```dockerfile
FROM gitpod/workspace-base:latest

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

RUN sudo add-apt-repository ppa:ondrej/php -y && \
    curl -fsSL https://deb.nodesource.com/setup_16.x | sudo bash - && \
    curl -1sLf 'https://dl.cloudsmith.io/public/symfony/stable/setup.deb.sh' | sudo -E bash && \
    sudo apt-get install -y \
    php8.1-fpm php8.1-mysql php8.1-curl php8.1-gd php8.1-xml php8.1-zip php8.1-opcache php8.1-mbstring php8.1-intl php8.1-cli \
    rsync \
    symfony-cli \
    mysql-client-8.0 \
    nodejs && \
    sudo apt-get upgrade -y && \
    echo "memory_limit=512M" > php.ini && \
    echo "assert.active=0" >> php.ini && \
    echo "opcache.interned_strings_buffer=20" >> php.ini && \
    echo "zend.detect_unicode=0" >> php.ini && \
    echo "realpath_cache_ttl=3600" >> php.ini && \
    sudo cp php.ini /etc/php/8.1/cli/conf.d/99-overrides.ini && \
    sudo cp php.ini /etc/php/8.1/fpm/conf.d/99-overrides.ini && \
    rm php.ini && \
    echo "[client]" > ~/.my.cnf && \
    echo "host=127.0.0.1" >> ~/.my.cnf && \
    echo "user=root" >> ~/.my.cnf && \
    echo "password=root" >> ~/.my.cnf
```

## Read to copy and paste project

### Shopware Extensions

If you are working also with Shopware extensions just copy my [.gitpod.yml](https://github.com/FriendsOfShopware/FroshTools/blob/main/.gitpod.yml) and [.gitpod.Dockerfile](https://github.com/FriendsOfShopware/FroshTools/blob/main/.gitpod.Dockerfile) to your project.

### Shopware 6 Project

If you are using already the new Symfony Flex template. Just run `composer req gitpod` and you are ready to go with Gitpod.

## Other IDEs

Gitpod does not only support VSCode in Web/Desktop. It supports also IDEs by Jetbrains like PhpStorm, WebStorm and many more. You need to install to local Jetbrains Product the Gitpod extension or just install [Jetbrains Gateway](https://www.jetbrains.com/remote-development/gateway/).

![Jetbrains Gateway](https://i.imgur.com/9uFQcGv.png)

So you can specify like in VSCode [your wanted Jetbrains Plugins](https://www.gitpod.io/docs/references/gitpod-yml#jetbrainsplugins). If your project is very big, you can also enable prebuild for the Jetbrain IDEs. It will prebuild the IDE index in the Gitpod prebuild step. So you have a faster startup time for your IDE and don't have to wait for the indexing.

You can use also already Fleet by launching it by own like:

```bash
curl -LSs "https://download.jetbrains.com/product?code=FLL&release.type=eap&platform=linux_x64" --output /tmp/fleet && chmod +x /tmp/fleet
/tmp/fleet launch workspace -- --auth=accept-everyone --publish --enableSmartMode "--projectDir=${GITPOD_REPO_ROOT}"
```

If you like more terminal editors like neovim, you can also connect straight to the SSH server of Gitpod. You can find the credentials in the Gitpod settings.

## Customizing

You can customize for you as user the installation with an Dotfiles repository. This repository will be cloned to the home directory of the user. So you can customize the terminal, the IDE and many more

![Dotfiles](https://i.imgur.com/Ynlae49.png)

You can add also to your local `.ssh/config` the following:

```bash
Host *.gitpod.io
    ForwardAgent yes
```

so when you join using VSCode on your local machine, you can use your local SSH keys to connect to external services. The credentials to push to your repository is configured by default


## Pricing

Gitpod offers a free plan for their SaaS offering with 50 hours/month. If you need more hours you can upgrade to a [paid plan](https://www.gitpod.io/pricing). But you can also host your own Gitpod installation. You can find the [installation guide here](https://www.gitpod.io/docs/configure/self-hosted/latest/installing-gitpod). If you are actively want to use it for your open-source projects you can ask also for a [free open-source plan](https://www.gitpod.io/for/opensource).

## Conclusion




