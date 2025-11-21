import StartingGrid from "./StartingGrid";
import SessionResults from "./SessionResults";
import { useSessionInfo } from "@/app/providers/SessionInfoProvider";

const ClassificationTable = () => {
  const { classificationResults } = useSessionInfo();

  // This should never run
  if (!classificationResults) return null;

  return (
    <>
      {classificationResults.type === "grid" ? (
        <StartingGrid classificationData={classificationResults.data} />
      ) : (
        <SessionResults classificationData={classificationResults.data} />
      )}
    </>
  );
};

export default ClassificationTable;
