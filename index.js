#!/usr/bin/env node

import shelljs from "shelljs";
import minimist from "minimist";
import getDatabaseConnection from "./getDatabaseConnection.js";
import { getTableList, getTableInfo } from "./DBHelper.js";
import controllerCreator from "./ControllerCreator.js";
import serviceCreator from "./ServiceCreator.js";
import mapperCreator from "./MapperCreator.js";

// 현재 작업 디렉토리
const cwd = shelljs.pwd().toString();

// 명령줄 파라미터
const { d, h, u, p, output, port, t } = minimist(process.argv.slice(2));

// DATABASE 연동정보 설정
const env = {
    host: h || "127.0.0.1",
    port: port || 3306,
    user: u || "root",
    password: p || "123qwe!@#",
    database: d || "dbnampat",
    output: output || cwd,
    connectionLimit: 10,
    connectTimeout: 30000,
    waitForConnections: true,
};

// 프로그램 시작
console.clear();
console.log("================================================");
console.log("|         MySQL DATABASE Util (by leekh)       |");
console.log("================================================");

for (let key in env) {
    console.log(`- ${key}: ${env[key]}`);
}

(async () => {
    let dbcon = null;
    let tableList = null;
    const inputTableList = t ? t.split(",") : null;

    /*********** 1. 데이터베이스 접속 ***********/
    try {
        dbcon = await getDatabaseConnection(env);
    } catch (e) {
        if (dbcon) {
            dbcon.release();
        }

        console.error(e);
        process.exit(1);
    }

    /*********** 2. 테이블 목록 조회 ***********/
    try {
        const tlist = await getTableList(dbcon);

        if (inputTableList) {
            tableList = tlist.filter((table) => {
                const {name: tableName} = table;
                return inputTableList.includes(tableName);
            });
        } else {
            tableList = [...tlist];
        }

        console.log(tableList);
    } catch (e) {
        if (dbcon) {
            dbcon.release();
        }
        
        console.error(e);
        process.exit(1);
    }

    /*********** 3. 테이블 정보 조회후 파일 생성 ***********/
    for (const table of tableList) {
        const {name: tableName, comment: tableComment} = table;
        await controllerCreator(tableName, tableComment, env.output);
        await serviceCreator(tableName, tableComment, env.output);
        const tableInfo = await getTableInfo(dbcon, tableName);
        await mapperCreator(tableName, tableComment, tableInfo, env.output);
    }

    if (dbcon) {
        dbcon.release();
    }

    process.exit(1);
})();
