"use client";
import React from "react";
import { SessionProvider } from "@/lib/authMock";

export default function SessionProviderComp({
    children,
}: {
    children: React.ReactNode;
}) {
    return <SessionProvider>{children}</SessionProvider>;
}