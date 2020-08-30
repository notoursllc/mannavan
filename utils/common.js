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
