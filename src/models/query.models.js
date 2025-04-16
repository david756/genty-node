const { Pool,types } = require('pg');
types.setTypeParser(20, val => parseInt(val, 10));

class Query {

    constructor() {
        this.pool = new Pool({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
        });
    }

    async queryDatabase(query, params, table) {
        
        const client = await this.pool.connect();
        try {
            const res = await client.query(query, params);
            return {
                status: 1,
                content: res.rows,
                row: res.rows[0],
                count: res.rowCount,
                lastId: res.rows[0]?.id || 0,
                table: table,
            };
        } catch (err) {
            return {
                status: 0,
                content: "Error en DB query: "+err.message,
                row: null,
                count: 0,
                lastId: 0,
                table: table,
            };
        } finally {
            client.release();
        }
    }

    async getById(table, id) {
        const query = `SELECT * FROM ${table} WHERE id = $1`;
        return await this.queryDatabase(query, [id], table);
    }

    async getByKey(table, key, value) {
        const query = `SELECT * FROM ${table} WHERE ${key} = $1`;
        return await this.queryDatabase(query, [value], table);
    }

    async getAnd(table, key1, value1, key2, value2, key3, value3) {
        let conditions = [];
        let values = [];
        if (key1 && value1 !== undefined) {
            conditions.push(`${key1} = $${conditions.length + 1}`);
            values.push(value1);
        }
        if (key2 && value2 !== undefined) {
            conditions.push(`${key2} = $${conditions.length + 1}`);
            values.push(value2);
        }
        if (key3 && value3 !== undefined) {
            conditions.push(`${key3} = $${conditions.length + 1}`);
            values.push(value3);
        }
        const query = `SELECT * FROM ${table} WHERE ${conditions.join(' AND ')}`;
        return await this.queryDatabase(query, values, table);

    }

    async getByMultipleKeys(table, conditions) {
        const keys = Object.keys(conditions);
        const values = Object.values(conditions);
        const query = `SELECT * FROM ${table} WHERE ${keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ')}`;
        return await this.queryDatabase(query, values, table);
    }

    async getAll(table) {
        const query = `SELECT * FROM ${table}`;
        return await this.queryDatabase(query, table);
    }

    async create(table, data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
        const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
        return await this.queryDatabase(query, values, table);
    }

    async updateById(table, id, data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const query = `UPDATE ${table} SET ${keys.map((key, index) => `${key} = $${index + 1}`).join(', ')} WHERE id = $${keys.length + 1} RETURNING *`;
        return await this.queryDatabase(query, [...values, id], table);
    }

    async updateByKeys(table, data, conditions) {
        const dataKeys = Object.keys(data);
        const dataValues = Object.values(data);
        const conditionKeys = Object.keys(conditions);
        const conditionValues = Object.values(conditions);
        const query = `UPDATE ${table} SET ${dataKeys.map((key, index) => `${key} = $${index + 1}`).join(', ')} WHERE ${conditionKeys.map((key, index) => `${key} = $${dataKeys.length + index + 1}`).join(' AND ')} RETURNING *`;
        return await this.queryDatabase(query, [...dataValues, ...conditionValues], table);
    }

    async deleteById(table, id) {
        const query = `DELETE FROM ${table} WHERE id = $1 RETURNING *`;
        return await this.queryDatabase(query, [id], table);
    }

    async deleteByKey(table, key, value) {
        const query = `DELETE FROM ${table} WHERE ${key} = $1 RETURNING *`;
        return await this.queryDatabase(query, [value], table);
    }

    async deleteByMultipleKeys(table, conditions) {
        const keys = Object.keys(conditions);
        const values = Object.values(conditions);
        const query = `DELETE FROM ${table} WHERE ${keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ')} RETURNING *`;
        return await this.queryDatabase(query, values, table);
    }
}

module.exports = Query;


