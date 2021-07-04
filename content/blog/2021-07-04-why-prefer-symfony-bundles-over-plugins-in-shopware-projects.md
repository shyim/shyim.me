---
id: shopware-symfony-bundles
title: Why Symfony bundles are better for customization than plugins in Shopware projects
author: Shyim
author_title: Developer @ Shopware
author_url: https://github.com/shyim
author_image_url: https://avatars3.githubusercontent.com/u/6224096?s=460&u=18be3a2d46f07dd42fc2b6dee9b4b9b68bca28d2&v=4
tags: [shopware]
---

Every developer which created a Plugin did already created a Symfony Bundle. All Shopware plugins are extending from a Shopware Bundle class which extends from the Symfony Bundle.
You might now ask yourself: when plugins are bundles, then why did you wrote this blog post? Let's first list the differences of a plugin and the two types of bundles.

| Feature                                            	| Plugin 	| Shopware Bundle 	| Symfony Bundle 	|
|----------------------------------------------------	|--------	|-----------------	|----------------	|
| modifying Shopware                                 	| ✔️      	| ✔️               	| ✔️              	|
| can have migrations                                	| ✔️      	| ✔️               	| ❌              	|
| can be a theme                                     	| ✔️      	| ✔️               	| ✔️              	|
| can be installed, uninstalled (lifecyle)           	| ✔️      	| ❌               	| ❌              	|
| can be managed by the shop owner in administration 	| ✔️      	| ❌               	| ❌              	|

## The benefits of working with a Bundle

As an agency, you don't want the shop owner to manage your custom built extensions. The lifecycle of plugins is intended mostly for store distribution and often irrelevant in a custom built environment.
When you make changes to a project, you want your code to be active always, regardless of the state of the shop. This makes Shopware updates smoother as well, as the upgrade process runs without plugins.
This solves theme compile issues on update process
You don't want to manage your own built extensions for that project too in your deployment together with the other plugins from the store. 
Also you could store the entire Code in the template of the Shopware 6 project.

## What's about Tasks which happens normally in Install / Update?

When your Bundle extends from Shopware Bundle, your bundle will automaticly register itself to the migration system. So you can write as usual migrations and run them in the cli using the `database:migrate` command.
Shopware keeps track also of extending the Administration etc. For tasks like creating entities, you could implement an simple command which does it for you. 
It's also easier to test a command instead a entire plugin lifecycle. 

## Bundle as a Theme?

A bundle can be also a Theme in Shopware. You will need to implement the `ThemeInterface` like [here](https://github.com/shopware/platform/blob/trunk/src/Storefront/Storefront.php#L23) and run later `theme:refresh` in the console.

## How will the Bundle integrated?

The bundle will be integrated like Symfony usual in the `config/packages.php` [file](https://github.com/shopware/production/blob/6.4/config/bundles.php#L19).
You could integrate your Bundle code into the `src` folder of the template and register a new namespace in the project `composer.json`

# One Bundle per project or multiple ones?

When you need that code shared, you should think about creating a new bundle and sharing it with a composer package. This depends also how you structure code internally.
Personaly I would place any code also the theme inside one bundle bundle. It reduces the headache about decorator prioerties in the DI or template order.

## When should I prefer plugins?

- When you want to provide it in the Store
- When you need to toggle your Plugin in the runtime without a new deployment
- Need the `plugin.xml` feature. Can be done with an simple admin module and the usage of `sw-system-config` too.

## Conclusion

We used this pattern last year on the Shopware Downtown project and was a neat way to extending Shopware 6. It made for us the deployment easier as we didn't had to think about plugin installation or update stuff. 
The new devs didn't had to install or activate the plugins. Our own migrations did run together with the Setup process. 
The code is public from the project, make your own oppion with it.

- Integration of the Bundles: https://github.com/shopwareDowntown/downtown/blob/master/src/Kernel.php#L55-L58 (Can be done too in config/bundles.php. Did there to avoid conflicts when updating template)
- A example bundle with merchants https://github.com/shopwareDowntown/downtown/tree/master/src/Merchants
