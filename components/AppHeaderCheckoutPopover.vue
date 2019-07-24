<script>
export default {
    data() {
        return {
            popoverVisible: false
        }
    },

    methods: {
        onReturnToCartClick() {
            this.popoverVisible = false;
            return this.$router.push({ name: 'cart-id' });
        }
    }
}
</script>

<template>
    <el-popover
        trigger="manual"
        placement="bottom"
        v-model="popoverVisible">
        <span class="cursorPointer"
            slot="reference"
            @click="popoverVisible = !popoverVisible"><slot></slot></span>
        <div class="tac">
            <div class="fs14">{{ $t('Are you sure you want to return to your Shopping Cart?') }}</div>
            <el-button plain @click="popoverVisible = false" class="mtm">{{ $t('Stay in checkout') }}</el-button>
            <el-button type="primary" @click="onReturnToCartClick" class="mtm">{{ $t('Return to cart') }}</el-button>
        </div>
    </el-popover>
</template>
