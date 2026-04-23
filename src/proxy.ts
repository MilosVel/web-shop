import { NextResponse, type NextRequest } from "next/server"
import {
    getUserFromSession,
    updateUserSessionExpiration,
} from "./auth/core/session"

const privateRoutes = ["/private", '/', '/spiri', '/create-table', "/admin"] // mora se dodati  '/' inace se vidi sidebar kada je user izlogovan. Takodje se mora dodati i '/spiri' inace ce toj ruti moci da se pristupi i kada uzer nije ulogovan
// const adminRoutes = ["/admin"] // rprivremeno cemo admn page prebaciti i u privateRoutes
const adminRoutes = ["/admin________"] // rprivremeno cemo admn page prebaciti i u privateRoutes

export async function proxy(request: NextRequest) { // middleware je ples izmedju response i requesta
    const response = (await middlewareAuth(request)) ?? NextResponse.next()

    //// //// ovim se na svaku aktivnost usera (klik, view page...) setuje nova expiration time
    await updateUserSessionExpiration({ // probati da se zakomentarise ovaj kod i toglovati rolu: nova rola nece biti odmah vidljiva ako je ovaj kod zakomentarisan. Kada je ovaj kod otkomentarisan onda se u PrivatePage u fajlu page/private.tsx u console.log dobija ispravan currentCuser sa ispravnom rolom
        set: (key, value, options) => {
            response.cookies.set({ ...options, name: key, value })
        },
        get: key => request.cookies.get(key),
    })
    return response
}

async function middlewareAuth(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const user = await getUserFromSession(request.cookies)

    // Redirect logged-in users away from /sign-in and sign-up page
    if ((pathname === "/sign-in" || pathname === "/sign-up") && user) {
        return NextResponse.redirect(new URL("/", request.url));
    }


    if (privateRoutes.includes(request.nextUrl.pathname)) {
        if (user == null) {
            return NextResponse.redirect(new URL("/sign-in", request.url))
        }
    }

    if (adminRoutes.includes(request.nextUrl.pathname)) {

        if (user == null) {
            return NextResponse.redirect(new URL("/sign-in", request.url))
        }
        if (user.role !== "admin") {
            return NextResponse.redirect(new URL("/", request.url))
        }
    }
}

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    ],
}
