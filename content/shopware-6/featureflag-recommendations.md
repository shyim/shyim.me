---
title: Usefull feature flag overview
aliases:
- /docs/shopware-6/featureflag-recommendations
---

Here is an small overview of usefull feature flags:

```
# Remove cheapest price from normal ProductEntity saves A lot of resources on seo indexer
FEATURE_NEXT_16151=1

# Scopes seo urls to an specific sales channel and only generates seo urls for accessible entities in that sales channel
FEATURE_NEXT_13410=1

# Configure Elasticsearch using default admin search settings (introduced with 6.4.16.0)
FEATURE_NEXT_22900=1

# Basic performance improvments
# only loading required seo associations in DAL
# not calculation empty cards
# checkout/cart returns 204 instead rendering of content
PERFORMANCE_TWEAKS=1
```
