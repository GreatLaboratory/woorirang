'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        const images = [];
        for (let i = 1; i <= 100; i++) {
            images.push({
                postId: i,
                url: 'https://woorirang-dev.s3.ap-northeast-2.amazonaws.com/posts/mbti1_woorirang_1598506807327.jpg'
            });
            images.push({
                topicId: i,
                url: 'https://woorirang-dev.s3.ap-northeast-2.amazonaws.com/posts/mbti1_woorirang_1598506807327.jpg'
            });
        }
        return queryInterface.bulkInsert('Images', images);
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('Comments', {});
    }
};
