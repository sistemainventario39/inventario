import React from "react";

export default function StatusToggle({ status, onStatusChange }) {
  const options = [
    {
      value: "Bueno",
      label: "B",
      className: "text-green-600 focus:ring-green-500",
    },
    {
      value: "Dañado",
      label: "D",
      className: "text-red-600 focus:ring-red-500",
    },
    {
      value: "Repuesto",
      label: "R",
      className: "text-blue-600 focus:ring-blue-500",
    },
  ];

  return (
    <div className="flex justify-around items-center bg-white border border-gray-300 shadow-sm rounded-lg h-10 px-3 min-w-[170px]">
      {options.map((option, index) => (
        <React.Fragment key={option.value}>
          <label className="flex items-center space-x-2 cursor-pointer group">
            <input
              type="checkbox"
              className={`h-4 w-4 rounded border-gray-300 ${option.className}`}
              checked={status === option.value}
              onChange={() => onStatusChange(option.value)}
            />
            <span className="text-xs font-bold text-black">{option.label}</span>
          </label>
          {index < options.length - 1 && (
            <div className="w-[1px] h-4 bg-gray-200 mx-2"></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
