import { CommonModule } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { finalize } from "rxjs";
import { GeminiService } from "../services/chat.service";

interface ChatMessage {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    createdAt: string;
}

const STORAGE_KEY = 'asistente-ia-chat-history';

@Component ({
    selector: 'app-interfaz',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './interfaz.html',
    styleUrl: './interfaz.css'
})

export class InterfazComponent implements OnInit {
    private readonly geminiService = inject(GeminiService);

    readonly imagenUrl = 'perfilia.jpeg';
    readonly messages = signal<ChatMessage[]>([]);
    readonly isLoading = signal(false);
    readonly errorMessage = signal('');
    draft = '';

    ngOnInit(): void {
        this.loadHistory();
    }

    sendMessage(): void {
        //Obtencion de pregunta desde el html
        const content = this.draft.trim();

        if (!content || this.isLoading()) {
            return;
        }

        this.errorMessage.set('');
        this.addMessage('user', content);
        this.draft = '';
        this.isLoading.set(true);
        
        //Envia el mensaje al back en chat.service
        this.geminiService.generateContent(content)
            .pipe(
                finalize(() => {
                    this.isLoading.set(false);
                })
            )
            .subscribe({
                next: response => {
                    this.addMessage('assistant', this.cleanMarkdown(response.response));
                },
                error: error => {
                    console.error('Error al comunicarse con el backend:', error);

                    const backendMessage = error?.error?.error;

                    this.errorMessage.set(
                        backendMessage || 'No se pudo obtener una respuesta del servidor.'
                    );
                }
            });
    }

    clearConversation(): void {
        this.messages.set([this.welcomeMessage()]);
        this.errorMessage.set('');
        this.persistHistory();
    }

    dismissError(): void {
        this.errorMessage.set('');
    }

    trackMessage(_: number, message: ChatMessage): number {
        return message.id;
    }

    private addMessage(role: ChatMessage['role'], content: string): void {
        this.messages.update(messages => [...messages, { id: Date.now(), role, content, createdAt: new Date().toISOString() }]);
        this.persistHistory();
    }

    private cleanMarkdown(content: string): string {
        return content
            .replace(/\*\*/g, '')
            .replace(/^#{1,6}\s*/gm, '')
            .trim();
    }

    //Recuperar conversacion guardada en naveg cuando se recarga (busca en local storage)
    private loadHistory(): void {
        const savedHistory = localStorage.getItem(STORAGE_KEY);
        if (!savedHistory) {
            this.messages.set([this.welcomeMessage()]);
            return;
        }
        try {
            const history = JSON.parse(savedHistory) as ChatMessage[];
            this.messages.set(history.length
                ? history.map(message => ({ ...message, content: this.cleanMarkdown(message.content) }))
                : [this.welcomeMessage()]);
        } catch {
            this.messages.set([this.welcomeMessage()]);
        }
    }

    private persistHistory(): void {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.messages()));
    }

    private welcomeMessage(): ChatMessage {
        return { id: 1, role: 'assistant', content: 'Hola, soy tu asistente de transito. Puedo ayudarte a consultar informacion y resolver tus dudas.', createdAt: new Date().toISOString() };
    }

}