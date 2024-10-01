import React from "react";


interface MenuItemProps {
  icon: React.ReactNode; 
  text: string;
  tooltip: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, text, tooltip }) => {
  return (
    <li className="w-fit h-fit flex justify-center items-center border-y-2 border-gray-500 group">
      <a className="w-96 flex flex-row justify-start items-center gap-4 tooltip tooltip-right" data-tip={tooltip}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {icon}
        </svg>
        <p className="ml-32 text-white group-hover:inline hidden">{text}</p>
      </a>
    </li>
  );
};

export default MenuItem;
