import React from "react";

type Session = {
  session_key: number;
  year: number;
  circuit_short_name: string;
  session_type: string;
  session_name: string;
  date_start: string;
};

interface SessionTableProps {
  filteredSessions: Session[];
}

const SessionTable = ({ filteredSessions }: SessionTableProps ) => {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-lg shadow p-4 overflow-auto max-h-[470px]">
      <h3 className="text-lg font-semibold mb-2">
        Sessions Found: {filteredSessions.length}
      </h3>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-800">
            <th className="p-2">Year</th>
            <th className="p-2">Track</th>
            <th className="p-2">Type</th>
            <th className="p-2">Name</th>
            <th className="p-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {filteredSessions.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="p-4 text-center text-gray-500 dark:text-gray-300"
              >
                No sessions found.
              </td>
            </tr>
          ) : (
            filteredSessions.slice(0, 20).map((s) => (
              <tr
                key={s.session_key}
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition"
              >
                <td className="p-2">{s.year}</td>
                <td className="p-2">{s.circuit_short_name}</td>
                <td className="p-2">{s.session_type.replace(/_/g, " ")}</td>
                <td className="p-2">{s.session_name}</td>
                <td className="p-2">
                  {new Date(s.date_start).toLocaleDateString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {filteredSessions.length > 20 && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Showing first 20 sessions. Refine filters for more!
        </div>
      )}
    </div>
  );
};

export default SessionTable;
