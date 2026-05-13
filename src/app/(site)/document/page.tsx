// PERHATIKAN: Harus pakai kurung kurawal { Documentation }
// Ganti "@/components/Documentation" dengan lokasi asli folder komponenmu
import MarineQuiz from "@/components/Documentation/InteractiveQuiz"; 

export const metadata = {
    title: "Documentation | OMG-DIVE",
    description: "Official documentation for the OMG-DIVE WebGIS project",
};

export default function DocumentationPage() {
    return (
        <main className="pt-5">
            <MarineQuiz />
        </main>
    );
}