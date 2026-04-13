//// testiranje se moze odraditi u browseru kada se unese link ipod
//// http://localhost:3000/api/example/dinamicki-sta-hocemo

import { NextRequest } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ dynamic: string }> }
) {
    const { dynamic } = await params;

    console.log("Get ruta", dynamic);

    // return new Response(JSON.stringify({ getRouta: "radi dinamicka ruta" }), {
    return new Response(JSON.stringify({ getRouta: "radi dinamicka ruta", param: dynamic }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
    });
}
