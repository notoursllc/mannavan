<script>
import svg_icon_mixin from '@/mixins/svg_icon_mixin';

export default {
    mixins: [
        svg_icon_mixin
    ]
}
</script>

<template>
    <icon-base viewBox="0 0 64 64" :width="width" :height="height" :class-name="className" :icon-name="iconName">
        <path style="fill:none;stroke:#727272;stroke-width:0.25;" d="M4,7.6l3.8,11.8l4.7,1.5c0,0,1.2,14.6,1,21.8c-0.2,7.3-1,19.9-1,19.9
            H51c0,0-0.4-15-0.5-19.6c-0.1-4.6,0.6-22,0.6-22l4.5-1.8l4-11.5c0,0-8.7-4.5-10.4-5c-1.6-0.5-9.6-2.1-9.6-2.1s-3.2,1.2-7.7,1.2
            c-4.5,0-8-1.1-8-1.1S16.9,2,14.6,2.5C12.2,3.1,4,7.6,4,7.6z"/>
        <path style="fill:none;stroke:#727272;stroke-width:0.25;" d="M49.3,2.7c0,0-1.1,5.9-0.8,10.1c0.4,5,2.6,8.2,2.6,8.2"/>
        <path style="fill:none;stroke:#727272;stroke-width:0.25;" d="M14.6,2.5c0,0,1.1,5.9,0.8,10.1c-0.4,5-2.7,8.3-2.7,8.3"/>
        <path style="fill:none;stroke:#727272;stroke-width:0.25;" d="M23.8,0.7c0,0,0.4,7.1,8,7.1s7.7-7.1,7.7-7.1"/>
        <path style="fill:none;stroke:#727272;stroke-width:0.25;" d="M24.1,2c0,0,3.1,0.9,8,0.9c4.9,0,7.3-1,7.3-1"/>
        <path style="fill:none;stroke:#727272;stroke-width:0.25;" d="M22.8,0.9c0,2.5,2.1,8.3,9,8.3c7.8,0,9-7.1,9-8.4"/>
        <line style="fill:none;stroke:#727272;stroke-width:0.25;" x1="12.7" y1="60.7" x2="51" y2="60.7"/>
        <line style="fill:none;stroke:#727272;stroke-width:0.25;" x1="5.2" y1="7.1" x2="9.4" y2="19.9"/>
        <line style="fill:none;stroke:#727272;stroke-width:0.25;" x1="58.2" y1="7.1" x2="54.1" y2="19.9"/>
        <polygon style="fill:#F05423;" points="58.7,10.5 48.8,6.1 49.3,2.7 59.7,7.8 	"/>
    </icon-base>
</template>
