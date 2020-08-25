---
id: shopware-6-dont-like-custom-fields
title: Why I don't like Custom fields?
author: Shyim
author_title: Developer @ Shopware
author_url: https://github.com/shyim
author_image_url: https://avatars3.githubusercontent.com/u/6224096?s=460&u=18be3a2d46f07dd42fc2b6dee9b4b9b68bca28d2&v=4
tags: [shopware]
---

Normally every project needs custom values saved on products or another entities. Shopware does offer by default Custom fields. It looks nice, but it can produce very fast issues.

Before we start: **This is my opinion**

Let's start with a simple Pro Contra list.

### Pro

* Can be easily created in the Administration / Code.
* Can define field types, labels etc and Shopware does the rendering in Administration for me
* Loaded by default on the entities
* Custom Fields are schema less. You can save anything in it

### Contra

* Custom Fields are schema less. You can save anything in it
* They are saved as JSON
   * Hard to modify using SQL
   * Cannot have associations
   * Slow on SQL Filtering, Aggregation
* Support between MySQL and MariaDB differs and Performance
* Cannot have Flags. All fields are public using Sales-Channel / Store-API
* Cause it does not have a Schema they will be indexed as `dynamic` in Elasticsearch. This brings lot of other problems
* You don't have a control is it translatable or not
* Fields values cannot be easy deleted on all entities. You need to modify each entry.

The most problems are introduced cause of the usage of an JSON field. In SQL the accessed fields needs to be extracted. This takes some time of course. 
On a bigger shop using many products this could leak to performance issues in the listing when it's used inside a product filter. 

## But when search / filtering / aggregation is slow. Can I not just use Elasticsearch?

You can. **But**...

We learned before they don't have a Schema. So we have to index the custom Fields with **dynamic** enabled. With this option Elasticsearch tries to find the best suitable data type for your field. When we have multiple data types in the same field across entries the indexing will fail. Cause Elasticsearch decided to use first best suitable data type and rejects values does not match it.

## But when it's okay to use it?

* When you don't need to Filter / Aggregate / Search on it
* When it's okay to be exposed in the Public API (Sales Channel / Store API)

## But Entity Extensions are so annoying to create

The generation of the entities can be annoying. But I am working since some time on a generator. Give it a try. https://github.com/FriendsOfShopware/FroshDevelopmentHelper
