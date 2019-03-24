# Config.php Tweaks

## Disable Template Cache

Add following code in your config.php to disable the Template Cache

```php
'template' => [
    'forceCompile' => true,
],
```

## Article names are escaped after Shop Migration

SwagMigration does escape all product anmes. It can be solved with a simple SQL

```sql
UPDATE s_articles SET name = REPLACE(name, "&amp;", "&");
UPDATE s_articles SET name = REPLACE(name, "&lt;", "<");
UPDATE s_articles SET name = REPLACE(name, "&gt;", ">");
```

## Configure SMTP in config.php

```php
'mail' => [
    'type'     => 'smtp', // Possible values: 'mail', 'smtp', 'file'
    'host'     => 'localhost',
    'port'     => 587,
    'ssl'      => 'tls', // Possible values: '', 'tls', 'ssl'
    'auth'     => 'login',  // Possible values: 'plain', 'login', 'crammd5'
    'username' => 'me@localhost',
    'password' => 'mypassword'
],
```

## Use composer with the release zip version

The dev autoload files are not existing in release zip. So you have to execute all commands with --no-dev

## How is the shipping calculation when the user is not logged in?

Shopware uses here the country with the lowest position to calculate the shipping costs

