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
            brandName: this.uppercase ? this.$store.state.ui.brandName.toUpperCase() : this.$store.state.ui.brandName
        }
    }
}
</script>

<template>
    <span>{{ brandName }}<sup>&reg;</sup></span>
</template>
