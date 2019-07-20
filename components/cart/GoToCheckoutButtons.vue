<script>
import KeepShoppingButton from '@/components/cart/KeepShoppingButton'

export default {
    name: 'GoToCheckoutButtons',

    components: {
        KeepShoppingButton
    },

    methods: {
        onCheckoutClick() {
            this.$emit('click')
            this.$router.push({ name: 'cart-checkout' });
        }
    }
}
</script>


<template>
    <div class="inlineBlock">
        <div class="btn-container">
            <el-button
                type="primary"
                size="large"
                @click="onCheckoutClick"
                round>{{ $t('PROCEED TO CHECKOUT') }}</el-button>
        </div>

        <div class="or-container colorGray">{{ $t('OR') }}</div>

        <div class="btn-container">
            <keep-shopping-button />
        </div>
    </div>
</template>


<style lang="scss">
    @import "~assets/css/components/_variables.scss";

    .btn-container,
    .or-container {
        display: inline-block;
    }

    .or-container {
        padding: 0 20px;
    }


    @media #{$small-and-down} {
        .btn-container,
        .or-container {
            display: block;
        }

        .or-container {
            padding: 10px 0;
        }
    }
</style>
