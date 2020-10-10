'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        const contents = [{
            imageUrl: 'https://woorirang-dev.s3.ap-northeast-2.amazonaws.com/mbtiContents/%EF%BF%BD%08%EF%BF%BD%20%18%EF%BF%BDD%20L%20%EF%BF%BD%EF%BF%BD_woorirang_1602032348265.png',
            url: 'https://www.youtube.com/watch?v=eAZG7BuXnOo',
            createdAt: new Date(),
            updatedAt: new Date(),
        }, {
            imageUrl: 'https://woorirang-dev.s3.ap-northeast-2.amazonaws.com/mbtiContents/%EF%BF%BDLX%208%20H%EF%BF%BD%1C_woorirang_1602032382314.png',
            url: 'https://m.blog.naver.com/94cs/221810776769',
            createdAt: new Date(),
            updatedAt: new Date(),
        }, {
            imageUrl: 'https://woorirang-dev.s3.ap-northeast-2.amazonaws.com/mbtiContents/%60%EF%BF%BDX%20mbti_woorirang_1602032407223.png',
            url: 'https://comic.naver.com/webtoon/list.nhn?titleId=751013&no=24&weekday=wed',
            createdAt: new Date(),
            updatedAt: new Date(),
        }];
        return queryInterface.bulkInsert('MbtiContents', contents);
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('MbtiContents', {});
    }
};
