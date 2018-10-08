<script>
// import SocialSharing from 'vue-social-sharing'
// import IconFacebook from '@/components/icons/IconFacebook'
// import IconGooglePlus from '@/components/icons/IconGooglePlus'
// import IconTwitter from '@/components/icons/IconTwitter'
// import IconPinterest from '@/components/icons/IconPinterest'

// Vue.use(SocialSharing)

export default {
    // components: {
    //     IconFacebook,
    //     IconGooglePlus,
    //     IconTwitter,
    //     IconPinterest
    // },
}
</script>


<template>
    <div>
        <div class="prod-container">
            <div class="is-half">
                <div class="image phm">
                    <slot name="pics"></slot>
                </div>
            </div>

            <div class="is-half phxl">
                <div>
                    <slot name="description"></slot>
                </div>

                <div class="fs20">
                    <slot name="price"></slot>
                </div>

                <div class="pvl"><hr></div>

                <!-- Size -->
                <div class="inlineBlock vat mbl" style="padding-right:40px;">
                    <slot name="size"></slot>
                </div>

                <!-- quantity -->
                <div class="inlineBlock vat mbl">
                    <slot name="quantity"></slot>
                </div>

                <div>
                    <slot name="button"></slot>
                </div>
            </div>
        </div>

        <div>
            <slot name="under"></slot>
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

.social {
    margin-top: 40px;
    text-align: center;
}

@media #{$medium-and-up} {
    .social {
        margin-top: 0;
        text-align: right;
    }
}
</style>
