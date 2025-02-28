// src/components/SearchableSelect.js
import React from "react";
import Select from "react-select";

function SearchableSelect({ label, options, value, onChange }) {
  const selectOptions = options.map(opt => ({ value: opt, label: opt }));
  const selectedOption = value ? { value, label: value } : null;
  return (
    <div style={{ margin: "10px 0" }}>
      <label style={{ marginRight: "10px" }}><b>{label}: </b></label>
      <Select
        options={selectOptions}
        value={selectedOption}
        onChange={selected => onChange(selected ? selected.value : "")}
        isClearable
        placeholder={`Buscar ${label.toLowerCase()}...`}
      />
    </div>
  );
}

export default SearchableSelect;
