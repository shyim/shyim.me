---
title: Event Cheat-Sheet
---

##  Shopware\_Modules\_Order\_SendMail\_FilterVariables

Manipulate variables of sOrder mail

## Shopware\_Modules\_Admin\_CheckUser\_Successful

After checked is the user loggedin

## Enlight\_Controller\_Action\_MODULE\_CONTROLLER\_ACTION

Overwrite or add new actions to a controller. In your subscriber you have to return true; at the end

## Enlight\_Bootstrap\_AfterInitResource\_DINAME

After a service has been loaded

## Enlight\_Bootstrap\_InitResource\_DINAME

Before a service has been loaded or register your own di

## Enlight\_Components\_Mail\_Send

Before a mail is sent

## Theme\_Inheritance\_Template\_Directories\_Collected

An event to register global template directories

## Enlight\_Controller\_Front\_DispatchLoopShutdown

It's the last event before the response is send

## Enlight\_Controller\_Router\_Route

An event to create custom routing

## Shopware\_Modules\_Basket\_AddArticle\_CheckBasketForArticle

Can be used to manipulate how products are found in basket.

Example allow adding multiple basket position of same product:

```php
public function checkBasket(\Enlight_Event_EventArgs $args)
{
    $qb = $args->get('queryBuilder');
    $qb->andWhere('1=2');
}
```

