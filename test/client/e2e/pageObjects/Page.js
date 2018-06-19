import VueSelector from 'testcafe-vue-selectors';
import { TestIdSelector } from '../utils';


export default class Page {

    constructor() {

        this.footer = {
            linkContactUs: TestIdSelector('footer-link-contactus'),
            linkPrivacy: TestIdSelector('footer-link-privacy'),
            linkConditions: TestIdSelector('footer-link-conditions'),
        }

    }

}
