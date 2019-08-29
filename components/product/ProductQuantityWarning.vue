<script>
export default {
    name: 'ProductQuantityWarning',

    props: {
        max: {
            type: Number,
            default: 1
        }
    }
}
</script>


<template>
    <div v-if="max > 0 && max <= 10" class="inlineBlock colorOrange">
        <i18n path="only_num_left">
            <span place="qty">{{ max }}</span>
        </i18n>
    </div>
</template>
