<script>
import svg_icon_mixin from '@/mixins/svg_icon_mixin';

export default {
    mixins: [
        svg_icon_mixin
    ]
}
</script>

<template>
    <icon-base :width="width" :height="height" :class-name="className" :icon-name="iconName">
        <path d="M14.1,9.9c0-0.1-0.1-0.2-0.2-0.2h-2.7c1-1.5,2-3.2,2-4.4c0-2.8-2.2-5.1-5-5.2S3,2.2,2.9,5.1c0,0.1,0,0.1,0,0.2
            c0,1.2,0.9,2.9,2,4.5H2.1C2,9.7,1.9,9.8,1.9,9.9l-1.3,5.7c0,0.1,0,0.1,0,0.2c0,0,0.1,0.1,0.2,0.1h14.2c0.1,0,0.1,0,0.2-0.1
            c0,0,0.1-0.1,0-0.2L14.1,9.9z M8,0.9c2.4,0,4.3,2,4.3,4.3c0,1.9-2.9,5.7-4.3,7.3c-1.4-1.7-4.3-5.4-4.3-7.3C3.6,2.9,5.6,0.9,8,0.9z
            M1.2,15.4l1.1-5.2h2.9c0.8,1.1,1.6,2.2,2.5,3.2c0.1,0.1,0.4,0.2,0.5,0l0,0c0.9-1,1.7-2.1,2.5-3.2h2.9l1.1,5.2H1.2z"/>
        <circle cx="8" cy="5.2" r="1.9"/>
    </icon-base>
</template>
