# Fixed Bugs

## Document Generation throws an Exception with deactivated Smarty Security

This bug has been fixed with 5.3.4. An update will resolve the issue

## Cronjobs created with cronjob.xml does not have an end Date

Until Shopware 5.3.5,  cronjobs created using xml does not have an end Date. Cronjobs without end date cannot be executed.

A Solution could the Cronjob by own

```php
<?php

namespace ShyimCron;

use Shopware\Components\Plugin;
use Shopware\Components\Plugin\Context\InstallContext;
use Shopware\Components\Plugin\Context\UninstallContext;


class ShyimCron extends Plugin {
    
    public static function getSubscribedEvents()
    {
        return [
            'Shopware_CronJob_MyCoolCron' => 'MyCoolCronRun'
        ];
    }
    
    public function install(InstallContext $context)
    {
        $this->addCron();
    }
    
    public function uninstall(UninstallContext $context)
    {
        $this->removeCron();
    }
    
    public function addCron()
    {
        $connection = $this->container->get('dbal_connection');
        $connection->insert(
            's_crontab',
            [
                'name'             => 'MyCoolCron',
                'action'           => 'MyCoolCron',
                'next'             => new \DateTime(),
                'start'            => null,
                '`interval`'       => '100',
                'active'           => 1,
                'end'              => new \DateTime(),
                'pluginID'         => null
            ],
            [
                'next' => 'datetime',
                'end'  => 'datetime',
            ]
        );
    }
    
    public function removeCron()
    {
        $this->container->get('dbal_connection')->executeQuery('DELETE FROM s_crontab WHERE `name` = ?', [
            'MyCoolCron'
        ]);
    }
    
    public function MyCoolCronRun(\Shopware_Components_Cron_CronJob $job)
    {
        return 'Yes its running!';
    }
}
```

## 

