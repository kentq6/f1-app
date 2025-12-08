import StartingGrid from "./StartingGridTable";
import SessionResults from "./SessionResultsTable";
import { useSessionInfo } from "@/app/providers/SessionInfoProvider";

const ClassificationInfo = () => {
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

export default ClassificationInfo;
