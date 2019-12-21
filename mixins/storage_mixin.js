import isObject from 'lodash.isobject';

export default {

    methods: {

        async storagemix_uploadImages(imageManagerValue) {
            if(Array.isArray(imageManagerValue)) {
                const newImages = imageManagerValue.filter((obj) => { return obj.hasOwnProperty('raw') });

                // upload the new images:
                const newImagePromises = [];
                newImages.forEach((obj) => {
                    let formData = new FormData();
                    formData.append('file', obj.raw)
                    newImagePromises.push(
                        this.$api.storage.addImage(formData)
                    );
                });

                const imageUploadResult = await Promise.all(newImagePromises);

                // adding the alt text to each upload result
                newImages.forEach((obj, index) => {
                    imageUploadResult[index].forEach((imgObject) => {
                        imgObject.altText = obj.altText;
                    });
                })

                return imageUploadResult;
            }
        },

        /**
         * Removes objects from product.images that are no longer used,
         * and also deletes the images from storage
         *
         * @returns Promise
         */
        storagemix_deleteProductImages(imageManagerValue, oldProductImages) {
            console.log("DELETE IMAGES", imageManagerValue, oldProductImages);

            if(Array.isArray(imageManagerValue) && isObject(oldProductImages)) {
                let newImageUrls = imageManagerValue.map(obj => obj.url);
                let toDelete = [];

                let i = Array.isArray(oldProductImages) ? oldProductImages.length : 0;
                while (i--) {
                    let hasUrl = false;
                    let arr = oldProductImages[i];

                    arr.forEach((obj) => {
                        if(newImageUrls.indexOf(obj.url) > -1) {
                            hasUrl = true;
                        }
                    });

                    if(!hasUrl) {
                        // spread the array members (objects) into toDelete
                        // instead of the array itself:
                        toDelete.push(...arr);
                        oldProductImages.splice(i, 1);
                    }
                }

                const imageDeletePromises = [];
                toDelete.forEach((obj) => {
                    imageDeletePromises.push(
                        this.$api.storage.deleteImage(obj.url)
                    )
                });

                console.log("DELETE IMAGES- TO DELETE", toDelete);
                return Promise.all(imageDeletePromises);
            }
        },

    }

}
