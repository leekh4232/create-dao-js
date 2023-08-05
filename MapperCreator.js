import fs from 'fs';
import { singular, snakeToCamel } from "./Util.js";
import path from 'path';
import { fileURLToPath } from 'url';

const serviceCreator = async (tableName, tableComment, tableInfo) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    if (!fs.existsSync(`${__dirname}/backend`)) {
        fs.mkdirSync(`${__dirname}/backend`);
    }
    
    if (!fs.existsSync(`${__dirname}/backend/mappers`)) {
        fs.mkdirSync(`${__dirname}/backend/mappers`);
    }

    /*
        ${AppName} : 대문자,단수형
        ${AppNameLow} : 소문자,단수형
        ${TableNameSingle} : 테이블이름(카멜)단수형
    */
    const camelUpper = snakeToCamel(tableName, true);
    const camelLower = snakeToCamel(tableName, false);
    const AppName = singular(camelUpper);
    const AppNameLow = singular(camelLower);
    const TableNameSingle = singular(tableName).toLowerCase();

    // console.log(`tableName: ${tableName}`);
    // console.log(`camelUpper: ${camelUpper}`);
    // console.log(`camelLower: ${camelLower}`);
    // console.log(`AppName: ${AppName}`);
    // console.log(`AppNameLow: ${AppNameLow}`);
    // console.log(`TableNameSingle: ${TableNameSingle}`);

    const mapperPath = `${__dirname}/backend/mappers/${AppName}Mapper.xml`;

    if (fs.existsSync(mapperPath)) {
        await fs.promises.unlink(mapperPath);
    }

    const selectFields = [];
    const insertFields = [];
    const insertValues = [];
    const updateFieldsAndValues = [];

    for (const column of tableInfo) {
        selectFields.push(`\`${column.COLUMN_NAME}\` AS \`${snakeToCamel(column.COLUMN_NAME)}\``);
        insertFields.push(`${column.COLUMN_NAME}`);

        if (column.COLUMN_NAME === 'reg_date' || column.COLUMN_NAME === 'edit_date') {
            insertValues.push(`now()`);
        } else if (column.COLUMN_NAME === 'hits') {
            insertValues.push(`0`);
        } else {
            insertValues.push(`#{${snakeToCamel(column.COLUMN_NAME)}}`);
        }

        if (column.COLUMN_NAME === 'reg_date' || column.COLUMN_NAME === 'hits') {
            continue;
        } else if (column.COLUMN_NAME === 'edit_date') {
            updateFieldsAndValues.push(`\`${column.COLUMN_NAME}\` = now()`);
        } else {
            updateFieldsAndValues.push(`\`${column.COLUMN_NAME}\` = #{${snakeToCamel(column.COLUMN_NAME)}}`);
        }
    }


    const tmpl = await fs.promises.readFile(`${__dirname}/template/mapper.tmpl`, 'utf8');
    const mapper = tmpl.replace(/\${TableName}/g, tableName).replace(/\${AppName}/g, AppName).replace(/\${AppNameLow}/g, AppNameLow).replace(/\${TableNameSingle}/g, TableNameSingle).replace(/\${TableComment}/g, tableComment).replace(/\${SelectFields}/g, selectFields.join(', ')).replace(/\${InsertFields}/g, insertFields.join(', ')).replace(/\${InsertValues}/g, insertValues.join(', '));
    
    await fs.promises.writeFile(mapperPath, mapper);
};

export default serviceCreator;