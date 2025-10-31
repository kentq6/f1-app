import React from "react";

interface SimpleLayoutProp {
  components: React.ReactNode[];
}

const SimpleLayout: React.FC<SimpleLayoutProp> = ({ components }) => {
  return (
    <div className="mt-2 sm:mt-3 space-y-4 sm:space-y-6">
      {components.map((component, index) => (
        <div key={index}>{component}</div>
      ))}
    </div>
  );
};

export default SimpleLayout;
