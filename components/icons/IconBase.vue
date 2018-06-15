

<script>
import svg_icon_mixin from '@/mixins/svg_icon_mixin';


export default {
    props: {
        viewBox: {
            type: String,
            default: '0 0 16 16'
        },
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

    // mixins: [
    //     svg_icon_mixin
    // ]
}
</script>

<template>
    <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        :viewBox="viewBox"
        :style="{'width':width, 'height':height}"
        role="presentation">
        <title :id="iconName" lang="en">{{iconName}} icon</title>
        <g :class="className">
            <slot></slot>
        </g>
    </svg>
</template>

<style scoped>
svg {
  display: inline-block;
  vertical-align: baseline;
  margin-bottom: -2px; /* yes, I'm that particular about formatting */
}
</style>
