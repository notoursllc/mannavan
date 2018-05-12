'use strict';

const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');
const isObject = require('lodash.isobject');
const cloneDeep = require('lodash.clonedeep');
const fileType = require('file-type');
const sharp = require('sharp');
const AWS = require('aws-sdk');
const helperService = require('../../../helpers.service');
const ProductPicVariantService = require('./ProductPicVariantService');
const BaseService = require('../../core/services/BaseService');

const imageMimeTypeWhiteList = [
    'image/png',
    'image/gif',
    'image/jpeg',
    'image/pjpeg'
];

const tmpDirectory = path.join(__dirname, '../../../../tmp');

// Configure AWS client for use with Digital Ocean Spaces
const spacesEndpoint = new AWS.Endpoint(process.env.DIGITAL_OCEAN_SPACES_ENDPOINT);
const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId: process.env.DIGITAL_OCEAN_SPACES_ACCESS_KEY,
    secretAccessKey: process.env.DIGITAL_OCEAN_SPACES_SECRET
});



function fileIsImage(fileData) {
    let typeObj = fileType(fileData);

    if(isObject(typeObj) && imageMimeTypeWhiteList.indexOf(typeObj.mime) > -1) {
        return typeObj;
    }

    return false;
}


module.exports = class ProductPicService extends BaseService {

    constructor(server) {
        super(server, 'ProductPic')
        this.productPicVariantService = new ProductPicVariantService(server);
    }


    getCloudUrl() {
        return `https://${process.env.DIGITAL_OCEAN_SPACE_NAME}.${process.env.DIGITAL_OCEAN_SPACES_ENDPOINT}`;
    }


    getCloudImagePath(fileName) {
        return `${process.env.NODE_ENV}/uploads/images/${fileName}`;
    }


    uploadFileToCloud(resizeData) {
        let self = this;
    
        return new Promise((resolve, reject) => {
            if(resizeData) {
                fs.readFile(`${tmpDirectory}/${resizeData.file_name}`, function(err, data) {
                    if(err) {
                        return reject(err);
                    }
                    
                    let { mime } = fileType(data);
                    let fileKey = self.getCloudImagePath(resizeData.file_name);
        
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
                    s3.putObject(params, function(err, data) {
                        if (err) {
                            return reject(err);
                        }
                            
                        // The entire image url will be persisted in the DB
                        resizeData.url = `${self.getCloudUrl()}/${fileKey}`; 
                        resolve(resizeData);
                    });
                });
            }
            else {
                resolve();
            }
        });
    }


    deleteFile(url) {
        let self = this;

        return new Promise((resolve, reject) => {
            if(!url) {
                return resolve();
            }

            let arr = url.split('/');
            let fileName = arr[arr.length - 1];

            if(!fileName) {
                return reject(`Can not delete file for url ${url}`);
            }

            let params = {
                Bucket: process.env.DIGITAL_OCEAN_SPACE_NAME, 
                Key: self.getCloudImagePath(fileName)
            };
    
            s3.deleteObject(params, (err) => {
                if(err) {
                    return reject(err);
                }

                resolve()
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
    resizeAndWrite(req, width) {
        // Cloning is necessary because the file.pipe operation below seems
        // to modify the request.payload.file value, causing subsequest
        // resize attemtps on the same file to fail.
        let request = cloneDeep(req);

        return new Promise((resolve, reject) => {
            if(request.payload.file) {
                let typeObj = fileIsImage(request.payload.file._data)

                if(typeObj) {
                    let w = parseInt(width, 10) || 600
                    let cleanId = helperService.stripTags(helperService.stripQuotes(request.payload.product_id));
                    let fileName = `${cleanId}_${new Date().getTime()}.${typeObj.ext}`;

                    let transformer = sharp()
                        .resize(w)
                        .max()
                        .withoutEnlargement(true)
                        .on('info', function(info) {
                            // Adding the file name to the response object because it's persisted in the DB later
                            info.file_name = fileName;
                            return resolve(info);
                        });

                    request.payload.file.pipe(transformer).pipe(
                        fs.createWriteStream(`${tmpDirectory}/${fileName}`)
                    );

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
    unlinkFileAndVariantsIfBeingReplaced(request) {
        let self = this;

        return new Promise((resolve, reject) => {
            // Delete the current product picture if an id is being passed (updating)
            // and a new file is being uploaded
            if(request.payload.id && request.payload.file) {
                self.unlinkFileAndVariants(request.payload.id)
                    .then((ProductPic) => {
                        return resolve(ProductPic)
                    })
                    .catch((err) => {
                        return reject(err);
                    })
            }   
            else {
                resolve()
            }
        });
    }


    /**
     * Deletes a file from the file system, and does the same
     * with any variants this file may have
     * 
     * @param {*} id 
     * @returns {ProductPic}  Returns the ProductPic model
     */
    unlinkFileAndVariants(id) {
        let self = this;

        return new Promise((resolve, reject) => {
            // Query the DB to get the file name of the pic
            // and all of the pics variants
            self.getModel()
                .findById(id, {
                    withRelated: ['pic_variants']
                })
                .then((ProductPic) => {
                    if(!ProductPic) {
                        global.logger.error('PRODUCT PIC - UNABLE TO FIND DB ENTRY', id);
                        reject('Unable to find product picture.')
                        return;
                    }
                    
                    let json = ProductPic.toJSON();
                    global.logger.info('PRODUCT PIC WITH VARIANTS', json)

                    //TODO: file_name has been replaced by 'url'
                    if(json.url) {
                        // Unlink the main product pic
                        self.deleteFile(json.url)
                            .then(() => {
                                global.logger.info('PRODUCT PIC - FILE DELETED', json.url);
                            })
                            .catch((err) => {
                                global.logger.error('PRODUCT PIC - ERROR DELETING FILE', err);
                            });

                        // Unlink the product pic variants
                        if(Array.isArray(json.pic_variants)) {
                            json.pic_variants.forEach((obj) => {
                                self.deleteFile(obj.url)
                                    .then(() => {
                                        global.logger.info('PRODUCT PIC VARIANT - FILE DELETED', obj.url);
                                    })
                                    .catch((err) => {
                                        global.logger.error('PRODUCT PIC VARIANT - ERROR DELETING FILE', err);
                                    });
                            });
                        }

                        return resolve(ProductPic);
                    }  
                    else {
                        return resolve(ProductPic);
                    }
                });
        });
    }


    /*
     * Upserts and resizes a standard product pic as well as its larger variant
     * @param {*} req 
     * @param {*} options 
     */
    upsertProductPic(request, options) {
        let self = this;

        return new Promise((resolve, reject) => {
            let productPic;

            this.unlinkFileAndVariantsIfBeingReplaced(request)
                .catch((err) => {
                    // just dropping the exception beacuse issues deleting the file
                    // shouldn't stop this process from continuing
                    global.logger.error('ERROR UNLINKING FILE', err)
                })
                .then((ProductPic) => {
                    // Always delete the variants and re-create
                    if(request.payload.file) {
                        self.productPicVariantService.deleteVariants(ProductPic)
                    }
                    
                    return self.resizeAndWrite(request, 600)
                })
                .then((resizeResponse) => {
                    return self.uploadFileToCloud(resizeResponse)
                })
                .then((resizeResponse) => {
                    global.logger.info('PRODUCT PIC - FILE RESIZED (600)', resizeResponse);

                    // update or create the ProductPic
                    let model = self.getModel();
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

                    if(payload.id) {
                        return model.update(payload, { id: payload.id });
                    }
                    else {
                        return model.create(payload);
                    }
                })
                .then((ProductPic) => {
                    productPic = ProductPic;
                    global.logger.info('PRODUCT PIC UPSERTED', productPic.get('id'));

                    // ProductPicVariant:
                    return self.resizeAndWrite(request, 1000)
                })
                .then((resizeResponse) => {
                    return self.uploadFileToCloud(resizeResponse)
                })
                .then((resizeResponse) => {
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
                    
                    payload.product_pic_id = productPic.get('id');

                    global.logger.info('PRODUCT PIC VARIANT - CREATING', payload);

                    return self.productPicVariantService.getModel().create(payload);
                })
                .then((ProductPicVariant) => {
                    global.logger.info('PRODUCT PIC VARIANT- CREATED', ProductPicVariant.get('product_pic_id'));
                    return resolve(ProductPicVariant.get('product_pic_id'))
                })
                .catch((err) => {
                    global.logger.info('ERROR FROM UPSERT PRODUCT PIC', err)
                    return reject(err);
                });
        });
    }
}