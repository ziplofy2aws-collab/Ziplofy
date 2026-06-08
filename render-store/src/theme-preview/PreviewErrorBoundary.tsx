import { Component, type ErrorInfo, type ReactNode } from 'react';
import { postToParent } from './previewBridge';

type Props = { children: ReactNode };
type State = { error: Error | null };

export class PreviewErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    const message = error.message || 'Theme render error';
    postToParent({
      source: 'ziplofy-theme-preview',
      type: 'ZIPLOFY_PREVIEW_ERROR',
      payload: { message: `${message}${info.componentStack ? '' : ''}` },
    });
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            padding: 24,
            fontFamily: 'system-ui, sans-serif',
            color: '#b91c1c',
            background: '#fef2f2',
            minHeight: '100vh',
          }}
        >
          <p style={{ marginTop: 0, fontWeight: 600 }}>Theme preview crashed</p>
          <pre style={{ fontSize: 12, whiteSpace: 'pre-wrap' }}>{this.state.error.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
