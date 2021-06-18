<script>
import isObject from 'lodash.isobject';
import { email, required } from 'vuelidate/lib/validators'
import product_mixin from '@/mixins/product_mixin';
import shopping_cart_mixin from '@/mixins/shopping_cart_mixin';
import ProductPrice from '@/components/product/ProductPrice';
import ProductQuantityWarning from '@/components/product/ProductQuantityWarning';
import ProductImageSlider from '@/components/product/ProductImageSlider';
import ProductCardThumbs from '@/components/product/ProductCardThumbs';
// import TshirtSizeChart from '@/components/product/TshirtSizeChart';

import {
    FigButton,
    FigOverlay,
    FigModal,
    FigSizeButtons,
    FigProductDetailsLayout
} from '@notoursllc/figleaf';

export default {
    components: {
        FigButton,
        FigOverlay,
        ProductPrice,
        ProductQuantityWarning,
        ProductImageSlider,
        ProductCardThumbs,
        FigModal,
        FigSizeButtons,
        FigProductDetailsLayout
    },

    mixins: [
        product_mixin,
        shopping_cart_mixin
    ],

    data() {
        return {
            product: {},
            visibleVariant: {},

            // skuOptions: {},
            selectedAttributes: {},
            selectedAttributesAreValid: false,
            isLoading: false,
            cartButtonLoading: false,
            selectedSkuInventoryCount: null,
            form: {
                selectedSku: null
            }
        };
    },

    computed: {
        addToCartButtonDisabled() {
            return !this.form.selectedSku;
        }
    },

    validations: function() {

        // let baseValidation = {
        //     countryCodeAlpha2: { required },
        //     firstName: { required },
        //     lastName: { required },
        //     streetAddress: { required },
        //     extendedAddress: {}, // no validation needed
        //     city: { required },
        //     state: { required },
        //     postalCode: { required },
        //     company: {} // no validation needed
        // }

        // if(this.type === 'shipping') {
        //     baseValidation.email = { required, email }
        // }

        // return {
        //     form: baseValidation
        // }
    },

    fetchOnServer: true,



    async asyncData({ route, store, app }) {
        try {
            const data = {};
            // data.product = await product_mixin.methods.getProductBySeoUri.call(app, params.seouri);
            data.product = await app.$api.products.get(route.params.id);

            // if(!data.product) {
            //     return;
            // }

            if(route.query.variant && Array.isArray(data.product.variants)) {
                for(let i=0, l=data.product.variants.length; i<l; i++) {
                    if(data.product.variants[i].id === route.query.variant) {
                        data.visibleVariant = data.product.variants[i];
                        console.log("ASYNC VISIBLE VARIANT", data.visibleVariant);
                        break;
                    }
                }
            }

            return data;
        }
        catch(err) {
            console.log('Error getting product', err);
        }
    },

    created() {
        if(!this.product) {
            this.$errorToast({
                title: this.$t('Error'),
                text: this.$t('Product not found')
            });
        }
    },

    head() {
        return {
            title: this.productTitle,
            meta: [
                { vmid: 'description', name: 'description', content: this.productDesc },
                { name: 'og:site_name', content: this.$store.state.ui.siteName },
                { name: 'og:url', content: this.$route.fullPath },
                { name: 'og:title', content: this.productTitle },
                { name: 'og:type', content: 'website' },
                { name: 'og:image', content: this.mediaPicture },
                { name: 'og:description', content: this.product ? this.product.description_long: '' },
            ]
        };
    },

    methods: {

        /**
         * Add a sku to the cart
         *
         * 1) Check for available stock
         * 2) Upsert the cart
         */
        async addToCart() {
            this.isLoading = true;

            try {
                // Check stock
                await this.getSkuInventoryCount(this.form.selectedSku.id);

                // Show error toast if no stock
                if(!this.selectedSkuInventoryCount) {
                    this.$errorToast({
                        title: this.$t('Error'),
                        text: this.$t('Sorry, this size is out of stock')
                    });
                    return;
                }

                // Add item to  cart
                const { data } = await this.$api.cart.addItem({
                    cart_id: this.$store.state.cart.id,
                    product_variant_sku_id: this.form.selectedSku.id,
                    qty: 1,
                    clear_shipping_rate: true
                });

                await this.$store.dispatch('cart/CART', data);

                // show the ATC confirm
                let selectedCartItem = null;
                data.cart_items.forEach((obj) => {
                    if(isObject(obj.product_variant_sku) && obj.product_variant_sku.id === this.form.selectedSku.id) {
                        selectedCartItem = obj;
                    }
                });
                console.log("selectedCartItem", selectedCartItem)

                const confirmButtonClickIndex = await this.$showAtcConfirm(selectedCartItem);

                // Redirect the user depending on the button clicked in the ATC confirm
                switch(confirmButtonClickIndex) {
                    case 1:
                        this.$router.push({
                            name: 'cart'
                        });
                        break;

                    case 2:
                        this.$router.push({
                            name: 'cart-checkout'
                        });
                        break;

                    default:
                        // do nothing
                }
            }
            catch(err) {
                console.log("ERR", {...err});

                if(err.response && err.response.data && err.response.data.message === 'INVALID_QUANTITY') {
                    // TODO: use FigModal here instead
                    this.$refs.invalid_qty_modal.show();
                    return;
                }

                this.$errorToast({
                    title: this.$t('Error'),
                    text: err.response.data.message
                });

                this.$bugsnag.notify(err);
            }

            this.isLoading = false;
        },

        onThumbClick(variant) {
            // console.log("ON THUMNB CLIKC", variant)
            this.setVisibleVariant(variant);
            this.$refs.slider.goTo(0);
        },

        async onSizeSelect(sku) {
            // this.form.selectedSku = sku;

            this.cartButtonLoading = true;
            await this.getSkuInventoryCount(sku.id);
            this.cartButtonLoading = false;
        },

        setVisibleVariant(variant) {
            this.visibleVariant = variant || {};
        },

        async getSkuInventoryCount(id) {
            try {
                const sku = await this.$api.products.getVariantSku(id);
                this.selectedSkuInventoryCount = isObject(sku) ? sku.inventory_count : 0;
            }
            catch(err) {
                this.$errorToast({
                    title: this.$t('Error'),
                    text: err.response.data.message
                });

                this.$bugsnag.notify(err);
            }
        },

        goToViewCart() {
            this.$router.push({ name: 'cart' });
        }
    }
};
</script>


