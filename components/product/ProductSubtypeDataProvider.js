export default {
    props: {
        subtype: {
            type: Number
        },

        sort: {
            type: String,
            default: 'updated_at:desc',
        },

        withRelated: {
            type: String,
            default: '*'
        }
    },

    data() {
        return {
            products: null,
            loading: true
        }
    },

    async created() {
        try {
            this.loading = true;

            const response = await this.$api.product.list({
                published: true,
                _sort: this.sort,
                _withRelated: this.withRelated,
                sub_type: { bitwise_and_gt: { left: this.subtype, right: 0 } }
            });

            this.products = response.data;
            this.loading = false;
        }
        catch(err) {
            console.error('Error getting products', err);
        }
    },

    render() {
        const slot = this.$scopedSlots.default({
            loading: this.loading,
            products: this.products
        });

        return Array.isArray(slot) ? slot[0] : slot;
    }
};
