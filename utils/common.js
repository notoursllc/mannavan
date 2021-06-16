import isObject from 'lodash.isobject';

export const convertEmptyStringsToNull = (obj) => {
    if(isObject(obj)) {
        const objCopy = Object.assign({}, obj);

        Object.keys(objCopy).forEach((key) => {
            if(typeof objCopy[key] === 'string' && !objCopy[key].trim().length) {
                objCopy[key] = null;
            }
        });

        return objCopy;
    }
};


export const stripTags = (str) => {
    return str.replace(/<\/?[^>]+(>|$)/g, '');
};


export const arraysAreEqual = (arr1, arr2) => {
    if (!arr1 || !arr2) {
        return false;
    }

    const length1 = arr1.length;

    if (length1 !== arr2.length) {
        return false;
    }

    for (let i = 0; i < length1; i++) {
        // Check if we have nested arrays
        if (Array.isArray(arr1[i]) && Array.isArray(arr2[i])) {
            // recurse into the nested arrays
            if (!arraysAreEqual(arr1[i], arr2[i])) {
                return false;
            }
        }
        else if (arr1[i] !== arr2[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }

    return true;
};


export const isUuid4 = (val) => {
    const re = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return re.test(val);
};


export const parseIso8601 = (date) => {
    const parts = date ? date.split('T') : [];
    const ymd = parts[0] ? parts[0].split('-') : [];
    const hms = parts[1] ? parts[1].split(':') : [];

    const makeInt = (val) => {
        return val ? parseInt(val, 10) : null;
    };

    return {
        year: makeInt(ymd[0]),
        month: makeInt(ymd[1]),
        day: makeInt(ymd[2]),
        hours: makeInt(hms[0]),
        minutes: makeInt(hms[1]),
        seconds: hms[2] ? makeInt(hms[2].replace('Z', '')) : 0
    };
};
