// Sesuaikan path import ini dengan lokasi asli file komponenmu
import PramukaOverview from "@/components/Overview/PramukaOverview/index";
import ProjectTeam from "@/components/Overview/ProjectTeam/index";

export const metadata = {
    title: "Overview | OMG-DIVE",
    description: "Project overview and team members",
};

export default function OverviewPage() {
    return (
            <main>
                {/* Komponen dokumentasi utamamu dipanggil di sini */}
                <PramukaOverview />
                <ProjectTeam />
            </main>
        );
}