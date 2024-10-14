import type {Metadata, ResolvingMetadata} from 'next';
import openGraphImage from "../../../../public/dashboardGraph.png";

interface PageProps {
    params: {
        org: string;
    };
}

export async function generateMetadata(
    {params}: PageProps,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const org = params.org;

    // Fetch organization data based on the org parameter
    const orgData = await fetch(`https://azion.online/dashboard/${org}`).then((res) => res.json());

    const previousImages = (await parent).openGraph?.images || [];

    return {
        title: orgData.name,
        description: orgData.description,
        openGraph: {
            images: [openGraphImage.src, ...previousImages],
        },
    };
}