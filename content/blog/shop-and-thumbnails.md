---
id: shopware-and-thumbnails
date: 2021-07-05T23:15:59
title: Thumbnails + Shopware + PHP = 🙉
author: Shyim
author_title: Developer @ Shopware
author_url: https://github.com/shyim
author_image_url: https://avatars3.githubusercontent.com/u/6224096?s=460&u=18be3a2d46f07dd42fc2b6dee9b4b9b68bca28d2&v=4
tags: [shopware]
---

All shop owners want a fast online shop with the best pagespeed results. The images in the shop are making a big difference in this stats.
But can we archive this with just PHP?

## Image generation with PHP

In PHP we have two ways how we can generate images once with the `gd` extension or with `imagemagic`. Both of this extensions are not optimized to create very small images and they are slower. Also they lack on support on newer image formats like avif (PHP 8.1 will have avif in `gd`).
The PHP Community has build packages like [spatie/image-optimizer](https://github.com/spatie/image-optimizer) to optimize the image after wards by executing serval optimziers in the cli. This approach requires to have functions like `exec`, `system` or `proc_open` available, which are disabled by default on some shared hosters and the optimizers installed in the host system. But there are new technologics like `ffi` or `wasm` in php.

## Image generation using FFI / WASM

Instead requiring optimizers installed on the system, we could bring it isolated as WASM or as shared library with FFI.
This both approaches could be very fast, but unfornuately both technologics are not widespread in the PHP ecosystem.

## Letting a external service do your image processing

When we can't create the best optimized image with just plain PHP, why not letting our image processing work done on some external service. One of my favourite image processing systems is [imgproxy](https://imgproxy.net/). It can be even selfhosted, if wanted. We save the original images on the server or an external storage like s3 and just link with it to our image processing server with some parameters like width, height etc. The server's are doing the rest for us with the best possible image.
Such servers are also offering to provide better image formats when the browser supports it. Like the browser is requesting a `jpg` image, and the browser supports also `webp`. The server will respond to the `.jpg` file extension a `webp` image without even providing multiple links or using a `picture` element.
**It's important** that your used processing service does cache your requests or you will have to setup a own cdn before it.
Let's do a quick `pro` and `contra` list of the usage of such software:

**Pro:**

- Best possible optimized image
- Serving better image formats as the original image (jpg => webp) without doing anything special
- Smaller backups as we don't have to save thumbnails
    - Can be even smaller when the original images are saved on a cloud bucket
- Can be self-hosted, if needed
- Be flexible in your template and use the dimension you want instead blowing up your storage
- Improve global your access times with some cloud image processing 
    - This mostly requires that the original image are also saved on their network

**Contra:**

- When the image processing service is offline, we don't have any images in our shop anymore
- When the original images are saved in a cloud bucket and you don't make backups. Your deleted file will be gone
- The choosen service needs caching or you should setup a cdn before your processing service.

## How do I integrate such external service in my shopware shop?

Shopware unfortunately does not support the usage of an external service by default. **But** the guys from FriendsOfShopware has covered you with the [Thumbnail processor plugin](https://store.shopware.com/frosh69611263569f/thumbnailprocessor-mit-lazy-loading.html). This extension is free and can be installed from Shopware store or from Github. Special thanks there to [tinecet](https://github.com/tinect) the author of the extension.

What does the plugin for you:

- Disabling the Shopware own thumbnail generation
- Allows you to define a URL template how the storefront url needs to be generated
    - A template looks like: `https://images.weserv.nl/?url={mediaUrl}/{mediaPath}&w={width}&h={height}`
- Adds lazy image loading to the storefront

With the usage of an cloud-bucket like s3 you can even move the original files from your disk to the bucket. For this referer to the [Shopware documentation](https://developer.shopware.com/docs/guides/hosting/infrastructure/filesystem) how to accomplish that.

## Some image processing providers list

- [BunnyCDN](https://bunny.net/)
    - not cheap with 9,5$/m per zone, but fast and including webp. You need to enable `Bunny Optimizer` and `Manipulation Engine`
- [imgproxy](https://imgproxy.net)
    - Opensource, can be selfhosted, fast and including webp and avif
- [Images.weserv.nl](https://images.weserv.nl)
    - Free, slow and not including webp
- [cloudimage](https://www.cloudimage.io/en/home)
    - Has free plan, fast and including webp
- [Cloudflare](https://developers.cloudflare.com/images/)
    - Only available at Business plan

## Conclusion

Thumbnails are essential in modern web development. But do we really want to apart with it? Setting up PHP with libavif, installing optimizers on the host to optimize later after upload the images and still getting bad images on pagespeed. I am sure there are better tasks to do as these. The external services are even very cheap like with Bunnycdn for 9,5$. Give it a try and concentrate on other important tasks.  
