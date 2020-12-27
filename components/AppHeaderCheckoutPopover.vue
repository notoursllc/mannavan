<script>
import uuid from 'uuid';

import {
    FigButton,
    FigPopover
} from '@notoursllc/figleaf';

export default {
    components: {
        FigButton,
        FigPopover
    },

    data() {
        return {
            uuid: uuid()
        };
    },

    computed: {
        cancelRef() {
            return `btn-cancel-${this.uuid}`;
        },

        popoverRef() {
            return `popover-target-${this.uuid}`;
        }
    },

    methods: {
        onReturnToCartClick() {
            this.hide();
            return this.$router.push({ name: 'cart-id' });
        },

        focusCancelButton(isVisible) {
            if(isVisible) {
                this.$refs[this.cancelRef].$el.focus();
            }
        },

        hide() {
            this.$refs[this.popoverRef].hide();
        }
    }
};
</script>


<template>
    <fig-popover
        placement="top"
        @visible="focusCancelButton"
        :ref="popoverRef">

        <template v-slot:toggler>
            <slot></slot>
        </template>

        <div class="p-2">{{ $t('Are you sure you want to return to your Shopping Cart?') }}</div>

        <div
            slot="footer"
            class="text-center">
            <fig-button
                variant="plain"
                size="sm"
                @click="hide"
                class="mr-1"
                :ref="cancelRef">{{ $t('Stay in checkout') }}</fig-button>

            <fig-button
                variant="primary"
                size="sm"
                @click="onReturnToCartClick">{{ $t('Return to cart') }}</fig-button>
        </div>
    </fig-popover>
</template>
