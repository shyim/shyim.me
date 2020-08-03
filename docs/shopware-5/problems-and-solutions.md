---
title: Problems and Solutions
---

## Sending a BCC Mail does not work?

Zend-Mailer does not Support BCC on SMTP transport.[ It drops the Bcc](https://github.com/shopware/shopware/blob/v5.3.4/engine/Library/Zend/Mail/Transport/Smtp.php#L233) header before sending the mail.

A solution could be to clone the mail and replace the receiver

## Plugin-Manager still shows Trial-Version

Open Plugin-Manager and press the Button "Synchronize licenses". When the button does not exist in your used Version:

* Login in your Shopware Account in Plugin Manager
* Clear all cookies of the Page
* Login in your Backend
* Licenses should be now synchronized in Background

## Smarty Plugins missing on Finish Page

Can be only fixed with an Update to Shopware 5.4.0

## Forms are without fields

The Security Plugin "SwagSecurityHotFix201701" drops in newer version all fields. It can be uninstalled and removed from System

## Failed to parse time string \(NULL\) at position 0 in attributes

This issue happens on MariaDB Installations. You should switch to MySQL or update to the newest Shopware version.

## Infinite Scrolling does not work anymore

Maybe you have a empty character or line in your config.php at &lt;?php tag

