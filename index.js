#!/usr/bin/env node

import shelljs from "shelljs";
import minimist from "minimist";
import getDatabaseConnection from "./getDatabaseConnection.js";
import { getTableList, getTableInfo } from "./DBHelper.js";
import controllerCreator from "./ControllerCreator.js";
import serviceCreator from "./ServiceCreator.js";
import mapperCreator from "./MapperCreator.js";
import { table } from 'table';

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
//console.clear();

const intro = [['MySQL DATABASE Util (by leekh)', '']];

// const configTable = new Table({
//     head: ['key', 'value']
// });

for (let key in env) {
    intro.push([key, env[key]]);
}

const introConfig = {
    columns: [
      { alignment: 'left' },
      { alignment: 'right' }
    ],
    spanningCells: [
      { col: 0, row: 0, colSpan: 2, alignment: 'center' }
    ],
  };

console.log(table(intro, introConfig));

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

        //console.log(tableList);
    } catch (e) {
        if (dbcon) {
            dbcon.release();
        }
        
        console.error(e);
        process.exit(1);
    }

    /*********** 3. 테이블 정보 조회후 파일 생성 ***********/

    const work = [['Create Source Code', '', '', '', '']];

    work.push(['table', 'comment', 'controller', 'service', 'mapper']);

    for (const table of tableList) {
        const {name: tableName, comment: tableComment} = table;
        const controllerName = await controllerCreator(tableName, tableComment, env.output);
        const serviceName = await serviceCreator(tableName, tableComment, env.output);
        const tableInfo = await getTableInfo(dbcon, tableName);
        const mapperName = await mapperCreator(tableName, tableComment, tableInfo, env.output);

        work.push([tableName, tableComment, controllerName, serviceName, mapperName]);
    }

    const config = {
        columns: [
          { alignment: 'left' },
          { alignment: 'left' },
          { alignment: 'right' },
          { alignment: 'right' },
          { alignment: 'right' }
        ],
        spanningCells: [
          { col: 0, row: 0, colSpan: 5, alignment: 'center' }
        ],
      };

    console.log(table(work, config));

    if (dbcon) {
        dbcon.release();
    }

    process.exit(1);
})();
