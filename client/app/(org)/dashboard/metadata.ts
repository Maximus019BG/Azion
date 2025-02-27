import type {Metadata, ResolvingMetadata} from 'next';
import openGraphImage from "../../../../public/dashboardGraph.png";
import axios, {AxiosResponse} from "axios";

export async function generateMetadata(
    parent: ResolvingMetadata
): Promise<Metadata> {
    // Fetch organization data from the API endpoint
    const orgData = await axios.get(`https://azion.online/dashboard/`).then((res: AxiosResponse) => res.data);

    const previousImages = (await parent).openGraph?.images || [];
    console.log(orgData);
    return {
        title: orgData.name,
        description: orgData.description,
        openGraph: {
            images: [openGraphImage.src, ...previousImages],
        },
    };
}