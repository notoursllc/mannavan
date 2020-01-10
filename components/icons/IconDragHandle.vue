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
        <g>
            <circle cx="4.5" cy="13.8" r="1.9"/>
            <circle cx="11.5" cy="13.8" r="1.9"/>
        </g>
        <g>
            <circle cx="4.5" cy="7.9" r="1.9"/>
            <circle cx="11.5" cy="7.9" r="1.9"/>
        </g>
        <g>
            <circle cx="4.5" cy="2.2" r="1.9"/>
            <circle cx="11.5" cy="2.2" r="1.9"/>
        </g>
    </icon-base>
</template>
