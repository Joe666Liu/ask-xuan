import type { LucideIcon } from "lucide-react"
import type { LocalizedTo } from "@/shared/components/locale/localized-link"

// ============================================================================
// Base Types
// ============================================================================

export type MediaPosition = "left" | "right"

export type GridColumns = 2 | 3 | 4

export interface BaseItem {
  id: string
  title: string
  description: string
}

// ============================================================================
// Section Header Types
// ============================================================================

export interface SectionHeaderProps {
  title: string
  description: string
  titleId?: string
}

// ============================================================================
// Benefits Types
// ============================================================================

export interface BenefitItem extends BaseItem {
  icon?: string
}

export interface AnimatedBenefitCardProps {
  benefit: BenefitItem
  index: number
}

export interface AnimatedBenefitHeaderProps {
  title: string
  description: string
  titleId: string
}

// ============================================================================
// Features Types
// ============================================================================

export interface FeatureItem extends BaseItem {
  icon: LucideIcon
}

// ============================================================================
// Hero Types
// ============================================================================

export interface AnnouncementProps {
  title: string
  href: string
  className?: string
}

// ============================================================================
// Introduction Types
// ============================================================================

export interface IntroductionFeature {
  id: string
  title: string
  description: string
}

export interface VideoOptions {
  autoPlay?: boolean
  controls?: boolean
  loop?: boolean
  muted?: boolean
}

export interface BaseIntroductionSection extends BaseItem {
  features: IntroductionFeature[]
}

export interface ImageIntroductionSection extends BaseIntroductionSection {
  type?: "image"
  image: string
  imagePosition?: MediaPosition
}

export interface VideoIntroductionSection extends Omit<BaseIntroductionSection, "features"> {
  type?: "video"
  video: string
  videoPosition?: MediaPosition
  videoOptions?: VideoOptions
  features?: Record<string, Pick<IntroductionFeature, "title" | "description">>
}

export type IntroductionSection = ImageIntroductionSection | VideoIntroductionSection

export interface ContentSectionProps {
  title: string
  description: string
  features: Pick<IntroductionFeature, "title" | "description">[]
}

export interface ImageSectionProps {
  image: string
  title: string
}

export interface VideoSectionProps extends Required<VideoOptions> {
  video: string
  title: string
}

export interface IntroductionLayoutProps {
  id: string
  contentSection: React.ReactNode
  mediaSection: React.ReactNode
  mediaPosition: MediaPosition
}

export interface ImageIntroductionProps {
  section: ImageIntroductionSection
}

export interface VideoIntroductionProps {
  section: VideoIntroductionSection
}

// ============================================================================
// Showcase Types
// ============================================================================

export interface ShowcaseItem {
  title: string
  description: string
  imagePath: string
  link?: LocalizedTo
}

export interface ShowcaseCardProps {
  item: ShowcaseItem
  index: number
  className?: string
}

export interface ShowcaseHeaderProps extends SectionHeaderProps {}

export interface GridShowcaseProps {
  id?: string
  title: string
  description: string
  items: ShowcaseItem[]
  columns?: GridColumns
}

// ============================================================================
// Media Types
// ============================================================================

export interface MediaItem extends BaseItem {
  imagePath: string
  href: string
  source: string
  date: string
  external?: boolean
}

export interface MediaCardProps {
  item: MediaItem
  index: number
}

export interface MediaHeaderProps extends SectionHeaderProps {}

// ============================================================================
// Testimonials Types
// ============================================================================

export interface TestimonialItem {
  id: string
  text: string
  image: string
  name: string
  role: string
}

export interface AnimatedTestimonialsContentProps {
  firstColumn: TestimonialItem[]
  secondColumn: TestimonialItem[]
  thirdColumn: TestimonialItem[]
}

export interface AnimatedTestimonialsHeaderProps {
  title: string
  headingId?: string
}

// ============================================================================
// PowerBy Types
// ============================================================================

export interface PowerByConfig {
  name: string
  path: string
}
