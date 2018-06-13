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
                <path d="M14.4,0.1H1.6c-0.8,0-1.5,0.7-1.5,1.5v12.9c0,0.8,0.7,1.5,1.5,1.5h12.9c0.8,0,1.5-0.7,1.5-1.5V1.6
                    C15.9,0.7,15.3,0.1,14.4,0.1z M12.2,10.3c0.5,0.5,0.5,1.4,0,1.9s-1.4,0.5-1.9,0L8,9.9l-2.3,2.3c-0.5,0.5-1.4,0.5-1.9,0
                    s-0.5-1.4,0-1.9L6.1,8L3.8,5.7c-0.5-0.5-0.5-1.4,0-1.9s1.4-0.5,1.9,0L8,6.1l2.3-2.3c0.5-0.5,1.4-0.5,1.9,0s0.5,1.4,0,1.9L9.9,8
                    L12.2,10.3z"/>
            </g>
        </svg>
    </i>
</template>
