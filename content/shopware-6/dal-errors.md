---
title: DAL exceptions
aliases:
    - /docs/next/dal-errors
---

## Expected input to be non empty non associative array.

The entity repositories are built for multiple operations. Example array:

```php
[
  [
    'name' => 'Test'
  ]
]
```

## Recrusion with OneToOne Association

Both sides of the association should not have `autoload` enabled. Otherwise you have an never-ending recrusion
