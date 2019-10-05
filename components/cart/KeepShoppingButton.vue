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
        }),

        productSubTypes() {
            return this.getProductSubTypes(true);
        }
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
                        v-for="(obj, type) in productSubTypes"
                        :key="obj.id"
                        :to="{ name: 'productSubType', params: { productSubType: obj.slug } }"
                        tag="a">{{ $t(type) }}</nuxt-link>

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
