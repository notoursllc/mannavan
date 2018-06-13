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
        <svg 
            version="1.1" 
            xmlns="http://www.w3.org/2000/svg" 
            xmlns:xlink="http://www.w3.org/1999/xlink" 
            viewBox="0 0 16 16"
            role="presentation">
            <title :id="iconName" lang="en">{{iconName}} icon</title>
            <g :fill="fillColor">
                <path d="M15.5,1H6.4C6.1,1,6,1.2,6,1.4l0,0v3.2H0.7c-0.4,0-0.6,0.3-0.6,0.6l0,0v9.1c0,0.4,0.3,0.6,0.6,0.6h9.1
                    c0.4,0,0.6-0.3,0.6-0.6V11h5.1c0.2,0,0.4-0.2,0.4-0.4V1.4C15.9,1.2,15.7,1,15.5,1z M9.2,13.7H1.3V8.6h7.9V13.7z M15.1,10.1h-4.6
                    V5.2c0-0.4-0.3-0.6-0.6-0.6h-3V1.8h8.3V10.1z"/>
            </g>
        </svg>
    </i>
</template>
