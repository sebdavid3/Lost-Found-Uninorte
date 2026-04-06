import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
export declare class ServiceDiscoveryService implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    private consul;
    private readonly serviceId;
    private readonly serviceName;
    constructor();
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    private registerService;
    private deregisterService;
    discoverService(serviceName: string): Promise<{
        address: string;
        port: number;
    }>;
    getAllInstances(serviceName: string): Promise<Array<{
        id: string;
        address: string;
        port: number;
        tags: string[];
        status: string;
    }>>;
}
