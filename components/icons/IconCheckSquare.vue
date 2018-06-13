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
                <path d="M14.4,0.1H1.6c-0.8,0-1.5,0.7-1.5,1.5l0,0v12.9c0,0.8,0.7,1.5,1.5,1.5l0,0h12.9c0.8,0,1.5-0.7,1.5-1.5l0,0V1.6
                    C15.9,0.7,15.3,0.1,14.4,0.1L14.4,0.1z M13.3,5.9l-5.7,5.8l0,0c0,0,0,0-0.1,0c-0.4,0.4-1,0.4-1.4,0l0,0L2.7,8.3
                    c-0.4-0.4-0.4-1.1,0-1.6c0.4-0.4,1.1-0.4,1.6,0l0,0l2.6,2.6l4.9-5c0.4-0.4,1.1-0.5,1.6-0.1C13.7,4.6,13.8,5.3,13.3,5.9
                    C13.4,5.8,13.3,5.8,13.3,5.9z"/>
            </g>
        </svg>
    </i>
</template>
