import Vue from 'vue'
import bugsnag from '@bugsnag/js'
import bugsnagVue from '@bugsnag/plugin-vue'

const bugsnagClient = bugsnag({
    apiKey: process.env.BUG_SNAG_API_KEY,
    notifyReleaseStages: [ 'production' ]
});

bugsnagClient.use(bugsnagVue, Vue);
