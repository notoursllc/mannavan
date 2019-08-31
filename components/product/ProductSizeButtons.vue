<script>
import product_mixin from '@/mixins/product_mixin';

export default {
    name: 'ProductSizeButtons',

    props: {
        value: {
            type: String
        },

        product: {
            type: Object,
            required: true
        }
    },

    mixins: [
        product_mixin
    ],

    data() {
        return {

        }
    },

    computed: {
        sizeOptions() {
            let opts = this.buildSizeOptions(this.product);
            return opts.sizeOpts;
        }
    },

    methods: {
        onSizeClick(size) {
            this.$emit('input', size)
        }
    }
}
</script>


<template>
    <div class="btn-size-container">
        <el-button
            class="btn-size"
            :type="value === size ? 'primary' : 'plain'"
            v-for="size in sizeOptions"
            :key="size"
            @click="onSizeClick(size)">{{ $t(size) }}</el-button>
    </div>
</template>

<style lang="scss" scoped>
@import "~assets/css/components/_mixins.scss";

.btn-size-container {
    @include flexbox();
    @include flex-direction(row);
    @include justify-content(flex-start);
    @include align-items(flex-start);
    @include flex-wrap(wrap);
}

.btn-size {
    margin: 0 7px 7px 0;
    min-width: 75px;
}
.btn-size:last-child {
    margin-right: 0;
}
</style>

