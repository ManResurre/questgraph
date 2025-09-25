'use client';
import React, {ReactNode} from "react";

export default function QuestLayout(
    {
        children,
    }: {
        children: ReactNode;
    }) {
    // console.log('render');

    return <div>
        {children}
    </div>;
}
