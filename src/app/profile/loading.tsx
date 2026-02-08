import { GridSkeleton } from "@/components/ui/GridSkeleton";
import { PageWrapper } from "@/components/PageThemeContext";

export default function ProfileLoading() {
  return (
    <PageWrapper>
      <div className="p-4 sm:p-6 lg:p-8">
        <GridSkeleton count={1} />
      </div>
    </PageWrapper>
  );
}
