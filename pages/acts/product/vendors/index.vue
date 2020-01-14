<script>
export default {
    middleware: [
        'authenticated'
    ],

    layout: 'admin',

    components: {
        MasterTypesManager: () => import('@/components/admin/MasterTypesManager')
    }
}
</script>


<template>
    <master-types-manager object="product_vendor_type" />
</template>
