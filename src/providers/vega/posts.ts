import axios from 'axios';
import * as cheerio from 'cheerio';
import { Post, GetPostsParams, GetSearchPostsParams } from '../types';

const headers = {
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Cache-Control": "no-store",
    "Accept-Language": "en-US,en;q=0.9",
    DNT: "1",
    "sec-ch-ua": '"Not_A Brand";v="8", "Chromium";v="120", "Microsoft Edge";v="120"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0"
};

export const getPosts = async ({ filter, page, providerContext, signal }: GetPostsParams): Promise<Post[]> => {
    const baseUrl = providerContext.baseUrl;
    const url = `${baseUrl}/${filter}/page/${page}/`;
    return posts(baseUrl, url, signal);
};

export const getSearchPosts = async ({ searchQuery, page, providerContext, signal }: GetSearchPostsParams): Promise<Post[]> => {
    const baseUrl = providerContext.baseUrl;
    const url = `${baseUrl}/page/${page}/?s=${searchQuery}`;
    return posts(baseUrl, url, signal);
};

async function posts(baseUrl: string, url: string, signal?: AbortSignal): Promise<Post[]> {
    try {
        const response = await axios.get(url, {
            headers: {
                ...headers,
                Referer: baseUrl
            },
            signal
        });

        const $ = cheerio.load(response.data);
        const posts: Post[] = [];

        $(".blog-items, .post-list").children("article").each((index, element) => {
            const $element = $(element);
            const $link = $element.find("a").first();

            let title = $link.attr("title") ||
                $element.find(".post-title").text() ||
                "";

            title = title.replace("Download", "").trim();

            // Try to clean up title with regex like in original code
            const match = title.match(/^(.*?)\s*\((\d{4})\)|^(.*?)\s*\((Season \d+)\)/);
            if (match) {
                title = (match[1] || match[3] || title).trim();
            }

            const link = $link.attr("href") || "";
            let image = $element.find("img").attr("data-lazy-src") ||
                $element.find("img").attr("data-src") ||
                $element.find("img").attr("src") ||
                "";

            if (image.startsWith("//")) {
                image = "https:" + image;
            }

            if (title && link) {
                posts.push({
                    id: link, // Use link as ID for now
                    title,
                    link,
                    image,
                    type: title.toLowerCase().includes("season") ? 'tv' : 'movie',
                    provider: 'vega'
                });
            }
        });

        return posts;
    } catch (error) {
        console.error("Vega posts error:", error);
        return [];
    }
}
