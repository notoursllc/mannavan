'use strict';

const fs = require('fs');
const path = require('path');
const Boom = require('boom');
const Promise = require('bluebird');
const isObject = require('lodash.isobject');
const cloneDeep = require('lodash.clonedeep');
const fileType = require('file-type');
const sharp = require('sharp');
const AWS = require('aws-sdk');
const helperService = require('../../helpers.service');


const imageMimeTypeWhiteList = [
    'image/png',
    'image/gif',
    'image/jpeg',
    'image/pjpeg'
];

// Configure AWS client for use with Digital Ocean Spaces
const spacesEndpoint = new AWS.Endpoint(process.env.DIGITAL_OCEAN_SPACES_ENDPOINT);
AWS.config.update({
    endpoint: spacesEndpoint,
    accessKeyId: process.env.DIGITAL_OCEAN_SPACES_ACCESS_KEY,
    secretAccessKey: process.env.DIGITAL_OCEAN_SPACES_SECRET
});
const s3 = new AWS.S3();

let server = null;


function getProductPicModel() {
    return server.app.bookshelf.model('ProductPic');
}


function getProductPicVariantModel() {
    return server.app.bookshelf.model('ProductPicVariant');
}


function setServer(s) {
    server = s;
}


function fileIsImage(fileData) {
    let typeObj = fileType(fileData);

    if(isObject(typeObj) && imageMimeTypeWhiteList.indexOf(typeObj.mime) > -1) {
        return typeObj;
    }

    return false;
}


function getCloudImagePath(fileName) {
    return `${process.env.NODE_ENV}/uploads/images/${fileName}`;
}


function getCloudUrl() {
    return `https://${process.env.DIGITAL_OCEAN_SPACE_NAME}.${process.env.DIGITAL_OCEAN_SPACES_ENDPOINT}`;
}


async function deleteFile(url) {
    return new Promise((resolve, reject) => {
        if(!url) {
            return;
        }

        let arr = url.split('/');
        let fileName = arr[arr.length - 1];

        if(!fileName) {
            reject(`Can not delete file for url ${url}`);
            return;
        }

        const config = {
            Bucket: process.env.DIGITAL_OCEAN_SPACE_NAME,
            Key: getCloudImagePath(fileName)
        };

        s3.deleteObject(config, (err, data) => {
            if(err) {
                return reject(err);
            }

            resolve(data);
        });
    });
}


/**
 * Saves a new picture file to disk, which is only temorary.
 * Nanobox does not persist file contents between deploys.  Therefore product pics
 * would be wiped out when a new version of the app is deployed to Nanobox.
 * After the file is saved then it will be uploaded to cloud storage.  The saved file
 * is no longer needed after that.
 * More info here about 'writable directories' on Nanobox:
 * https://docs.nanobox.io/app-config/writable-dirs/
 */
async function resizeAndWrite(req, width) {
    return new Promise((resolve, reject) => {
        // Cloning is necessary because the file.pipe operation below seems
        // to modify the request.payload.file value, causing subsequest
        // resize attemtps on the same file to fail.
        let file = cloneDeep(req.payload.file);

        if(file) {
            let typeObj = fileIsImage(file._data)

            if(typeObj) {
                let w = parseInt(width, 10) || 600
                let cleanId = helperService.stripTags(helperService.stripQuotes(req.payload.product_id));
                let fileName = `${cleanId}_${new Date().getTime()}.${typeObj.ext}`;

                // Read image data from readableStream,
                // resize,
                // emit an 'info' event with calculated dimensions
                // and finally write image data to writableStream
                let transformer = sharp()
                    .resize(w)
                    .max()
                    .withoutEnlargement(true)
                    .toBuffer(function(err, buffer) {
                        if (err) {
                            reject(err);
                            return;
                        }

                        let fileKey = getCloudImagePath(fileName);
                        let { mime } = fileType(buffer);

                        // https://gist.github.com/SylarRuby/b60eea29c1682519e422476cc5357b60
                        const s3Config = {
                            Bucket: process.env.DIGITAL_OCEAN_SPACE_NAME,
                            Key: fileKey,
                            Body: buffer,
                            ACL: 'public-read',
                            ContentEncoding: 'base64', // required
                            ContentType: mime
                            // Metadata: {
                            //     'Content-Type': typeObj.mime
                            // }
                        };

                        s3.upload(s3Config, (err, data) => {
                            if (err) {
                                console.log(err);
                                return reject(err);
                            }

                            console.log('Image successfully uploaded.', data);

                            return resolve({
                                url: `${getCloudUrl()}/${fileKey}`,
                                width: w
                            });
                        })
                    });

                file.pipe(transformer);
            }
            else {
                global.logger.info('SAVING PRODUCT FAILED BECAUSE WRONG MIME TYPE');
                return reject('File type must be one of: ' + imageMimeTypeWhiteList.join(','))
            }
        }
        else {
            resolve();
        }
    });
}


/**
 * Deletes the product file if a new file is being sent in the request payload.
 * A successful file delete will then return the ProductPic in the response,
 * otherwise the response will be empty.
 */
async function unlinkFileAndVariantsIfBeingReplaced(request) {
    if(request.payload.id && request.payload.file) {
        // Delete the current product picture if an id is being passed (updating)
        // and a new file is being uploaded
        let ProductPic = await unlinkFileAndVariants(request.payload.id);
        return ProductPic;
    }
}


/**
 * Deletes a file from the file system, and does the same
 * with any variants this file may have
 *
 * @param {*} id
 * @returns {ProductPic}  Returns the ProductPic model
 */
