import { Injectable, inject } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GeminiResponse{
    response: string;
}

@Injectable({
    providedIn: 'root'
})

export class GeminiService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = 'http://localhost:3000/api/gemini';

    generateContent(prompt: string): Observable<GeminiResponse>{
        return this.http.post<GeminiResponse>
        (this.apiUrl, 
        {prompt}
        );
    }
}
