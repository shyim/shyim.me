---
id: thumbnails-and-php
date: 2021-07-14T00:15:59
title: Optimization of Thumbnails in PHP
author: Shyim
author_title: Principal Software Engineer @ Shopware
author_url: https://github.com/shyim
author_image_url: https://avatars3.githubusercontent.com/u/6224096?s=460&u=18be3a2d46f07dd42fc2b6dee9b4b9b68bca28d2&v=4
tags: [shopware]
draft: false
---

Every shop owner wants a fast online shop with the best pagespeed results. The images have a huge impact on these stats.
But can we achieve better results with only PHP?

## Image generation with PHP

In PHP there are two ways how images can be generated: using the `gd`, or the `ImageMagick` extension. Both extensions are not optimized to create very small images and they are quite slow. They also lack support for newer image formats like avif (PHP 8.1 will have avif in `gd`).
The PHP community has build packages (like [spatie/image-optimizer](https://github.com/spatie/image-optimizer)) to optimize an image after it has been uploaded by executing several optimziers in the CLI. This approach requires to have functions like `exec`, `system` or `proc_open` available, which are disabled by default on some shared hosters. Also, the optimizers need to be installed on the host system. But there are new technologies like `ffi` or `wasm` available in PHP.

### Image generation using FFI / WASM on server-side

Instead of requiring optimizers installed on the server system, we could bring it with the code, isolated as WASM or as a shared library with FFI.
These approaches are both very fast, but unfortunately, both technologies are not widely used in the PHP ecosystem.

## Pre optimize the images before uploading on client side

Since the WASM support has landed in the browsers, it is also possible to optimize the image before sending it to the servers. This approach added Discourse to their platform to [reduce the file size of uploaded images](https://blog.discourse.org/2021/07/faster-user-uploads-on-discourse-with-rust-webassembly-and-mozjpeg/). This will work good in a situation where the Administration only manages the entire shop. Still, most users are using the API or Import extensions to import the products with the images. There will be client-side optimization not help as the optimization happens inside the browser.

## Letting a external service do our image processing

When we can't create the best optimized image with just plain PHP, why not let our image processing work be done by some external service? One of my favourite image processing systems is [imgproxy](https://imgproxy.net/). It can be even selfhosted, if necessary. We save the original images on the server or an external storage like S3 and just link it to our image processing server with some parameters, like width, height etc. The servers are doing the rest for us with the best possible image results.
Such servers also offer better image formats if the browser supports it. This means, when the browser requests a `jpg` image, but the browser supports also `webp`. The server can respond to the `.jpg` file extension a `webp` image without even providing multiple links or using a [`picture` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/picture#the_type_attribute).
**It's important** that your used processing service does cache your requests or you will have to setup a own CDN before it.
Let's do a quick `pros` and `cons` list of the usage of such software:

**Pros:**

- Best possible optimized image
- Serving better image formats as the original image (jpg => webp) without doing anything special
- Smaller backups of the shop, as we don't have to save thumbnails
    - Can be even smaller when the original images are saved on a cloud bucket
- Can be self-hosted, if necessary
- We can be flexible in our template and use the dimension we want instead blowing up your storage
- Improves the global access times with some cloud image processing 
    - This mostly requires that the original image are also saved on their network

**Cons:**

- When the image processing service is offline, images in our shop cannot be loaded
- When the original images are saved in a cloud bucket and we don't make backups, our deleted file will be gone
- The choosen service needs caching so we should setup a cdn before your processing service

## How do we integrate such external service in our shopware shops?

Unfortunately, Shopware does not support the usage of an external service by default. **But** the guys from FriendsOfShopware has covered us with the [Thumbnail processor plugin](https://store.shopware.com/frosh69611263569f/thumbnailprocessor-mit-lazy-loading.html). This extension is free and can be installed from Shopware store or from Github. Special thanks there to [tinect](https://github.com/tinect) the author of the extension.

What does the plugin for us?

- Disabling the Shopware own thumbnail generation
- Allows us to define a URL template how the storefront url needs to be generated
    - A template looks like: `https://mycdn.shopdomain.com/{mediaPath}?width={width}&height={height}`
- Adds lazy image loading to the storefront
- Takes automatically care of the sizes attribute for responsive images

With the usage of an cloud-bucket like s3 we can even move the original files from disk to the bucket. For this refer to the [Shopware documentation](https://developer.shopware.com/docs/guides/hosting/infrastructure/filesystem) on how to accomplish that.

## Some image processing providers list

- [BunnyCDN](https://bunny.net/)
    - Cheap with 9,5$/m per zone for image processing, but fast and including webp. We need to enable `Bunny Optimizer` and `Manipulation Engine`. Additionally, we can use really cheap storage and global traffic.
- [imgproxy](https://imgproxy.net)
    - Opensource, can be selfhosted, fast and including webp and avif. But needs a caching in front of it, f.e. a CDN.
- [Images.weserv.nl](https://images.weserv.nl)
    - Free, slow and not including webp
- [cloudimage](https://www.cloudimage.io/en/home)
    - Has free plan, fast and including webp
- [Cloudflare](https://developers.cloudflare.com/images/)
    - Only available at Business plan

## Conclusion

Thumbnails are essential in modern web development. But do we really want wasting time for setting up PHP with libavif, installing optimizers on the host to optimize later after upload the images and still getting unsuitable images for our users and pagespeed? I am sure there are better tasks to do as these. The external services are even very cheap like with Bunnycdn for 9,5$/m. Give it a try and keep focusing on the things that really needs your power.
