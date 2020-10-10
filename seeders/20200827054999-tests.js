'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        const tests = [{
            title: '에니어그램',
            url: 'https://urbanlist.kr/content/enneargram',
        }, {
            title: '에고그램',
            url: 'http://egogramtest.kr/',
        }, {
            title: '빅파이브',
            url: 'https://together.kakao.com/promotions/1155',
        }, {
            title: '성인애착유형',
            url: 'http://typer.kr/test/ecr/',
        }, {
            title: 'mgram',
            url: 'https://mgram.me/ko/',
        }];
        return queryInterface.bulkInsert('Tests', tests);
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('Tests', {});
    }
};
