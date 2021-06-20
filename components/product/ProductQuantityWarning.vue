<script>
import { FigIconLabel } from '@notoursllc/figleaf';

export default {
    name: 'ProductQuantityWarning',

    components: {
        FigIconLabel
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
    <fig-icon-label
        v-if="qty <= threshold"
        class="colorOrange">
        <template v-slot:left>
            <fig-icon icon="urgent" width="28" height="28" stroke="#fd7e14" :stroke-width="1" />
        </template>
        {{ message }}
    </fig-icon-label>
</template>
