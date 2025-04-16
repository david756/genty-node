const Query = require('../models/query.models');
class Activity {
    async getPostList(data, table) {
        const query = new Query();
        const textQuery = `
            SELECT 
            p.id, 
            p.code,
            p.description, 
            p.date, 
            p.count_likes,
            p.count_dislikes,
            p.count_comments,
            p.count_views,
            ST_Y(p.location::geometry) AS lat,
            ST_X(p.location::geometry) AS lon,
            ROUND(${this.getTextQueryDistance()}) AS distance_m,
            ROUND(EXTRACT(EPOCH FROM ($3 - p.date))) AS time_s,
            ${this.getTextQueryScore()} AS score,
            COALESCE(BOOL_OR(user_likes.like_type = 'like'), false) AS is_liked,
            COALESCE(BOOL_OR(user_likes.like_type = 'dislike'), false) AS is_disliked
            FROM posts p 
            LEFT JOIN likes user_likes 
                ON p.id = user_likes.reference_id 
                AND user_likes.reference_type = 'posts' 
                AND user_likes.user_id = $5
            WHERE ($4 = -1 OR ${this.getTextQueryScore()} > $4)
              AND ${this.getTextQueryDistance()} <= 1511005000
              AND p.date >= $3 - INTERVAL '999110000 minutes'
            GROUP BY p.id
            ORDER BY score ASC
            LIMIT ${data.limit};
        `;
        const params = [data.lat, data.lon, data.date, data.last_data, data.user_id];
        return await query.queryDatabase(textQuery, params, table);
    }

    async getPost(data, table) {
        const query = new Query();
        const textQuery = `
            SELECT 
            p.id, 
            p.code,
            p.description, 
            p.date, 
            p.count_likes ,
            p.count_dislikes ,
            p.count_comments,
            p.count_views,
            ST_Y(p.location::geometry) AS lat,
            ST_X(p.location::geometry) AS lon,
            ST_Distance(
            p.location,
            ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography
            ) AS distance_m,
            EXTRACT(EPOCH FROM (now() - p.date)) AS time_s,
            COALESCE(BOOL_OR(user_likes.like_type = 'like'), false) AS is_liked,
            COALESCE(BOOL_OR(user_likes.like_type = 'dislike'), false) AS is_disliked
            FROM posts p 
            LEFT JOIN likes user_likes 
            ON p.id = user_likes.reference_id 
            AND user_likes.reference_type = 'posts' 
            AND user_likes.user_id = $4
            WHERE p.code = $3
            GROUP BY p.id
            LIMIT 1;
        `;
        const params = [data.user_lat, data.user_lon, data.code, data.user_id];
        return await query.queryDatabase(textQuery, params, table);
    }

    async getEventList(data, table) {
        const query = new Query();
        const textQuery = `
            SELECT 
            p.id, 
            p.code,
            p.description, 
            p.date, 
            p.count_likes,
            p.count_dislikes,
            p.count_comments,
            p.count_confirmations,
            p.count_views,
            ST_Y(p.location::geometry) AS lat,
            ST_X(p.location::geometry) AS lon,
            ROUND(${this.getTextQueryDistance()}) AS distance_m,
            ROUND(EXTRACT(EPOCH FROM ($3 - p.date))) AS time_s,
            ${this.getTextQueryScore()} AS score,
            COALESCE(BOOL_OR(user_likes.like_type = 'like'), false) AS is_liked,
            COALESCE(BOOL_OR(user_likes.like_type = 'dislike'), false) AS is_disliked,
            ec.description category
            FROM events p
            INNER JOIN event_categories ec on ec.id=p.event_category_id
            LEFT JOIN likes user_likes 
                ON p.id = user_likes.reference_id 
                AND user_likes.reference_type = 'events' 
                AND user_likes.user_id = $5
            WHERE ($4 = -1 OR ${this.getTextQueryScore()} > $4)
              AND ${this.getTextQueryDistance()} <= 1511005000
              AND p.date >= $3 - INTERVAL '999110000 minutes'
            GROUP BY p.id,ec.description
            ORDER BY score ASC
            LIMIT ${data.limit};
        `;
        const params = [data.lat, data.lon, data.date, data.last_data, data.user_id];
        return await query.queryDatabase(textQuery, params, table);
    }

