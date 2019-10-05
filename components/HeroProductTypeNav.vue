<script>
import product_mixin from '@/mixins/product_mixin';

const globalTypes = process.env.GLOBAL_TYPES;


export default {
    mixins: [
        product_mixin
    ],

    computed: {
        productSubTypes() {
            return this.getProductSubTypes(true);
        }
    }
}
</script>


<template>
    <div>
        <div class="hero-prod-types">
            <nuxt-link
                v-for="(obj, type) in productSubTypes"
                :key="obj.id"
                :to="{ name: 'productSubType', params: { productSubType: obj.slug } }"
                tag="el-button"
                class="is-round"
                active-class="el-button--success">{{ $t(type) }}</nuxt-link>

            <nuxt-link
                :to="{ name: 'index' }"
                tag="el-button"
                class="is-round"
                active-class="el-button--success"
                :exact="true">{{ $t('All') }}</nuxt-link>
        </div>
    </div>
</template>


<style lang="scss" scoped>
    .hero-prod-types {
        width: 100vw;
        box-sizing: border-box;
        background: #fff;
        padding: 15px 30px;
        font-size: 14px;
        position: relative;
        text-align: center;
        overflow: hidden;
        white-space: nowrap;
    }
</style>
