import { Selector } from 'testcafe';

function getBaseUrl(path) {
    // let base = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://www.gobreadvan.com';
    let base = 'http://localhost:3000';

    if(path) {
        return `${base}/${path}`;
    }
    return base;
}

function TestIdSelector(id) {
    return Selector(`[data-testid="${id}"]`);
}


module.exports = {
    getBaseUrl,
    TestIdSelector
}
