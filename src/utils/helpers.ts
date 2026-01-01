export function getFormattedDate(format: string): string {
	// @ts-ignore
	const moment = (window as any).moment;
	return moment().format(format);
}
