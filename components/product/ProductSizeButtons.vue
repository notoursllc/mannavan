<script>
import Vue from 'vue';

export default Vue.extend({
    name: 'ProductSizeButtons',

    props: {
        value: {
            type: String,
            default: null
        },

        product: {
            type: Object,
            default: () => {
                return {};
            }
        },

        variantId: {
            type: String,
            default: null
        }
    },

    data() {
        return {

        };
    },

    // watch: {
    //     value: {
    //         handler(newVal) {

    //         },
    //         immediate: true
    //     }
    // },

    computed: {
        sizes() {
            const labels = [];

            if(Array.isArray(this.product.variants)) {
                this.product.variants.forEach((obj) => {
                    if(this.variantId === obj.id && Array.isArray(obj.skus)) {
                        obj.skus.forEach((sku) => {
                            // TODO: shopbacUI is not setting 'published' yet.  That needs fixing so we can use this logic:
                            // if(sku.label && sku.published && sku.visible_if_no_inventory) {
                            if(sku.label && sku.visible_if_no_inventory) {
                                labels.push({
                                    label: sku.label,
                                    disabled: sku.inventory_count <= 0,
                                    sku: sku
                                });
                            }
                        });
                    }
                });
            }

            return labels;
        }
    },

    methods: {
        onBtnClick(variant) {
            //TODO:
            console.log("BTN CLICK", variant)
            this.$emit('input', variant.sku)
        }
    }
});
</script>

<template>
    <div class="size-buttons">
        <button
            v-for="(obj, index) in sizes"
            :key="index"
            :disabled="obj.disabled"
            :class="{ selected: obj.id === value && !obj.disabled }"
            @click="onBtnClick(obj)">{{ obj.label }}</button>
    </div>
</template>


<style lang="postcss" scoped>
.size-buttons {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 7px;
}

.size-buttons > button {
    @apply border border-gray-300 text-black bg-white flex flex-grow items-center justify-center rounded-md;
    height: 48px;
}
.size-buttons > button:disabled {
    @apply cursor-not-allowed bg-gray-100 text-gray-300;
}
.size-buttons > button:not(:disabled):hover,
.size-buttons > button.selected {
    @apply border-blue-300 bg-blue-100;
}
</style>
