<script>
import Vue from 'vue';
import VueImg from 'v-img';
import { Carousel, Slide } from 'vue-carousel';


Vue.use(VueImg, {
    altAsTitle: true,
    sourceButton: false, // Display 'download' button near 'close' that opens source image in new tab
    openOn: 'click', // Event listener to open gallery will be applied to <img> element
    thumbnails: false
});


export default {
    components: {
        Carousel,
        Slide,
    },

    props: {
        product: {
            type: Object,
            default: function() {
                return {};
            }
        }
    },

    data() {
        return {
            productPics: [],
            swiperOptionh: {
                spaceBetween: 50,
                pagination: {
                    el: '.swiper-pagination-h',
                    clickable: true
                }
            },
            swiperOptionv: {
                direction: 'vertical',
                spaceBetween: 50,
                pagination: {
                    el: '.swiper-pagination-v',
                    clickable: true
                }
            }
        };
    },

    watch: {
        product: {
            handler(newVal) {
                if(newVal) {
                    this.loadPics();
                }
            },
            immediate: true
        }
    },

    methods: {
        loadPics() {
            const pics = [];

            if (Array.isArray(this.product.images)) {
                this.product.images.forEach((obj) => {
                    pics.push({
                        preview: obj,
                        large: Array.isArray(obj.variants) ? obj.variants[0] : null
                    });
                });
            }

            // images from skus
            if (Array.isArray(this.product.skus)) {

                this.product.skus.forEach((sku) => {
                    if (Array.isArray(sku.images)) {
                        // the first sku image is pushed onto the pics array
                        // and every other sku image is related to the first
                        const pic = {
                            preview: sku.images[0],
                            large: Array.isArray(sku.images[0].variants) ? sku.images[0].variants[0] : null,
                            related: []
                        };

                        // add the other images to the 'related' property of the first pic
                        const otherSkuImages = sku.images.slice(1);
                        otherSkuImages.forEach((otherImg) => {
                            pic.related.push({
                                preview: otherImg,
                                large: Array.isArray(otherImg.variants) ? otherImg.variants[0] : null
                            });
                        });

                        pics.push(pic);
                    }
                });

                console.log("PICS", pics);
            }

            this.productPics = pics;
        }
    }
};
</script>


<template>
    <div v-if="product" class="pic-list">
        <div class="pic-column" v-for="(pic, key) in productPics" :key="key">
            <div class="pic-container">
                <img :src="pic.preview.image_url"
                     :alt="pic.preview.alt_text"
                     v-img="{group:'prod', src:pic.large.url}">
            </div>
        </div>

        <!-- <client-only :placeholder="$t('Loading pictures...')">
            <carousel
                :autoplay="true"
                :autoplayHoverPause="true"
                :navigationEnabled="!!productPics.length"
                :perPage="1"
                :loop="true"
                paginationColor="#cacac8"
                paginationActiveColor="#e66d17">
                <slide v-for="(pic, key) in productPics" :key="key">
                    <img :src="pic.preview.image_url"
                            :alt="pic.preview.alt_text"
                            v-img="{group:'prod', src:pic.large.image_url}">
                </slide>
            </carousel>
        </client-only> -->
    </div>
</template>


<style lang="scss">
@import "~assets/css/components/_mixins.scss";
@import '~assets/css/components/_variables.scss';

.pic-list {
    @include flexbox();
    @include flex-direction(row);
    @include justify-content(flex-start);
    @include align-items(flex-start);
    @include align-content(flex-start);
    @include flex-wrap(wrap);
    width: 100%;
}

.pic-column {
    @include flex(none);
    width: 50%;
    padding: 5px;
}

.pic-container {
    @include flex-shrink(0);
    @include flex-basis(50%);
    background:#FFFFFF;
    position: relative;
    overflow: hidden;

    img {
        width: 100%;
    }
}

@media #{$small-and-down} {
    .pic-column {
        @include flex(1 0 auto);
        width: 100%;
        padding: 0;
    }
}


.VueCarousel-wrapper {
    box-shadow: 0 10px 20px 0 rgba(0, 0, 0, 0.1)
}
</style>
