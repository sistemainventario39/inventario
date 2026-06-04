import React from "react";

export default function StatusToggle({ status, onStatusChange }) {
  return (
    <div className="flex justify-around items-center bg-white border border-gray-300 shadow-sm rounded-lg h-10 px-4 min-w-[120px]">
      <label className="flex items-center space-x-2 cursor-pointer group">
        <input
          type="checkbox"
          className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
          checked={status === "Bueno"}
          onChange={() => onStatusChange("Bueno")}
        />
        <span className="text-xs font-bold text-black">B</span>
      </label>

      <div className="w-[1px] h-4 bg-gray-200 mx-3"></div>

      <label className="flex items-center space-x-2 cursor-pointer group">
        <input
          type="checkbox"
          className="h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
          checked={status === "Defectuoso"}
          onChange={() => onStatusChange("Defectuoso")}
        />
        <span className="text-xs font-bold text-black">D</span>
      </label>
    </div>
  );
}
