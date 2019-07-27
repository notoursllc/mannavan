import Vue from 'vue';
import Element from 'element-ui/lib/element-ui.common';
import locale from 'element-ui/lib/locale/lang/en';

import {
    Alert,
    Breadcrumb,
    BreadcrumbItem,
    Button,
    ButtonGroup,
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
    MessageBox,
    Notification,
    Option,
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


export default () => {
    Vue.use(Element, { locale });

    Vue.use(Alert);
    Vue.use(Breadcrumb);
    Vue.use(BreadcrumbItem);
    Vue.use(Button);
    Vue.use(ButtonGroup);
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
    Vue.prototype.$notify = Notification;
    Vue.prototype.$loadingService = Loading.service;
}
