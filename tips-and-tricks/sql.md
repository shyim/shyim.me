# SQL

## Product names are escaped after Shop Migration

SwagMigration does escape all product names. It can be solved with a simple SQL

```sql
UPDATE s_articles SET name = REPLACE(name, "&amp;", "&");
UPDATE s_articles SET name = REPLACE(name, "&lt;", "<");
UPDATE s_articles SET name = REPLACE(name, "&gt;", ">");
```

