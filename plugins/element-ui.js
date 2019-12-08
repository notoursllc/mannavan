import Vue from 'vue';
import Element from 'element-ui/lib/element-ui.common';
import locale from 'element-ui/lib/locale/lang/en';
import isObject from 'lodash.isobject'

import {
    Alert,
    Breadcrumb,
    BreadcrumbItem,
    Button,
    ButtonGroup,
    Card,
    Checkbox,
    Dialog,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    Image,
    Input,
    InputNumber,
    Loading,
    Menu,
    MenuItem,
    Message,
    MessageBox,
    Option,
    Popconfirm,
    Popover,
    Radio,
    RadioGroup,
    Select,
    Submenu,
    Table,
    TableColumn,
    Tabs,
    TabPane,
    Tooltip,
    Upload
} from 'element-ui';


export default ({ store }) => {
    Vue.use(Element, { locale });

    Vue.use(Alert);
    Vue.use(Breadcrumb);
    Vue.use(BreadcrumbItem);
    Vue.use(Button);
    Vue.use(ButtonGroup);
    Vue.use(Card);
    Vue.use(Checkbox);
    Vue.use(Dialog);
    Vue.use(Dropdown);
    Vue.use(DropdownItem);
    Vue.use(DropdownMenu);
    Vue.use(Image);
    Vue.use(Input);
    Vue.use(InputNumber);
    Vue.use(Loading.directive);
    Vue.use(Menu);
    Vue.use(MenuItem);
    Vue.use(Option);
    Vue.use(Popconfirm);
    Vue.use(Popover);
    Vue.use(Radio);
    Vue.use(RadioGroup);
    Vue.use(Select);
    Vue.use(Submenu);
    Vue.use(Table);
    Vue.use(TableColumn);
    Vue.use(Tabs);
    Vue.use(TabPane);
    Vue.use(Tooltip);
    Vue.use(Upload);

    Vue.prototype.$confirm = MessageBox.confirm;
    Vue.prototype.$loadingService = Loading.service;


    Vue.prototype.$successMessage = function(message, config) {
        let cfg = Object.assign({
            message: message,
            showClose: false,
            duration: 5000
        }, config);

        openMessage('success', cfg);
    }

    Vue.prototype.$errorMessage = function(message, config) {
        let cfg = Object.assign({
            message: message,
            showClose: true,
            duration: 0
        }, config);

        openMessage('error', cfg);
    }


    async function openMessage(type, config) {
        // this is my own attribute, it shouldn't get passed to element-ui:
        if(config.hasOwnProperty('closeOthers')) {
            if(config.closeOthers) {
                await store.dispatch('ui/CLOSE_MESSAGE_INSTANCES');
            }

            delete config.closeOthers;
        }

        let messageInstance = Message[type](config);

        if(config.duration === 0) {
            store.dispatch('ui/ADD_MESSAGE_INSTANCE', messageInstance);
        }
    }
}
