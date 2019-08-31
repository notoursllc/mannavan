<script>
import Vue from 'vue'
import VueImg from 'v-img'
import { Carousel, Slide } from 'vue-carousel'

Vue.use(VueImg, {
    altAsTitle: true,
    sourceButton: false, // Display 'download' button near 'close' that opens source image in new tab
    openOn: 'click', // Event listener to open gallery will be applied to <img> element
    thumbnails: false
});


export default {
    props: {
        product: {
            type: Object,
        }
    },

    components: {
        Carousel,
        Slide
    },

    data() {
        return {
            productPics: []
        }
    },

    methods: {
        getLargePic: function(index) {
            if (Array.isArray(this.product.pics) && this.product.pics[index]) {
                if(Array.isArray(this.product.pics[index].pic_variants) && this.product.pics[index].pic_variants.length) {
                    return this.product.pics[index].pic_variants[0].url;
                }
                return this.product.pics[index].url;
            }

            return null;
        },

        loadPics() {
            if (Array.isArray(this.product.pics)) {
                const pics = [];

                this.product.pics.forEach((obj) => {
                    pics.push(obj.url)
                });

                this.productPics = pics;
            }
        }
    },

    created() {
        this.$watch('product', prod => {
            if(prod) {
                this.loadPics();
            }
        }, {immediate: true})
    }
}
</script>


<template>
    <div>
        <div v-if="product">
            <client-only :placeholder="$t('Loading pictures...')">
                <carousel :autoplay="true"
                            :autoplayHoverPause="true"
                            :navigationEnabled="!!productPics.length"
                            :perPage="1"
                            :loop="true"
                            paginationColor="#cacac8"
                            paginationActiveColor="#e66d17">
                    <slide v-for="(pic, key) in productPics" :key="key">
                        <img :src="pic"
                            :alt="product.title"
                            v-img="{group:'prod', src:getLargePic(key)}" />
                    </slide>
                </carousel>
            </client-only>
        </div>
    </div>
</template>


<style lang="scss">
    .VueCarousel-wrapper {
        box-shadow: 0 10px 20px 0 rgba(0, 0, 0, 0.1)
    }
</style>
