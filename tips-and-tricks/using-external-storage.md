---
description: This needs at least Shopware 6.3.0.0
---

# Using external Storage

Example Configuration for S3

```text
shopware:
    filesystem:
        private:
            type: "amazon-s3"
            config:
                bucket: "documents"
                endpoint: "http://minio:9000"
                use_path_style_endpoint: true
                region: 'local'
                credentials:
                    key: AKIAIOSFODNN7EXAMPLE
                    secret: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
                options:
                    visibility: "private"
        public:
            type: "amazon-s3"
            url: 'http://s3.localhost/media'
            config:
                bucket: "media"
                endpoint: "http://minio:9000"
                use_path_style_endpoint: true
                region: 'local'
                credentials:
                    key: AKIAIOSFODNN7EXAMPLE
                    secret: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
                options:
                    visibility: "public"
        theme:
            type: "amazon-s3"
            url: 'http://s3.localhost/theme'
            config:
                bucket: "theme"
                endpoint: "http://minio:9000"
                use_path_style_endpoint: true
                region: 'local'
                credentials:
                    key: AKIAIOSFODNN7EXAMPLE
                    secret: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
                options:
                    visibility: "public"
        asset:
            type: "amazon-s3"
            url: 'http://s3.localhost/asset'
            config:
                bucket: "asset"
                endpoint: "http://minio:9000"
                use_path_style_endpoint: true
                region: 'local'
                credentials:
                    key: AKIAIOSFODNN7EXAMPLE
                    secret: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
                options:
                    visibility: "public"
        sitemap:
            type: "amazon-s3"
            url: 'http://s3.localhost/sitemap'
            config:
                bucket: "sitemap"
                endpoint: "http://minio:9000"
                use_path_style_endpoint: true
                region: 'local'
                credentials:
                    key: AKIAIOSFODNN7EXAMPLE
                    secret: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
                options:
                    visibility: "public"

```

