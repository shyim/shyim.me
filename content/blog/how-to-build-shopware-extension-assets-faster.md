---
id: how-to-build-shopware-extension-assets-faster
date: 2022-12-15T21:00:00
title: How to build your Shopware extension assets much faster
author: Shyim
author_title: Principal Software Engineer @ Shopware
author_url: https://github.com/shyim
author_image_url: https://avatars3.githubusercontent.com/u/6224096?s=460&u=18be3a2d46f07dd42fc2b6dee9b4b9b68bca28d2&v=4
tags: [shopware]
---

When you deliver your Shopware extension to a Shop owner, your extension must contain in `src/Resources/public` the build assets for the Administration and the Storefront.
We committed in the first plugins in [Frosh](https://github.com/FriendsOfShopware) all assets directly in Git.
But this led to annoying conflicts, or when you merged two pull requests at once, it didn't contain both changes.

So, for this reason, we removed the build files from all Git repositories again and used [shopware-cli](https://sw-cli.fos.gg) to build the files.

[shopware-cli](https://sw-cli.fos.gg) is a helper tool to manage your extensions locally and in your Shopware account or your project. Worth to check it out!

## Optimizing the current setup

So we call now on our cli `shopware-cli extension zip ~/my-extension`. What is now shopware-cli for us is doing:

- Determine using existing js files. Do we need to build Administration and or Storefront?
- Download Shopware (If no env `SHOPWARE_PROJECT_ROOT` exists)
- Install `node_modules` (other people also say the heaviest object in the universe)
- Run webpack

This process can take a while. 
First, what we optimized is including all Shopware files in the Dockerfile and pointing using `SHOPWARE_PROJECT_ROOT` to a Shopware folder, not to download the repo always.

This change saves a little like 10 - 20 seconds, but let's try to optimize the bundling itself.

The Shopware Administration builds by default itself and the extensions. So [I added](https://github.com/shopware/platform/commit/bffa1d01b0bef7b6f792327d40b4603e68bf4662) for this an environment variable `SHOPWARE_ADMIN_BUILD_ONLY_EXTENSIONS` to produce only the extensions.

This change improves the build time from 2 minutes to 10 seconds.

So we went from like 6 minutes to 2 minutes (complete job). But still, I need to install a bunch of node_modules and need the Shopware source itself. So I looked more profoundly at what Webpack does to bundle our extension.

## What the Webpack in Administration does

The Webpack process in the Administration is using since Shopware 6.4.5.0, a Webpack Multi Compiler.
The Multi Compiler itself isolates each entry, like your extension, to its Webpack instance. So when the Admin and your extension load the same file, it will be bundled into both files, and when the Admin changes something, your code does not break.

Additionally, the default Webpack config gives us stuff like:

- Sass compiling
- Typescript
- CSS
- Auto-copy files into our extension public folder

So when our extension is already isolated from the Administration itself, and we use anything from the `Shopware` global object, can we just use a different bundler?

## Combining ESBuild with shopware-cli

[ESBuild](https://esbuild.github.io/) is a fast bundler written in Go, and [shopware-cli](https://github.com/FriendsOfShopware/shopware-cli/) itself is also written in Go. So let's combine these tools to integrate them directly into shopware-cli instead of installing other stuff.

The result is that we can now enable esbuild with a config file `.shopware-extension.yml`

```yaml
build:
    zip:
        assets:
            enable_es_build_for_admin: true
            enable_es_build_for_storefront: true
```

This calls directly ESBuild in Go and copies the result to the location where Shopware expects it. As ESBuild is written in Pure Go, we don't need NodeJS. Only npm if we have a `package.json` in our extension to install additional packages.

So our build went from 2 minutes to 7 seconds. Most time, in this example, it takes composer and npm as the extension uses additional composer packages and npm packages.

![Compile Step](https://i.imgur.com/s4rBzX2.png)

The actual ESBuild took only 617ms. If you are interested how it works in detail, see [the following file](https://github.com/FriendsOfShopware/shopware-cli/blob/main/extension/asset_native.go).

### The differences between Webpack

In the Administration, when you want to add additional npm packages, you usually have to [adjust the webpack config](https://developer.shopware.com/docs/guides/plugins/plugins/plugin-fundamentals/using-npm-dependencies#adding-a-npm-package-to-the-administration-or-the-storefront). This variant of aliasing and forcing a specific folder does currently not work. ESBuild visits all parent's folders and looking into `node_modules`, so you don't need to create an alias for this method.

While in Administration, the build files are isolated. They are in the Storefront, not. [Some files](https://github.com/shopware/platform/blob/93283b9acef3ed1989dcba1565d289abd411d36a/src/Storefront/Resources/app/storefront/webpack.config.js#L251-L254) will always be loaded from the Shopware file itself. 
The idea behind this is to generate the smallest possible file for the Storefront, but in some scenerios this can break as the hashes inside the file of Shopware changes.

As we execute ESBuild inside shopware-cli without sources, we have to build our Storefront JS isolated from the Storefront itself. But there is a rescue with a helper!

### Extracting Shopware Storefront components for Isolated build

Some classes, like the Plugin class, must have for Shopware Storefront development. To have them still accessible inside your extension, we published an npm package [shopware-storefront-sdk](https://github.com/FriendsOfShopware/shopware-storefront-sdk). 

So instead of using regular files from the standard Storefront, we install this npm package to our extension and can still build plugins for the Storefront.

The idea is to provide only the nesscarry files and rely most time on Browser API directly. For example, instead of using [DomAccess helper](https://github.com/shopware/platform/blob/trunk/src/Storefront/Resources/app/storefront/src/helper/dom-access.helper.js), we just use document.querySelector

It also contains a [plugin.override](https://github.com/FriendsOfShopware/shopware-storefront-sdk/blob/main/src/plugin-system/plugin.override.ts) helper to allow multi-override methods of existing Storefront plugins. Basically, it's some kind of decoration of Symfony, so you don't have to extend and re-register it. The extends of the orginal class, adds the original also to your js bundle with Webpack. 

Here is a small code snippet to illustrate what it can do:

```js
class BaseClass {
    public method() {
        return 'base';
    }
}

PluginOverride.overrideClass(BaseClass, {
    method() {
        return this.callParent('method', ...arguments) + '-override';
    }
})

PluginOverride.overrideClass(BaseClass, {
    method() {
        return this.callParent('method', ...arguments) + '-override2';
    }
})

const obj = new BaseClass();
expect(obj.method()).toBe('base-override-override2');
expect(obj.method()).toBe('base-override-override2');

// use override to override a registered class
PluginOverriede.override('CookiePermission', {
   ....
})
```


### Bonus Tip: ESBuild based Administration Watcher

The normal Administration Watcher has to compile the Administration and your extension to show you a result. The cli does support the Watching the extension, too, with ESBuild.

As the CLI is independent of Shopware, it doesn't have the JS/CSS files of the Administration. For this reason, we must pass a running Shopware Instance and our path to the plugin.

```bash
> shopware-cli extension admin-watch ~/my-plugin http://localhost
```

While the typical Administration Watcher needs 55 seconds to start, our ESBuild server starts within a second. It works by intercepting some API calls and injecting our Watcher JS additional to the normal Administration JS.

**HINT:** The target URL can also be a live shop so that you can develop/debug your extension code against the API and all other plugins.

When you change a JS file, the Administration reloads, but on SCSS changes, the CSS gets replaced without reloading. 


### Conclusion

We went from 6 Minutes of building to 7 seconds using Isolated complete builds with ESBuild.
For me, it was worth investing time in digging into ESBuild to get rid of the Shopware source / node_modules while building my extension in the CI.

I can fully recommend anyone enabling ESBuild for the Administration in the shopware-cli config. It does not change a lot and works mainly without any changes. 

The Storefront is a more significant change and needs the use of the SDK. The SDK is in the beginning. Let's evolve it together and decouple our plugins from the build Shopware version.

Don't hesitate to join the [Shopware Community Slack](https://slack.shopware.com) to the channel `#friendsofshopware` if you need help on this topic!


