---
title: General exceptions
aliases:
    - /docs/next/general-errors
---

# PageController can't be requested via XmlHttpRequest

By default Ajax is disabled on all Storefront controllers. You can enable it by adding an new defaults `XmlHttpRequest`
Example:
```
/**
 * @Route("/widgets/test", name="widgets.test", options={"seo"="false"}, methods={"GET"}, defaults={"XmlHttpRequest"=true})
 */
```
