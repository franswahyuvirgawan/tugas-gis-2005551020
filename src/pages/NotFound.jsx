import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="h-screen w-full flex flex-row justify-center items-center text-white">
      <div className="flex flex-row gap-[20px] items-center">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">404</h1>
        <div className="shrink-0 bg-white w-[1px] h-[40px]"></div>
        <div className="text-sm flex flex-col gap-1">
          <p className="">Halaman ini tidak dapat ditemukan.</p>
          <Link
            to="/"
            className="group flex w-full items-center rounded-md border border-transparent text-muted-foreground underline"
          >
            Silahkan kembali kehalaman awal.
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
