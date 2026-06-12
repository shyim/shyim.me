---
id: app-privacy-policy
title: Privacy Policy — Shopware Shop Manager
author: Shyim
author_title: Principal Software Engineer @ Shopware
author_url: https://github.com/shyim
author_image_url: https://avatars3.githubusercontent.com/u/6224096?s=460&u=18be3a2d46f07dd42fc2b6dee9b4b9b68bca28d2&v=4
tags: []
---

_Last updated: June 12, 2026_

Shopware Shop Manager ("the app") is an Android companion app that lets merchants
manage their own Shopware 6 shop. It is operated by Soner Sayakci (s.sayakci@gmail.com).

## The short version

The app has **no backend, no analytics and no tracking**. It communicates exclusively
with the Shopware Admin API of the shop(s) **you** connect. Everything the app stores,
it stores on your device.

## What the app stores on your device

- **Shop connection settings**: the shop URL, display name, color tag, daily revenue
  target, low-stock threshold, content language and the access scopes of your login.
- **Session credential**: when you sign in, your admin password is used once to obtain
  an OAuth session from *your* shop and is **never stored**. The app keeps only a
  revocable, rotating refresh token, encrypted with a hardware-backed key
  (Android Keystore, AES-GCM). You can revoke it at any time by changing your
  password or deleting the user session in your shop's administration.
- **Shop data cache**: a small overview snapshot per shop (revenue figures, order
  counts, recent orders, low-stock products, pending review count) so the dashboard
  works offline. It is refreshed from your shop and can be deleted by removing the
  shop or clearing the app's data.
- Generated documents (PDF invoices/delivery notes) and camera captures are staged in
  the app's **cache** directory only for viewing/sharing/uploading.

Credentials and cached shop data are **excluded from Android cloud backup and
device-to-device transfer**.

## What the app transmits — and to whom

The app sends requests only to the base URL of the shop(s) you connect (your own
server or your hosting provider's). It transmits your login once to obtain a session
and afterwards uses the session token. No data is sent to the app developer or to any
third party. There are no third-party SDKs, no advertising and no analytics.

## Permissions

- **Internet** — to reach your shop's Admin API.
- **Notifications** (optional) — local notifications about new orders/reviews created
  by the app's background sync. No push service is involved.
- **Camera** (via the system camera app) — only when you take a product photo; the
  image goes directly to your shop's media library and the local copy is deleted.

## Data deletion

Remove a shop in the app (Manage shops → shop → Remove) or clear the app's storage in
Android settings — both delete all locally stored data for that shop. Server-side,
your shop remains untouched; revoke the app's session in your shop administration if
desired.

## Children

The app is a business tool and not directed at children.

## Changes & contact

Changes to this policy will be published at this URL. Questions:
s.sayakci@gmail.com.
