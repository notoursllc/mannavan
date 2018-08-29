<script>
import Vue from 'vue'
import Promise from 'bluebird';
import isObject from 'lodash.isobject'
import _forEach from 'lodash.foreach'
import { Select, Option, InputNumber, Notification, Button, Loading } from 'element-ui'
import VueImg from 'v-img'
import { Carousel, Slide } from 'vue-carousel'
import SocialSharing from 'vue-social-sharing'
import ProductPrice from '@/components/product/ProductPrice'
import NumberButtons from '@/components/NumberButtons'
import IconFacebook from '@/components/icons/IconFacebook'
import IconGooglePlus from '@/components/icons/IconGooglePlus'
import IconTwitter from '@/components/icons/IconTwitter'
import IconPinterest from '@/components/icons/IconPinterest'
import IconCap from '@/components/icons/IconCap'
import product_mixin from '@/mixins/product_mixin'
import app_mixin from '@/mixins/app_mixin'
import shopping_cart_mixin from '@/mixins/shopping_cart_mixin'


Vue.use(Select);
Vue.use(Option);
Vue.use(InputNumber);
Vue.use(Button);
Vue.use(Loading.directive)
Vue.use(SocialSharing)
Vue.use(VueImg, {
    altAsTitle: true,
    sourceButton: false, // Display 'download' button near 'close' that opens source image in new tab
    openOn: 'click', // Event listener to open gallery will be applied to <img> element
    thumbnails: false
});

Vue.prototype.$notify = Notification;
let currentNotification = null;


function showNotification(Notification) {
    if(currentNotification) {
        currentNotification.close();
    }

    currentNotification = Notification
}


export default {
    components: {
        ProductPrice,
        NumberButtons,
        Carousel,
        Slide,
        IconFacebook,
        IconGooglePlus,
        IconTwitter,
        IconPinterest
    },

    data() {
        return {
            product: null,
            sizeOptions: [],
            productPics: [],
            selectedSize: null,
            selectedQty: 1,
            isLoading: false,
            siteUrl: this.getSiteUrl(true),
            pageUrl: `${this.getSiteUrl(true)}${this.$route.fullPath}`,
            twitterUser: this.getTwitterUser()
        }
    },

    mixins: [
        product_mixin,
        app_mixin,
        shopping_cart_mixin
    ],

    computed: {
        productTitle() {
            return this.product ? this.product.title : '';
        },
        productDesc() {
            return this.product ? this.product.description_long : '';
        },
        mediaPicture() {
            return `${this.siteUrl}${this.productPics[0]}`
        }
    },

    async asyncData({ params, store, app }) {
        try {
            const data = {};
            data.product = await product_mixin.methods.getProductBySeoUri.call(app, params.seouri);

            if(!data.product) {
                return;
            }

            const pics = [];

            let opts = product_mixin.methods.buildSizeOptions(data.product);
            data.sizeOptions = opts.sizeOpts;

            if (Array.isArray(data.product.pics)) {
                data.product.pics.forEach((obj) => {
                    pics.push(obj.url)
                });

                data.productPics = pics;
            }

            store.dispatch('ui/pageTitle', data.product.title);

            return data;
        }
        catch(err) {
            console.log("Error getting product", err)
        }
    },

    methods: {
        addToCart: async function() {
            if (!this.selectedSize) {
                showNotification(
                    this.$notify({
                        type: 'error',
                        title: this.$t('Please select a size'),
                        message: this.$t('We want to make sure it fits!'),
                        duration: 0
                    })
                )
            }
            else if (!this.selectedQty) {
                showNotification(
                    this.$notify({
                        type: 'error',
                        title: this.$t('Please select a quantity'),
                        message: this.$t('Thanks!'),
                        duration: 0
                    })
                )
            }
            else {
                this.isLoading = true;

                try {
                    const response = await this.addItem({
                        id: this.product.id,
                        options: {
                            size: this.selectedSize,
                            qty: this.selectedQty
                        }
                    });
                    this.setCartAndTokenStateFromResponse(response);

                    this.isLoading = false;
                    this.goToCart();
                    return;
                }
                catch(err) {
                    this.isLoading = false;

                    showNotification(
                        this.$notify({
                            type: 'error',
                            title: this.$t('Error'),
                            message: err.response.data.message,
                            duration: 0
                        })
                    )
                }
            }
        },

        goToCart: function() {
            // this.$router.push(`/cart/${this.product.id}`);
            this.$router.push({
                name: 'cart-id',
                params: { id: this.product.id }
            });
        },

        getLargePic: function(index) {
            if (Array.isArray(this.product.pics) && this.product.pics[index]) {
                if(Array.isArray(this.product.pics[index].pic_variants) && this.product.pics[index].pic_variants.length) {
                    return this.product.pics[index].pic_variants[0].url;
                }
                return this.product.pics[index].url;
            }

            return null;
        }
    },

    created() {
        if(!this.product) {
            showNotification(
                this.$notify({
                    type: 'error',
                    title: this.$t('Product not found'),
                    // message: null,
                    duration: 0
                })
            )
        }
    },

    head() {
        return {
            title: this.productTitle,
            meta: [
                { vmid: 'description', name: 'description', content: this.productDesc },
                { name: 'og:site_name', content: this.getSiteName() },
                { name: 'og:url', content: this.$route.fullPath },
                { name: 'og:title', content: this.productTitle },
                { name: 'og:type', content: 'website' },
                { name: 'og:image', content: this.mediaPicture },
                { name: 'og:description', content: this.product ? this.product.description_long: '' },
            ]
        }
    }
}
</script>


