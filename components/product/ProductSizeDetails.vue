<script>
    import FormRow from '@/components/FormRow'

    export default {
        props: {
            size: {
                type: Object,
                required: true
            }
        },

        components: {
            FormRow
        }
    }
</script>


<template>
    <div>
        <form-row label="Size:">{{ $t(size.size) }}</form-row>
        <form-row label="Sort order:">{{ $t(size.sort) }}</form-row>
        <form-row label="Is visible:">{{ $t(size.is_visible) }}</form-row>
        <form-row label="Cost:">{{ $t(size.cost) }}</form-row>
        <form-row label="Base price:">{{ $t(size.base_price) }}</form-row>
        <form-row label="Sale price:">{{ $t(size.sale_price) }}</form-row>
        <form-row label="Is on sale:">{{ $t(size.is_on_sale) }}</form-row>
        <form-row label="Inventory count:">{{ $t(size.inventory_count) }}</form-row>
    </div>
</template>