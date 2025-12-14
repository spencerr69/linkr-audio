import Image from "next/image";
import {Metadata} from "next";

const BASE_API_URL = "https://sr-api.aletrispinkroot.workers.dev";

type Release =
    {
        upc: string;
        title: string;
        artist_name: string;
        artwork: string;
        spotify: string;
        apple_music: string;
        tidal: string;
        bandcamp: string;
        soundcloud: string;
        youtube: string;
        track_count: number;
    }

const Page = async ({params}: { params: Promise<{ id: string, slug: string }> }) => {
    const {id, slug} = await params;

    const resp = await fetch(`${BASE_API_URL}/releases/${id}/${slug}`);

    if (!resp.ok) {
        return <h1>Release not found</h1>
    }

    const release: Release = await resp.json();

    return (<>
        <h1>{release.title}</h1>
        <h3>{release.artist_name}</h3>

        <Image src={release.artwork} alt={release.title} width={750} height={750}/>

        <a href={release.apple_music}>apple music</a>
        <a href={release.spotify}>spotify</a>
        <a href={release.tidal}>tidal</a>

    </>)
}

export default Page;

export async function generateMetadata({params}: { params: Promise<{ id: string, slug: string }> }): Promise<Metadata> {
    const {id, slug} = await params;

    const resp = await fetch(`${BASE_API_URL}/releases/${id}/${slug}`);

    if (!resp.ok) {
        return {
            title: "Release not found",
        }
    }


    const release: Release = await resp.json();

    return {
        title: release.title,
        description: release.artist_name,
    }
}