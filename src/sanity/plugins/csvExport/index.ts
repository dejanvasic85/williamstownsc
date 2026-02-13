import { DownloadIcon } from '@sanity/icons';
import { definePlugin } from 'sanity';
import { CsvExportTool } from './csvExportTool';

export const csvExportPlugin = definePlugin({
	name: 'csv-export',
	tools: [
		{
			title: 'CSV Export',
			name: 'csv-export',
			icon: DownloadIcon,
			component: CsvExportTool
		}
	]
});
