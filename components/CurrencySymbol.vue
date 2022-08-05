<script>
export default {
    name: 'CurrencySymbol',

    props: {
        currency: {
            type: String,
            default: 'USD'
        }
    }
}
</script>


<template>
    <i18n-n tag="span" :value="0" :format="{ key: 'currency', currency: currency }">
        <template #currency="slotProps">
            <span>{{ slotProps.currency }}</span>
        </template>
        <template #integer="slotProps">
            <span style="display:none">{{ slotProps.integer }}</span>
        </template>
        <template #group="slotProps">
            <span style="display:none">{{ slotProps.group }}</span>
        </template>
        <template #decimal="slotProps">
            <span style="display:none">{{ slotProps.decimal }}</span>
        </template>
        <template #fraction="slotProps">
            <span style="display:none">{{ slotProps.fraction }}</span>
        </template>
    </i18n-n>
</template>
