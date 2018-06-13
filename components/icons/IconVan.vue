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
                <path d="M15.1,10.7V6.7l-2.6-2.6h-1.7V2H0.1v2.1h3.8v0.5H0.1V6H6v0.5H0.1V8h8.7v0.5H0.1v3.3h1.5c0,0,0,0.1,0,0.1
                    c0,1.2,1.1,2.2,2.3,2.2c1.2,0,2.1-1,2.2-2.2c0,0,0-0.1,0-0.1h3.3c0,0,0,0.1,0,0.1c0,1.2,1.1,2.2,2.3,2.2c1.2,0,2.1-1,2.2-2.2
                    c0,0,0-0.1,0-0.1h2v-1.1L15.1,10.7L15.1,10.7z M3.9,13.2c-0.7,0-1.3-0.6-1.3-1.3c0-0.7,0.6-1.3,1.3-1.3s1.3,0.6,1.3,1.3
                    c0,0,0,0,0,0C5.1,12.6,4.6,13.2,3.9,13.2L3.9,13.2z M11.6,13.2c-0.7,0-1.3-0.6-1.3-1.3c0-0.7,0.6-1.3,1.3-1.3
                    c0.7,0,1.3,0.6,1.3,1.3c0,0,0,0,0,0C12.9,12.6,12.3,13.2,11.6,13.2C11.7,13.2,11.6,13.2,11.6,13.2z M13.8,8.2h-3v-3h1.2l0,0l0,0
                    l1.8,1.8V8.2z"/>
            </g>
        </svg>
    </i>
</template>
