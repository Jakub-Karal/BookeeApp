import React from "react";

function Header({ title, onClick }) {
  return (
    <div className="header">
      <span className="app-title clickable" onClick={onClick}>{title}</span>
    </div>
  );
}

export default Header;
