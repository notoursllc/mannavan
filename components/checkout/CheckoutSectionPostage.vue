<script>
import Vue from 'vue'
import { mapGetters } from 'vuex'
import { Radio } from 'element-ui'

Vue.use(Radio);

export default {
    data: function() {
        return {
            shipping_type: "1" //TODO
        }
    },

    computed: {
        ...mapGetters({
            shoppingCart: 'shoppingcart/cart'
        }),
    },
}
</script>

<template>
    <div class="g-spec-locked">
        <div class="g-spec-label colorGreen fs20">{{ $t('Postage') }}</div>
        <div class="g-spec-content">
            <table class="widthAll">
                <tr>
                    <td><el-radio v-model="shipping_type" label="1">{{ $t('Standard') }}</el-radio></td>
                    <td class="tar">
                        {{ $n(shoppingCart.shipping_total, 'currency') }}
                    </td>
                </tr>
            </table>
        </div>
    </div>
</template>
