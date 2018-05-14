require('babel-register')

// http://nightwatchjs.org/getingstarted#settings-file
module.exports = {
    src_folders: ['test/client/e2e/specs'],
    output_folder: 'test/client/e2e/reports',
    custom_assertions_path: ['test/client/e2e/custom-assertions'],

    launch_url: 'http://ondemand.saucelabs.com:80',
    selenium_port: 80,
    selenium_host: 'ondemand.saucelabs.com',
    silent: true,
    username: process.env.SAUCE_USERNAME,
    access_key: process.env.SAUCE_ACCESS_KEY,
    screenshots: {
        enabled: false,
        path: ''
    },
    globals: {
        waitForConditionTimeout: 10000
    },

    test_settings: {
        firefox: {
            desiredCapabilities: {
                browserName: 'firefox',
                javascriptEnabled: true,
                acceptSslCerts: true
            }
        },

        chrome: {
            desiredCapabilities: {
                browserName: 'chrome',
                platform: 'Windows 10',
                version: '47'
            }
        },

        ie11: {
            desiredCapabilities: {
                browserName: 'internet explorer',
                platform: 'Windows 10',
                version: '11.0'
            }
        }
    }
}