<template>
    <div class="pageContainerMax container-fluid">
        <fig-product-details-layout v-if="product">
            <!-- pics -->
            <template slot="pics">
                <client-only placeholder="Carousel loading...">
                    <product-image-slider
                        ref="slider"
                        :product="product"
                        :variant-id="visibleVariant.id" />
                </client-only>
            </template>

            <template slot="title">{{ product.title }}</template>

            <template slot="description">{{ product.description }}</template>

            <template slot="price">
                <product-price
                    :variant="visibleVariant"
                    :sku="form.selectedSku" />
            </template>

            <template slot="thumbs">
                <product-card-thumbs
                    :product="product"
                    :width="70"
                    :selected="visibleVariant.id"
                    @click="onThumbClick" />
            </template>

            <template slot="sizes">
                <product-quantity-warning
                    :qty="visibleVariant.total_inventory_count" />

                <div class="mtl">
                    <div class="flex items-center font-medium mb-1 w-full">
                        <div class="text-black flex-grow">{{ $t('Select a size') }}:</div>
                        <div class="text-gray-500">{{ $t('Size guide') }}</div>
                    </div>

                    <fig-size-buttons
                        v-model="form.selectedSku"
                        :skus="visibleVariant.skus"
                        @input="onSizeSelect" />
                </div>
            </template>

            <template slot="button">
                <fig-overlay :show="cartButtonLoading">
                    <div v-if="!visibleVariant">{{ $t('Unavailable') }}</div>
                    <template v-else>
                        <fig-button
                            v-if="!visibleVariant.total_inventory_count || (selectedSkuInventoryCount !== null && selectedSkuInventoryCount < 1)"
                            variant="danger"
                            :disabled="true"
                            size="lg"
                            class="w-full block">{{ $t('Out of stock') }}</fig-button>

                        <fig-button
                            v-else
                            variant="success"
                            size="lg"
                            class="w-full block"
                            @click="addToCart"
                            :disabled="addToCartButtonDisabled"
                            :loading="isLoading">{{ $t('Add To Your Order') }}</fig-button>
                    </template>
                </fig-overlay>
            </template>
        </fig-product-details-layout>

        <fig-modal ref="invalid_qty_modal" size="md">
            <template slot="header">{{ $t('Error') }}</template>

            <div class="mb-4">{{ $t('cart_product_qty_limit') }}</div>
            <div class="text-center">
                <fig-button
                    variant="primary"
                    @click="goToViewCart">{{ $t('View cart') }}</fig-button>
            </div>
        </fig-modal>
    </div>
</template>


<style>
.product-attribute-select .vs__dropdown-toggle,
.product-attribute-select .vs__selected {
    line-height: 2;
}
</style>
