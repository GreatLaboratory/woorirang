import { Sequelize, DataTypes } from 'sequelize';
import User from './User';
import Comment from './Comment';
import Post from './Post';
import LikePost from './LikePost';
import LikeComment from './LikeComment';
import Topic from './Topic';
import Image from './Image';
import Notice from './Notice';
import { MYSQL_URI, MYSQL_DATABASE, MYSQL_USERNAME, MYSQL_PASSWORD } from '../config/secret';
import * as bcrypt from 'bcrypt-nodejs';

export const init = (): Sequelize => {
    const sequelize: Sequelize = new Sequelize(MYSQL_DATABASE, MYSQL_USERNAME, MYSQL_PASSWORD, {
        timezone: '+09:00',
        host: MYSQL_URI,
        dialect: 'mysql'
    });
    User.init({
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        snsId: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING(50),
            unique: true,
            allowNull: false,
        },
        password: {
            type: new DataTypes.STRING(300),
            allowNull: true,
        },
        nickname: {
            type: new DataTypes.STRING(20),
            allowNull: false,
        },
        mbti: {
            type: new DataTypes.STRING(10),
            allowNull: false,
        },
    }, {
        sequelize,
        engine: 'InnoDB',
        charset: 'utf8',
        indexes: [
            {
                unique: true,
                fields: ['email']
            }
        ],
        hooks: {
            beforeCreate: (user: User) => {
                const salt: string = bcrypt.genSaltSync();
                user.password = bcrypt.hashSync(user.password, salt);
            }
        }
    });

    Post.init({
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        userId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        title: {
            type: new DataTypes.STRING(20),
            allowNull: false,
        },
        content: {
            type: new DataTypes.STRING(150),
            allowNull: true,
        },
        likes: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        views: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        commentNum: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        type: {
            type: new DataTypes.STRING(10),
            allowNull: false,
        },
        isAnonymous: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    }, {
        sequelize,
        engine: 'InnoDB',
        charset: 'utf8',
    });

    Topic.init({
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        userId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
        },
        title: {
            type: new DataTypes.STRING(20),
            allowNull: false,
        },
        commentNum: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        isAnonymous: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    }, {
        sequelize,
        engine: 'InnoDB',
        charset: 'utf8',
    });

    Comment.init({
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        userId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        postId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
        },
        topicId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
        },
        commentId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
        },
        content: {
            type: new DataTypes.STRING(150),
            allowNull: false,
        },
        userNickName: {
            type: new DataTypes.STRING(150),
            allowNull: false,
        },
        userMbti: {
            type: new DataTypes.STRING(150),
            allowNull: false,
        },
        likes: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        isAnonymous: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    }, {
        sequelize,
        engine: 'InnoDB',
        charset: 'utf8',
    });

    LikePost.init({
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        userId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        postId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
    }, {
        sequelize,
        timestamps: false,
        tableName: 'LikePosts',
        engine: 'InnoDB',
        charset: 'utf8',
    });

    LikeComment.init({
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        userId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        commentId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
    }, {
        sequelize,
        timestamps: false,
        tableName: 'LikeComments',
        engine: 'InnoDB',
        charset: 'utf8',
    });

    Image.init({
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        postId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
        },
        topicId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
        },
        url: {
            type: new DataTypes.STRING(200),
            allowNull: false,
        },
    }, {
        sequelize,
        timestamps: false,
        engine: 'InnoDB',
        charset: 'utf8',
    });
    
    Notice.init({
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        userId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        commenterId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        postId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
        },
        topicId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
        },
        message: {
            type: new DataTypes.STRING(200),
            allowNull: false,
        },
        isChecked: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        isAnonymous: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    }, {
        sequelize,
        engine: 'InnoDB',
        charset: 'utf8',
    });

    // User : Notice = 1 : N
    // User.hasMany(Notice, {
    //     foreignKey: 'userId',
    //     as: 'User'
    // });
    // Notice.belongsTo(User, {
    //     foreignKey: 'userId',
    //     as: 'User'
    // });

    // User : Notice = 1 : 1
    User.hasOne(Notice, {
        foreignKey: 'commenterId',
        // as: 'CommentUser'
    });
    Notice.belongsTo(User, {
        foreignKey: 'commenterId',
        // as: 'CommentUser'
    });

    // User : Comment = 1 : N
    User.hasMany(Comment, {
        foreignKey: 'userId'
    });
    Comment.belongsTo(User, {
        foreignKey: 'userId',
    });

    // Comment : Comment = 1 : N
    Comment.hasMany(Comment, {
        foreignKey: 'commentId'
    });
    Comment.belongsTo(Comment, {
        foreignKey: 'commentId'
    });

    // Post : Comment = 1 : N
    Post.hasMany(Comment, {
        foreignKey: 'postId'
    });
    Comment.belongsTo(Post, {
        foreignKey: 'postId'
    });
    
    // User : Post = 1 : N
    User.hasMany(Post, {
        foreignKey: 'userId'
    });
    Post.belongsTo(User, { 
        foreignKey: 'userId' 
    });
    
    // User : Topic = 1 : N
    User.hasMany(Topic, {
        foreignKey: 'userId'
    });
    Topic.belongsTo(User, { 
        foreignKey: 'userId' 
    });

    // User : LikePost = 1 : N
    User.hasMany(LikePost, {
        foreignKey: 'userId'
    });
    LikePost.belongsTo(User, { 
        foreignKey: 'userId' 
    });
    
    // User : LikeComment = 1 : N
    User.hasMany(LikeComment, {
        foreignKey: 'userId'
    });
    LikeComment.belongsTo(User, { 
        foreignKey: 'userId' 
    });

    // Post : Image = 1 : N
    Post.hasMany(Image, {
        foreignKey: 'postId'
    });
    Image.belongsTo(Post, {
        foreignKey: 'postId'
    });
    
    // Topic : Comment = 1 : N
    Topic.hasMany(Comment, {
        foreignKey: 'topicId'
    });
    Comment.belongsTo(Topic, {
        foreignKey: 'topicId'
    });

    // Topic : Image = 1 : N
    Topic.hasMany(Image, {
        foreignKey: 'topicId'
    });
    Image.belongsTo(Topic, {
        foreignKey: 'topicId'
    });

    return sequelize;
};
