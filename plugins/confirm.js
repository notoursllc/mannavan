import Vue from 'vue';
import isObject from 'lodash.isobject';
import FigIcon from '@notoursllc/figleaf/components/icon/FigIcon';
import { getSmallestProductVariantCoverImage } from '@/utils/product';

export default (context) => {

    // context.app.nuxt.$on('fig::confirm::hide', () => {
    //     console.log("on hide")
    // });
    // console.log(context.app.nuxt)

    /**
     * Show the confirm dialog
     *
     * @param String,VNode message
     * @param {*} config
     * @return Promise
     */
    Vue.prototype.$showConfirm = function(message, variant, config) {
        const cfg = Object.assign(
            {},
            {
                okLabel: this.$t('OK'),
                cancelLabel: this.$t('Cancel')
            },
            config
        );

        const h = this.$createElement;
        let childNode = null;
        let icon = null;

        switch(variant) {
            case 'warning':
                icon = 'alert-circle';
        }

        if(icon) {
            childNode = h(
                'div',
                {
                    class: ['pr-3']
                },
                [
                    h(
                        FigIcon,
                        {
                            attrs: {
                                icon: icon,
                                width: 35,
                                height: 35,
                                variant: 'warning'
                            }
                        }
                    )
                ]
            );
        }

        if(childNode) {
            const messageVNode = h(
                'div',
                {
                    class: ['flex items-center justify-center']
                },
                [
                    childNode,
                    h(
                        'div',
                        {
                            class: 'text-left'
                        },
                        [message]
                    )
                ]);

            return this.$figleaf.confirm(
                [messageVNode],
                cfg
            );
        }

        return this.$figleaf.confirm(message, cfg);
    };


    /**
     * Show the ATC (add to cart) confirm dialog
     *
     * @param String,VNode message
     * @param String variant  String
     * @param {*} config
     * @return Promise
     */
    Vue.prototype.$showAtcConfirm = function(skuId, config) {
        const shoppingCart = this.$store.state.cart.cart;

        if(!Array.isArray(shoppingCart.cart_items)) {
            return;
        }

        let cartItem = null;
        shoppingCart.cart_items.forEach((obj) => {
            if(isObject(obj.product_variant_sku) && obj.product_variant_sku.id === skuId) {
                cartItem = obj;
            }
        });

        // console.log("productImage", productImage);

        const cfg = Object.assign(
            {},
            {
                title: this.$t('Added to Cart'),
                checkoutLabel: this.$t('Checkout'),
                viewCartLabel: this.$t('View Cart')
            },
            config
        );

        const h = this.$createElement;
        const productImage = cartItem ? getSmallestProductVariantCoverImage(cartItem.product_variant) : null;
        let thumbnail = null;

        if(isObject(productImage)) {
            thumbnail = h(
                'div',
                {
                    class: ['pr-3']
                },
                [
                    h(
                        'img',
                        {
                            attrs: {
                                src: productImage.url,
                                width: 75
                            }
                        }
                    )
                ]
            );
        }

        const productTitle = isObject(cartItem.product) ? cartItem.product.title : null;
        const productSize = isObject(cartItem.product_variant_sku) ? cartItem.product_variant_sku.label : null;

        let productPrice = null;
        if(isObject(cartItem.product_variant)) {
            const intPrice = parseInt(cartItem.product_variant.display_price, 10);
            if(!isNaN(intPrice)) {
                productPrice = intPrice / 100;
            }
        }

        const messageNodes = [];

        if(productTitle) {
            messageNodes.push(
                h(
                    'div', { class: 'text-gray-800 font-medium mb-1' }, [productTitle]
                )
            );
        }

        if(productSize) {
            messageNodes.push(
                h(
                    'div',
                    { class: 'text-gray-500 mb-1' },
                    [
                        `${this.$t('Size')}: ${productSize}`
                    ]
                )
            );
        }

        if(productPrice) {
            messageNodes.push(
                h(
                    'div',
                    { class: 'text-gray-800' },
                    [
                        this.$n(productPrice, 'currency')
                    ]
                )
            );
        }

        if(thumbnail) {
            const messageVNode = h(
                'div',
                {
                    class: ['flex items-start justify-start']
                },
                [
                    thumbnail,
                    h(
                        'div',
                        {
                            class: 'text-left'
                        },
                        messageNodes
                    )
                ]);

            return this.$figleaf.atcConfirm(
                [messageVNode],
                cfg
            );
        }

        return this.$figleaf.atcConfirm(messageNodes, cfg);
    };

};
