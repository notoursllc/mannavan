<script>
import isObject from 'lodash.isobject';
import { email, required } from 'vuelidate/lib/validators';
import ProductPrice from '@/components/product/ProductPrice';
import ProductImageSlider from '@/components/product/ProductImageSlider';
import ProductCardThumbs from '@/components/product/ProductCardThumbs';
import { getProductVariantCoverImage } from '@/utils/product';
// import TshirtSizeChart from '@/components/product/TshirtSizeChart';
import {
    FigButton,
    FigOverlay,
    FigModal,
    FigSizeButtons,
    FigProductDetailsLayout,
    FigStockLevelWarning,
    FigTexasToast,
    FigContent,
    FigNuxtImgBunny,
    FigAddress,
    FigIcon,
    FigIconLabel
} from '@notoursllc/figleaf';

export default {
    components: {
        FigButton,
        FigOverlay,
        ProductPrice,
        ProductImageSlider,
        ProductCardThumbs,
        FigModal,
        FigSizeButtons,
        FigProductDetailsLayout,
        FigStockLevelWarning,
        FigTexasToast,
        FigContent,
        FigNuxtImgBunny,
        FigAddress,
        FigIcon,
        FigIconLabel
    },

    async asyncData({ route, store, app }) {
        try {
            const data = {};
            const response = await app.$api.product.get(
                route.params.id,
                { _withRelated: '*' }
            );

            data.product = response.data;
            // if(!data.product) {
            //     return;
            // }

            if(route.query.variant && Array.isArray(data.product.variants)) {
                for(let i=0, l=data.product.variants.length; i<l; i++) {
                    if(data.product.variants[i].id === route.query.variant) {
                        data.visibleVariant = data.product.variants[i];
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
            },
            atcConfirm: {
                title: null,
                imageUrl: null,
                productSize: null,
                productPrice: null
            }
        };
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

    created() {
        if(!this.product) {
            this.$figleaf.errorToast({
                title: this.$t('Error'),
                text: this.$t('Product not found')
            });
        }
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
                    this.$figleaf.errorToast({
                        title: this.$t('Error'),
                        text: this.$t('Sorry, this size is out of stock')
                    });
                    return;
                }

                // Add item to  cart
                const { data } = await this.$api.cart.item.add({
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

                const confirmButtonClickIndex = await this.showAtcConfirm(selectedCartItem);

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
                if(err.response && err.response.data && err.response.data.message === 'INVALID_QUANTITY') {
                    // TODO: use FigModal here instead
                    this.$refs.invalid_qty_modal.show();
                    return;
                }

                this.$figleaf.errorToast({
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
                const { data } = await this.$api.product.variant.getSku(id);
                this.selectedSkuInventoryCount = isObject(data) ? data.inventory_count : 0;
            }
            catch(err) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: err.response.data.message
                });

                this.$bugsnag.notify(err);
            }
        },

        onHideTexasToast(buttonIndex) {
            switch(buttonIndex) {
                case 1:
                    this.goToViewCart();
                    break;

                case 2:
                    this.$router.push({ name: 'cart-checkout' });
                    break;
            }
        },

        showAtcConfirm(cartItem, config) {
            if(!isObject(cartItem)) {
                return;
            }

            // this.atcConfirm.cartItem = cartItem;
            this.atcConfirm.imageUrl = cartItem ? getProductVariantCoverImage(cartItem.product_variant) : null;
            this.atcConfirm.title = isObject(cartItem.product) ? cartItem.product.title : null;
            this.atcConfirm.productSize = isObject(cartItem.product_variant_sku) ? cartItem.product_variant_sku.label : null;


            if(isObject(cartItem.product_variant)) {
                const intPrice = parseInt(cartItem.product_variant.display_price, 10);
                if(!isNaN(intPrice)) {
                    this.atcConfirm.productPrice = intPrice / 100;
                }
            }

            this.$refs.addToCartToast.show(5000);
        },

        goToViewCart() {
            this.$router.push({ name: 'cart' });
        }
    }
};
</script>


<template>
    <fig-content class="pt-4">
        <fig-product-details-layout v-if="product">
            <!-- pics -->
            <template v-slot:pics>
                <client-only placeholder="Carousel loading...">
                    <product-image-slider
                        ref="slider"
                        :product="product"
                        :variant-id="visibleVariant.id" />
                </client-only>
            </template>

            <template v-slot:title>{{ product.title }}</template>

            <template v-slot:description>{{ product.description }}</template>

            <template v-slot:price>
                <product-price
                    :variant="visibleVariant"
                    :sku="form.selectedSku" />
            </template>

            <template v-slot:thumbs>
                <product-card-thumbs
                    :product="product"
                    preset="prodthumb"
                    :selected="visibleVariant.id"
                    @click="onThumbClick" />
            </template>

            <template v-slot:sizes>
                <fig-stock-level-warning
                    :qty="visibleVariant.total_inventory_count" />

                <div class="mt-6">
                    <div class="flex items-center font-medium mb-1 w-full">
                        <div class="text-black flex-grow">{{ $t('Select a size') }}:</div>
                        <!-- <div class="text-gray-500">{{ $t('Size guide') }}</div> -->
                    </div>

                    <fig-size-buttons
                        v-model="form.selectedSku"
                        :skus="visibleVariant.skus"
                        @input="onSizeSelect" />
                </div>
            </template>

            <template v-slot:button>
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

            <template v-if="product.artist" v-slot:artist>
                <div class="p-4 border border-gray-200 rounded-sm">
                    <div class="text-gray-600 text-xs font-semibold mb-2">{{ $t('PHOTOGRAPHER') }}</div>
                    <div class="flex flex-wrap">
                        <div class="pr-2" v-if="product.artist.image">
                            <fig-nuxt-img-bunny
                                :src="product.artist.image"
                                preset="prodthumb"
                                loading="eager" />
                        </div>
                        <div>
                            <div class="font-semibold">{{ product.artist.name }}</div>
                            <div>
                                <fig-icon-label>
                                    <template v-slot:left>
                                        <fig-icon
                                            icon="map-pin"
                                            :width="18"
                                            :height="18"
                                            stroke="#a19e9e" />
                                    </template>

                                    <div class="text-sm text-gray-400">
                                        <fig-address
                                            :city="product.artist.city"
                                            :state="product.artist.state"
                                            :country-code="product.artist.countryCodeAlpha2"
                                            country-code-inline />
                                    </div>
                                </fig-icon-label>

                                <div v-if="product.artist.description" class="pt-1">{{ product.artist.description }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </fig-product-details-layout>


        <fig-modal ref="invalid_qty_modal" size="md">
            <template slot="header">{{ $t('Error') }}</template>

            <div class="mb-4">{{ $t('cart_product_qty_limit') }}</div>
            <div class="text-center">
                <fig-button
                    variant="primary"
                    @click="goToViewCart">{{ $t('View Cart') }}</fig-button>
            </div>
        </fig-modal>


        <!-- add to cart toast -->
        <fig-texas-toast
            ref="addToCartToast"
            @hide="onHideTexasToast">
            <template v-slot:title>{{ $t('Added to Cart') }}</template>
            <template v-slot:message>
                <div class="flex items-start justify-start">
                    <!-- thumbnail -->
                    <div class="pr-5" v-if="atcConfirm.imageUrl">
                        <fig-nuxt-img-bunny
                            :src="atcConfirm.imageUrl"
                            preset="prodthumb"
                            loading="eager" />
                    </div>

                    <!-- message -->
                    <div class="text-left">
                        <!-- title -->
                        <div v-if="atcConfirm.title" class="text-gray-800 font-medium mb-1">{{ atcConfirm.title }}</div>

                        <!-- size -->
                        <div v-if="atcConfirm.productSize" class="text-gray-500 mb-1">
                            {{ $t('Size') }}: {{ atcConfirm.productSize }}
                        </div>

                        <!-- price -->
                        <div v-if="atcConfirm.productPrice" class="text-gray-800">
                            {{ $n(atcConfirm.productPrice, 'currency') }}
                        </div>
                    </div>
                </div>
            </template>
            <template v-slot:secondaryButtonLabel>{{ $t('View Cart') }}</template>
            <template v-slot:primaryButtonLabel>{{ $t('Checkout') }}</template>
        </fig-texas-toast>
    </fig-content>
</template>


<style>
.product-attribute-select .vs__dropdown-toggle,
.product-attribute-select .vs__selected {
    line-height: 2;
}
</style>
