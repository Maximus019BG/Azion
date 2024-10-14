import {MetadataRoute} from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const org = 'Azion';

    return [
        {
            url: 'https://azion.online',
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 1,
        },
        {
            url: 'https://azion.online/register',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `https://azion.online/dashboard/${org}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.5,
        },
    ];
}