import axios from 'axios';
import * as cheerio from 'cheerio';
import { Stream, GetStreamParams } from '../types';
import { extractors } from './extractors';

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

export const getStream = async ({ link, type, signal, providerContext }: GetStreamParams): Promise<Stream[]> => {
    const { hubcloudExtracter } = extractors;
    const streamLinks: Stream[] = [];

    try {
        if (type === 'movie') {
            // 1. Fetch the initial page
            const response = await axios.get(link, { headers, signal });
            const dotlinkText = response.data;

            // 2. Find the cloud link
            const cloudLinkMatch = dotlinkText.match(/<a\s+href="([^"]*cloud\.[^"]*)"/i);
            let cloudLink = cloudLinkMatch ? cloudLinkMatch[1] : null;

            // 3. FilePress Logic (Ported from original)
            try {
                const $ = cheerio.load(dotlinkText);
                const filepressLink = $('.btn.btn-sm.btn-outline[style="background:linear-gradient(135deg,rgb(252,185,0) 0%,rgb(0,0,0)); color: #fdf8f2;"]').parent().attr("href");

                if (filepressLink) {
                    const filepressID = filepressLink.split("/").pop();
                    const filepressBaseUrl = filepressLink.split("/").slice(0, -2).join("/");

                    // Step 1: Get Token
                    const tokenRes = await axios.post(`${filepressBaseUrl}/api/file/downlaod/`, {
                        id: filepressID,
                        method: "indexDownlaod",
                        captchaValue: null
                    }, {
                        headers: {
                            "Content-Type": "application/json",
                            Referer: filepressBaseUrl
                        }
                    });

                    if (tokenRes.data?.status) {
                        const filepressToken = tokenRes.data.data;

                        // Step 2: Get Stream Link
                        const streamRes = await axios.post(`${filepressBaseUrl}/api/file/downlaod2/`, {
                            id: filepressToken,
                            method: "indexDownlaod",
                            captchaValue: null
                        }, {
                            headers: {
                                "Content-Type": "application/json",
                                Referer: filepressBaseUrl
                            }
                        });

                        if (streamRes.data?.data?.[0]) {
                            streamLinks.push({
                                server: "filepress",
                                link: streamRes.data.data[0],
                                type: "direct", // Assuming direct link
                                quality: "720", // Default assumption
                                headers: { Referer: filepressBaseUrl }
                            });
                        }
                    }
                }
            } catch (error) {
                console.error("FilePress extraction failed:", error);
            }

            // 4. HubCloud Extraction
            if (cloudLink) {
                const hubStreams = await hubcloudExtracter(cloudLink, signal);
                streamLinks.push(...hubStreams);
            }
        }

        return streamLinks;

    } catch (error: any) {
        if (error.message?.includes("Aborted")) return [];
        console.error("Vega stream error:", error);
        return [];
    }
};
