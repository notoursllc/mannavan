<script>
import isObject from 'lodash.isobject';
import { isUuid4 } from '@/utils/common';

export default {
    name: '',

    props: {
        variant: {
            type: Object,
            default: () => {
                return {};
            }
        }
    },

    computed: {
        accentMessage() {
            const now = Date.now();
            let msg = null;

            if(isObject(this.variant) && this.variant.accent_message_id) {
                // if accent_message_id is a UUID then we need to get the actual
                // message from the list of all messages in Vuex

                if(isUuid4(this.variant.accent_message_id)) {
                    msg = this.$store.state.product.skuAccentMessages[this.variant.accent_message_id] || null;
                }
                else {
                    msg = this.variant.accent_message_id;
                }

                if(!msg) {
                    return null;
                }

                // checking for begin or end date display restrictions
                if(this.variant.accent_message_begin || this.variant.accent_message_end) {
                    // if the begin time has not been reached yet
                    // or the end time is in the past
                    // then we can't set the message
                    if( (this.variant.accent_message_begin && new Date(this.variant.accent_message_begin).getTime() > now)
                        || (this.variant.accent_message_end && new Date(this.variant.accent_message_end).getTime() < now) ) {
                        return null;
                    }
                }
            }

            return msg;
        }
    }
};
</script>


<template>
    <span v-if="accentMessage">{{ accentMessage }}</span>
</template>
