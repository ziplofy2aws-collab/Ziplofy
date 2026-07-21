import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { useSocket } from './socket.context';

describe('SocketProvider / useSocket', () => {
  it('throws if useSocket used outside provider', () => {
    const Bad = () => {
      useSocket();
      return null;
    };
    expect(() => render(<Bad />)).toThrow(/useSocket must be used within a SocketProvider/);
  });
});

