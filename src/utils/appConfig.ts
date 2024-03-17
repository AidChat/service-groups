import {PrismaClient} from "@prisma/client";

const appConfig = {
    _version: 'v1', _urlParser: function (url: string) {
        return '/' + this._version + url;
    }, _service: 'service-messaging', // in js getters are only used to access properties of an object
    _query: new PrismaClient(), _requestParser: function (keys: string[], bodyObj: {}) {
        return new Promise(function (resolve, reject) {
            for (let k of keys) {
                if (Object.keys(bodyObj).filter(item => item === k).length < 1) {
                    reject({message: "Please provide correct data"})
                }
            }
            resolve({});
        })

    }

};

export const config = Object.create(appConfig);


