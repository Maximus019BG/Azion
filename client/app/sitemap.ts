import {MetadataRoute} from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const org = 'Azion';

    return [
        {
            url: 'https://azion.online',
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: 'https://azion.online/download',
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
          url: 'https://azion.online/login',
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: 'https://azion.online/register',
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
          url: 'https://azion.online/login/fast',
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `https://azion.online/dashboard`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.5,
        },
        {
            url: `https://azion.online/dashboard/projects`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.5,
        },
        {
            url: `https://azion.online/dashboard/tasks`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.5,
        },
        {
            url: `https://azion.online/dashboard/employees`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority : 0.5,
        }
    ];
}