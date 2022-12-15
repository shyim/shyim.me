---
id: how-to-deploy-to-community-store
date: 2019-09-18T00:00:00
title: How to deploy plugin updates automatically to the Shopware Store
author: Shyim
author_title: Principal Software Engineer @ Shopware
author_url: https://github.com/shyim
author_image_url: https://avatars3.githubusercontent.com/u/6224096?s=460&u=18be3a2d46f07dd42fc2b6dee9b4b9b68bca28d2&v=4
tags: [shopware]
---

This blog post describes a small example how to automaticly deploy plugin updates to the Store. I will use the [FroshPerformance](https://github.com/FriendsOfShopware/FroshPerformance) plugin as example.

## Preparation

You will need

* a Plugin which based on the 5.2 Pluginsystem or Shopware 6 Plugin
* a Continuous Integration (i will use Travis as example)
* Credentials for the Shopware Account
* [FroshPluginUploader](https://github.com/FriendsOfShopware/FroshPluginUploader/)

### Prepare the Plugin itself

You will need a `plugin.xml` with filled `title`, `version`, `description`, `compability` and `changelog` for the languages `en` and `de`. All these informations will be picked up automaticly and updated in the Account.

**Optional**

You can define also the plugin description, manual and images in `Resources/store`. Currently supported files are

* [shortLanguage (de, en)].html - for the Description
* [shortLanguage (de, en)]_manual.html - for the Install Manual
* images/*.(png|jpg|jpeg) will be used for Images. First image will be used as preview image.

### Setting up the ci

As first you should define following environment variables as secret in your favourite ci

* ACCOUNT_USER - Username of Shopware Account
* ACCOUNT_PASSWORD - Password of Shopware Account
    

As next we setup a job to build the store ready plugin zip. The Uploader has an command to generate an zip file for your
```
php frosh-plugin-uploader.phar ext:zip:dir [Path to Git Folder]
```

After building an zip, we validate the zip file using the uploader with
```
php frosh-plugin-uploader.phar ext:validate my-plugin.zip
```

This will check all requirements from the Uploader and also from the Plugin Guidelines. which are also describe in [Prepare the Plugin itself](#preparethepluginitself)

After the validating you can sync the **optional** folder `Resources/store` to the account with

```
php frosh-plugin-uploader.phar ext:update FroshPerformance
```

As last step you can upload the zip with

```
php frosh-plugin-uploader.phar ext:upload my-plugin.zip
```

The command will also wait for the automatic code-review and will fail, if its not green. Reuploading same version will replace existing binary.
