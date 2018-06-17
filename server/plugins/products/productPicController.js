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

const tmpDirectory = path.join(__dirname, '../../../tmp');

// Configure AWS client for use with Digital Ocean Spaces
const spacesEndpoint = new AWS.Endpoint(process.env.DIGITAL_OCEAN_SPACES_ENDPOINT);
const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId: process.env.DIGITAL_OCEAN_SPACES_ACCESS_KEY,
    secretAccessKey: process.env.DIGITAL_OCEAN_SPACES_SECRET
});

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


async function uploadFileToCloud(resizeData) {
    if(!resizeData) {
        return;
    }

    let data = await fs.readFile(`${tmpDirectory}/${resizeData.file_name}`);

    console.log("uploadFileToCloud - resizeData", resizeData);
    console.log("uploadFileToCloud - data", data);

    let { mime } = fileType(data);
    let fileKey = getCloudImagePath(resizeData.file_name);

    let params = {
        Body: data,
        Bucket: process.env.DIGITAL_OCEAN_SPACE_NAME,
        Key: fileKey,
        ACL: 'public-read',
        ContentType: mime
        // Metadata: {
        //     'Content-Type': typeObj.mime
        // }
    };

    // Upload the image to DigitalOcean.
    // Returns a data object containing an 'ETag' attribute,
    // which I think we don't need for anything.
    await s3.putObject(params);

    // The entire image url will be persisted in the DB
    resizeData.url = `${getCloudUrl()}/${fileKey}`;
    return resizeData;
}


async function deleteFile(url) {
    if(!url) {
        return;
    }

    let arr = url.split('/');
    let fileName = arr[arr.length - 1];

    if(!fileName) {
        throw new Error(`Can not delete file for url ${url}`)
    }

    await s3.deleteObject({
        Bucket: process.env.DIGITAL_OCEAN_SPACE_NAME,
        Key: getCloudImagePath(fileName)
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
        // let request = req;

        // if(request.payload.file) {
        if(file) {
            // let typeObj = fileIsImage(request.payload.file._data)
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

                        const s3Config = {
                            Body: buffer,
                            Bucket: process.env.DIGITAL_OCEAN_SPACE_NAME,
                            Key: fileKey,
                            ACL: 'public-read',
                            ContentType: mime
                            // Metadata: {
                            //     'Content-Type': typeObj.mime
                            // }
                        };

                        console.log("S3 config", s3Config)
                        s3.putObject(s3Config);

                        console.log("SHARP DONE", fileKey);

                        return resolve({
                            url: `${getCloudUrl()}/${fileKey}`,
                            width: w
                        });
                    })
                    // .on('info', function(info) {
                    //     // Adding the file name to the response object because it's persisted in the DB later
                    //     info.file_name = fileName;
                    //     return resolve(info);
                    // });

                // request.payload.file.pipe(transformer);
                file.pipe(transformer);
                // request.payload.file.pipe(transformer).pipe(
                //     fs.createWriteStream(`${tmpDirectory}/${fileName}`)
                // );

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

function resizeAndWrite2(req, width) {
    // Cloning is necessary because the file.pipe operation below seems
    // to modify the request.payload.file value, causing subsequest
    // resize attemtps on the same file to fail.
    let request = cloneDeep(req);

    if(request.payload.file) {
        let typeObj = fileIsImage(request.payload.file._data)

        if(typeObj) {
            let w = parseInt(width, 10) || 600
            let cleanId = helperService.stripTags(helperService.stripQuotes(request.payload.product_id));
            let fileName = `${cleanId}_${new Date().getTime()}.${typeObj.ext}`;

            // Read image data from readableStream,
            // resize,
            // emit an 'info' event with calculated dimensions
            // and finally write image data to writableStream
            let transformer = sharp()
                .resize(w)
                .max()
                .withoutEnlargement(true)
                .on('info', function(info) {
                    // Adding the file name to the response object because it's persisted in the DB later
                    info.file_name = fileName;
                    return info;
                });

            request.payload.file.pipe(transformer).pipe(
                fs.createWriteStream(`${tmpDirectory}/${fileName}`)
            );
        }
        else {
            global.logger.info('SAVING PRODUCT FAILED BECAUSE WRONG MIME TYPE');
            throw new Error('File type must be one of: ' + imageMimeTypeWhiteList.join(','));
        }
    }
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
async function upsertProductPic(request, options) {
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
    // const resizeResponse = await resizeAndWrite(request, 600);
    // const uploadResponse = await uploadFileToCloud(resizeResponse);

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
    // const variantResizeResponse = await resizeAndWrite(request, 1000);
    // const variantUploadResponse = await uploadFileToCloud(variantResizeResponse);

    global.logger.info('PRODUCT PIC VARIANT - FILE RESIZED (1000)', resizeResponse);

    let payload = cloneDeep(request.payload);
    delete payload.file;
    delete payload.product_id;
    delete payload.sort_order;
    delete payload.id;

    if(isObject(resizeResponse)) {
        payload.url = resizeResponse.url;
        payload.width = resizeResponse.width || null;
        payload.height = resizeResponse.height || null;
    }
    payload.product_pic_id = productPicId;

    global.logger.info('PRODUCT PIC VARIANT - CREATING', payload);

    const ProductPicVariant = getProductPicVariantModel().create(payload);

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
        const productPicId = await upsertProductPic(request);

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
        ProductPic = await getProductPicModel().destroy(
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
