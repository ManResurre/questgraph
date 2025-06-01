import 'reflect-metadata';
import AppDataSource from "../data-source";
import {DataSource} from "typeorm";

export class DatabaseService {
    private static instance: DatabaseService | null;
    connection: DataSource;

    private constructor() {
    }

    public static async getInstance(): Promise<DatabaseService> {
        try {
            if (!DatabaseService.instance) {
                DatabaseService.instance = new DatabaseService();
            }
            await DatabaseService.instance.init();
            return DatabaseService.instance;
        } catch (error: any) {
            throw new Error(`Database connection failed: ${error.message}`);
        }
    }

    async init() {
        if (!this.connection || !this.connection.isInitialized)
            this.connection = await AppDataSource.initialize();
    }

    public async disconnect(): Promise<void> {
        if (this.connection.isInitialized) {
            await this.connection.destroy();
            DatabaseService.instance = null;
        }
    }
}
