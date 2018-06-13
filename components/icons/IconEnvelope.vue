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
                <path d="M15.43,2.7H.57a.5.5,0,0,0-.51.5v9.6a.5.5,0,0,0,.51.5H15.43a.5.5,0,0,0,.51-.5V3.2A.5.5,0,0,0,15.43,2.7ZM8,8.26,2.06,3.71H13.94ZM5.36,7.52,1.08,11.81V4.23Zm.54.42L7.69,9.31a.53.53,0,0,0,.62,0L10.1,7.94l4.35,4.35H1.55Zm4.74-.42,4.28-3.29v7.58Z"/>
            </g>
        </svg>
    </i>
</template>