<template>
    <div class="pageContainerMax">
        <div v-if="this.product">
                <div class="prod-container">
                    <div class="is-half">
                        <div class="image phm">
                            <no-ssr :placeholder="$t('Loading pictures...')">
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
                            </no-ssr>
                        </div>
                    </div>

                    <div class="is-half phxl">
                        <!-- <div class="fs30 mbm">{{ product.title }}</div> -->

                        <div class="pbl fs16">{{ product.description_long }}</div>

                        <div class="fs20">
                            <product-price :product="product"></product-price>
                        </div>

                        <div class="pvl"><hr></div>

                        <!-- Size -->
                        <div class="inlineBlock vat mbl" style="padding-right:40px;">
                            <div class="fwb">{{ $t('Size') }}</div>
                            <el-select v-model="selectedSize"
                                    :no-data-text="$t('Sorry this item does not have any sizes available')"
                                    placeholder="Select"
                                    class="width125">
                                <el-option
                                        v-for="size in sizeOptions"
                                        :key="size"
                                        :label="$t(size)"
                                        :value="size">
                                </el-option>
                            </el-select>
                        </div>

                        <!-- quantity -->
                        <div class="inlineBlock vat mbl">
                            <div class="fwb">{{ $t('Quantity') }}</div>
                            <div>
                                <div class="displayTableCell prl fs20 vam colorGreen fw600">{{ selectedQty }}</div>
                                <div class="displayTableCell">
                                    <number-buttons :step="1"
                                                    :min="1"
                                                    :max="product.inventory_count"
                                                    :init-value="1"
                                                    v-on:change="val => { selectedQty = val }"></number-buttons>
                                </div>
                            </div>
                        </div>

                        <div class="ptl">
                            <el-button type="success"
                                    @click="addToCart"
                                    :loading="isLoading"
                                    round>{{ $t('ADD TO CART') }}</el-button>
                        </div>
                    </div>
                </div>

                <div class="social">

                    <!-- <social-sharing :url="siteUrl + '/product/share?id=' + product.id" -->
                    <!-- <social-sharing :url="pageUrl"
                                    :title="product.title"
                                    :description="product.title"
                                    hashtags="breadVan"
                                    :twitter-user="twitterUser"
                                    :media="mediaPicture"
                                    inline-template>
                        <div>
                            <network network="facebook">
                                <icon-facebook icon-name="facebook" width="40px" height="40px" />
                            </network>
                            <network network="googleplus">
                                <icon-google-plus icon-name="google-plus" width="40px" height="40px" />
                            </network>
                            <network network="pinterest">
                                <icon-pinterest icon-name="google-plus" width="25px" />
                            </network>
                            <network network="twitter">
                                <icon-twitter icon-name="google-plus" width="25px" />
                            </network>
                        </div>
                    </social-sharing> -->
                </div>
        </div>
    </div>
</template>


<style lang="scss">
@import '~assets/css/components/_variables.scss';
@import "~assets/css/components/_mixins.scss";


.prod-container {
    @include flexbox();
    @include flex-wrap(wrap);
}
.is-half {
    @include flex(none);
    width: 50%;
}

@media #{$medium-and-down} {
    .prod-container {
        display: block;
    }
    .is-half {
        @include flex(1 0 auto);
        width: 100%;
    }
}

.prod-attributes-table {
    padding-top: 10px;

    .row {
        display: table-row;
    }

    .label {
        display: table-cell;
        padding: 0 20px 10px;
        font-weight: bold;
    }

    .value {
        display: table-cell;
        padding-bottom: 10px;
    }
}

.social {
    margin-top: 40px;
    text-align: center;
}

.VueCarousel-wrapper {
    box-shadow: 0 10px 20px 0 rgba(0, 0, 0, 0.1)
}

@media #{$medium-and-up} {
    .social {
        margin-top: 0;
        text-align: right;
    }
}
</style>
