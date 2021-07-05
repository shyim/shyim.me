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
This solves theme compile issues during update process, e.g.
You don't want to manage your own built extensions for that project too in your deployment together with the other plugins from the store. 
Also you could store the entire Code in the template of the Shopware 6 project.

## What's about tasks that usually happen during install / update?

When your bundle extends from Shopware bundle, your bundle will automatically register itself to the migration system. So you can write migrations as usual and run them in the CLI using the `database:migrate` command.
Shopware also keeps track of extending the Administration etc. For tasks like creating entities, you could implement an simple command, which does it for you. 
It's also easier to test a command instead a entire plugin lifecycle. 

## Bundle as a Theme?

A bundle can be also a theme in Shopware. You just need to implement the `ThemeInterface` like [here](https://github.com/shopware/platform/blob/trunk/src/Storefront/Storefront.php#L23) and run `theme:refresh` in the console later.

## How does the Bundle integrate itself?

The bundle can be integrated like usual in Symfony, in the `config/packages.php` [file](https://github.com/shopware/production/blob/6.4/config/bundles.php#L19).
You could integrate your Bundle code into the `src` folder of the template and register a new namespace in the project `composer.json`

# One Bundle per project or multiple ones?

When you need to share your code, you should think about creating a new bundle and sharing it with a composer package. This depends also how you structure code internally.
Personally, I would place any code, as well as the theme, inside one single bundle. This reduces the headache regarding decorator priorities in the DI, or order of templates.

## In what cases should I prefer plugins?

- IN case you want to offer it in the Shopware store
- In case you need to toggle your plugin during runtime, without a new deployment
- IN case you need the `plugin.xml` feature. But this can be done with an simple admin module and the usage of `sw-system-config`, too.

## Conclusion

We used this pattern last year on the Shopware Downtown project and it was a neat way to extend Shopware 6. It made the deployment a lot easier for us, as we didn't have to think about plugin installation or update stuff. 
The new devs didn't have to install or activate plugins. Our own migrations did run together with the setup process. 
The code of the project is public, make your own opinon.

- Integration of the bundles: https://github.com/shopwareDowntown/downtown/blob/master/src/Kernel.php#L55-L58 (Can be done in `config/bundles.php`, too. Was done there to avoid conflicts when updating templates)
- A example bundle with merchants https://github.com/shopwareDowntown/downtown/tree/master/src/Merchants
