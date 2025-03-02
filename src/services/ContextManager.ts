import { kv } from '@vercel/kv';
import { ConversationContext, Context, Message, SessionMetadata } from '../types/context';
import { generateMarkdown } from '../utils/markdownGenerator';

export class ContextManager {
  private static readonly EXPIRATION_TIME = 30 * 60; // 30分（秒単位）
  private static readonly CONTEXT_PREFIX = 'context:';

  public async createContext(userId: string): Promise<ConversationContext> {
    const sessionId = `session_${Date.now()}`;
    const newContext: ConversationContext = {
      userId,
      sessionId,
      context: {
        lastMessage: '',
        timestamp: new Date(),
        alcoholLevel: 0,
        mood: '',
        topic: '',
        messages: [],
        customData: {
          recentTopics: [],
          interactionCount: 0,
          aiAnalysis: {
            userConcerns: [],
            recommendedTopics: []
          }
        }
      },
      expiresAt: new Date(Date.now() + ContextManager.EXPIRATION_TIME * 1000)
    };

    const key = this.getContextKey(userId);
    await kv.set(key, newContext, { ex: ContextManager.EXPIRATION_TIME });
    return newContext;
  }

  public async getContext(userId: string): Promise<ConversationContext | null> {
    const key = this.getContextKey(userId);
    const context = await kv.get<ConversationContext>(key);
    
    if (!context) return null;

    if (this.isContextExpired(context)) {
      await this.archiveContext(userId);
      return null;
    }

    return context;
  }

  public async updateContext(userId: string, updates: Partial<Context>): Promise<ConversationContext> {
    let context = await this.getContext(userId);
    if (!context) {
      context = await this.createContext(userId);
    }

    context.context = {
      ...context.context,
      ...updates,
      timestamp: new Date()
    };

    context.expiresAt = new Date(Date.now() + ContextManager.EXPIRATION_TIME * 1000);
    
    const key = this.getContextKey(userId);
    await kv.set(key, context, { ex: ContextManager.EXPIRATION_TIME });
    return context;
  }

  public async addMessage(userId: string, message: Message): Promise<ConversationContext> {
    const context = await this.getContext(userId);
    if (!context) throw new Error('No active context found');

    context.context.messages.push(message);
    context.context.lastMessage = message.content;
    context.context.timestamp = new Date();
    context.expiresAt = new Date(Date.now() + ContextManager.EXPIRATION_TIME * 1000);

    const key = this.getContextKey(userId);
    await kv.set(key, context, { ex: ContextManager.EXPIRATION_TIME });
    return context;
  }

  private isContextExpired(context: ConversationContext): boolean {
    return context.expiresAt.getTime() < Date.now();
  }

  public async archiveContext(userId: string): Promise<string> {
    const key = this.getContextKey(userId);
    const context = await kv.get<ConversationContext>(key);
    if (!context) throw new Error('No context to archive');

    const metadata: SessionMetadata = {
      sessionId: context.sessionId,
      startTime: context.context.messages[0]?.timestamp || context.context.timestamp,
      endTime: new Date(),
      context: context.context
    };

    const markdown = generateMarkdown(metadata);
    await kv.del(key);

    return markdown;
  }

  public async restoreContext(userId: string, markdown: string): Promise<ConversationContext> {
    try {
      const metadata = this.extractMetadataFromMarkdown(markdown);
      const context: ConversationContext = {
        userId,
        sessionId: metadata.sessionId,
        context: metadata.context,
        expiresAt: new Date(Date.now() + ContextManager.EXPIRATION_TIME * 1000)
      };

      const key = this.getContextKey(userId);
      await kv.set(key, context, { ex: ContextManager.EXPIRATION_TIME });
      return context;
    } catch (error) {
      throw new Error('Invalid markdown format for context restoration');
    }
  }

  private extractMetadataFromMarkdown(markdown: string): SessionMetadata {
    const metadataMatch = markdown.match(/<!--\nsession_metadata:([\s\S]*?)-->/);
    if (!metadataMatch) throw new Error('No metadata found in markdown');

    try {
      const metadata = JSON.parse(metadataMatch[1]);
      return metadata;
    } catch (error) {
      throw new Error('Invalid metadata format');
    }
  }

  private getContextKey(userId: string): string {
    return `${ContextManager.CONTEXT_PREFIX}${userId}`;
  }
} 