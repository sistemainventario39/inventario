import React from "react";
import { CiSearch } from "react-icons/ci";

export default function SerialSearchInput({
  value,
  onChange,
  onSearch,
  placeholder = "SN-XXXXX-XXXX",
  className = "",
  inputClassName = "",
  buttonColor = "bg-primary-600 hover:bg-primary-700",
  buttonIconSize = 20,
}) {
  return (
    <div className={`flex h-10 ${className}`}>
      {" "}
      {/* Altura fija para alinear con el estado por defecto */}
      <input
        type="text"
        required
        className={`block w-full border-gray-300 rounded-l-lg shadow-sm px-3 border outline-none font-mono focus:ring-primary-500 text-sm ${inputClassName}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      <button
        type="button"
        onClick={onSearch}
        className={`${buttonColor} text-white px-3 rounded-r-lg transition-colors flex items-center justify-center border border-primary-600`}
      >
        <CiSearch size={buttonIconSize} />
      </button>
    </div>
  );
}
