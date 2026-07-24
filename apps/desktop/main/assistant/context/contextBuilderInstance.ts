import { conversationMemory } from '../conversationMemoryInstance.js';
import { conversationManager } from '../conversation/conversationManagerInstance.js';
import { sessionManager } from '../session/sessionInstance.js';
import { ContextBuilder } from './ContextBuilder.js';

export const contextBuilder = new ContextBuilder({
  conversationManager,
  sessionManager,
  workingMemory: conversationMemory,
});
