import 'reflect-metadata';
import AppDataSource from "@/data-source";
import {DataSource} from "typeorm";

export class DatabaseService {
    static #instance: DatabaseService;
    private static instance: DatabaseService | null;
    connection: DataSource;

    /**
     * @deprecated Use create method instead this
     */
    constructor() {
        if (DatabaseService.#instance) {
            return DatabaseService.#instance;
        }

        DatabaseService.#instance = this;
        this.init();
    }

    public static async create(): Promise<DatabaseService> {
        try {
            if (!DatabaseService.instance) {
                DatabaseService.instance = new DatabaseService();
                await DatabaseService.instance.init();
            }
            return DatabaseService.instance;
        } catch (error: any) {
            throw new Error(`Database connection failed: ${error.message}`);
        }
    }

    private async init() {
        this.connection = await AppDataSource.initialize();
    }

    public async disconnect(): Promise<void> {
        if (this.connection.isInitialized) {
            await this.connection.destroy();
            DatabaseService.instance = null;
        }
    }
}
