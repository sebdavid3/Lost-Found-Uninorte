import { AppService } from './app.service';
import { ServiceDiscoveryService } from './service-discovery/service-discovery.service';
export declare class AppController {
    private readonly appService;
    private readonly discoveryService;
    constructor(appService: AppService, discoveryService: ServiceDiscoveryService);
    getHello(): string;
    healthCheck(): {
        status: string;
        service: string;
        version: string;
        timestamp: string;
        uptime: number;
    };
    getServiceInstances(serviceName: string): Promise<{
        service: string;
        totalInstances: number;
        instances: {
            id: string;
            address: string;
            port: number;
            tags: string[];
            status: string;
        }[];
        discoveredAt: string;
    }>;
}
