import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { ChatResponse, ChatRequest } from './chat.type';

export class ChatService {
  #http = inject(HttpClient);

  postChatHome(data: ChatRequest) {
    return this.#http.post<{ success: boolean, data: ChatResponse }>('chat/home', data);
  }
  postChat(data: ChatRequest) {
    return this.#http.post<{ success: boolean, data: ChatResponse }>('chat', data);
  }
  getChat(data: {}) {
    return this.#http.get<{ success: boolean, data: ChatResponse }>('chat', { params: data });
  }
  deleteChat(data: { _id: string }) {
    return this.#http.delete<{ success: boolean, data: null }>('chat', { params: data });
  }
}
