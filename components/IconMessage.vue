<script>
export default {
    name: 'IconMessage',

    inheritAttrs: false
};
</script>


<template>
    <div
        class="nowrap"
        v-bind="$attrs"
        v-on="$listeners">
        <div v-if="$slots.icon" class="prs vat inlineBlock">
            <slot name="icon"></slot>
        </div>
        <div class="inlineBlock white-space-normal vabtm"><slot></slot></div>
    </div>
</template>
