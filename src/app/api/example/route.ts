//// testiranje se moze odraditi u browseru kada se unese link ipod
//// http://localhost:3000/api/example

import { NextRequest } from "next/server";

export async function GET(
    request: NextRequest,
) {
    console.log("Get ruta");

    return new Response(JSON.stringify({ getRouta: "radi get ruta" }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
    });
}
