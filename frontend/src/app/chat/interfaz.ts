import { CommonModule } from "@angular/common";
import { Component, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";

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
    readonly messages = signal<ChatMessage[]>([]);
    readonly isLoading = signal(false);
    readonly errorMessage = signal('');
    draft = '';

    ngOnInit(): void {
        this.loadHistory();
    }

    sendMessage(): void {
        const content = this.draft.trim();
        if (!content || this.isLoading()) return;

        this.errorMessage.set('');
        this.addMessage('user', content);
        this.draft = '';
        this.isLoading.set(true);

        window.setTimeout(() => {
            this.isLoading.set(false);
            if (content.toLowerCase() === 'error') {
                this.errorMessage.set('No se pudo obtener una respuesta. Intenta de nuevo.');
                return;
            }
            this.addMessage('assistant', 'Esta es una respuesta simulada. El siguiente paso sera conectar este flujo con tu backend.');
        }, 900);
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

    //Recuperar conversacion guardada en naveg cuando se recarga (busca en local storage)
    private loadHistory(): void {
        const savedHistory = localStorage.getItem(STORAGE_KEY);
        if (!savedHistory) {
            this.messages.set([this.welcomeMessage()]);
            return;
        }
        try {
            const history = JSON.parse(savedHistory) as ChatMessage[];
            this.messages.set(history.length ? history : [this.welcomeMessage()]);
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