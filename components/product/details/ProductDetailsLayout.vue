<script>
// import SocialSharing from 'vue-social-sharing'
// import IconFacebook from '@/components/icons/IconFacebook'
// import IconGooglePlus from '@/components/icons/IconGooglePlus'
// import IconTwitter from '@/components/icons/IconTwitter'
// import IconPinterest from '@/components/icons/IconPinterest'

// Vue.use(SocialSharing)

export default {
    name: 'ProductDetailsLayout',

    components: {
        FormRow: () => import('@/components/FormRow')
    },
}
</script>


<template>
    <div>
        <div class="prod-container">
            <div class="is-half">
                <div class="prod-image">
                    <slot name="pics"></slot>
                </div>
            </div>

            <div class="is-half phxl">
                <div class="fs20 pbm">
                    <slot name="title"></slot>
                </div>

                <div>
                    <slot name="description"></slot>
                </div>

                <div>
                    <slot name="artist"></slot>
                </div>

                <div class="fs20">
                    <slot name="price"></slot>
                </div>

                <hr>

                <div class="pbl">
                    <div class="displayTable widthAll">
                        <!-- Size -->
                        <form-row>
                            <template slot="label">{{ $t('Size') }}:</template>
                            <template slot="value">
                                <slot name="size"></slot>
                            </template>
                        </form-row>

                        <!-- Quantity -->
                        <form-row>
                            <template slot="label">{{ $t('Quantity') }}:</template>
                            <template slot="value">
                                <slot name="quantity"></slot>
                            </template>
                        </form-row>
                    </div>
                </div>

                <!-- button -->
                <div class="tac">
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

.prod-image {
    position: relative;
}

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
