'use strict';

export default {
    props: {
        iconName: {
            type: String,
            default: 'box'
        },
        iconColor: {
            type: String,
        },
        width: {
            type: [String],
            // default: '18px'
        },
        height: {
            type: [String],
            // default: '18px'
        },
        className: {
            type: [String],
        }
    },
    computed: {
        fillColor() {
            return this.iconColor || '#4a4a4a'
        }
    }
}
