import { Request } from 'express';
import AWS, { S3 } from 'aws-sdk';
import multer from 'multer';
import multerS3, { AUTO_CONTENT_TYPE } from 'multer-s3';
import path from 'path';

const s3: S3 = new AWS.S3({
    accessKeyId: 'AKIAIB6Q2NKBUQ4RQYEQ',
    secretAccessKey: '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',
    region: 'ap-northeast-2'
});

export const productUploader = multer({
    storage: multerS3({
        s3,
        bucket: 'woorirang-dev/posts',
        acl: 'public-read',
        contentType: AUTO_CONTENT_TYPE,
        metadata: (req: Request, file: Express.Multer.File, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req: Request, file: Express.Multer.File, cb) => {
            const ext = path.extname(file.originalname);
            cb(null, path.basename(file.originalname, ext) + '_woorirang_' + new Date().valueOf() + ext);
        },
    })
});
