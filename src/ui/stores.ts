import { writable, readable, derived } from "svelte/store";
import type FocusSessionsPlugin from "@/main";
import type { SessionManager, FocusSession } from "@/services/session-manager";
import { getRemainingTime } from "@/utils/time-utils";

export const plugin = writable<FocusSessionsPlugin>();

export const draftName = writable("Focus Session");
export const draftMinutes = writable(25);
export const draftSeconds = writable(0);

export const session = readable<FocusSession | null>(null, (set) => {
	let sessionManager: SessionManager;

	const unsubscribePlugin = plugin.subscribe((p) => {
		if (p) {
			sessionManager = p.sessionManager;

			// Initial set
			set(sessionManager.getActiveSession());

			// Listen for changes
			sessionManager.onChange(() => {
				set(sessionManager.getActiveSession());
			});
		}
	});

	return () => {
		unsubscribePlugin();
		// We technically can't unsubscribe from sessionManager with the current API
		// without a specific listener reference, but the plugin lifecycle handles this.
		// Ideally we would add a specific removeListener method if we need granular cleanup,
		// but for a singleton service it's acceptable.
	};
});

export const timeRemaining = derived(
	session,
	($session, set) => {
		if (!$session || $session.status === "completed") {
			set(0);
			return;
		}

		const update = () => {
			if ($session.status === "running") {
				const remaining = getRemainingTime(
					$session.duration,
					$session.elapsed,
					$session.status,
					$session.lastResumed,
				);
				set(remaining);
			} else if ($session.status === "paused") {
				const remaining = getRemainingTime(
					$session.duration,
					$session.elapsed,
					$session.status,
					$session.lastResumed,
				);
				set(remaining);
			}
		};

		update();

		const interval = setInterval(update, 1000);

		return () => {
			clearInterval(interval);
		};
	},
	0, // Initial value
);
