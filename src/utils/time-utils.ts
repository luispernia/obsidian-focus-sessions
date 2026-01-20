export const formatDuration = (seconds: number): string => {
	const sign = seconds < 0 ? "+" : "";
	const absSeconds = Math.abs(seconds);
	const m = Math.floor(absSeconds / 60);
	const s = absSeconds % 60;
	return `${sign}${m}:${s.toString().padStart(2, "0")}`;
};

export const formatTimerDisplay = (seconds: number): string => {
	return formatDuration(seconds);
};

export const getRemainingTime = (
	durationSeconds: number,
	elapsed: number,
	status: "running" | "paused" | "completed",
	lastResumed: number,
): number => {
	if (status === "completed") return 0;

	// durationSeconds is already in seconds
	const totalSec = durationSeconds;
	let currentElapsed = elapsed;

	if (status === "running") {
		const now = Date.now();
		const additional = Math.floor((now - lastResumed) / 1000);
		currentElapsed += additional;
	}

	return totalSec - currentElapsed;
};
