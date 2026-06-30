import { Image } from "@unpic/react"
import { motion, useReducedMotion } from "motion/react"
import React from "react"
import { cn } from "@/shared/lib/utils"

interface Testimonial {
  id?: string
  text: string
  image: string
  name: string
  role: string
}

export interface TestimonialsColumnProps {
  className?: string
  testimonials: Testimonial[]
  duration?: number
  columnIndex?: number
}

export const TestimonialsColumn = ({
  className,
  testimonials,
  duration = 10,
  columnIndex = 1,
}: TestimonialsColumnProps) => {
  const shouldReduceMotion = useReducedMotion()
  const loops = shouldReduceMotion ? 1 : 2

  return (
    <div className={className}>
      <motion.div
        animate={shouldReduceMotion ? undefined : { y: "-50%" }}
        transition={
          shouldReduceMotion
            ? undefined
            : {
                duration,
                repeat: Infinity,
                ease: "linear",
                repeatType: "loop",
              }
        }
        className={cn("flex flex-col gap-6 pb-6")}
        style={{ backgroundColor: "transparent" }}
        aria-live="polite"
        aria-label={shouldReduceMotion ? "Testimonials" : "Scrolling testimonials"}
      >
        {[
          ...new Array(loops).fill(0).map((_, index) => (
            <React.Fragment key={`loop-${index}`}>
              {testimonials.map(({ text, image, name, role }, i) => (
                <article
                  key={`${index}-${i}`}
                  className={cn(
                    "max-w-xs w-full p-6 rounded-2xl",
                    "transition-[box-shadow,transform,border-color,background-color] duration-300 hover:scale-105",
                    "focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
                    "border shadow-lg shadow-primary/10",
                    "dark:bg-white/5 dark:border-white/10 dark:backdrop-blur-md"
                  )}
                  aria-labelledby={`testimonial-${columnIndex}-${i}-author`}
                  aria-describedby={`testimonial-${columnIndex}-${i}-content`}
                >
                  <blockquote
                    id={`testimonial-${columnIndex}-${i}-content`}
                    className={cn(
                      "text-sm leading-relaxed mb-4",
                      "text-gray-900 dark:text-white/90"
                    )}
                    cite={`Testimonial by ${name}`}
                  >
                    "{text}"
                  </blockquote>

                  <footer className={cn("flex items-center gap-3")}>
                    <Image
                      width={40}
                      height={40}
                      src={image}
                      alt={`Profile picture of ${name}`}
                      className={cn("h-10 w-10 select-none", "dark:border-2 dark:border-white/20")}
                    />

                    <div className={cn("flex flex-col")}>
                      <cite
                        id={`testimonial-${columnIndex}-${i}-author`}
                        className={cn(
                          "font-semibold text-sm leading-tight not-italic",
                          "text-gray-900 dark:text-white"
                        )}
                      >
                        {name}
                      </cite>

                      <div
                        className={cn(
                          "text-xs leading-tight mt-0.5",
                          "text-gray-600 dark:text-white/60"
                        )}
                        title={`${name}'s role`}
                      >
                        {role}
                      </div>
                    </div>
                  </footer>
                </article>
              ))}
            </React.Fragment>
          )),
        ]}
      </motion.div>
    </div>
  )
}
