<script>
export default {
    props: {
        type: {
            type: String,
            required: false,
            default: 'primary'
        },
        column: {
            type: Number,
            required: false,
            default: 1
        }
    },

    computed: {
        /**
         * Returns the element-ui button types:
         * https://element.eleme.io/#/en-US/component/button
         */
        buttonType() {
            switch(this.type) {
                case 'edit':
                case 'save':
                    return 'primary'

                case 'delete':
                    return 'danger'

                case 'cancel':
                    return null;

                default:
                    return 'success';
            }
        },

        /**
         * Returns the element-ui icon class names:
         * https://element.eleme.io/#/en-US/component/icon
         */
        iconClass() {
            switch(this.type) {
                case 'edit':
                    return 'el-icon-edit';

                case 'save':
                    return 'el-icon-s-claim';

                case 'delete':
                    return 'el-icon-delete';

                case 'cancel':
                    return 'el-icon-close';

                default:
                    return 'el-icon-plus';
            }
        },

        buttonClass() {
            if(this.type === 'cancel' || this.column === 2) {
                return 'fab2'
            }
        }
    },

    methods: {
        onclick() {
            this.$emit('click')
        }
    }
}
</script>

<template>
    <el-button
        :type="buttonType"
        :icon="iconClass"
        round
        @click="onclick"
        class="fab"
        :class="buttonClass" />
</template>


<style lang="scss" scoped>
@import "~assets/css/components/_variables.scss";

.fab {
    z-index: 1;
    position: fixed;
    bottom: 20px;
    right: 20px;
    font-size: 25px;
    border-radius: 50%;
    padding: 17px;
}

.fab2 {
    right: 100px;
}
</style>
