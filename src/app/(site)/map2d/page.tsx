import MapWrapper from "@/components/Map/MapWrapper";

export const metadata = {
    title: "2D Map | OMG-DIVE",
    description: "Interactive 2D Map Visualization",
};

export default function TwoDMapPage() {
    return (
        <main>
            <MapWrapper />
        </main>
    );
}