<script>
import app_mixin from '@/mixins/app_mixin';

export default {
    props: {
        uppercase: {
            type: Boolean,
            default: false,
        }
    },

    mixins: [
        app_mixin
    ],

    data: function() {
        return {
            brandName: this.uppercase ? this.getBrandName().toUpperCase() : this.getBrandName()
        }
    }
}
</script>

<template>
    <span>{{ brandName }}<sup>&reg;</sup></span>
</template>
