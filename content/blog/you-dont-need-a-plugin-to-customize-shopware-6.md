---
id: shopware-symfony-bundles
date: 2021-07-04T23:15:59
title: You don't need a plugin to customize a Shopware 6 project
author: Shyim
author_title: Developer @ Shopware
author_url: https://github.com/shyim
author_image_url: https://avatars3.githubusercontent.com/u/6224096?s=460&u=18be3a2d46f07dd42fc2b6dee9b4b9b68bca28d2&v=4
tags: [shopware]
---

Every developer who has created a plugin has already created a Symfony bundle. All Shopware plugins are extending from a Shopware bundle class which extends from the Symfony bundle.
You might now ask yourself: when plugins are bundles, why did you write this blog post? First, let's list the differences of a plugin and the two types of bundles:

| Feature                                            	| Plugin 	| Shopware Bundle 	| Symfony Bundle 	|
|----------------------------------------------------	|--------	|-----------------	|----------------	|
| modifying Shopware                                 	| ✔️      	| ✔️               	| ✔️              	|
| can have migrations                                	| ✔️      	| ✔️               	| ❌              	|
| can be a theme                                     	| ✔️      	| ✔️               	| ✔️              	|
| can modify admin / storefront with js/css           | ✔️      	| ✔️               	| ❌              	|
| can be installed, uninstalled (lifecyle)           	| ✔️      	| ❌               	| ❌              	|
| can be managed by the shop owner in administration 	| ✔️      	| ❌               	| ❌              	|

## The benefits of working with a Bundle

Having less features is sometimes better.
As an agency, you don't want the shop owner to manage your custom built extensions. The lifecycle of plugins is intended mostly for store distribution and often irrelevant in a custom built environment.
When you make changes to a project, you want your code to be active always, regardless of the state of the shop. This makes Shopware updates smoother as well, as the upgrade process runs without plugins your code will still run.
This solves [theme compile issues during update process](https://github.com/adityatelange/hugo-PaperMod/discussions/456), e.g.
The loading order of the bundles can be fix configured in the `config/bundles.php` file to fix bundle dependency issues.
Also you could store the entire code in the template of the Shopware 6 project.

## What's about tasks that usually happen during install / update?

When your bundle extends from Shopware bundle, your bundle will automatically register itself to the migration system. So you can write migrations as usual and run them in the CLI using the `database:migrate` command.
Shopware also keeps track of extending the Administration etc. For tasks like creating entities, you could implement an simple command, which does it for you. 
It's also easier to test a command instead a entire plugin lifecycle. 

## Bundle as a Theme?

A bundle can be also a theme in Shopware. You just need to implement the `ThemeInterface` like [here](https://github.com/shopware/platform/blob/trunk/src/Storefront/Storefront.php#L23) and run `theme:refresh` in the console later.

## How does the Bundle integrate itself?

The bundle can be integrated like usual in Symfony, in the `config/packages.php` [file](https://github.com/shopware/production/blob/6.4/config/bundles.php#L19).
You could integrate your Bundle code into the `src` folder of the Shopware 6 production template and register a new namespace in the project `composer.json`

# One Bundle per project or multiple ones?

I personally recommand creating one bundle for the entire project and splitting it by core components like `Checkout`, `Framework` and `Content`. 
The theme even should be inside this bundle to reduce the headache regarding decorator priorities in the DI, or order of templates.
You should do what fits best to your development workflow and talk with your team.

## In what cases should I prefer plugins?

- In case you want to offer it in the Shopware store
- In case you need to toggle your plugin during runtime, without a new deployment
- In case you need the `config.xml` plugin configuration feature.
  - A alternative way is to use [Symfony configuration](https://symfony.com/doc/current/bundles/configuration.html) or create a own admin module with `sw-config` which can render also a `config.xml`

## Conclusion

We used this pattern last year on the Shopware Downtown project and it was a neat way to extend Shopware 6. It made the deployment a lot easier for us, as we didn't have to think about plugin installation or update stuff. 
The new devs didn't have to install or activate plugins. Our own migrations did run together with the setup process. 
The code of the project is public, make your own opinon.

- Integration of the bundles: https://github.com/shopwareDowntown/downtown/blob/master/src/Kernel.php#L55-L58 (Can be done in `config/bundles.php`, too. Was done there to avoid conflicts when updating templates)
- A example bundle with merchants https://github.com/shopwareDowntown/downtown/tree/master/src/Merchants
