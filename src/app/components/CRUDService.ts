import {getBaseUrl} from "@/lib/url-helper";

export abstract class CRUDService {
    private baseUrl = getBaseUrl();
    protected static instances = new Map<Function, any>();

    protected headers = {
        'Content-Type': 'application/json',
        // Authorization: `Bearer ${localStorage.getItem('token')}`
    }
    protected abstract apiUrl: string;

    public static init<T>(cls: new () => T): T {
        if (!CRUDService.instances.has(cls)) {
            CRUDService.instances.set(cls, new cls());
        }
        return CRUDService.instances.get(cls);
    }

    getUrl(id?: number) {
        if (id)
            return `${this.baseUrl}${this.apiUrl}/${id}`;

        return `${this.baseUrl}${this.apiUrl}`;
    }

    async create<T>(body: T): Promise<T> {
        const response = await fetch(this.getUrl(), {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error('API create failed');
        }
        return await response.json();
    }

    async load<T>(): Promise<T> {
        const response = await fetch(this.getUrl(), {
            method: 'GET',
            headers: this.headers,
        });

        if (!response.ok) {
            throw new Error('API load failed');
        }

        return await response.json()
    }

    async delete<T>(id: number): Promise<T> {
        const response = await fetch(this.getUrl(), {
            method: 'DELETE',
            headers: this.headers,
        });

        if (!response.ok) {
            throw new Error('API delete failed');
        }

        return await response.json()
    }

    async getById(id: number) {
        console.log(this.getUrl(id));
        const response = await fetch(this.getUrl(id), {
            method: 'GET',
            headers: this.headers,
        });

        if (!response.ok) {
            throw new Error('API load failed');
        }

        return await response.json()
    }
}
