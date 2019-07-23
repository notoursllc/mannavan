<script>
export default {
    props: {
        uppercase: {
            type: Boolean,
            default: false,
        }
    },

    data: function() {
        return {
            siteName: this.uppercase ? this.$store.state.ui.siteName.toUpperCase() : this.$store.state.ui.siteName
        }
    }
}
</script>

<template>
    <span>{{ siteName }}</span>
</template>
