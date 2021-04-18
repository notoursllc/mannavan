<script>
import { getSmallestProductVariantCoverImage, getProductVariantCoverImage } from '@/utils/product';

export default {
    name: 'ProductVariantCoverImage',

    props: {
        variant: {
            type: Object,
            default: null
        },

        smallest: {
            type: Boolean,
            default: false
        },

        width: {
            type: Number,
            default: 75
        }
    },

    computed: {
        productPicUrl() {
            const obj = this.smallest
                ? getSmallestProductVariantCoverImage(this.variant)
                : getProductVariantCoverImage(this.variant, this.width);

            return obj.url;
        }
    },

    render(h) {
        const config = {};

        if(this.productPicUrl) {
            config.attrs = {
                src: this.productPicUrl
            };
        }

        return h(
            config.attrs ? 'img' : null,
            config
        );
    }
};
</script>
