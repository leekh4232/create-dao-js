#!/usr/bin/env node

import DBPoolHelper from "./DBPoolHelper.js";

const getDatabaseConnection = async (env) => {
    const connectionInfo = {...env};
    delete connectionInfo.output;
    
    const dbcon = await DBPoolHelper.getInstance(connectionInfo).getConnection();
    return dbcon;
};

export default getDatabaseConnection;