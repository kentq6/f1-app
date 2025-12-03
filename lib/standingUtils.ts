/**
 * Sort standings by points (desc) and assign position.
 * For drivers, break ties by who reached the points total LAST: i.e., later-achiever is placed first.
 * Assumes each driver object has an extra field `lastPointsReachedIdx` if needed.
 */
export default function sortStandingsArray<
  T extends { points?: number; lastPointsReachedIdx?: number }
>(standings: T[]): T[] {
  return standings
    .slice()
    .sort((a, b) => {
      const pa = a.points ?? 0;
      const pb = b.points ?? 0;
      if (pb !== pa) return pb - pa;
      // Only for driversStandingArray, tie-break by lastPointsReachedIdx if present
      if (
        typeof a.lastPointsReachedIdx === "number" &&
        typeof b.lastPointsReachedIdx === "number"
      ) {
        // Larger lastPointsReachedIdx means LATER
        return b.lastPointsReachedIdx - a.lastPointsReachedIdx;
      }
      return 0;
    })
    .map((item, idx) => ({ ...item, position: idx + 1 }));
}
