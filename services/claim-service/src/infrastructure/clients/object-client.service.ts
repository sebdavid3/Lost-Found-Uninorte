import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ObjectClientService {
  private readonly baseUrl = process.env.OBJECT_SERVICE_URL || 'http://object-service:3003';

  constructor(private readonly http: HttpService) {}

  async findById(id: string): Promise<any | null> {
    try {
      const res = await firstValueFrom(this.http.get(`${this.baseUrl}/objects/${id}`));
      return res.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw new HttpException('Error contactando object-service', 502);
    }
  }

  async findAll(filters: { q?: string; category?: string; location?: string; page?: number; limit?: number } = {}): Promise<any> {
    const params = new URLSearchParams();
    if (filters.q) params.append('q', filters.q);
    if (filters.category) params.append('category', filters.category);
    if (filters.location) params.append('location', filters.location);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));
    const res = await firstValueFrom(this.http.get(`${this.baseUrl}/objects?${params.toString()}`));
    return res.data;
  }

  async findByDateRange(start: string, end: string): Promise<any[]> {
    const res = await firstValueFrom(
      this.http.get(`${this.baseUrl}/objects?foundAtStart=${encodeURIComponent(start)}&foundAtEnd=${encodeURIComponent(end)}`),
    );
    const data = res.data;
    if (data && data.items) return data.items;
    return Array.isArray(data) ? data : [];
  }

  async updateStatus(id: string, status: string): Promise<any> {
    const res = await firstValueFrom(
      this.http.patch(
        `${this.baseUrl}/objects/${id}`,
        { status },
        { headers: { 'x-user-role': 'ADMIN' } }
      )
    );
    return res.data;
  }
}
