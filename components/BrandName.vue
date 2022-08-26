<script>
export default {
    props: {
        uppercase: {
            type: Boolean,
            default: false
        }
    },

    computed: {
        brandName() {
            const name = this.$store.state.ui.brandName || '';
            return this.uppercase ? name.toUpperCase() : name;
        }
    }
}
</script>

<template>
    <span>{{ brandName }}<sup>&reg;</sup></span>
</template>
