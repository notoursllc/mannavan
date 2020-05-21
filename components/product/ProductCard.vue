<script>
import isObject from 'lodash.isobject';
import product_mixin from '@/mixins/product_mixin';

export default {
    components: {
        ProductColorwayThumbs: () => import('@/components/product/ProductColorwayThumbs')
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
        }
    },

    data() {
        return {
            mouseOverPicUrl: null,
            mouseOverSku: null,
            visibleSku: {}
        };
    },

    computed: {
        productPic() {
            return this.mouseOverPicUrl || this.featuredProductSkuPic(this.product);
        },

        productPrice() {
            return isObject(this.mouseOverSku) ? this.mouseOverSku.base_price : this.product.skus[0].base_price; // todo; convert to dollars
        }
    },

    watch: {
        product: {
            handler(newVal) {
                if(isObject(newVal) && Array.isArray(newVal.skus)) {
                    for(let i=0, l=newVal.skus.length; i<l; i++) {
                        if(newVal.skus[i].published) {
                            this.visibleSku = newVal.skus[i];
                            break;
                        }
                    }
                }

            },
            immediate: true
        }
    },

    methods: {
        onThumbMouseOver(obj) {
            if(isObject(obj)) {
                this.mouseOverPicUrl = obj.image.image_url;
                this.visibleSku = obj.sku;
                // this.mouseOverSku = obj.sku;
            }
        }
    }
};
</script>


<template>
    <figure class="pic-card">
        <el-image
            :src="productPic"
            lazy
            class="image widthAll" />

        <div class="pic-card-content-wrapper">
            <div class="pic-card-title">{{ product.title }}</div>
            <div class="pic-card-subtitle">subtitle</div>
            <div class="pic-card-count-wrapper">
                <product-colorway-thumbs
                    :product="product"
                    @thumbMouseOver="onThumbMouseOver" />
            </div>
            <div class="pic-card-price">${{ visibleSku.base_price }}</div>
        </div>
    </figure>

</template>


<style lang="scss">
    @import "~assets/css/components/_variables.scss";

    .pic-card {
        // background-color: #fff;
        color: #000;
        transition: .3s;
        overflow: hidden;
        position: relative;
        display: block;

        .pic-card-img {
            width: 40px;
            height: 40px;
            background-size: cover;
            background-position: center;
            display: inline-block;
            margin: 0 3px;
        }

        .pic-card-content-wrapper {
            padding: 12px 0 2px;
            // background-color: #fff;
            font-size: 16px;
            font-weight: 500;
            position: relative;
            overflow: hidden;

            .pic-card-alert {
                color: rgb(250, 84, 0);
                font-weight: 400;
            }

            .pic-card-title {
                width: 66%;
            }

            .pic-card-subtitle {
                color: rgb(141,141,141);
                font-size: 16px;
            }

            .pic-card-count-wrapper {
                color: rgb(141,141,141);
                height: 45px;
                margin-top: 10px;
            }

            .pic-card-price {
                position: absolute;
                top: 0;
                right: 0;
                width: 100%;
                padding: 12px 10px 0 0;
                text-align: right;
            }
        }
    }

    // .pic-card-content {
    //     position: absolute;
    //     bottom: 0;
    //     padding: 10px;
    //     background-color: rgba(0,0,0,0.5);
    //     color: #fff;
    //     // height: 40px;
    //     overflow: hidden;
    //     font-size: 14px;
    //     font-weight: 500;
    //     width: 100%;
    // }
</style>
