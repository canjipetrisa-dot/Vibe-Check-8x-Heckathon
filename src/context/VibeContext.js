import React, { createContext, useContext, useState, useCallback } from 'react';
import { PERSONAS } from '../theme';
import { track } from '../analytics';

const VibeContext = createContext(null);

let nextId = 1;

export function VibeProvider({ children }) {
  const [persona, setPersonaState] = useState(PERSONAS[0]);
  const [vibe, setVibeState] = useState(50);
  const [messages, setMessages] = useState([]);

  const setPersona = useCallback((p) => {
    setPersonaState(p);
    track('persona_selected', { name: p.name });
  }, []);

  // Live value while dragging (no analytics spam)
  const setVibe = useCallback((v) => {
    setVibeState(Math.round(v));
  }, []);

  // Fire analytics only when the drag ends
  const commitVibe = useCallback((v) => {
    const value = Math.round(v);
    setVibeState(value);
    track('vibe_changed', { value });
  }, []);

  const addMessage = useCallback((msg) => {
    const withId = { id: String(nextId++), ...msg };
    setMessages((prev) => [...prev, withId]);
    return withId.id;
  }, []);

  const updateMessage = useCallback((id, patch) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }, []);

  const removeMessage = useCallback((id) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return (
    <VibeContext.Provider
      value={{
        persona,
        setPersona,
        vibe,
        setVibe,
        commitVibe,
        messages,
        addMessage,
        updateMessage,
        removeMessage,
        clearMessages,
      }}
    >
      {children}
    </VibeContext.Provider>
  );
}

export function useVibe() {
  const ctx = useContext(VibeContext);
  if (!ctx) throw new Error('useVibe must be used inside VibeProvider');
  return ctx;
}
