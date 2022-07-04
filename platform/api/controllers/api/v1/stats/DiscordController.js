const moment = require('moment');

module.exports = {
    async messages(req, res) {
        let { user, discord_id, term, start, end, limit } = req.query;

        if (!Array.is_array(user) && typeof user !== 'undefined') {
            user = [user];
        }

        if (!Array.is_array(discord_id) && typeof discord_id !== 'undefined') {
            discord_id = [discord_id];
        }

        let query = {
            where: {
                [$and]: []
            },
            attributes: [
                'user',
                'discord_id',
                [db.sequelize.literal('count(*)'), 'messages']
            ],
            order: [[db.sequelize.col('messages'), 'desc']],
            group: ['discord_id'],
            limit: 1000
        };

        let dates = [];

        if (user) {
            query.where.user = user;
        }

        if (discord_id) {
            query.where.discord_id = discord_id;
        }

        if (term) {
            query.where.message = {
                [$like]: '%' + term + '%'
            };
        }

        if (start) {
            start = moment(start);

            if (start.isValid()) {
                query.where[$and].push({
                    created_at: {
                        [$gte]: start.format('YYYY-MM-DD HH:mm:ss')
                    }
                });
            }
        }

        if (end) {
            end = moment(end);

            if (end.isValid()) {
                query.where[$and].push({
                    created_at: {
                        [$lte]: end.format('YYYY-MM-DD HH:mm:ss')
                    }
                });
            }
        }

        if (limit > 0 && limit <= 1000) {
            query.limit = +limit;
        }

        let stats = await db.discord_chat_messages.find_all(query);

        return res.send(stats);
    },

    async channels(req, res) {
        let { user, discord_id, start, end, limit } = req.query;

        let query = {
            where: {
                [$and]: []
            },
            attributes: [
                'channel',
                [db.sequelize.literal('count(*)'), 'messages']
            ],
            order: [[db.sequelize.col('messages'), 'desc']],
            group: ['channel'],
            limit: 1000
        };

        let dates = [];

        if (user) {
            query.where.user = {
                [$like]: '%' + user.replace(/[^\x00-\x7F]/g, '') + '%'
            };
        }

        if (discord_id) {
            query.where.discord_id = discord_id;
        }

        if (start) {
            start = moment(start);

            if (start.isValid()) {
                query.where[$and].push({
                    created_at: {
                        [$gte]: start.format('YYYY-MM-DD HH:mm:ss')
                    }
                });
            }
        }

        if (end) {
            end = moment(end);

            if (end.isValid()) {
                query.where[$and].push({
                    created_at: {
                        [$lte]: end.format('YYYY-MM-DD HH:mm:ss')
                    }
                });
            }
        }

        if (limit > 0 && limit <= 1000) {
            query.limit = +limit;
        }

        let stats = await db.discord_chat_messages.find_all(query);

        return res.status(200).send(stats);
    }
};
