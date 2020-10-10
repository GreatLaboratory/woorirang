'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        const topics = [];
        for (let i = 1; i <= 5; i++) {
            for (let j = 1; j <= 20; j++) {
                topics.push({
                    userId: i,
                    title: `topic${i.toString()}${j.toString()}`,
                    commentNum: (i === 1 && j <= 5) ? 5 : 0,
                    isAnonymous: i < 4,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }    
        }
        return queryInterface.bulkInsert('Topics', topics);
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('Topics', {});
    }
};
// sequelize seed:generate --name topics
