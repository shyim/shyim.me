---
id: deprecation-frosh-packages
date: 2021-09-01T00:00:01
title: Shopware packages is live + deprecation of packages.friendsofshopware.com
author: Shyim
author_title: Developer @ Shopware
author_url: https://github.com/shyim
author_image_url: https://avatars3.githubusercontent.com/u/6224096?s=460&u=18be3a2d46f07dd42fc2b6dee9b4b9b68bca28d2&v=4
tags: [shopware, frosh]
---

Today is finally the day when `Shopware packages` is being released. You might ask what is `Shopware packages`, and what does it have to do with packages.friendsofshopware.com?
Good question 🙂

## What is Shopware packages?

Shopware packages is the long-awaited official `Composer package repository` for all Shopware store extensions. But why do we want to use that or care about that?

## What can I expect from Shopware packages?

With composer, we can manage all dependencies in our Shopware setups. We usually use a composer project template which requires Shopware and provides some basic tooling.
When we want now update the Shopware version, we just pick a newer version of Shopware in composer, and we are ready to go. 
That's nice and easy for our Shopware upgrades, but we mostly also use extensions for our shops such as PayPal. 
Typically, we download the ZIP-file from the Store, unpack and upload it to `custom/plugins`. Yes, we all are lazy and this really sounds annoying.
With the new repository, we can treat the extensions as normal composer dependency like just using `composer req store.shopware.com/swagpaypal` like cool guys 😎.
This will automatically get the most recent version compatible to our Shopware version and other requirements set by the extension manufacturer. 
Since the dependencies are built directly into Composer, we can use typical commands like `composer update store.shopware.com/swagpaypal` to update the extension or even update Shopware and all required extensions at once. It's cool, isn't it?

## What are the main benefits over packages.friendsofshopware.com?

- official supported solution by shopware AG
- improved support for wildcard shops
- the tokens are bound to the shop and the user and not the actual credentials
- more future-proof due to new dedicated internal APIs

## How do we set this up?

Log into [Shopware account](https://account.shopware.com) and go to the shop and click on an extension we want to install. At the top we find a new button `Install via composer`.

![Shopware account](https://i.imgur.com/K95hXNu.png)

![Dialog](https://i.imgur.com/PJg6gsL.png)

After finishing the given instructions in the modal we can start installing multiple extensions. The generated token is bound to our current logged in account and used shop and needs to be generated only once. This token persists until you generate a new one.


## What will happen with FriendsOfShopware Packages?

If you used before FriendsOfShopware Packages, this will look very familiar to you already. The composer package names are still the same. To migrate, only the token needs to be changed, and it's very important to run `composer update` afterwards to update the content of the `composer.lock`-file.

From now on the FriendsOfShopware packages will send deprecation messages to all users on any Composer operation to switch to the new solution. I will shut down FriendsOfShopware Packages at 01.11.2021 in favor of Shopware packages. It was a funny and interesting project for me and I have learned a lot about composer, hosting in Heroku, own K8s cluster and other topics. 

### Forks of FriendsOfShopware Packages have to react, too

There are some companies which host an installation of packages on their own. These installations cannot get an updated store information anymore. An alternative could be [Private packagist](https://packagist.com/) with the mirror capability or any other HTTP cache capable server.
