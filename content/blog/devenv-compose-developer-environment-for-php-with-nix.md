---
id: devenv-compose-developer-environment-for-php-with-nix
date: 2022-12-25T00:00:00
title: 'Devenv: Compose a Developer Environment easily for PHP with Nix'
author: Shyim
author_title: Principal Software Engineer @ Shopware
author_url: https://github.com/shyim
author_image_url: https://avatars3.githubusercontent.com/u/6224096?s=460&u=18be3a2d46f07dd42fc2b6dee9b4b9b68bca28d2&v=4
tags: [devenv, nix, docker, php]
---

I have been using [Nix](https://nixos.org) for almost four years and also maintaining some packages at [nixpkgs](https://github.com/nixos/nixpkgs) (the primary Nix repository). The Nix learning curve is complicated, so I could not get my colleagues into it.
But [Devenv](https://devenv.sh) made it so easy to compose a developer environment, so I got their attraction, and some of them switched already, and we are looking to where we can port it.

## What is Devenv?

[Devenv](https://devenv.sh) allows you to describe in the Nix language how your **project** setup has to look like for any Unix-based systems (WSL2, Mac, Linux) for amd64/arm64 architectures. As you may know, no project has the same dependencies: one needs NodeJS 16, and the other NodeJS 18 already. For those reasons, there are already solutions like [NVM](https://github.com/nvm-sh/nvm)(node version manager) where you can pin the version using a `.nvmrc` file.
This works, of course, only for Node, and there are similar tools for any language and devenv allows you here to pin any package and with services.

## Installation of Devenv

The installation is straightforward. You will need to install the Nix package manager, Cachix, to get binary caches and not to compile stuff and devenv itself. You can follow the [instructions in the docs](https://devenv.sh/getting-started/) 


## Install our first packages

With Devenv, we can craft a complete shell and processes with all available packages from [nixpkgs](https://github.com/nixos/nixpkgs) instead of using for any language a version manager. Let's say we want NodeJS 16, yarn, and PHP 8.1. Use `devenv init` to generate the devenv lock and the configuration. Then we can add in our new generated `devenv.nix` our packages.

```nix
# devenv.nix
{ pkgs, ... }: {
  packages = [ pkgs.nodejs-16_x pkgs.yarn pkgs.php81 ];
}
```

When we call inside that folder `devenv shell` and the requested packages are getting installed, we land in a Bash shell.

![](https://i.imgur.com/RYM1mlF.png)


The `shell` command is limited to Bash and it's annoying to call always the command. So I can recommend you install [direnv](https://direnv.net/). It hooks into your shell and calls Devenv to populate your existing shell.

![](https://i.imgur.com/vVCofvS.png)

You can find the package names using `devenv search <term>` or by visiting https://search.nixos.org.

But languages are already abstracted in Devenv, so we can toggle the tools directly without manually adding them as a package. Behind the abstraction it adds them to the packages, but for some languages like Ruby there is more happening like adjusting the `GEM_HOME`. 

```nix
# devenv.nix
{ pkgs, ... }: {
  packages = [ pkgs.yarn ];

  languages.javascript.enable = true;
  # Uses by default the latest LTS
  languages.javascript.package = pkgs.nodejs-16_x;
  
  languages.php.enable = true;
}
```

If you are interested in what the options are doing, here you can find the source:
- [Javascript](https://github.com/cachix/devenv/blob/main/src/modules/languages/javascript.nix)
- [PHP](https://github.com/cachix/devenv/blob/main/src/modules/languages/php.nix)
- [Ruby](https://github.com/cachix/devenv/blob/main/src/modules/languages/ruby.nix)

## Customizing PHP configuration

We now have PHP in our environment with "default" extensions and default php.ini. 
Let's configure our PHP how we want to have it.

To configure it, we have to call `buildEnv` on our PHP package.

```diff
# devenv.nix
{ pkgs, ... }: {
   ...
   
+  languages.php.package = pkgs.php81.buildEnv {
+    extraConfig = ''
+      memory_limit = 256m
+    '';
+  };
}
```

When we now open the shell again, we see the memory_limit has been changed

![](https://i.imgur.com/djhp1hS.png)

To install more PHP extensions like `redis` we can also pass more extensions inside the `buildEnv`

```diff
# devenv.nix
{ pkgs, ... }: {
   ...
   
  languages.php.package = pkgs.php81.buildEnv {
+   extensions = { all, enabled }: with all; enabled ++ [ redis ];
    extraConfig = ''
      memory_limit = 256m
    '';
  };
}
```

And we see we have Redis installed.

![](https://i.imgur.com/qDFrowo.png)

With `enabled ++ [ redis ]`, we add our Redis to all currently enabled PHP extensions. We will remove all other extensions by changing it to just `[ redis ]`. You can find all available extensions [here](https://search.nixos.org/packages?channel=unstable&from=0&size=50&sort=relevance&type=packages&query=php81Extensions.)


## Adding prebuilt processes

Typically your application needs some kind of service like Postgres, MySQL, Redis, and more. For this reason, devenv has options to start processes.

Let's start a MySQL server:

```diff
# devenv.nix
{ pkgs, ... }: {
   ...
   
+  services.mysql.enable = true;
}
```

Now we have to run `devenv up` to start the processes in the foreground. There is a [open issue](https://github.com/cachix/devenv/issues/80) that allows running in the background. This addition also installs the MySQL cli into our shell.


![](https://i.imgur.com/jGmqx55.png)

Typically you want to create MySQL users and databases, so it's easier for the devs.

```diff
# devenv.nix
{ pkgs, ... }: {
   ...
   
+  services.mysql.initialDatabases = [{ name = "app"; }];
+  services.mysql.ensureUsers = [
+    {
+      name = "app";
+      password = "app";
+      ensurePermissions = { "app.*" = "ALL PRIVILEGES"; };
+    }
+  ];
}
```

So after stopping the active `devenv up` and restarting it we can connect with our newly created users.

![](https://i.imgur.com/byu2jsE.png)

By default, the MySQL service uses MySQL 8.0; you can override the package option to `pkgs.mariadb` to get MariaDB. (You may need to delete the existing database `rm -rf .devenv/state/mysql`)

The most basic services are already supported devenv:

- MySQL (MariaDB)
- Caddy
- PHP-FPM
- Postgres
- Redis
- MongoDB
- Elasticsearch
- RabbitMQ
- [See options for a complete list](https://devenv.sh/reference/options/#servicesadminerenable)

## Adding own processes

You can spawn your processes if you do not find the necessary service. 

```diff
# devenv.nix
{ pkgs, ... }: {
   ...
   
+   processes.ping.exec = "ping google.com";
}
```

When we run `devenv up`, we see a new process, `ping`, pinging google.com.

With the power of Nix, you can also reference packages; when they are not installed, Nix will install them on the fly. Let's use [symfony-cli](https://github.com/symfony-cli/symfony-cli) to start a webserver.

```diff
# devenv.nix
{ pkgs, ... }: {
   ...
   
+   # Packages refer always to the root of the package and not a specific binary
+   processes.symfony.exec = "${pkgs.symfony-cli}/bin/symfony server:start";
}
```

You can also use it to start your queue consumer or other things you need to run in the background.

## Adding environment variables

Since we already started a MySQL server in our example, we have to tell our application the connection string for it. To simplify it, we can also set enviroment variables available in the shell and in the processes.

```diff
# devenv.nix
{ pkgs, ... }: {
   ...
   
+   env.DATABASE_URL = "mysql://app:app@localhost/app";
}
```

![](https://i.imgur.com/t0xdcT8.png)

## Adding scripts

It's also possible to add a kind of shell aliases to the shell to simplify some behavior.

```diff
# devenv.nix
{ pkgs, ... }: {
   ...
   
+   scripts.build-app.exec = ''
+     npm install --prefix src/Foo
+     npm run --prefix src/Foo build
+     bin/console assets:install
+    '';
}
```

**Tip:** You can refer to pkgs like in the process example to use programs not directly installed.

## Using packages from other Nix flakes

The default `pkgs` (nixpkgs) contains only supported software. To install older PHP versions like 7.4, you must add an additional input like [phps](https://github.com/fossar/nix-phps) for PHP packages.

To add an input, we have to adjust the `devenv.yaml`

```yaml
inputs:
  nixpkgs:
    url: github:NixOS/nixpkgs/nixpkgs-unstable
  phps:
    url: github:fossar/nix-phps
    inputs:
      nixpkgs:
        follows: nixpkgs
```

The phps flake refers to nixpkgs, having the same nixpkgs input also, in phps we say to follow our root nixpkgs.

Now we can run `devenv update` to update our lock file and add the new input.

We must adopt our "imports" in the nix file with the change.

```diff
-{ pkgs, ... }: {
+{ pkgs, inputs, ... }:
```

Then we can reference it in the package option like so:

```Nix
languages.php.package = inputs.phps.packages.${builtins.currentSystem}.php74;
```

To configure the extensions and php.ini, you can call, like before, `buildEnv` on it.

## Editor Integration

You can find all binaries from your shell symlinked in the `.devenv/profile/bin` folder and use them to set up the Interpreter in PhpStorm. For Jetbrains IDEs, a plugin named [Better Direnv](https://plugins.jetbrains.com/plugin/19275-better-direnv) adds support for Run Configuration. It does currently not support PhpStorm, but I [made a pull request](https://github.com/Fapiko/intellij-better-direnv/pull/20) to add support for that

For VSCode users, there is also a [extension](https://marketplace.visualstudio.com/items?itemName=mkhl.direnv) for it

## Make local changes only for you

You can create a `devenv.local.nix` to override configurations locally. This file should be ignored in your `.gitignore` (`devenv init` does this by default).


## Devenvify an existing application

I will use the [symfony demo application](https://github.com/symfony/demo) to see how a complete environment could look. The demo application requires the following:

- PHP 8.1
- Node
- Webserver

```Nix
{ pkgs, config, ... }:

{
  packages = [
    pkgs.yarn
  ];

  languages.javascript.enable = true;
  languages.php.enable = true;

  # You can use also symfony-cli like in the examples, but I like it more explict
  languages.php.fpm.pools.web = {
    settings = {
      "clear_env" = "no";
      "pm" = "dynamic";
      "pm.max_children" = 10;
      "pm.start_servers" = 2;
      "pm.min_spare_servers" = 1;
      "pm.max_spare_servers" = 10;
    };
  };

  services.caddy.enable = true;
  services.caddy.virtualHosts.":8000" = {
    extraConfig = ''
      root * public
      php_fastcgi unix/${config.languages.php.fpm.pools.web.socket}
      file_server
    '';
  };

  processes.build-assets.exec = "yarn watch";
}
```

The user just has to run `composer install` and `yarn` to install the packages. If you like, you can script that with the `enterShell` hook. `enterShell` is always executed when the user opens the shell or starts the processes.

```Nix
enterShell = ''
    if [[ ! -d vendor ]]; then
        composer install
    fi
    
    if [[ ! -d node_modules ]]; then
        yarn
    fi
'';
```

## Miscellaneous

The `devenv.lock` locks the complete package tree from your packages and their packages. It would be best if you ran `devenv update` from time to time to get the latest PHP/Node updates. 
Also, it makes sense to call `devenv gc` to get rid of downloaded packages which are not used anymore.

## Conclusion

We started using [Devenv at Shopware](https://github.com/shopware/platform/blob/trunk/devenv.nix) for 2 weeks, and fascinating developers are still to switch to it. It allows us to build one environment that works similarly on Linux, Mac, and WSL2 without any performance issues, as it runs natively without containers. The developers like it to have a declarative way to build their environments, especially trying stuff out without breaking their complete system. 

From the DevOps side, it's also lovely when you update the config/lock. It get's applied after the `git pull` of the developer, and they don't have to think about updating their tools or pulling images.

The first commit of Devenv was two months before, so It's a new tool making Nix more accessible for all kinds of projects outside. If you have questions or problems, feel free to join the [Discord server](https://discord.gg/naMgvexb6q).
