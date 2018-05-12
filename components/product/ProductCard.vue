<script>
    import Vue from 'vue'
    import product_mixin from '@/mixins/product_mixin'

    export default {
        props: ['product'],

        mixins: [
            product_mixin
        ],

        computed: {
            productPic: function() {
                return this.featuredProductPic(this.product);
            }
        }
    }
</script>


<template>
    <div class="pic-card">
        <img :src="productPic" alt="Image" class="image widthAll">
        <div class="pic-card-content">{{ product.title }}</div>
    </div>
</template>


<style lang="scss">
    @import "~assets/css/components/_variables.scss";

    .pic-card {
        background-color: #fff;
        color: #000;
        transition: .3s;
        overflow: hidden;
        position: relative;
    }

    .pic-card-content {
        position: absolute;
        bottom: 0;
        width: 100%;
        padding: 10px;
        background-color: rgba(0,0,0,0.5);
        color: #fff;
        // height: 40px;
        overflow: hidden;
        font-size: 14px;
        font-weight: bold;
    }
</style>
