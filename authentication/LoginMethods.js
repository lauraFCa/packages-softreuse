import mysql from 'mysql2/promise';

export default class LoginMethods {
    
    dbParams = {};

    /**
     * Set the parameters to connect to the database.
     * @param {Object} dbParams - The parameters to connect to the database. IE: { host: 'localhost', port: '3306', user
     */
    setDbParams = (dbParams) => {
        this.dbParams = dbParams;
    }

    /**
     * Returns the parameters to connect to the database.
     * @returns {Object} - The parameters to connect to the database.
     */
    getDbParams = () => this.dbParams;


    /**
     * Runs a SQL query on the database.
     * @param {string} sql - The SQL query to execute.
     * @returns {Promise<Array>} - A promise that resolves to the query results.
     */
    runQuery = async (sql) => {
        const connection = await mysql.createConnection(this.dbParams);

        try {
            const [results, fields] = await connection.query(sql);
            return results;
        } catch (e) {
            console.log('Error executing the query:', e);
        }
    };

    /**
     * Get all user data from DB
     * @param {string} table - The table to query. IE: 'my_table'
     * @param {Array<object>} whereParams - The parameter for query to filter the select Data. IE: 
     *  [{id: 1, junction: 'AND'}, {name: 'test', junction: 'OR'}]
     * @returns User data, or an error message if no parameters are given
     */
    getUser = async (table, whereParams) => {
        if (table && whereParams) {
            let selectQuery = `SELECT * FROM ${table}`;
            if (whereParams.length > 0) {
                const whereQ = [];
                whereParams.forEach(param => {
                    const keys = Object.keys(param);
                    let elementStr = "";
                    keys.forEach(key => {
                        if (key != 'junction' && param['junction']) {
                            elementStr += `${param['junction']} ${key} = '${param[key]}'`;
                        } else if (!param['junction']) {
                            elementStr += `${key} = '${param[key]}'`;
                        }
                    });
                    whereQ.push(elementStr);
                });
                selectQuery += ` WHERE ${whereQ.join(' ')}`.replace("WHERE AND", "WHERE").replace("WHERE OR", "WHERE");
            }
            selectQuery += ';';
            const user = await this.runQuery(selectQuery);
            console.log('user:', user);
            return user;
        } else {
            return [400, "Missing parameters (all fields are mandatory to get a User)"]
        }
    }

    /**
     * Runs query to insert new user in database
     * @param {string} table - The table to query. IE: 'my_table'
     * @param {Object} paramsToInsert - The parameter to insert into talbe IE: { name: 'my name', email: 'my email', age: 23, isChild: true };
     */
    createUser = async (table, insertObject) => {
        if (table && insertObject) {
            const keys = Object.keys(insertObject);
            const values = Object.values(insertObject);
            const queryValues = values.map(value => {
                return typeof value === 'string' ? `'${value}'` : value;
            });
            const insertQuery = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${queryValues.join(', ')});`;
            const outp = await this.runQuery(insertQuery);
            return outp;
        } else {
            return [false, 'Missing parameters (all fields are mandatory to save a Data)'];
        }
    }

}