# Plugins

## Add a Smarty Plugin folder with a Plugin

It can be solved with a simple CompilerPass in your Plugin

{% code-tabs %}
{% code-tabs-item title="MyPlugin/Components/CompilerPass/AddTemplatePluginDirCompilerPass.php" %}
```php
<?php

namespace MyPlugin\Components\CompilerPass;

use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;

class AddTemplatePluginDirCompilerPass implements CompilerPassInterface
{
    public function process(ContainerBuilder $container)
    {
        $template = $container->getDefinition('template');
        $template->addMethodCall('addPluginsDir', [$container->getParameter('my_plugin.my_parameter_to_folder')]);
    }
}
```
{% endcode-tabs-item %}
{% endcode-tabs %}

{% code-tabs %}
{% code-tabs-item title="MyPlugin.php" %}
```php
<?php

class MyPlugin extends Plugin
{
    public function build(ContainerBuilder $container)
    {
        parent::build($container);
        $container->addCompilerPass(new AddTemplatePluginDirCompilerPass());
    }
}
```
{% endcode-tabs-item %}
{% endcode-tabs %}

## Inject Plugin Configuration

This method loads only configuration from main shop.

```markup
<service id="myplugin.config" class="Shopware\Components\Plugin\CachedConfigReader">
    <factory service="shopware.plugin.cached_config_reader" method="getByPluginName"/>
    <argument type="string">MyPlugin</argument>
</service>
```

Since Shopware 5.5.3 it's possible to fetch also the right config translation

```markup
<service id="myplugin.config" class="Shopware\Components\Plugin\CachedConfigReader">
    <factory service="shopware.plugin.cached_config_reader" method="getByPluginName"/>
    <argument type="string">MyPlugin</argument>
    <argument type="expression">container.initialized('shop') ? service('shop') : null</argument>
</service>
```

## Force loading of plugins in old system

Sometimes you want use Components of Plugins which are writing in old plugin system and the autoloading does not work. This problem occurs cause the plugins are lazy and constructed only if needed. You can force construction with the following code

```php
Shopware()->Plugins()->Namespace()->PluginName()
// e.g Shopware()->Plugins()->Backend()->HttpCache()
```

## Disable http-cache in Subscriber/Controller

With setting a Cache-Control header you can disable for the current request the http-cache.

```php
$this->Response()->setHeader('Cache-Control', 'private', true);
```

## Remove theme variables from Json

Remove the template

```php
$this->View()->setTemplate();
```

## PHP static store for a config.xml combobox

Create a normal Combobox in config.php. We will set the store values in install method of the plugin

```php
/** @var Element $element */
$element = $this->container->get('models')->getRepository(Element::class)->findOneBy([
    'name' => 'FIELDNAMEFROMCONFIG'
]);

$element->setOptions([
    'store' => [
                    [0, 'No'],
                    [1, 'Yes']
                ]
]);

$this->container->get('models')->persist($element);
$this->container->get('models')->flush();
```

