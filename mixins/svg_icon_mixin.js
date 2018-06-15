'use strict';

import IconBase from '@/components/icons/IconBase';

export default {
    props: {
        width: {
            type: String
        },
        height: {
            type: String
        },
        className: {
            type: String,
            default: 'fillGray'
        },
        iconName: {
            type: String
        }
    },

    components: {
        IconBase
    },
}
