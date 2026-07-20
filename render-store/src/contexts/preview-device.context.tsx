import { createContext, useContext, type ReactNode } from 'react';

export type PreviewDevice = 'desktop' | 'mobile';

const PreviewDeviceContext = createContext<PreviewDevice>('desktop');

export function PreviewDeviceProvider({
  device,
  children,
}: {
  device: PreviewDevice;
  children: ReactNode;
}) {
  return <PreviewDeviceContext.Provider value={device}>{children}</PreviewDeviceContext.Provider>;
}

export function usePreviewDevice(): PreviewDevice {
  return useContext(PreviewDeviceContext);
}
