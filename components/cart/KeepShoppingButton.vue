<script>
import { mapGetters } from 'vuex';
import product_mixin from '@/mixins/product_mixin'

export default {
    mixins: [
        product_mixin
    ],

    computed: {
        ...mapGetters({
            numCartItems: 'shoppingcart/numItems'
        })
    },
}
</script>

<template>
    <div class="inlineBlock">
        <el-popover
            ref="keepshoppingpopover"
            placement="bottom"
            width="150"
            trigger="click">
           <div class="fs14 tac">
               <div>{{ $t('Shop for') }}:</div>
               <div class="tac pts keepShoppingLinks">
                    <nuxt-link
                        v-for="(index, type) in getProductSubTypes()"
                        :key="index"
                        :to="{ name: 'productSubType', params: { productSubType: getUrlPathForProductSubType(type) } }"
                        tag="a">{{ $tc(type, 2) }}</nuxt-link>

                    <nuxt-link
                        :to="{ name: 'index' }"
                        tag="a">{{ $t('All products') }}</nuxt-link>
               </div>
           </div>
        </el-popover>

        <el-button
            size="large"
            v-popover:keepshoppingpopover
            round>{{ numCartItems ? $t('Order More') : $t('Continue Shopping') }}</el-button>
    </div>
</template>

<style lang="scss">
    .keepShoppingLinks {
        a {
            display: block;
            margin: 5px 0 10px 0;
        }
    }
</style>
