import Vue from 'vue';
import Bugsnag from '@bugsnag/js';
import BugsnagPluginVue from '@bugsnag/plugin-vue';

export default (context, inject) => {
    Bugsnag.start({
        apiKey: context.$config.bugSnagApiKey,
        plugins: [new BugsnagPluginVue()],
        notifyReleaseStages: [ 'production' ]
    });

    const bugsnagVue = Bugsnag.getPlugin('vue');
    bugsnagVue.installVueErrorHandler(Vue);

    inject('bugsnag', Bugsnag);
};
