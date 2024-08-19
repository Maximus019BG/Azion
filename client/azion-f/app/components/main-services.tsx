"use client"
import React from "react";
import MainServiceLayout from "../layouts/main-service";
import yerarchy from "../../public/background1.png";


const Main_Services: React.FC = () => {
  return (
    <div className=" flex flex-col justify-evenly items-center ">
      <MainServiceLayout
        title="Service One"
        description="This is a description of Service One."
        imageUrl={yerarchy.src}
      />
      <MainServiceLayout 
        title="Service Two"
        description="This is a description of Service Two."
        imageUrl={yerarchy.src}
      />
      <MainServiceLayout
        title="Service Three"
        description="This is a description of Service Three."
        imageUrl={yerarchy.src}
      />
    </div>
  );
};

export default Main_Services;
