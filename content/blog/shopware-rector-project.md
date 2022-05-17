---
id: shopware-rector-project
date: 2022-05-17T15:20:00
title: Shopware Rector Project
author: Shyim
author_title: Developer @ Shopware
author_url: https://github.com/shyim
author_image_url: https://avatars3.githubusercontent.com/u/6224096?s=460&u=18be3a2d46f07dd42fc2b6dee9b4b9b68bca28d2&v=4
tags: [shopware, hackathon]
---

Last week I attended the first Hockethon (combination of Hackathon + Hockenheim) of the [Kellerkinder](https://www.kellerkinder.de/). That event was unique, and I want to thank Kellerkinder for organizing such an event. If you are interested in what we all did on that event, check out the [blog post from Marco](https://marco-steinhaeuser.de/hockethon-may-2022-kellerkinder.html)

I teamed up with [Manuel](https://twitter.com/_MaHoDi_) we made pretty fast progress to enable HTTP caching in the store-API. As the Storefront already has HTTP caching, we used the same logic. But in the end, we had a reference in the Core store-API to the HTTP cache of the storefront bundle. So to do it right, we had to extract the HTTP cache logic of Storefront into the core component.
While migrating code between two components, we thought this task is so brain-dead, so let's use Rector to do this for us.

[Rector](https://github.com/rectorphp/rector) is an opensource tool to instantly upgrades and refactors the PHP code of your application. You configure some rules and modify the matching code. It is similar to the [Structural Replace](https://www.jetbrains.com/help/phpstorm/structural-search-and-replace.html#structural_replace) in PhpStorm but more powerful.

One of our changes that needed to be done on the entire Shopware project

```diff
-use Shopware\Storefront\Framework\Cache\Annotation\HttpCache;
+use Shopware\Core\Framework\Cache\Annotation\HttpCache;

/**
 * @HttpCache()
 * @Route(....)
 */
public function page(?string $id, Request $request, SalesChannelContext $salesChannelContext): Response
```

so we used the following Rector to do it automatically for us

```php
use Rector\Renaming\Rector\Name\RenameClassRector;
use Rector\Config\RectorConfig;

return static function (RectorConfig $rectorConfig): void {
    $rectorConfig->ruleWithConfiguration(RenameClassRector::class, [
        'Shopware\Storefront\Framework\Cache\Annotation\HttpCache' => 'Shopware\Core\Framework\Cache\Annotation\HttpCache',
    ]);
};
```

As we were already finished with our Topic at the hackathon so early, we decided to let us look more into Rector and prepare a set for the next major Shopware 6.5 version.

## Shopware Rector Sets

Sets are a list of Rector rules with configuration which should be executed on your files. Rector has already out of the box many rules and sets and supports as example upgrading to the next Symfony version like so easily:

```php
use Rector\Symfony\Set\SymfonySetList;
use Rector\Config\RectorConfig;

return static function (RectorConfig $rectorConfig): void {
    $rectorConfig->symfonyContainerXml(__DIR__ . '/var/cache/dev/App_KernelDevDebugContainer.xml');

    $rectorConfig->sets([
        SymfonySetList::SYMFONY_54,
        SymfonySetList::SYMFONY_CONSTRUCTOR_INJECTION,
    ]);
};
```

So we intended to build a similar composer package but for Shopware. So we created a new [repository](https://github.com/FriendsOfShopware/shopware-rector) and started creating a set for the next major.

Most of the breaking changes can be already done with the [prebuilt rules](https://github.com/rectorphp/rector/blob/main/docs/rector_rules_overview.md), which can be easily applied like renaming methods in classes

```php
$rectorConfig->ruleWithConfiguration(
        RenameMethodRector::class,
        [
            // class, old method, new method
            new MethodCallRename('Shopware\Core\Framework\Adapter\Twig\EntityTemplateLoader', 'clearInternalCache', 'reset'),
            new MethodCallRename('Shopware\Core\Content\ImportExport\Processing\Mapping\Mapping', 'getDefault', 'getDefaultValue'),
            new MethodCallRename('Shopware\Core\Content\ImportExport\Processing\Mapping\Mapping', 'getMappedDefault', 'getDefaultValue'),
        ],
    );
```

There were no rules for some of the changes, so we wrote [custom rules](https://github.com/FriendsOfShopware/shopware-rector/blob/master/src/Rule/v65/) like migrating the `@LoginRequired` annotation to the `@Route` defaults.

```diff
-@LoginRequired
-@Route("/store-api/product", name="store-api.product.search", methods={"GET", "POST"})
+@Route("/store-api/product", name="store-api.product.search", methods={"GET", "POST"}, defaults={"_loginRequired"=true})
public function myAction()
```

So we can automate most of the stuff of the next major version with Rector and make it possible to upgrade the extensions faster. Faster version adoptions also mean that shop owners could update more quickly, and extension developers can faster decide to drop supporting old versions.

## Your help is needed!

The Shopware Rector set is just in the beginning. Automation of Shopware changes in extensions would save time for all of us. But to save the time of us all, someone needs to maintain the set and add more configuration and rules.

For this reason, it would be nice if we could group up as a Shopware community and move this project forward. As a collaboration of many developers, we can save all time, and we hate all brainless tasks of fixing compatibility issues. 

The repository already contains a few issues, which can be found [here](https://github.com/FriendsOfShopware/shopware-rector/issues). 
There are also other things which can be also done in a Shopware Rector Set like performance stuff like my favorite

```diff
-$criteria = new Criteria();
-$criteria->addFilter(new EqualsAnyFilter('id', $ids));
+$criteria = new Criteria($ids);
```

If you are new to Rector, it is worth looking into the PHP-Parser [docs](https://github.com/nikic/PHP-Parser/tree/master/doc) for learning the AST and looking into the rules itself. If you like, there is also a Rector book available for [purchase](https://leanpub.com/rector-the-power-of-automated-refactoring).

If you have questions, you can also join the [Shopware Slack](https://slack.shopware.com) and ask in the `#friendsofshopware`. I am happy to help there and other people :). 

So let's make together Shopware refactorings much easier!.

[Shopware Rector Repository](https://github.com/FriendsOfShopware/shopware-rector)
