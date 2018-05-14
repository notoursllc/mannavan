const assert = require('assert');

describe('PAGE: /', () => {
    it('should have title', () => {
        browser.url('/');
        assert.equal(browser.getTitle(), 'gmnst');
    });
});