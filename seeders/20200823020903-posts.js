'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        const posts = [];
        for (let i = 1; i <= 5; i++) {
            for (let j = 1; j <= 20; j++) {
                posts.push({
                    userId: i,
                    title: `post${i.toString()}${j.toString()}`,
                    content: `content${i.toString()}${j.toString()}`,
                    likes: 0,
                    views: 0,
                    commentNum: (i === 1 && j <= 5) ? 5 : 0,
                    type: i < 4 ? 'free' : 'topic',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isAnonymous: i < 4,
                });
            }    
        }
        return queryInterface.bulkInsert('Posts', posts);
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('Posts', {});
    }
};
// sequelize seed:generate --name posts
