<script>
export default {
    name: 'GoToCheckoutButtons',

    components: {
        KeepShoppingButton: () => import('@/components/cart/KeepShoppingButton')
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
        <div class="btn-keep-shopping">
            <keep-shopping-button />
        </div>

        <div class="btn-complete">
            <el-button
                type="primary"
                size="large"
                @click="onCheckoutClick"
                round>{{ $t('Complete Order') }}</el-button>
        </div>
    </div>
</template>


<style lang="scss">
    @import "~assets/css/components/_variables.scss";

    .btn-keep-shopping {
        margin-right: 20px;
    }

    .btn-keep-shopping,
    .btn-complete {
        display: inline-block;
    }

    @media #{$small-and-down} {
        .btn-keep-shopping {
            margin-right: 0;
        }

        .btn-keep-shopping,
        .btn-complete {
            display: block;
        }
    }
</style>
