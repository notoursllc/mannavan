<script>
/**
 * Displays a thumbnail image for each product color
 */
import isObject from 'lodash.isobject';
import { getProductVariantCoverImage } from '@/utils/product';
import {
    FigTooltip,
    FigNuxtImgBunny
} from '@notoursllc/figleaf';


export default {
    name: 'ProductCardThumbs',

    components: {
        FigTooltip,
        FigNuxtImgBunny
    },

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

        preset: {
            type: String,
            default: 'prodthumbxs',
            validator: (value) => ['prodthumb', 'prodthumbxs'].includes(value)
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
        }
    },

    watch: {
        product: {
            handler(newVal) {
                if(isObject(newVal) && Array.isArray(newVal.variants)) {
                    const variantThumbs = this.getOneThumbPerVariant(newVal);

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

            if(Array.isArray(product.variants)) {
                product.variants.forEach((variant) => {
                    const url = getProductVariantCoverImage(variant);

                    if(url) {
                        images.push({
                            url: url,
                            variant: variant
                        });
                    }
                });
            }

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
             class="media-thumb-wrapper"
             @click="onThumbClick(obj)"
             @mouseover="onThumbMouseOver(obj)">

            <fig-tooltip
                :disabled="obj.variant.total_inventory_count > 0">
                <div
                    slot="toggler"
                    class="media-thumb"
                    :class="{ 'media-thumb-selected': selectedVariantId === obj.variant.id }">
                    <fig-nuxt-img-bunny
                        :src="obj.url"
                        :preset="preset"
                        loading="lazy"
                        :alt="obj.alt_text || $t('variant image')" />
                </div>
                {{ $t('Sold out') }}
            </fig-tooltip>
        </div>
    </div>
</template>


<style>
.media-thumb {
    @apply cursor-pointer;
}
.media-thumb,
.media-thumb > div {
    @apply rounded-md;
}
.media-thumb-wrapper:not(:last-child) {
    @apply mr-2;
}
.media-thumb:hover,
.media-thumb-selected {
    box-shadow: 0 0 0 2px rgb(55, 194, 245);
}
</style>
