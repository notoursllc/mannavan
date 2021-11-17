import { BreadvanApi } from '@notoursllc/breadvan-api';

export default (context, inject) => {

    const api = BreadvanApi(context.$axios);
    inject('api', { ...api });

};
