import { useEffect, useMemo, useState } from 'react';

import styles from './LeftPanel.module.css';
import type { ConversationSummary } from '../../types/assistant';
import { useAIState } from '../../state/useAIState';

type ConversationGroupName = 'Today' | 'Yesterday' | 'Last 7 Days' | 'Older';

interface ConversationGroup {
  readonly name: ConversationGroupName;
  readonly conversations: readonly ConversationSummary[];
}

const DAY_MS = 86_400_000;

export function LeftPanel() {
  const {
    activeConversationId,
    conversations,
    createConversation,
    deleteConversation,
    renameConversation,
    selectConversation,
    state,
  } = useAIState();
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');

  const groups = useMemo(() => groupConversations(conversations), [conversations]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent): void => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'n') {
        event.preventDefault();
        void createConversation();
      }
    };

    window.addEventListener('keydown', handleShortcut);
    return () => {
      window.removeEventListener('keydown', handleShortcut);
    };
  }, [createConversation]);

  const beginRename = (conversation: ConversationSummary): void => {
    setRenamingId(conversation.id);
    setDraftTitle(conversation.title);
  };

  const commitRename = async (): Promise<void> => {
    if (renamingId === null) {
      return;
    }

    await renameConversation(renamingId, draftTitle);
    setRenamingId(null);
    setDraftTitle('');
  };

  const confirmDelete = (conversation: ConversationSummary): void => {
    if (window.confirm(`Delete "${conversation.title}"? This cannot be undone.`)) {
      void deleteConversation(conversation.id);
    }
  };

  return (
    <aside className={styles.container} aria-label="Conversation sidebar">
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>HANNA</span>
          <h2>Conversations</h2>
        </div>
        <button className={styles.newButton} type="button" onClick={() => void createConversation()} title="New chat (Ctrl+N)">
          + New Chat
        </button>
      </header>

      <div className={styles.status}>{state === 'loading' ? 'Loading conversations...' : `${String(conversations.length)} saved chats`}</div>

      <div className={styles.list}>
        {groups.map((group) => group.conversations.length > 0 && (
          <section className={styles.group} key={group.name}>
            <h3>{group.name}</h3>
            {group.conversations.map((conversation) => {
              const isActive = conversation.id === activeConversationId;
              return (
                <article className={classNames(styles.item, isActive ? styles.active : undefined)} key={conversation.id}>
                  <button className={styles.selectButton} type="button" onClick={() => {
                    void selectConversation(conversation.id);
                  }}>
                    {renamingId === conversation.id ? (
                      <input
                        autoFocus
                        className={styles.renameInput}
                        value={draftTitle}
                        onChange={(event) => {
                          setDraftTitle(event.target.value);
                        }}
                        onBlur={() => {
                          void commitRename();
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            void commitRename();
                          }
                          if (event.key === 'Escape') {
                            setRenamingId(null);
                          }
                        }}
                      />
                    ) : (
                      <>
                        <span className={styles.title}>{conversation.title}</span>
                        <span className={styles.meta}>{String(conversation.messageCount)} messages</span>
                      </>
                    )}
                  </button>
                  <div className={styles.actions}>
                    <button type="button" onClick={() => {
                      beginRename(conversation);
                    }} aria-label={`Rename ${conversation.title}`}>Rename</button>
                    <button type="button" onClick={() => {
                      confirmDelete(conversation);
                    }} aria-label={`Delete ${conversation.title}`}>Delete</button>
                  </div>
                </article>
              );
            })}
          </section>
        ))}
      </div>
    </aside>
  );
}

function groupConversations(conversations: readonly ConversationSummary[]): ConversationGroup[] {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const groups: ConversationGroup[] = [
    { name: 'Today', conversations: [] },
    { name: 'Yesterday', conversations: [] },
    { name: 'Last 7 Days', conversations: [] },
    { name: 'Older', conversations: [] },
  ];

  for (const conversation of conversations) {
    const age = startOfToday - new Date(conversation.updatedAt).setHours(0, 0, 0, 0);
    const index = age <= 0 ? 0 : age <= DAY_MS ? 1 : age <= DAY_MS * 6 ? 2 : 3;
    const group = groups[index];

    if (group !== undefined) {
      groups[index] = { name: group.name, conversations: [...group.conversations, conversation] };
    }
  }

  return groups;
}

function classNames(...names: readonly (string | undefined)[]): string {
  return names.filter((name): name is string => name !== undefined).join(' ');
}
