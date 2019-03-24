# Config.php Tweaks

## Disable Template Cache

Add following code in your config.php to disable the Template Cache

```php
'template' => [
    'forceCompile' => true,
],
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
