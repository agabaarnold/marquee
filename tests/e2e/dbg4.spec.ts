import { expect, test } from "@playwright/test";

test("probe movie hydration", async ({ page }) => {
	const messages: string[] = [];
	page.on("console", (m) => messages.push(`${m.type()}: ${m.text().slice(0, 160)}`));
	page.on("pageerror", (e) => messages.push(`PAGEERROR: ${e.message.slice(0, 160)}`));
	await page.goto("/movie/550");
	await page.waitForLoadState("networkidle");
	const probe = await page.evaluate(() => {
		const hook = (window as unknown as { __REACT_DEVTOOLS_GLOBAL_HOOK__?: { renderers?: Map<number, unknown> } }).__REACT_DEVTOOLS_GLOBAL_HOOK__;
		return {
			reactRoots: hook?.renderers ? [...hook.renderers.keys()] : "no-hook",
			hasRoot: !!document.querySelector("[data-testid]"),
		};
	});
	console.log("probe:", JSON.stringify(probe));
	console.log("messages:", JSON.stringify(messages.slice(0, 8)));
	await expect(true).toBe(true);
});
