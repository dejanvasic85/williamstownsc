'use client';

import { type ReactNode, createContext } from 'react';
import type { ClientConfig } from '@/lib/config';

const ConfigContext = createContext<ClientConfig | null>(null);

type ConfigProviderProps = {
	children: ReactNode;
	config: ClientConfig;
};

export function ConfigProvider({ children, config }: ConfigProviderProps) {
	return <ConfigContext value={config}>{children}</ConfigContext>;
}

export { ConfigContext };
