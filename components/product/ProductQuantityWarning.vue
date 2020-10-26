<script>
import IconMessage from '@/components/IconMessage';

export default {
    name: 'ProductQuantityWarning',

    components: {
        IconMessage
    },

    props: {
        qty: {
            type: Number,
            default: 0
        },

        threshold: {
            type: Number,
            default: 10
        }
    },

    computed: {
        message() {
            if(this.qty === 0) {
                return this.$t('Sold out');
            }
            return this.$t('Just a few left. Order soon.');
        }
    }
};
</script>


<template>
    <icon-message
        v-if="qty <= threshold"
        class="colorOrange">
        <template v-slot:icon>
            <fig-icon icon="urgent" width="28" height="28" stroke="#fd7e14" :stroke-width="1" />
        </template>
        {{ message }}
    </icon-message>
</template>
