<script>
import isObject from 'lodash.isobject';
import ProductVariantCoverImage from '@/components/product/ProductVariantCoverImage';
import ProductPrice from '@/components/product/ProductPrice';
import {
    FigButton,
    FigPopConfirm,
    FigOverlay,
    FigFormSelectNative
} from '@notoursllc/figleaf';

export default {
    name: 'CartItem',

    components: {
        ProductVariantCoverImage,
        ProductPrice,
        FigButton,
        FigPopConfirm,
        FigOverlay,
        FigFormSelectNative
    },

    props: {
        item: {
            type: Object,
            default: () => {
                return {};
            }
        },

        editMode: {
            type: Boolean,
            default: false
        },

        showPriceStrikethrough: {
            type: Boolean,
            default: true
        },

        showQuantityWarning: {
            type: Boolean,
            default: true
        }
    },

    data() {
        return {
            cartItem: {},
            sizeOptions: [],
            form: {
                size: null,
                qty: null
            },
            isLoading: false
        };
    },

    computed: {
        selectedColor() {
            return isObject(this.cartItem.product_variant) ? this.cartItem.product_variant.label : null;
        },

        selectedSize() {
            return isObject(this.cartItem.product_variant_sku) ? this.cartItem.product_variant_sku.label : null;
        },

        quantityOptions() {
            const opts = [];
            const max = this.$store.state.ui.appConfig.CART_PRODUCT_QUANTITY_LIMIT || 20;

            for(let i=1; i<=max; i++) {
                opts.push(
                    { label: i, value: i }
                );
            }

            return opts;
        },

        canEdit() {
            // can't edit if there are no options,
            // or if there is just one option and that option is the sku already selected
            if(!this.sizeOptions.length
                || (this.sizeOptions.length === 1 && this.sizeOptions[0].value === this.cartItem.product_variant_sku.id)) {
                return false;
            }

            return true;
        }
    },

    watch: {
        item: {
            handler(newVal) {
                this.cartItem = {
                    ...newVal
                };
                this.init();
            },
            immediate: true,
            deep: true
        }
    },

    methods: {
        init() {
            this.setSizeOptions();
        },

        emitUpdated() {
            this.$emit('updated');
        },

        async onRemoveItem(id) {
            this.isLoading = true;

            try {
                const { data } = await this.$api.cart.deleteItem({
                    id: id,
                    clear_shipping_rate: true
                });

                this.emitUpdated();
                await this.$store.dispatch('cart/CART', data);
            }
            catch(err) {
                console.error('Error getting products', err);
            }

            this.isLoading = false;
        },

        // getProductQuantityMaxValue(selectedSize, product) {
        //     return this.getInventoryCountForSize(selectedSize, product);
        // },

        async setSizeOptions() {
            try {
                const variant = await this.$api.products.getVariant(
                    this.cartItem.product_variant.id,
                    { skus: true }
                );

                const opts = [];

                if(isObject(variant) && Array.isArray(variant.skus)) {
                    variant.skus.forEach((sku) => {
                        opts.push({
                            label: sku.label,
                            value: sku.id
                        });
                    });
                }

                this.sizeOptions = opts;
            }
            catch(err) {
                console.error('Error getting products', err);
            }
        },

        async updateCartItem() {
            this.isLoading = true;

            try {
                const { data } = await this.$api.cart.updateItem({
                    cart_id: this.$store.state.cart.id,
                    id: this.cartItem.id,
                    product_variant_sku_id: this.cartItem.product_variant_sku.id,
                    qty: this.cartItem.qty,
                    clear_shipping_rate: true
                });

                this.emitUpdated();
                await this.$store.dispatch('cart/CART', data);
                this.init();
            }
            catch(err) {
                console.error('Error updating cart item', err);

                this.$figleaf.errorToast({
                    title: this.$t('An error occurred')
                });

                this.$bugsnag.notify(err);
            }

            this.isLoading = false;
        }
    }
};
</script>


<template>
    <fig-overlay :show="isLoading">
        <div class="bg-white rounded p-2 sm:p-3 mb-2 sm:mb-4 flex items-start">
            <!-- image -->
            <div class="mr-2 sm:mr-4">
                <product-variant-cover-image
                    :variant="cartItem.product_variant"
                    smallest />
            </div>

            <div class="flex-grow">
                <!-- product title -->
                <div class="font-semibold mb-1">{{ cartItem.product.title }}</div>

                <!-- color -->
                <div class="text-gray-600 mb-1">
                    <div class="inline-block pr-1">{{ $t('Color') }}:</div>
                    <div class="inline-block">{{ selectedColor }}</div>
                </div>

                <!-- selected size -->
                <div class="text-gray-600 mb-3 sm:mb-4">
                    <div class="inline-block pr-1">{{ $t('Size') }}:</div>
                    <div class="inline-block">
                        <template v-if="!canEdit">{{ selectedSize }}</template>
                        <template v-else>
                            <fig-form-select-native
                                v-model="cartItem.product_variant_sku.id"
                                @input="updateCartItem"
                                :options="sizeOptions" />
                        </template>
                    </div>
                </div>

                <div>
                    <!-- remove button -->
                    <fig-pop-confirm @confirm="onRemoveItem(cartItem.id)">
                        {{ $t('Remove this item?') }}

                        <fig-button
                            slot="reference"
                            variant="naked"
                            size="sm">
                            <span class="border-b border-gray-400">{{ $t('Remove') }}</span>
                        </fig-button>
                    </fig-pop-confirm>
                </div>
            </div>

            <div class="mr-8 sm:mr-10">
                <!-- quantity -->
                <div>{{ $t('Quantity') }}:</div>
                <fig-form-select-native
                    v-model="cartItem.qty"
                    @input="updateCartItem"
                    :options="quantityOptions" />
            </div>

            <div>
                <product-price
                    :variant="cartItem.product_variant"
                    :sku="cartItem.product_variant_sku" />
            </div>
        </div>
    </fig-overlay>
</template>
