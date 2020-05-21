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


export const getNextAvailableTypeValue = (allTypes) => {
    let highestValue = 0;

    // find the highest value
    allTypes.forEach((obj) => {
        if(obj.value > highestValue) {
            highestValue = obj.value;
        }
    });

    let factor = 0;

    if(highestValue) {
        factor = parseInt(Math.log(highestValue) / Math.log(2), 10); // current factor
        factor++; // what the new factor should be
    }

    return Math.pow(2, factor);
};


export const slugSuggestion = (name) => {
    if(name) {
        return name.replace(/ /g,'_').toLowerCase().replace(/[^a-z_0-9]/g, "");
    }
};


export const stripTags = (str) => {
    return str.replace(/<\/?[^>]+(>|$)/g, '');
};


export const arrayDiff = (a1, a2) => {
    const a = [];
    const diff = [];

    for (let i = 0; i < a1.length; i++) {
        a[a1[i]] = true;
    }

    for (let i = 0; i < a2.length; i++) {
        if (a[a2[i]]) {
            delete a[a2[i]];
        }
        else {
            a[a2[i]] = true;
        }
    }

    for (let k in a) {
        diff.push(k);
    }

    return diff;
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


export const isNumeric = (n) => {
    return !isNaN(parseFloat(n)) && isFinite(n);
};
