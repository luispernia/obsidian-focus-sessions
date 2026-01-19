export const formatDuration = (seconds: number): string => {
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return `${m}:${s.toString().padStart(2, "0")}`;
};

export const formatTimerDisplay = (seconds: number): string => {
	if (seconds >= 60) {
		return Math.ceil(seconds / 60).toString();
	}
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

	return Math.max(0, totalSec - currentElapsed);
};
