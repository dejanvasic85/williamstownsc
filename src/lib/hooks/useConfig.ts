'use client';

import { use } from 'react';
import { ConfigContext } from '../providers/ConfigProvider';

export function useConfig() {
	const config = use(ConfigContext);

	if (!config) {
		throw new Error('useConfig must be used within ConfigProvider');
	}

	return config;
}
