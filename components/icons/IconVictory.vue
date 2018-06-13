<script>
import svg_icon_mixin from '@/mixins/svg_icon_mixin';

export default {
    mixins: [
        svg_icon_mixin
    ]
}
</script>

<template>
    <i class="inlineBlock" :style="{'width':width, 'height':height}">
        <svg xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            style="enable-background:new 0 0 63.3 30.4;"
            viewBox="0 0 63.3 30.4"
            preserveAspectRatio="xMidYMid meet"
            :aria-labelledby="iconName"
            role="presentation">
            <title :id="iconName" lang="en">{{iconName}} icon</title>
            <g :fill="fillColor">
                <path d="M59.2,0c-2.4,0-4.3,1.9-4.3,4.3c0,0.1,0,0.2,0,0.4l-8.8,8.8c0.3,1.3,0.5,2.6,0.5,3.9c0,1.4-0.2,2.7-0.5,4
                    L58.8,8.7h0.4c2.4-0.1,4.2-2.1,4.1-4.5C63.2,1.9,61.4,0.1,59.2,0L59.2,0z M59.2,5.6c-0.7,0-1.3-0.6-1.3-1.3s0.6-1.3,1.3-1.3
                    s1.3,0.6,1.3,1.3C60.5,5,59.9,5.6,59.2,5.6C59.2,5.6,59.2,5.6,59.2,5.6L59.2,5.6z"/>
                <path d="M31.8,4.6c-6.2,0-11.5,4.5-12.7,10.6L8.7,4.7c0-0.1,0-0.2,0-0.4C8.7,2,6.7,0,4.3,0C1.9,0,0,2,0,4.4
                    c0,2.4,1.9,4.3,4.3,4.3c0,0,0,0,0,0h0.4l17.7,17.7l0.5,0.5L23,27l0,0c5.2,4.9,13.4,4.6,18.3-0.7S45.8,12.9,40.6,8
                    C38.2,5.8,35.1,4.5,31.8,4.6z M3.1,4.4c0.1-0.7,0.7-1.2,1.4-1.2c0.6,0.1,1.1,0.5,1.2,1.2C5.7,5,5.2,5.7,4.5,5.7S3.2,5.3,3.1,4.6
                    C3.1,4.5,3.1,4.4,3.1,4.4z M31.8,24.8c-1.8,0-3.6-0.7-4.9-1.9l-0.5-0.5c-2.7-3-2.5-7.6,0.5-10.4s7.6-2.5,10.4,0.5
                    c2.7,3,2.5,7.6-0.5,10.4C35.4,24.1,33.6,24.8,31.8,24.8z"/>
            </g>
        </svg>
    </i>
</template>
