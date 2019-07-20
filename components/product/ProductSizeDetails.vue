<script>
export default {
    props: {
        size: {
            type: Object,
            required: true
        }
    },

    components: {
        FormRow: () => import('@/components/FormRow')
    }
}
</script>

<template>
    <div>
        <form-row>
            <template slot="label">Size:</template>
            <template slot="value">{{ $t(size.size) }}</template>
        </form-row>

        <form-row>
            <template slot="label">Sort order:</template>
            <template slot="value">{{ $t(size.sort) }}</template>
        </form-row>

        <form-row>
            <template slot="label">Is visible:</template>
            <template slot="value">{{ $t(size.is_visible) }}</template>
        </form-row>

        <form-row>
            <template slot="label">Cost:</template>
            <template slot="value">{{ $t(size.cost) }}</template>
        </form-row>

        <form-row>
            <template slot="label">Base price:</template>
            <template slot="value">{{ $t(size.base_price) }}</template>
        </form-row>

        <form-row>
            <template slot="label">Sale price:</template>
            <template slot="value">{{ $t(size.sale_price) }}</template>
        </form-row>

        <form-row>
            <template slot="label">Is on sale:</template>
            <template slot="value">{{ $t(size.is_on_sale) }}</template>
        </form-row>

        <form-row>
            <template slot="label">Inventory count:</template>
            <template slot="value">{{ $t(size.inventory_count) }}</template>
        </form-row>
    </div>
</template>