    async getEvent(data, table) {
        const query = new Query();
        const textQuery = `
            SELECT 
            p.id, 
            p.code,
            p.description, 
            p.date, 
            p.count_likes ,
            p.count_dislikes ,
            p.count_comments,
            p.count_views,
            p.count_confirmations,
            ST_Y(p.location::geometry) AS lat,
            ST_X(p.location::geometry) AS lon,
            ST_Distance(
            p.location,
            ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography
            ) AS distance_m,
            EXTRACT(EPOCH FROM (now() - p.date)) AS time_s,
            COALESCE(BOOL_OR(user_likes.like_type = 'like'), false) AS is_liked,
            COALESCE(BOOL_OR(user_likes.like_type = 'dislike'), false) AS is_disliked,
            ec.description category
            FROM events p
            INNER JOIN event_categories ec on ec.id=p.event_category_id
            LEFT JOIN likes user_likes 
            ON p.id = user_likes.reference_id 
            AND user_likes.reference_type = 'posts' 
            AND user_likes.user_id = $4
            WHERE p.code = $3
            GROUP BY p.id,ec.description
            LIMIT 1;
        `;
        const params = [data.user_lat, data.user_lon, data.code, data.user_id];
        return await query.queryDatabase(textQuery, params, table);
    }

    async getComments(data, table) {
        const query = new Query();
        const textQuery = `
            SELECT c.*,
                EXTRACT(EPOCH FROM (now() - c.date)) AS time_s,
                u.name_display
                 FROM comments c  
                 INNER JOIN users u on u.id= c.user_id 
                WHERE ($2 = -1 OR c.id < $2) and reference_id=$1 and reference_type=$3
                order by id desc limit 5;
        `;
        const params = [data.reference_id, data.last_data, data.reference_type];
        return await query.queryDatabase(textQuery, params, table);
    }

    async saveViewed(data, table) {
        const viewedPosts = String(data.ids).split(',');
        const query = new Query();
        result = { status: 0 };
        for (const postId of viewedPosts) {
            const deleteQuery = `
                DELETE FROM views 
                WHERE user_id = $1 AND reference_id = $2 AND reference_type = $3;
            `;
            const deleteParams = [data.user_id, postId, data.reference_type];
            result = await query.queryDatabase(deleteQuery, deleteParams, table);
            if (result.count == 0) {
                const updateQuery = `
                    UPDATE ${data.reference_type} 
                    SET count_views = count_views + 1 
                    WHERE id = $1;
                `;
                const updateParams = [postId];
                await query.queryDatabase(updateQuery, updateParams, table);
            }
            const insertQuery = `
                INSERT INTO views (user_id, reference_id, reference_type, date, user_location)
                VALUES ($1, $2, $3, $4, $5);
            `;
            const insertParams = [data.user_id, postId, data.reference_type, data.timestamp, data.user_location];
            result = await query.queryDatabase(insertQuery, insertParams, table);
        }
        return result;
    }

    async updateCountComments(data, table) {
        const query = new Query();
        const updateQuery = `
            UPDATE ${data.reference_type} 
            SET count_comments = (
                SELECT COUNT(*) 
                FROM comments 
                WHERE reference_id = $1 AND reference_type = $2
                )
            WHERE id = $1;
        `;
        const updateParams = [data.reference_id, data.reference_type];
        const result = await query.queryDatabase(updateQuery, updateParams, table);
        return result;
    }

    async updateCountLikes(data, table) {
        const query = new Query();
        const textQuery = `
            SELECT 
                COALESCE(SUM(CASE WHEN like_type = 'like' THEN 1 ELSE 0 END),0) as count_likes,
                COALESCE(SUM(CASE WHEN like_type = 'dislike' THEN 1 ELSE 0 END),0) as count_dislikes
            FROM likes
            WHERE reference_id = $1 AND reference_type = $2;
        `;
        const params = [data.reference_id, data.reference_type];
        result = await query.queryDatabase(textQuery, params, table);
        const likesData = result.row;

        const updateQuery = `
            UPDATE ${data.reference_type}
            SET count_likes = $1, count_dislikes = $2
            WHERE id = $3;
        `;
        const updateParams = [likesData.count_likes, likesData.count_dislikes, data.reference_id];
        return await query.queryDatabase(updateQuery, updateParams, table);
    }

    getTextQueryScore() {
        return `
            ROUND(EXTRACT(EPOCH FROM ($3 - p.date)) + 
            (ST_Distance(
                p.location,
                ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography
            ) * 3.6))
        `;
    }

    getTextQueryDistance() {
        return `
            ST_Distance(
                p.location,
                ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography
            )
        `;
    }

}

module.exports = Activity;