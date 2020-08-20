<script>
// import SocialSharing from 'vue-social-sharing'
// import IconFacebook from '@/components/icons/IconFacebook'
// import IconGooglePlus from '@/components/icons/IconGooglePlus'
// import IconTwitter from '@/components/icons/IconTwitter'
// import IconPinterest from '@/components/icons/IconPinterest'

// Vue.use(SocialSharing)

export default {
    name: 'ProductDetailsLayout'
};
</script>


<template>
    <div>
        <div class="prod-container">
            <div class="photo-container">
                <slot name="pics"></slot>
            </div>

            <div class="details-container">
                <slot name="info"></slot>
            </div>
        </div>

        <div>
            <slot name="under"></slot>
        </div>
    </div>
</template>


<style lang="scss">
@import '~assets/css/components/_variables.scss';
@import "~assets/css/components/_mixins.scss";

.prod-container {
    @include flexbox();
    // @include flex-wrap(wrap);

}
.photo-container {
    // @include flex(none);
    // width: 50%;
    @include flexbox();
    flex-grow: 3;
    flex-shrink: 1;
    flex-basis: 0%;
    border: 1px solid red;
}
.details-container {
    // @include flex(none);
    // width: 33.33333%;
    // padding: 0 30px;
    // @include flexbox();
    flex-grow: 1;
    flex-shrink: 1;
    flex-basis: 0%;
    padding: 10px 20px;
    border: 1px solid green;
}


@media #{$medium-and-down} {
    .prod-container, .photo-container, .details-container  {
        display: block;
    }

    .details-container {
        padding: 0 5px;
    }
}
</style>
