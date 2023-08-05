import fs from 'fs';
import { singular, snakeToCamel } from "./Util.js";

const serviceCreator = async (tableName, tableComment) => {
    if (!fs.existsSync("./backend")) {
        fs.mkdirSync("./backend");
    }
    
    if (!fs.existsSync("./backend/services")) {
        fs.mkdirSync("./backend/services");
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

    const servicePath = `./backend/services/${AppName}Service.js`;

    if (fs.existsSync(servicePath)) {
        await fs.promises.unlink(servicePath);
    }

    const tmpl = await fs.promises.readFile('./template/service.tmpl', 'utf8');
    const service = tmpl.replace(/\${TableName}/g, tableName).replace(/\${AppName}/g, AppName).replace(/\${AppNameLow}/g, AppNameLow).replace(/\${TableNameSingle}/g, TableNameSingle).replace(/\${TableComment}/g, tableComment);
    
    await fs.promises.writeFile(servicePath, service);
};

export default serviceCreator;