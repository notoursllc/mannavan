<script>
    export default {
        props: ['title']
    }
</script>


<template>
    <section class="page-header">
        <div class="container">
            <div class="columns">
                <div class="column">
                    <h2 class="is-3 inline">{{ title }}</h2>
                    <slot></slot>
                </div>
            </div>
        </div>
    </section>
</template>


<style lang="scss">
    @import "../assets/css/components/_variables.scss";

    .page-header {
        padding: 10px 0;

        h2 {
            font-size: 24px;
            font-weight: 400;
        }
    }
</style>