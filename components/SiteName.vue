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
            siteName: this.uppercase ? this.getSiteName().toUpperCase() : this.getSiteName()
        }
    }
}
</script>

<template>
    <span>{{ siteName }}</span>
</template>
