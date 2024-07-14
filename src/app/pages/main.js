import React from "react";
import dynamic from 'next/dynamic';
import TopBar from "@/components/TopBar";
import DataInput from "@/components/DataInput";
import TableViewer from "@/components/TableViewer"

const Main = () => (
    <>
        {/* <div>
            <TopBar />
        </div> */}
        <div>
            <DataInput />
        </div>
        {/* <div>
            <TableViewer />
        </div> */}
    </>
);

export default Main;