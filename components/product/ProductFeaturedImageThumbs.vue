<script>
import isObject from 'lodash.isobject';
import product_mixin from '@/mixins/product_mixin';


export default {
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
            selectedSkuId: null
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
                if(isObject(newVal) && Array.isArray(newVal.skus)) {
                    const featuredImages = this.prodMix_getFeaturedSkuImagesForProduct(newVal);

                    // If there is only one featured image, then we will not dipslay any thumbs
                    // because that one image will already be displayed on the page
                    if(!Array.isArray(featuredImages) || featuredImages.length === 1) {
                        this.thumbs = [];
                    }
                    else {
                        this.thumbs = this.limit ? featuredImages.slice(0, this.limit) : featuredImages;
                    }
                }

                this.$emit('numdisplayed', this.thumbs.length);
            },
            immediate: true
        },

        selected: {
            handler(newVal) {
                this.selectedSkuId = newVal;
            },
            immediate: true
        }
    },

    methods: {
        onThumbClick(obj) {
            this.$emit('click', obj.sku);
            this.selectedSkuId = obj.sku.id;
        },

        onThumbMouseOver(obj) {
            this.$emit('mouseover', obj.sku);
        }
    }
};
</script>


<template>
    <div>
        <div v-for="(obj, index) in thumbs"
             :key="index"
             class="media-thumb"
             :style="thumbStyle"
             @click="onThumbClick(obj)"
             @mouseover="onThumbMouseOver(obj)">

            <!-- <picture
                :id="`thumb_${index}`"
                @mouseover="onThumbMouseOver(obj)">
                <PiioElement :path="obj.url" tag="source" media="(max-width:45px)" class="thumbImg"></PiioElement>
                <PiioElement :path="obj.url" tag="img" class="thumbImg"></PiioElement>
            </picture> -->

            <PiioElement
                :path="obj.url"
                tag="img"
                :id="`thumb_${index}`"
                :class="{ selected: selectedSkuId === obj.sku.id }"
                @mouseover="onThumbMouseOver(obj)">></PiioElement>

            <b-tooltip
                :disabled="obj.sku.inventory_count > 0"
                :target="`thumb_${index}`">{{ $t('Sold out') }}</b-tooltip>
        </div>
    </div>
</template>


<style lang="scss">
.media-thumb {
    margin: 0 3px;
    display: inline-block;
    cursor: pointer;

    img {
        width: 100%;
        height: 100%;
        border-radius: 3px;
        border: 2px transparent;

        &:hover,
        &.selected {
            // border: 2px solid rgb(55, 194, 245);
            box-shadow: 0 0 0 2px rgb(55, 194, 245);
        }
    }
}
</style>
