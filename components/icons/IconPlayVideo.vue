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
                <path d="M8 0c-4.418 0-8 3.582-8 8s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8zM8 14.5c-3.59 0-6.5-2.91-6.5-6.5s2.91-6.5 6.5-6.5 6.5 2.91 6.5 6.5-2.91 6.5-6.5 6.5zM6 4.5l6 3.5-6 3.5z"></path>
            </g>
        </svg>
    </i>
</template>
