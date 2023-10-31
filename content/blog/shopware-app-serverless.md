---
id: shopware-app-serverless
date: 2022-11-27T20:00:00
title: Easy and Cheap Shopware App Hosting using Cloudflare Workers
author: Shyim
author_title: Principal Software Engineer @ Shopware
author_url: https://github.com/shyim
author_image_url: https://avatars3.githubusercontent.com/u/6224096?s=460&u=18be3a2d46f07dd42fc2b6dee9b4b9b68bca28d2&v=4
tags: [shopware, app-system, app, hosting, cloudflare]
---

Shopware Apps are a different way to extend Shopware and can use an optional external App Server to provide additional functionality from your external backend. 
In this Blog post, I want to show you that a Shopware App with a Backend can be easy and also very affordable. 

## The scary backend server

Before the App system, the only way to extend Shopware was to build a plugin. Plugins are like Symfony Bundles with Shopware magic to offer them in Shopware Store.
So we wrote code that runs directly in the customer's web shop, and we can create additional tables to store our information. But we have to make sure that our code works on many setups and PHP versions.
As the plugins can do like anything and this makes sandboxing difficult or build reliable that they don't break each other. That was when the Shopware app system was born to offer a different extension concept.

App system uses app scripting a Twig sandbox to run code or trigger a webhook to your system, and you get API access and call the API again to modify stuff.

Now we write the code on our own backend and the shops call our API routes to execute the code. Huh! I need a server that will serve this traffic and this adds also some responsibilities

- The user expects the Server is fast on the API calls
- The user expects that the service have a good uptime
- We don't know how many users will use it and how many API calls we will get

## Serverless Hosting

When we look closer into what kind of requests the Shops are doing are:

- Register the Shop to our instance
- Maybe webhooks
- Module page rendering
- Action Buttons

But all of these actions have something common they are all stateless. We don't need some kind of session or so. So our backend server can be anything what can respond to an HTTP Request.

This allows us to use any of your favorite serverless platforms, deploy our code and don't think about the scaling or user amounts.

## The Cloudflare Worker example