async function unlinkFileAndVariants(id) {
    // Query the DB to get the file name of the pic
    // and all of the pics variants
    let ProductPic = await getProductPicModel().findById(id, {
        withRelated: ['pic_variants']
    });

    if(!ProductPic) {
        throw new Error('Unable to find product picture.');
    }

    let json = ProductPic.toJSON();

    if(json.url) {
        // Unlink the main product pic
        await deleteFile(json.url)
        global.logger.info('PRODUCT PIC - FILE DELETED', json.url);

        // Unlink the product pic variants
        if(Array.isArray(json.pic_variants)) {
            json.pic_variants.forEach(async (obj) => {
                await deleteFile(obj.url);
                global.logger.info('PRODUCT PIC VARIANT - FILE DELETED', obj.url);
            });
        }

        return ProductPic
    }
}


function deleteVariants(ProductPic) {
    if(!ProductPic) {
        return;
    }

    let json = ProductPic.toJSON();

    if(Array.isArray(json.pic_variants)) {
        json.pic_variants.forEach((obj) => {
            global.logger.info('DELETING PRODUCT PIC VARIANT FROM DB', obj.id);

            getProductPicVariantModel().destroy({
                id: obj.id
            });
        });
    }
}


/*
    * Upserts and resizes a standard product pic as well as its larger variant
    * @param {*} req
    * @param {*} options
    */
async function upsertPic(request, options) {
    try {
        const ProductPic = await unlinkFileAndVariantsIfBeingReplaced(request);

        // Always delete the variants and re-create
        if(request.payload.file) {
            deleteVariants(ProductPic)
        }
    }
    catch(e) {
        // just dropping the exception beacuse issues deleting the file
        // shouldn't stop this process from continuing
        global.logger.error('ERROR UNLINKING FILE', e)
    }

    const resizeResponse = await resizeAndWrite(request, 600);
    global.logger.info('PRODUCT PIC - FILE RESIZED (600)', resizeResponse);

    // update or create the ProductPic
    let payload = cloneDeep(request.payload);
    delete payload.file; // not needed when updatng the model

    // resizeResponse will be empty if the HTTP request did not include a file
    // (which it may not if the user in only updating other attributes)
    if(resizeResponse) {
        // Additional data needed for the ProductPic model
        payload.url = resizeResponse.url;
        payload.width = resizeResponse.width || null;
        payload.height = resizeResponse.height || null;
    }

    let ProductPic;
    if(payload.id) {
        ProductPic = await getProductPicModel().update(payload, { id: payload.id });
    }
    else {
        ProductPic = await getProductPicModel().create(payload);
    }
    global.logger.info('PRODUCT PIC UPSERTED', ProductPic.get('id'));

    let ProductPicVariant = await upsertPicVariant(request, ProductPic.get('id'));
    return ProductPicVariant.get('product_pic_id');
}


async function upsertPicVariant(request, productPicId) {
    const resizeResponse = await resizeAndWrite(request, 1000);
    global.logger.info('PRODUCT PIC VARIANT - FILE RESIZED (1000)', resizeResponse);

    const createParams = {
        product_pic_id: productPicId,
        is_visible: request.payload.is_visible === true ? true : false
    };

    if(isObject(resizeResponse)) {
        createParams.url = resizeResponse.url;
        createParams.width = resizeResponse.width || null;
        createParams.height = resizeResponse.height || null;
    }

    global.logger.info('PRODUCT PIC VARIANT - CREATING', createParams);

    const ProductPicVariant = getProductPicVariantModel().create(createParams);

    global.logger.info('PRODUCT PIC VARIANT- CREATED', ProductPicVariant.get('product_pic_id'));

    return ProductPicVariant;
}



function featuredProductPic(productJson) {
    let pic = null;

    if(Array.isArray(productJson.pics)) {
        let len = productJson.pics.length;

        // The related sizes for a product are ordered by sort order (ASC)
        // so the first 'is_visible' pic will be the featured pic
        for(let i=0; i<len; i++) {
            if(productJson.pics[i].is_visible && productJson.pics[i].url) {
                pic = productJson.pics[i].url;
                break;
            }
        }
    }

    return pic;
}


/***************************************
 * route handlers
 /**************************************/

 async function productPicUpsertHandler(request, h) {
    try {
        const productPicId = await upsertPic(request);

        if(!productPicId) {
            throw Boom.badRequest('Unable to create a a new product picture.');
        }

        global.logger.info(
            request.payload.id ? 'PRODUCT PIC - DB UPDATED' : 'PRODUCT PIC - DB CREATED',
            productPicId
        );

        return h.apiSuccess({
            product_pic_id: productPicId
        });
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        throw Boom.badRequest(err);
    }
};


async function productPicDeleteHandler(request, h) {
    try {
        request.payload.updated_at = request.payload.updated_at || new Date();

        try {
            await unlinkFileAndVariants(request.payload.id);
        }
        catch(err) {
            // just dropping the exception beacuse issues deleting the file
            // shouldn't stop this process from continuing
            global.logger.error(err);
            global.bugsnag(err);
        }

        //TODO: Get the product.  If this is the featured pic, assign a new one on the product

        // Delete from DB:
        const ProductPic = await getProductPicModel().destroy(
            { id: request.payload.id }
        );

        global.logger.info('DELETE FILE PRODUCT PIC SHOULD HAVE VARIANTS', ProductPic.toJSON())
        global.logger.info('PRODUCT PIC - DB DELETED2', request.payload.id);

        return h.apiSuccess({
            id: request.payload.id
        });
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        throw Boom.badRequest(err);
    }
};


module.exports = {
    setServer,
    getCloudImagePath,
    getCloudUrl,
    featuredProductPic,
    productPicUpsertHandler,
    productPicDeleteHandler
}
