import { Link, type LinkComponentProps } from "@tanstack/react-router"
import { getPrefix } from "intlayer"
import type { AnchorHTMLAttributes, FC } from "react"
import { useLocale } from "react-intlayer"

export const LOCALE_ROUTE = "{-$locale}" as const

// Main utility
export type RemoveLocaleParam<T> = T extends string ? RemoveLocaleFromString<T> : T

export type To = RemoveLocaleParam<NonNullable<LinkComponentProps["to"]>>
export type HashTo = `#${string}`
export type HomeHashTo = `/#${string}`
export type ExternalTo = `${"http://" | "https://" | "mailto:" | "tel:"}${string}`
export type AnchorTo = HashTo | HomeHashTo | ExternalTo
export type LocalizedTo = To | AnchorTo

type CollapseDoubleSlashes<S extends string> = S extends `${infer H}//${infer T}`
  ? CollapseDoubleSlashes<`${H}/${T}`>
  : S

type LocalizedLinkProps = {
  to?: LocalizedTo
} & Omit<LinkComponentProps, "to">

// Helpers
type RemoveAll<S extends string, Sub extends string> = S extends `${infer H}${Sub}${infer T}`
  ? RemoveAll<`${H}${T}`, Sub>
  : S

type RemoveLocaleFromString<S extends string> = CollapseDoubleSlashes<
  RemoveAll<S, typeof LOCALE_ROUTE>
>

export const LocalizedLink: FC<LocalizedLinkProps> = (props) => {
  const { locale } = useLocale()
  const { localePrefix } = getPrefix(locale)

  const isHomeHashTo = typeof props.to === "string" && props.to.startsWith("/#")
  const isAnchorTo =
    typeof props.to === "string" &&
    (props.to.startsWith("#") ||
      isHomeHashTo ||
      props.to.startsWith("http://") ||
      props.to.startsWith("https://") ||
      props.to.startsWith("mailto:") ||
      props.to.startsWith("tel:"))

  if (isAnchorTo) {
    const { to, ...rest } = props
    const anchorTo = to as AnchorTo
    const homePath = localePrefix ? `/${localePrefix}` : "/"
    const href = isHomeHashTo ? `${homePath}${anchorTo.slice(1)}` : anchorTo

    return (
      <a
        {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
        href={href}
      />
    )
  }

  const { to = "/" as To, params, ...rest } = props
  const isDocsIndex = to === "/docs"
  const linkParams = {
    locale: localePrefix,
    ...(isDocsIndex ? { _splat: "" } : {}),
    ...(typeof params === "object" ? params : {}),
  }

  return (
    <Link
      {...(rest as Omit<LinkComponentProps, "to" | "params">)}
      params={linkParams}
      to={
        (isDocsIndex
          ? `/${LOCALE_ROUTE}/docs/$`
          : `/${LOCALE_ROUTE}${to}`) as LinkComponentProps["to"]
      }
    />
  )
}
