/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request, env, _ctx): Promise<Response> {
		const newRequest = new Request(request);



		const domain = env.domain;

		newRequest.headers.set("Origin", domain);

		const url = request.url;

		const protocolSpot = url.indexOf("//");

		const urlWithoutProtocol = url.slice(protocolSpot + 2);

		const subdomain = urlWithoutProtocol.split(".")[0];

		const slash = urlWithoutProtocol.indexOf("/");

		const route = urlWithoutProtocol.slice(slash + 1);

		const ignoreBeginnings = [
			"images", "site", "_next", "api", "cdn-cgi",
		];

		const ignore = ignoreBeginnings.reduce((prev, thisOne) => {
			if (prev) {
				return true;
			} else return route.startsWith(thisOne);
		}, false);


		if (ignore || !route || route.endsWith(".svg") || route.startsWith(subdomain) /* hacky ass way*/) {
			return Response.redirect(`${domain}/${route}`, 301);
		}

		const newDomain = `${domain}/${route && `${subdomain}/${route}`}`;

		return await fetch(newDomain, newRequest);
	},
} satisfies ExportedHandler<Env>;
