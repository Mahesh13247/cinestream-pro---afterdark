import React, { useState, useEffect, useMemo } from 'react';
import LivePlayer from '../components/LivePlayer';
import { Tv, Radio, Search, Globe, Heart } from 'lucide-react';
import { iptvApi, Channel } from '../services/iptv';
import { Loader } from 'lucide-react';

const LiveTV = () => {
    const [categories] = useState(iptvApi.getAllCategories());
    const [activeCategory, setActiveCategory] = useState('movies');
    const [channels, setChannels] = useState<Channel[]>([]);
    const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchChannels = async () => {
            setLoading(true);
            setChannels([]);
            try {
                const results = await iptvApi.getChannelsByCategory(activeCategory);
                setChannels(results);
                if (results.length > 0) {
                    setActiveChannel(results[0]);
                } else {
                    setActiveChannel(null);
                }
            } catch (error) {
                console.error("Failed to load channels", error);
            } finally {
                setLoading(false);
            }
        };

        fetchChannels();
    }, [activeCategory]);

    const filteredChannels = useMemo(() => {
        return channels.filter(c =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [channels, searchQuery]);

    return (
        <div className="min-h-screen bg-background pt-24 pb-20 px-4">
            <div className="w-full max-w-[2000px] mx-auto px-4 md:px-8">
                <div className="flex items-center gap-3 mb-8">
                    <Globe className="text-primary w-8 h-8 animate-pulse" />
                    <h1 className="text-3xl font-bold text-text">Global Live TV</h1>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Player Section */}
                    <div className="flex-1 order-2 lg:order-1">
                        {activeChannel ? (
                            <>
                                <LivePlayer src={activeChannel.url} poster={activeChannel.logo} />
                                <div className="mt-4 p-4 bg-surface rounded-xl border border-white/10 flex items-center gap-4">
                                    <div className="w-16 h-16 bg-white/5 rounded-lg p-2 flex items-center justify-center overflow-hidden">
                                        {activeChannel.logo ? (
                                            <img
                                                src={activeChannel.logo}
                                                alt={activeChannel.name}
                                                className="max-w-full max-h-full object-contain"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                }}
                                            />
                                        ) : null}
                                        <Tv size={32} className={`text-text-muted ${activeChannel.logo ? 'hidden' : ''}`} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-text">{activeChannel.name}</h2>
                                        <p className="text-text-muted mt-1 capitalize">{activeChannel.category} • Live Stream</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="aspect-video bg-black/50 rounded-xl flex items-center justify-center border border-white/10">
                                <p className="text-text-muted">Select a channel to start watching</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="w-full lg:w-96 flex-shrink-0 order-1 lg:order-2 flex flex-col gap-6">

                        {/* Category Selector */}
                        <div className="bg-surface p-4 rounded-xl border border-white/10">
                            <h3 className="text-sm font-bold text-text-muted uppercase mb-3">Categories</h3>
                            <div className="flex flex-wrap gap-2">
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveCategory(cat.id)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeCategory === cat.id
                                            ? 'bg-primary text-black'
                                            : 'bg-background text-text-muted hover:bg-white/10 hover:text-text'
                                            }`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Channel List */}
                        <div className="bg-surface p-4 rounded-xl border border-white/10 flex-1 min-h-[500px] flex flex-col">
                            <div className="mb-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search channels..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-background border border-white/10 rounded-lg pl-10 pr-4 py-2 text-text focus:outline-none focus:border-primary/50"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 space-y-2 max-h-[600px] custom-scrollbar">
                                {loading ? (
                                    <div className="flex justify-center py-10">
                                        <Loader className="animate-spin text-primary" />
                                    </div>
                                ) : filteredChannels.length > 0 ? (
                                    filteredChannels.map(channel => (
                                        <button
                                            key={`${channel.id}-${channel.url}`}
                                            onClick={() => setActiveChannel(channel)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${activeChannel?.url === channel.url
                                                ? 'bg-primary text-black font-bold shadow-lg shadow-primary/20'
                                                : 'bg-background text-text-muted hover:bg-white/10 hover:text-text'
                                                }`}
                                        >
                                            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center overflow-hidden p-1 flex-shrink-0">
                                                {channel.logo ? (
                                                    <img
                                                        src={channel.logo}
                                                        alt={channel.name}
                                                        className="w-full h-full object-contain"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                        }}
                                                    />
                                                ) : null}
                                                <Tv size={18} className={`text-text-muted ${channel.logo ? 'hidden' : ''}`} />
                                            </div>
                                            <span className="truncate">{channel.name}</span>
                                            {activeChannel?.url === channel.url && (
                                                <div className="ml-auto w-2 h-2 bg-red-500 rounded-full animate-pulse flex-shrink-0" />
                                            )}
                                        </button>
                                    ))
                                ) : (
                                    <div className="text-center py-10 text-text-muted">
                                        <p>No channels found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveTV;
