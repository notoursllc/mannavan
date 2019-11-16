<script>
export default {
    name: 'SeoPreview',

    props: {
        title: {
            type: String
        },

        description: {
            type: String
        },

        uri: {
            type: String
        }
    },

    data: function() {
        return {
            domainName: process.env.DOMAIN_NAME
        }
    }
}
</script>


<template>
    <div>
        <div class="seo-preview-title">{{ title }}</div>
        <div class="seo-preview-uri">https://{{ domainName }}/p/{{ uri }}
        </div>
        <div class="seo-preview-desc">{{ description }}</div>
    </div>
</template>


<style scoped>
    .seo-preview-title,
    .seo-preview-desc {
        word-break: break-word;
        word-break: break-word;
    }

    .seo-preview-title {
        color: #1a0dab;
        font-size: 20px;
        line-height: 22px;
    }

    .seo-preview-uri {
        color: #006621;
        font-size: 14px;
        line-height: 24px;
    }

    .seo-preview-desc {
        color: #545454;
        font-size: 13px;
    }
</style>
