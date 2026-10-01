import { Monitor, Moon, Sun } from "lucide-react";

import { useTheme } from "./store";
import type { Theme } from "./store";

const NEXT: Record<Theme, { next: Theme; label: string }> = {
	system: { label: "Switch to light theme", next: "light" },
	light: { label: "Switch to dark theme", next: "dark" },
	dark: { label: "Switch to system theme", next: "system" },
};

const ICON = { system: Monitor, light: Sun, dark: Moon } as const;

export const ThemeToggle = ({ className }: { className?: string }) => {
	const { setTheme, theme } = useTheme();
	const Icon = ICON[theme];
	const { label, next } = NEXT[theme];

	return (
		<button
			aria-label={label}
			className={className}
			onClick={() => {
				setTheme(next);
			}}
			title={label}
			type="button"
		>
			<Icon aria-hidden="true" className="size-4" />
		</button>
	);
};
