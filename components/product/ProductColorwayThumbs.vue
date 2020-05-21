<script>
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

        maxDisplay: {
            type: Number,
            default: 3
        }
    },

    data() {
        return {
            showThumbs: false,
            thumbs: {},
            allPossibleThumbs: {}
        };
    },

    computed: {
        thumbOverflowDisplay() {
            const len = Object.keys(this.allPossibleThumbs).length;
            if(len > this.maxDisplay) {
                return `+${len - this.maxDisplay}`;
            }
            return '';
        },

        numVisibleThumbs() {
            return Object.keys(this.thumbs).length;
        }
    },

    watch: {
        product: {
            handler(newVal) {
                console.log("PROD", this.product);
                if(newVal) {
                    this.collectThumbs();
                }
            },
            immediate: true
        }
    },

    methods: {
        collectThumbs() {
            const thumbs = [];
            const results = this.getSkusWithAttribute(this.product, 'Color');
            const colorImages = {};

            if(!results.attributeId || !results.skus.length) {
                return thumbs;
            }

            // Different SKUs can be for the same color (small/red, medium/red),
            // so we need to make sure we get only one image per color
            results.skus.forEach((sku) => {
                if(sku.is_displayable) {
                    sku.attributes.forEach((attr) => {
                        // results.attributeId tells us which SKU is assigned the "color" label
                        if(attr.optionId === results.attributeId
                            && !colorImages.hasOwnProperty(attr.optionId)) {

                            // get the first published image
                            for(let i = 0, l = sku.images.length; i < l; i++) {
                                if(sku.images[i].published) {
                                    // colorImages[attr.value] = sku.images[i];
                                    colorImages[attr.value] = {
                                        sku: sku,
                                        image: sku.images[i]
                                    };
                                    break;
                                }
                            }
                        }
                    });
                }
            });

            // building the truncated list of images that will be displayed
            const truncated = {};
            let counter = 0;
            for(const key in colorImages) {
                if(counter < this.maxDisplay) {
                    truncated[key] = colorImages[key];
                    counter++;
                }
            }

            this.allPossibleThumbs = colorImages;
            this.thumbs = truncated;

            console.log("ALL IMAGES", this.allPossibleThumbs);
            console.log("TRUNCATED IAMGES", this.thumbs);
        },

        onThumbMouseover(key) {
            this.$emit('thumbMouseOver', this.thumbs[key]);
        }
    }
};
</script>

<template>
    <div v-if="numVisibleThumbs > 1">
        <template v-if="showThumbs">
            <div @mouseleave="showThumbs = false">
                <div v-for="(obj, key) in thumbs"
                     :key="key"
                     class="colorway-thumb">
                    <el-tooltip
                        effect="dark"
                        content="Sold out"
                        placement="top"
                        :disabled="obj.sku.inventory_count > 0">
                        <figure
                            :style="'background-image:url(' + obj.image.image_url + ');'"
                            @mouseover="onThumbMouseover(key)"></figure>
                    </el-tooltip>
                </div>

                <div class="colorway-overflow">{{ thumbOverflowDisplay }}</div>
            </div>
        </template>
        <template v-else>
            <div @mouseover="showThumbs = true">
                {{ $tc('n_colors', numVisibleThumbs, { num: numVisibleThumbs }) }}
            </div>
        </template>
    </div>
</template>

<style lang="scss">
.colorway-thumb {
    margin: 0 3px;
    display: inline-block;

    figure {
        width: 40px;
        height: 40px;
        background-size: cover;
        background-position: center;
        display: inline-block;
    }
}

.colorway-overflow {
    margin-left: 5px;
    display: inline-block;
    line-height: 40px;
    vertical-align: top;
}
</style>
