<script>
export default {
    props: {
        size: {
            type: Object,
            required: true
        }
    }
}
</script>

<template>
    <div>
        <div class="formRow">
            <label>Size:</label>
            <span>{{ $t(size.size) }}</span>
        </div>

        <div class="formRow">
            <label>Sort order:</label>
            <span>{{ size.sort }}</span>
        </div>

        <div class="formRow">
            <label>Is visible:</label>
            <span>{{ size.is_visible }}</span>
        </div>

        <div class="formRow">
            <label>Cost:</label>
            <span>{{ size.cost }}</span>
        </div>

        <div class="formRow">
            <label>Base price:</label>
            <span>{{ size.base_price }}</span>
        </div>

        <div class="formRow">
            <label>Sale price:</label>
            <span>{{ size.sale_price }}</span>
        </div>

        <div class="formRow">
            <label>Is on sale:</label>
            <span>{{ size.is_on_sale }}</span>
        </div>

        <div class="formRow">
            <label>Inventory count:</label>
            <span>{{ size.inventory_count }}</span>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "~assets/css/components/_formRow.scss";
</style>
