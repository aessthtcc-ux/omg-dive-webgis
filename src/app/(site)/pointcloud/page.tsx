import Mapping3D from "@/components/Map/map3d";

export const metadata = {
    title: "3D Map Visualization | OMG-DIVE",
    description: "Interactive 3D Map for WebGIS",
};

export default function ThreeDMapPage() {
    return (
        <main>
            {/* Memanggil komponen peta 3D kamu */}
            <Mapping3D />
        </main>
    );
}