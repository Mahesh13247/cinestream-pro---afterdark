import axios from 'axios';

export interface Channel {
    id: string;
    name: string;
    logo: string;
    url: string;
    category: string;
    group?: string;
}

const BASE_URL = 'https://iptv-org.github.io/iptv';

export const iptvApi = {
    getChannelsByCategory: async (category: string): Promise<Channel[]> => {
        try {
            // Special handling for adult content
            if (category === 'xxx') {
                return getAdultChannels();
            }

            const response = await axios.get(`${BASE_URL}/categories/${category}.m3u`);
            return parseM3U(response.data, category);
        } catch (error) {
            console.error(`Failed to fetch channels for category: ${category}`, error);
            return [];
        }
    },

    getAllCategories: () => [
        { id: 'movies', name: 'Movies' },
        { id: 'news', name: 'News' },
        { id: 'music', name: 'Music' },
        { id: 'sport', name: 'Sports' },
        { id: 'documentary', name: 'Documentary' },
        { id: 'kids', name: 'Kids' },
        { id: 'family', name: 'Family' },
        { id: 'education', name: 'Education' },
        { id: 'entertainment', name: 'Entertainment' },
        { id: 'lifestyle', name: 'Lifestyle' },
        { id: 'xxx', name: 'Adult 18+' },
    ]
};

// Custom adult channels from public sources
const getAdultChannels = async (): Promise<Channel[]> => {
    const channels: Channel[] = [];

    // Try to fetch Eporner videos and convert them to "live" channels
    try {
        const epornerResponse = await axios.get('https://www.eporner.com/api/v2/video/search/', {
            params: {
                query: '',
                per_page: 30,
                page: 1,
                thumbsize: 'medium',
                order: 'top-weekly',
                format: 'json'
            },
            timeout: 5000
        });

        if (epornerResponse.data && epornerResponse.data.videos) {
            const epornerChannels = epornerResponse.data.videos.map((video: any, index: number) => ({
                id: `eporner-${video.id || index}`,
                name: video.title || `Adult Video ${index + 1}`,
                logo: video.default_thumb?.src || '',
                url: video.embed || video.url || '#',
                category: 'xxx'
            }));
            channels.push(...epornerChannels);
        }
    } catch (error) {
        console.log('Failed to fetch Eporner videos, using fallback channels...', error);
    }

    // Add RedTraffic live streams
    const redTrafficChannels: Channel[] = [
        {
            id: 'adult-1',
            name: 'RedTraffic Big Ass',
            logo: '',
            url: 'http://live.redtraffic.xyz/bigass.m3u8',
            category: 'xxx'
        },
        {
            id: 'adult-2',
            name: 'RedTraffic Big Dick',
            logo: '',
            url: 'http://live.redtraffic.xyz/bigdick.m3u8',
            category: 'xxx'
        },
        {
            id: 'adult-3',
            name: 'RedTraffic Big Tits',
            logo: '',
            url: 'http://live.redtraffic.xyz/bigtits.m3u8',
            category: 'xxx'
        },
        {
            id: 'adult-4',
            name: 'RedTraffic Blowjob',
            logo: '',
            url: 'http://live.redtraffic.xyz/blowjob.m3u8',
            category: 'xxx'
        },
        {
            id: 'adult-5',
            name: 'RedTraffic Cuckold',
            logo: '',
            url: 'http://live.redtraffic.xyz/cuckold.m3u8',
            category: 'xxx'
        },
        {
            id: 'adult-6',
            name: 'RedTraffic Fetish',
            logo: '',
            url: 'http://live.redtraffic.xyz/fetish.m3u8',
            category: 'xxx'
        },
        {
            id: 'adult-7',
            name: 'RedTraffic Hardcore',
            logo: '',
            url: 'http://live.redtraffic.xyz/hardcore.m3u8',
            category: 'xxx'
        },
        {
            id: 'adult-8',
            name: 'RedTraffic Interracial',
            logo: '',
            url: 'http://live.redtraffic.xyz/interracial.m3u8',
            category: 'xxx'
        },
        {
            id: 'adult-9',
            name: 'RedTraffic Latina',
            logo: '',
            url: 'http://live.redtraffic.xyz/latina.m3u8',
            category: 'xxx'
        },
        {
            id: 'adult-10',
            name: 'RedTraffic Lesbian',
            logo: '',
            url: 'http://live.redtraffic.xyz/lesbian.m3u8',
            category: 'xxx'
        },
        {
            id: 'adult-11',
            name: 'RedTraffic MILF',
            logo: '',
            url: 'http://live.redtraffic.xyz/milf.m3u8',
            category: 'xxx'
        },
        {
            id: 'adult-12',
            name: 'RedTraffic Pornstar',
            logo: '',
            url: 'http://live.redtraffic.xyz/pornstar.m3u8',
            category: 'xxx'
        },
        {
            id: 'adult-13',
            name: 'RedTraffic POV',
            logo: '',
            url: 'http://live.redtraffic.xyz/pov.m3u8',
            category: 'xxx'
        },
        {
            id: 'adult-14',
            name: 'RedTraffic Russian',
            logo: '',
            url: 'http://live.redtraffic.xyz/russian.m3u8',
            category: 'xxx'
        },
        {
            id: 'adult-15',
            name: 'RedTraffic Teen',
            logo: '',
            url: 'http://live.redtraffic.xyz/teen.m3u8',
            category: 'xxx'
        },
        {
            id: 'adult-16',
            name: 'RedTraffic Threesome',
            logo: '',
            url: 'http://live.redtraffic.xyz/threesome.m3u8',
            category: 'xxx'
        },
    ];

    channels.push(...redTrafficChannels);

    return channels;
};

const parseM3U = (content: string, category: string): Channel[] => {
    const lines = content.split('\n');
    const channels: Channel[] = [];
    let currentChannel: Partial<Channel> = {};

    lines.forEach(line => {
        line = line.trim();
        if (line.startsWith('#EXTINF:')) {
            // Parse metadata
            const info = line.substring(8);
            const parts = info.split(',');
            const name = parts[parts.length - 1].trim();

            // Extract logo
            const logoMatch = info.match(/tvg-logo="([^"]*)"/);
            const logo = logoMatch ? logoMatch[1] : '';

            // Extract group/id if available (simplified)
            const idMatch = info.match(/tvg-id="([^"]*)"/);
            const id = idMatch ? idMatch[1] : `ch-${channels.length}`;

            currentChannel = {
                id,
                name,
                logo,
                category
            };
        } else if (line.startsWith('http')) {
            // URL line
            if (currentChannel.name) {
                channels.push({
                    ...currentChannel,
                    url: line,
                } as Channel);
                currentChannel = {};
            }
        }
    });

    return channels;
};
