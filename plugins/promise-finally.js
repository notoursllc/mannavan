import axios from '@nuxtjs/axios';

// Axios does not implement .finally in the returned promise
// so this shim will add support
// See https://github.com/axios/axios/issues/34
import promiseFinally from 'promise.prototype.finally';
promiseFinally.shim();
