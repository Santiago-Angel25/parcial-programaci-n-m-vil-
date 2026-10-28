import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, timeout } from 'rxjs';

interface PostResponse {
  id: number;
  albumId: number;
  title: string;
  url: string;
  thumbnailUrl: string;
}

export interface Photos {
  id: number;
  albumId: number;
  title: string;
  url: string;
  thumbnailUrl: string;
  stock: number;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl =
    'https://jsonplaceholder.typicode.com/photos';

  getOrders(): Observable<Photos[]> {
    return this.http.get<PostResponse[]>(this.apiUrl).pipe(
      timeout({ first: 10000 }),
      map((posts) => posts.map((post) => ({
        id: post.id,
        albumId: post.albumId,
        title: post.title,
        url: post.url,
        thumbnailUrl: post.thumbnailUrl,
        stock: Math.floor(Math.random() * 10) + 1,
      })))
    );
  }
}