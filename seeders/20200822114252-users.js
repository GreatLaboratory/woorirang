'use strict';
const bcrypt = require('bcrypt-nodejs');

module.exports = {
    up: (queryInterface, Sequelize) => {
        const password = bcrypt.hashSync('audrhks0201', bcrypt.genSaltSync());
        return queryInterface.bulkInsert('Users', [
            {
                email: 'cartopia95@naver.com',
                password,
                nickname: 'gwan',
                mbti: 'infj',
                fcmToken: '',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                email: 'cartopia96@naver.com',
                password,
                nickname: 'logan',
                mbti: 'enfj',
                fcmToken: '',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                email: 'cartopia97@naver.com',
                password,
                nickname: 'nia',
                mbti: 'inpj',
                fcmToken: '',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                email: 'cartopia98@naver.com',
                password,
                nickname: 'jack',
                mbti: 'enfp',
                fcmToken: '',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                email: 'cartopia99@naver.com',
                password,
                nickname: 'maria',
                mbti: 'entp',
                fcmToken: '',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                email: '1485633686',
                password,
                nickname: '로건신',
                mbti: 'estj',
                fcmToken: 'emRbn5O4T0eRYHvgu1nuyf:APA91bGpngcQgpQZKgBp9b5BrTIavnf2cUMEGe3wubSw8f0ZSrYsMjmvRh0OreItQ15rjk_107vuAA8ZTiLTBn0A9RA_tD45jjvVAdClbwDMjdMriDeBaw3t3jgky0IkafczCnDv29yr',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('Users', {});
    }
};
