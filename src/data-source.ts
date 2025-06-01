import "reflect-metadata";
import {join} from 'path';
import {readFileSync} from 'fs';
import {DataSource} from "typeorm";

import {User} from "./entity/User";
import {Quest} from "./entity/Quest";
import {Scene} from "./entity/Scene";
import {Param} from "./entity/Param";
import {Choice} from "./entity/Choice";
import {ParamValue} from "./entity/ParamValue";
import {ParamOptions} from "./entity/ParamOptions";

const sslCertPath = process.env.SUPABASE_SSL_CERT;

let sslConfig: any = false;

if (sslCertPath) {
    try {
        const certContent = readFileSync(join(process.cwd(), sslCertPath), 'utf8');
        sslConfig = {
            ca: certContent,
            rejectUnauthorized: true
        };
    } catch (error) {
        console.error('Failed to read SSL certificate:', error);
        throw new Error('SSL certificate loading failed');
    }
}

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.SUPABASE_DB_HOST,
    port: Number(process.env.SUPABASE_DB_PORT),
    username: process.env.SUPABASE_DB_USER,
    password: process.env.SUPABASE_DB_PASSWORD,
    database: process.env.SUPABASE_DB_NAME,
    synchronize: false,
    entities: [User, Quest, Scene, Param, Choice, ParamValue, ParamOptions],
    subscribers: [],
    migrations: [__dirname + '/migration/*.ts'],
    ssl: sslConfig,
    extra: {
        ssl: sslConfig ? {
            ...sslConfig,
            require: true
        } : null,
        pool: {
            max: 5,
            min: 1,
            idleTimeoutMillis: 30000
        }
    },
    logging: ['error']
});

declare global {
    var typeormConnection: DataSource | undefined;
}

export default AppDataSource;
