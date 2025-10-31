import React from "react";

interface GridLayoutProps {
  components: React.ReactNode[];
}

const getComponentKey = (component: React.ReactNode, fallback: number) => {
  // If it's a valid React element and has a key, use it
  if (React.isValidElement(component) && component.key != null) {
    return component.key;
  }
  // fallback to index or something else if needed
  return `component-${fallback}`;
};

const GridLayout: React.FC<GridLayoutProps> = ({ components }) => {
  // Split components into left and right columns, storing just the component
  const leftColumn: React.ReactNode[] = [];
  const rightColumn: React.ReactNode[] = [];

  components.forEach((component, idx) => {
    if (idx % 2 === 0) {
      leftColumn.push(component);
    } else {
      rightColumn.push(component);
    }
  });

  return (
    <div className="mt-2 sm:mt-3 space-y-4 sm:space-y-6 grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3 items-stretch">
      {/* Left Column */}
      <div className="space-y-4 sm:space-y-6 flex flex-col h-full">
        {leftColumn.map((component, idx) => (
          <React.Fragment key={getComponentKey(component, idx)}>
            {component}
          </React.Fragment>
        ))}
      </div>

      {/* Right Column */}
      <div className="space-y-4 sm:space-y-6 flex flex-col h-full">
        {rightColumn.map((component, idx) => (
          <React.Fragment key={getComponentKey(component, idx)}>
            {component}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default GridLayout;
