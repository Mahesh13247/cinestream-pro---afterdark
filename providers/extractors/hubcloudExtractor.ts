/**
 * HubCloud Stream Extractor
 * Handles multiple CDN types: HubCloud, Pixeldrain, CloudFlare, FastDL, etc.
 * Based on Vega-App's implementation
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { Stream } from '../types';
import { commonHeaders } from '../utils/commonHeaders';

/**
 * Base64 decode helper
 */
function decode(value: string): string {
    if (!value) return '';
    try {
        return atob(value);
    } catch {
        return value;
    }
}

/**
 * Extract streams from HubCloud and similar services
 */
export async function hubcloudExtractor(
    link: string,
    signal?: AbortSignal
): Promise<Stream[]> {
    try {
        console.log('🔍 HubCloud Extractor:', link);
        const baseUrl = link.split('/').slice(0, 3).join('/');
        const streamLinks: Stream[] = [];

        // Fetch initial page
        const vLinkRes = await axios.get(link, {
            headers: commonHeaders,
            signal,
        });
        const vLinkText = vLinkRes.data;
        const $vLink = cheerio.load(vLinkText);

        // Extract redirect URL
        const vLinkRedirect = vLinkText.match(/var\s+url\s*=\s*'([^']+)';/) || [];
        let vcloudLink =
            decode(vLinkRedirect[1]?.split('r=')?.[1]) ||
            vLinkRedirect[1] ||
            $vLink('.fa-file-download.fa-lg').parent().attr('href') ||
            link;

        console.log('📍 VCloud Link:', vcloudLink);

        // Handle relative URLs
        if (vcloudLink?.startsWith('/')) {
            vcloudLink = `${baseUrl}${vcloudLink}`;
            console.log('📍 New VCloud Link:', vcloudLink);
        }

        // Fetch final page
        const vcloudRes = await fetch(vcloudLink, {
            headers: commonHeaders,
            signal,
            redirect: 'follow',
        });
        const $ = cheerio.load(await vcloudRes.text());

        // Extract download links
        const linkClass = $('.btn-success.btn-lg.h6,.btn-danger,.btn-secondary');

        for (const element of linkClass.toArray()) {
            const itm = $(element);
            let downloadLink = itm.attr('href') || '';

            if (!downloadLink) continue;

            // CloudFlare Worker
            if (downloadLink.includes('.dev') && !downloadLink.includes('/?id=')) {
                streamLinks.push({
                    server: 'Cf Worker',
                    link: downloadLink,
                    type: 'direct',
                    quality: '1080p',
                });
            }
            // Pixeldrain
            else if (downloadLink.includes('pixeld')) {
                if (!downloadLink.includes('api')) {
                    const token = downloadLink.split('/').pop();
                    const pixelBaseUrl = downloadLink.split('/').slice(0, -2).join('/');
                    downloadLink = `${pixelBaseUrl}/api/file/${token}?download`;
                }
                streamLinks.push({
                    server: 'Pixeldrain',
                    link: downloadLink,
                    type: 'direct',
                    quality: '1080p',
                });
            }
            // HubCloud
            else if (downloadLink.includes('hubcloud') || downloadLink.includes('/?id=')) {
                try {
                    const newLinkRes = await fetch(downloadLink, {
                        method: 'HEAD',
                        headers: commonHeaders,
                        signal,
                        redirect: 'manual',
                    });

                    let newLink = downloadLink;
                    if (newLinkRes.status >= 300 && newLinkRes.status < 400) {
                        newLink = newLinkRes.headers.get('location') || downloadLink;
                    }

                    if (newLink.includes('googleusercontent')) {
                        newLink = newLink.split('?link=')[1] || newLink;
                    } else {
                        const newLinkRes2 = await fetch(newLink, {
                            method: 'HEAD',
                            headers: commonHeaders,
                            signal,
                            redirect: 'manual',
                        });

                        if (newLinkRes2.status >= 300 && newLinkRes2.status < 400) {
                            newLink = newLinkRes2.headers.get('location')?.split('?link=')[1] || newLink;
                        }
                    }

                    streamLinks.push({
                        server: 'HubCloud',
                        link: newLink,
                        type: 'direct',
                        quality: '1080p',
                    });
                } catch (error) {
                    console.error('HubCloud link extraction error:', error);
                }
            }
            // CloudFlare Storage
            else if (downloadLink.includes('cloudflarestorage')) {
                streamLinks.push({
                    server: 'CfStorage',
                    link: downloadLink,
                    type: 'direct',
                    quality: '1080p',
                });
            }
            // FastDL
            else if (downloadLink.includes('fastdl') || downloadLink.includes('fsl.')) {
                streamLinks.push({
                    server: 'FastDL',
                    link: downloadLink,
                    type: 'direct',
                    quality: '1080p',
                });
            }
            // HubCDN
            else if (downloadLink.includes('hubcdn') && !downloadLink.includes('/?id=')) {
                streamLinks.push({
                    server: 'HubCDN',
                    link: downloadLink,
                    type: 'direct',
                    quality: '1080p',
                });
            }
            // Generic MKV files
            else if (downloadLink.includes('.mkv') || downloadLink.includes('.mp4')) {
                const serverName =
                    downloadLink
                        .match(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/i)?.[1]
                        ?.replace(/\./g, ' ') || 'Unknown';
                streamLinks.push({
                    server: serverName,
                    link: downloadLink,
                    type: 'direct',
                    quality: '1080p',
                });
            }
        }

        console.log('✅ Extracted streams:', streamLinks.length);
        return streamLinks;
    } catch (error) {
        console.error('❌ HubCloud extractor error:', error);
        return [];
    }
}
