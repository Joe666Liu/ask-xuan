import { redirect } from "@tanstack/react-router"
import { createMiddleware } from "@tanstack/react-start"
import { getCookie, getPrefix, Locales } from "intlayer"

const COOKIE_NAME = "INTLAYER_LOCALE"
const DEFAULT_LOCALE = Locales.ENGLISH
const SUPPORTED_LOCALES: string[] = [Locales.ENGLISH, Locales.CHINESE]

function hasLocalePrefix(pathname: string): boolean {
  const firstSegment = pathname.split("/").filter(Boolean)[0]
  return Boolean(
    firstSegment && SUPPORTED_LOCALES.includes(firstSegment) && firstSegment !== DEFAULT_LOCALE
  )
}

export const localeRedirectMiddleware = createMiddleware().server(async ({ next, request }) => {
  const url = new URL(request.url)
  const { pathname } = url

  if (hasLocalePrefix(pathname)) {
    return await next()
  }

  const cookieString = request.headers.get("cookie") ?? ""
  const storedLocale = getCookie(COOKIE_NAME, cookieString)

  if (!storedLocale || storedLocale === DEFAULT_LOCALE) {
    return await next()
  }

  const { localePrefix } = getPrefix(storedLocale)
  const newPath = pathname === "/" ? `/${localePrefix}` : `/${localePrefix}${pathname}`

  throw redirect({ href: newPath + url.search + url.hash })
})
