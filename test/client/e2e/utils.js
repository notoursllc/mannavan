import { Selector } from 'testcafe';

function getBaseUrl(path) {
    console.log("GET BASE", process.env.NODE_ENV)
    let base = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://www.gobreadvan.com';

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
