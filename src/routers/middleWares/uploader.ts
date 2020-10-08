import { Request } from 'express';
import AWS, { S3 } from 'aws-sdk';
import multer from 'multer';
import multerS3, { AUTO_CONTENT_TYPE } from 'multer-s3';
import path from 'path';

const s3: S3 = new AWS.S3({
    accessKeyId: 'AKIAIHWFLNOZUE6UGXUA',
    secretAccessKey: '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',
    region: 'ap-northeast-2'
});

export const postUploader = multer({
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

export const testResultUploader = multer({
    storage: multerS3({
        s3,
        bucket: 'woorirang-dev/testResults',
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

export const mbtiContentUploader = multer({
    storage: multerS3({
        s3,
        bucket: 'woorirang-dev/mbtiContents',
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
