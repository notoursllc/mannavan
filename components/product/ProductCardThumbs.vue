<script>
/**
 * Displays a thumbnail image for each product color
 */

import isObject from 'lodash.isobject';
import product_mixin from '@/mixins/product_mixin';

import {
    FigTooltip
} from '@notoursllc/figleaf';

export default {
    name: 'ProductCardThumbs',

    components: {
        FigTooltip
    },

    mixins: [
        product_mixin
    ],

    props: {
        product: {
            type: Object,
            default: () => {
                return {};
            }
        },

        limit: {
            type: Number,
            default: null
        },

        width: {
            type: Number,
            default: 45
        },

        selected: {
            type: String,
            default: ''
        }
    },

    data() {
        return {
            thumbs: [],
            selectedVariantId: null
        };
    },

    computed: {
        thumbOverflowDisplay() {
            if(this.numProductSkus > this.maxVariantDisplay) {
                return `+${this.numProductSkus - this.maxVariantDisplay}`;
            }
            return '';
        },

        thumbStyle() {
            return {
                width: `${this.width}px`,
                height: `${this.width}px`
            };
        }
    },

    watch: {
        product: {
            handler(newVal) {
                console.log("OROD WATCh", newVal)
                if(isObject(newVal) && Array.isArray(newVal.variants)) {
                    const variantThumbs = this.getOneThumbPerVariant(newVal);
                    console.log("variantThumbs", variantThumbs)

                    // If there is only one featured image, then we will not dipslay any thumbs
                    // because that one image will already be displayed on the page
                    if(variantThumbs.length === 1) {
                        this.thumbs = [];
                    }
                    else {
                        this.thumbs = this.limit ? variantThumbs.slice(0, this.limit) : variantThumbs;
                    }
                }

                this.$emit('numdisplayed', this.thumbs.length);
            },
            immediate: true
        },

        selected: {
            handler(newVal) {
                this.selectedVariantId = newVal;
            },
            immediate: true
        }
    },

    methods: {
        getOneThumbPerVariant(product) {
            const images = [];

            if(!Array.isArray(product.variants) || !product.variants.length) {
                return images;
            }

            product.variants.forEach((variant) => {
                const img = this.prodMix_getVariantCoverImage(variant);

                // new get the 75px width image
                if(isObject(img) && img.variants) {
                    img.variants.forEach((obj) => {
                        if(obj.target_width === 75) {
                            images.push({
                                url: obj.url,
                                variant: variant
                            });
                        }
                    });
                }
            });

            return images;
        },

        onThumbClick(obj) {
            this.$emit('click', obj.variant);
            this.selectedVariantId = obj.variant.id;
        },

        onThumbMouseOver(obj) {
            this.$emit('mouseover', obj.variant);
        }
    }
};
</script>


<template>
    <div class="flex flex-row items-center -mx-sm">
        <div v-for="(obj, index) in thumbs"
             :key="index"
             class="media-thumb"
             @click="onThumbClick(obj)"
             @mouseover="onThumbMouseOver(obj)">

            <fig-tooltip
                :disabled="obj.variant.total_inventory_count > 0">
                <template slot="toggler">
                    <nuxt-image
                        :placeholder="true"
                        :src="obj.url"
                        :style="thumbStyle"
                        :id="`thumb_${index}`"
                        :class="{ selected: selectedVariantId === obj.variant.id }" />
                </template>
                {{ $t('Sold out') }}
            </fig-tooltip>
        </div>
    </div>
</template>


<style lang="postcss">
.media-thumb {
    @apply cursor-pointer;
}
.media-thumb:not(:last-child) {
    @apply pr-2;
}
.media-thumb img:hover,
.media-thumb img.selected {
    box-shadow: 0 0 0 2px rgb(55, 194, 245);
}
</style>
