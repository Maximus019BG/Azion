import type {Metadata, ResolvingMetadata} from 'next';
import openGraphImage from "../../../../../../public/opengraphThin.png";

interface PageProps {
    params: {
        taskId: string | null;
    };
}

export async function generateMetadata(
    {params}: PageProps,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const {taskId} = params;

    // Fetch task data based on the taskId parameter
    const taskData = await fetch(`https://azion.online/dashboard/task/view/${taskId}`).then((res) => res.json());

    const previousImages = (await parent).openGraph?.images || [];

    return {
        title: taskData.name,
        description: taskData.description,
        openGraph: {
            images: [openGraphImage.src, ...previousImages],
        },
    };
}