My most loved serverless platform is Cloudflare Workers it has a great DX and a [great Discord Community](https://discord.com/invite/cloudflaredev) which is really helpful!. 
So I will cover here an app hosting example at Cloudflare Workers and I will come at the end of the blog posts to the pricing.

I built a [Cloudflare Worker Shopware App Example](https://github.com/shyim/shopware-app-example-cloudflare) and will show you how easy and affordable a backend hosting can be.

The template uses TypeScript to serve an API at any Cloudflare Edge Node. Let's look more deep in the template what it does:

First, we have a [package.json](https://github.com/shyim/shopware-app-example-cloudflare/blob/main/package.json) which requires [shopware-app-server-sdk](https://github.com/FriendsOfShopware/app-server-sdk-js) and itty-router. 
The app server sdk contains the all complex stuff for Shopware like registration process, verify requests, preconfigured API client, so you can work directly on your implementation.

And then we have our [wrangler.toml](https://github.com/shyim/shopware-app-example-cloudflare/blob/main/wrangler.toml), this is the configuration file for Cloudflare Workers a specifies an entry script `src/index.ts`. 

Our [index.ts](https://github.com/shyim/shopware-app-example-cloudflare/blob/main/src/index.ts) exports a function named `fetch` which will called from Cloudflare on any Request, and we have to respond with a Response object.

In this case we use a router library `itty-router` to have [some kind of basic routing](https://github.com/shyim/shopware-app-example-cloudflare/blob/main/src/router.ts).

In the router we register our two routes to registration the Shopware shop at our backend:

```javascript
import { authorize, authorizeCallback } from './routes/registration'

const router = Router()

router.get('/authorize', authorize)
router.post('/authorize/callback', authorizeCallback)
```

and our functions to authorize just calls the library methods

```javascript
import { convertRequest, convertResponse, CloudflareShopRepository } from "shopware-app-server-sdk/runtime/cf-worker";
import { WebCryptoHmacSigner } from "shopware-app-server-sdk/component/signer";
import { Env } from "..";

export function getConfiguredApp(env: Env) {
    return new App(
        {
            appName: env.APP_NAME,
            appSecret: env.APP_SECRET,
            authorizeCallbackUrl: `${env.APP_URL}/authorize/callback`
        },
        new CloudflareShopRepository(env.appRegistrationNamespace),
        new WebCryptoHmacSigner()
    )
}

export async function authorize(request: Request, env: Env): Promise<Response> {
    const app = getConfiguredApp(env)
    const req = await convertRequest(request);

    return await convertResponse(await app.registration.authorize(req));
}

export async function authorizeCallback(request: Request, env: Env): Promise<Response> {
    const app = getConfiguredApp(env)
    const req = await convertRequest(request);

    return await convertResponse(await app.registration.authorizeCallback(req));
}
```

In the function `getConfiguredApp` we configure the app server SDK for our URL, choose the storage for the credentials by the `Env` which contains all variables set in `wrangler.toml` or in our secrets.

And then we already have a complete app registration flow at Cloudflare.

If we register now a Shop using the example [manifest.xml](https://github.com/shyim/shopware-app-example-cloudflare/blob/main/MyApp/manifest.xml) we can see in Cloudflare KV our registration.

![KV Namespace](https://i.imgur.com/CstQGk6.png)


## React to Webhooks

Let's now react to Webhooks of the Shop by listing to product updates using the `manifest.xml`

```diff
+<webhooks>
+        <webhook name="productWritten" url="https://OUR_URL/webhook/product.written" event="product.written"/>
+</webhooks>
```

now we have to adjust our router to handle that new URL:

```javascript
router.post('/webhook/product.written', onProductWritten)
```

and in our actual callback we resolve the source (find the shop in our database)

```javascript
export async function onProductWritten(request: Request, env: Env) {
    const app = getConfiguredApp(env);
    const convertedRequest = await convertRequest(request);

    const source = await app.contextResolver.fromSource(convertedRequest);

    return new Response('');
}
```

This also verifies under the hood if the signature matches.

From the `source` we can extract our payload.

```javascript
interface ShopwareUpdateRecord {
    entity: string;
    operation: string;
    primaryKey: string;
    updatedFields: string[];
}

const updates = source.payload.data.payload as ShopwareUpdateRecord[];
```

Then we can update the product description as example using the API Client from the SDK in the `source`:

```javascript
for (const update of updates) {
    // Avoid recursion as we update the description
    if (update.updatedFields.includes('description')) {
        continue;
    }

    await source.httpClient.patch(`/product/${update.primaryKey}`, {
        description: 'Hello from my serverless app!'
    });
}
```

In the template is also an [example to render a module page](https://github.com/shyim/shopware-app-example-cloudflare/tree/main/src/routes/module).

The [FroshWebDavApp](https://store.shopware.com/frosh11030048018f/webdav.html) is also opensource at [GitHub](https://github.com/FriendsOfShopware/FroshAppWebDav) and is using Cloudflare Workers in free plan.


## Available features at Cloudflare

- [Cronjobs](https://developers.cloudflare.com/workers/examples/cron-trigger/)
- [Key Value Storage](https://developers.cloudflare.com/workers/runtime-apis/kv/)
- [File Storage](https://developers.cloudflare.com/r2/data-access/workers-api/workers-api-reference/)
- [Cache](https://developers.cloudflare.com/workers/runtime-apis/cache/)
- [SQL (alpha)](https://developers.cloudflare.com/d1/)
- [Durable Objects (very powerful)](https://developers.cloudflare.com/workers/learning/using-durable-objects/)

## Limitations on Cloudflare

There are two plans Bundled and Unbound.

In Bundled you can execute up to 50ms CPU time (free plan 10ms). This does not contain any IO (HTTP calls). In Unbound you can use up to 30s including IO.

You can find the plans [here](https://developers.cloudflare.com/workers/platform/pricing)

## Pricing

In the free tier, you have access to 100k requests a day on your Worker. With a Paid plan (min 5$) you get 10 Million requests a month and each additional million costs you $0.50. Of course, other services costs also like the Key Value storage. See [pricing page](https://developers.cloudflare.com/workers/platform/pricing) for all products.

## Conclusion

A backend of an app server must not be always hosted traditionally using a Web hosting / Server. Due to the simplicity of the request, we can use serverless platforms to create really easy and cheap our app server backend.

I used here in my example Cloudflare because I am the most familiar with it, but there are many similar options with other programming languages like:

- [Deno Deploy](https://deno.com/deploy)
- [Vercel](https://vercel.com/)
- [AWS Lambda](https://aws.amazon.com/lambda/)
- [Google Cloud Functions](https://cloud.google.com/functions)
- [Firebase](https://firebase.google.com/)
- you name it. They are many

Happy serverless programming!
