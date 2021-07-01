<script>
export default {
    props: {
        uppercase: {
            type: Boolean,
            default: false
        }
    },

    computed: {
        siteName() {
            return this.uppercase ? this.$store.state.ui.siteName.toUpperCase() : this.$store.state.ui.siteName;
        }
    }
};
</script>

<template>
    <span>{{ siteName }}</span>
</template>
