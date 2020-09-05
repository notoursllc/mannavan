import Bugsnag from '@bugsnag/js';
import BugsnagPluginVue from '@bugsnag/plugin-vue';

export default (context, inject) => {

    Bugsnag.start({
        apiKey: context.$config.bugSnagApiKey,
        plugins: [new BugsnagPluginVue()],
        notifyReleaseStages: [ 'production' ]
    });

    inject('bugsnag', Bugsnag);

};
