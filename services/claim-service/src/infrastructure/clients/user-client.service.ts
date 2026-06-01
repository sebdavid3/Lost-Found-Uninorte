import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UserClientService {
  private readonly baseUrl = process.env.USER_SERVICE_URL || 'http://user-service:3002';

  constructor(private readonly http: HttpService) {}

  async findById(id: string): Promise<any | null> {
    try {
      const res = await firstValueFrom(this.http.get(`${this.baseUrl}/users/${id}`));
      return res.data;
    } catch (error: any) {
      if (error.response?.status === 404 || error.response?.status === 400) {
        return null;
      }
      throw new HttpException('Error contactando user-service', 502);
    }
  }

  async findByEmail(email: string): Promise<any | null> {
    try {
      const res = await firstValueFrom(
        this.http.get(`${this.baseUrl}/users/me?email=${encodeURIComponent(email)}`),
      );
      return res.data;
    } catch {
      return null;
    }
  }
}
