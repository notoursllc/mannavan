<script>
import Vue from 'vue'
import { Button } from 'element-ui'
import product_mixin from '@/mixins/product_mixin';

const globalTypes = process.env.GLOBAL_TYPES;


Vue.use(Button);

export default {
    mixins: [
        product_mixin
    ]
}
</script>


<template>
    <div>
        <div class="hero-prod-types">
            <nuxt-link
                :to="{ name: 'index' }"
                tag="el-button"
                class="is-round"
                active-class="el-button--success"
                :exact="true">{{ $t('All') }}</nuxt-link>

            <nuxt-link
                v-for="(index, type) in getProductSubTypes()"
                :key="index"
                :to="{ name: 'type-name', params: { name: getUrlPathForProductSubType(type) } }"
                tag="el-button"
                class="is-round"
                active-class="el-button--success">{{ $tc(type, 2) }}</nuxt-link>
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
