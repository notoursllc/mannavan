import Vue from 'vue';

import {
    FigBadge,
    FigButton,
    FigCol,
    FigFormSelect,
    FigIcon,
    FigIconSprite,
    FigOverlay,
    FigPopover,
    FigRow,
    FigTooltip,
    FigVictoryIcon
} from '@notoursllc/figleaf';


export default () => {
    Vue.component('fig-badge', FigBadge);
    // Vue.component('fig-button', FigButton);
    Vue.component('fig-col', FigCol);
    Vue.component('fig-form-select', FigFormSelect);
    Vue.component('fig-icon', FigIcon);
    Vue.component('fig-icon-sprite', FigIconSprite);
    Vue.component('fig-overlay', FigOverlay);
    Vue.component('fig-popover', FigPopover);
    Vue.component('fig-row', FigRow);
    Vue.component('fig-tooltip', FigTooltip);
    Vue.component('fig-victory-icon', FigVictoryIcon);
};
