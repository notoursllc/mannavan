import isObject from 'lodash.isobject';

export const convertEmptyStringsToNull = (obj) => {
    if(isObject(obj)) {
        let objCopy = Object.assign({}, obj);

        Object.keys(objCopy).forEach((key) => {
            if(typeof objCopy[key] === 'string' && !objCopy[key].trim().length) {
                objCopy[key] = null;
            }
        });

        return objCopy;
    }
}


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
}


export const slugSuggestion = (name) => {
    if(name) {
        return name.replace(/ /g,"_").toLowerCase().replace(/[^a-z_0-9]/g, "");
    }
}
