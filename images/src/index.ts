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
   async fetch(request, env, ctx): Promise<Response> {
      let url = new URL(request.url);
      
      if (url.pathname.endsWith("upload")) {
         const image = await request.formData();
         const imageData = image.get("imageFile");
         
         const r2 = env.linkr_images;
         
         const key = url.searchParams.get("key");
         
         if (!key) {
            return new Response("Missing image key", { status: 400 });
         }
         
         const upload = await r2.put(key, imageData);
         
         if (upload?.size && upload?.size > 1) {
            return new Response(`${key}`, {
               status: 200,
            });
         }
         
         return new Response("Error on server", { status: 500 });
         
      }
      
      // Cloudflare-specific options are in the cf object.
      let options: ImageTransform = {};
      let quality: number = 100;
      
      // Copy parameters from query string to request options.
      // You can implement various different parameters here.
      if (url.searchParams.has("fit")) { // @ts-ignore
         options.fit = url.searchParams.get("fit");
      }
      if (url.searchParams.has("width"))
         options.width = Number(url.searchParams.get("width"));
      if (url.searchParams.has("height"))
         options.height = Number(url.searchParams.get("height"));
      if (url.searchParams.has("quality"))
         quality = Number(url.searchParams.get("quality"));
      
      // Your Worker is responsible for automatic format negotiation. Check the Accept header.
      const accept = request.headers.get("Accept") || "";
      
      
      // Get URL of the original (full size) image to resize.
      // You could adjust the URL here, e.g., prefix it with a fixed address of your server,
      // so that user-visible URLs are shorter and cleaner.
      const imageURL = url.searchParams.get("image");
      if (!imageURL)
         return new Response("Missing \"image\" value", { status: 400 });
      
      try {
         const r2 = env.linkr_images;
         
         const rawImageResp = await r2.get(imageURL);
         
         const image = rawImageResp?.body;
         
         if (!image) {
            return new Response("Image not found.", { status: 404 });
         }
         
         const out = await env.IMAGES.input(image)
                              .transform(options)
                              .output({ format: accept, quality } as ImageOutputOptions);
         
         return out.response();
         
         
      } catch (err) {
         return new Response("Invalid \"image\" value", { status: 400 });
      }
      
   },
} satisfies ExportedHandler<Env>;
