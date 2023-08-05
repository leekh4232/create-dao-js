const getTableList = async (dbcon) => {
    const sql = "SELECT table_name as `name`, TABLE_COMMENT as `comment` FROM information_schema.tables WHERE table_schema=?";
    const input = [dbcon.connection.config.database];

    const [tableList] = await dbcon.query(sql, input);

    if (tableList.length < 1) {
        throw new Error(`현재 ${dbcon.connection.config.database} 데이터베이스에 테이블이 없습니다.`);
    }

    return tableList;
};

const getTableInfo = async (dbcon, tableName) => {
    const sql = `SELECT
            ORDINAL_POSITION AS No,
            COLUMN_NAME, COLUMN_TYPE,
            if( IS_NULLABLE = 'NO', 'NOT NULL', 'NULL' ) as IS_NULL,
            COLUMN_KEY, EXTRA, COLUMN_DEFAULT, COLUMN_COMMENT
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
        ORDER BY TABLE_NAME, ORDINAL_POSITION`;

    const input = [dbcon.connection.config.database, tableName];
    //console.log(input.join("."));

    const [ result ] = await dbcon.query(sql, input);

    if (result.length < 1) {
        throw new Error(`${dbcon.connection.config.database}.${tableName} 테이블에는 컬럼이 없습니다.`);
    }

    return result;
}

export { getTableList, getTableInfo };
