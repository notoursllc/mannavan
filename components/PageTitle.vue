<script>
export default {
    name: 'PageTitle',

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
    <h1 class="pageTitle"><slot></slot></h1>
</template>

<style scoped>
.pageTitle {
    background-color: #fff;
    font-size: 20px;
    font-weight: 500;
    padding: 7px 20px;
    margin: 0;
}
</style>
