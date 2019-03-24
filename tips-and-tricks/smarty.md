# Smarty

## Assign the snippet value to a variable

```markup
{s name="NameFromSnippet" assign="tplVariable"}Default Value{/s}
{$tplVariable|replace:'Test':'Lol'}
```

## Read plugin config values

```text
{config name="myVar" namespace="MYPLUGINNAME"}
```

## Check existence of Template file

```text
{if "frontend/foo.tpl"|template_exists}
```

