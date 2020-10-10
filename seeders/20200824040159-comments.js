'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        const comments = [];
        const userList = [{
            userId: 1,
            userNickName: 'gwan',
            mbti: 'infj'
        }, {
            userId: 2,
            userNickName: 'logan',
            mbti: 'enfj'
        }, {
            userId: 3,
            userNickName: 'nia',
            mbti: 'inpj'
        }, {
            userId: 4,
            userNickName: 'jack',
            mbti: 'enfp'
        }, {
            userId: 5,
            userNickName: 'maria',
            mbti: 'entp'
        }];
        for (let i = 1; i <= 5; i++) {
            for (let j = 1; j <= 5; j++) {
                comments.push({
                    userId: i,
                    userNickName: userList[i - 1].userNickName,
                    userMbti: userList[i - 1].mbti,
                    postId: j,
                    content: `comment${i}${j}`,
                    likes: 0,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isAnonymous: i < 3,
                });
            }
            for (let j = 1; j <= 5; j++) {
                comments.push({
                    userId: i,
                    userNickName: userList[i - 1].userNickName,
                    userMbti: userList[i - 1].mbti,
                    topicId: j,
                    content: `comment${i}${j}`,
                    likes: 0,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isAnonymous: i < 3,
                });
            }
        }    
        
        return queryInterface.bulkInsert('Comments', comments);
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('Comments', {});
    }
};
