import { Image } from "@unpic/react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { useId } from "react"
import { useIntlayer } from "react-intlayer"
import { LocalizedLink } from "@/shared/components/locale/localized-link"
import { cn } from "@/shared/lib/utils"

const containerVariants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.43, 0.13, 0.23, 0.96] as const,
      delayChildren: 0.1,
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.43, 0.13, 0.23, 0.96] as const,
    },
  },
}

const numberVariants = {
  hidden: (direction: number) => ({
    opacity: 0,
    x: direction * 40,
    y: 15,
    rotate: direction * 5,
  }),
  visible: {
    opacity: 0.7,
    x: 0,
    y: 0,
    rotate: 0,
    transition: {
      duration: 0.8,
      ease: [0.43, 0.13, 0.23, 0.96] as const,
    },
  },
}

const ghostVariants = {
  hidden: {
    scale: 0.8,
    opacity: 0,
    y: 15,
    rotate: -5,
  },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: {
      duration: 0.6,
      ease: [0.43, 0.13, 0.23, 0.96] as const,
    },
  },
  hover: {
    scale: 1.1,
    y: -10,
    rotate: [0, -5, 5, -5, 0],
    transition: {
      duration: 0.8,
      ease: "easeInOut" as const,
      rotate: {
        duration: 2,
        ease: "linear" as const,
        repeat: Infinity,
        repeatType: "reverse" as const,
      },
    },
  },
  floating: {
    y: [-5, 5],
    transition: {
      y: {
        duration: 2,
        ease: "easeInOut" as const,
        repeat: Infinity,
        repeatType: "reverse" as const,
      },
    },
  },
}

export function GlobalNotFoundComponent() {
  const titleId = useId()
  const descId = useId()
  const content = useIntlayer("not-found")
  const shouldReduceMotion = useReducedMotion()

  return (
    <section
      className={cn(
        "global-not-found",
        "min-h-screen flex flex-col items-center justify-center bg-background",
        "px-4"
      )}
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      <AnimatePresence mode="wait">
        <motion.div
          className="text-center"
          variants={containerVariants}
          initial={shouldReduceMotion ? false : "hidden"}
          animate="visible"
          exit={shouldReduceMotion ? undefined : "hidden"}
        >
          <div className="flex items-center justify-center gap-4 md:gap-6 mb-8 md:mb-12">
            <motion.span
              className="text-[80px] md:text-[120px] font-bold text-foreground opacity-70 font-signika select-none"
              variants={numberVariants}
              custom={-1}
              aria-hidden="true"
            >
              4
            </motion.span>
            <motion.div
              variants={ghostVariants}
              whileHover={shouldReduceMotion ? undefined : "hover"}
              animate={shouldReduceMotion ? "visible" : ["visible", "floating"]}
              aria-hidden="true"
            >
              <Image
                src="https://xubohuah.github.io/xubohua.top/Group.png"
                alt=""
                width={120}
                height={120}
                className="w-[80px] h-[80px] md:w-[120px] md:h-[120px] object-contain select-none"
                draggable="false"
              />
            </motion.div>
            <motion.span
              className="text-[80px] md:text-[120px] font-bold text-foreground opacity-70 font-signika select-none"
              variants={numberVariants}
              custom={1}
              aria-hidden="true"
            >
              4
            </motion.span>
          </div>

          <motion.h1
            id={titleId}
            className="text-3xl md:text-5xl font-bold text-foreground mb-4 md:mb-6 opacity-70 font-dm-sans select-none"
            variants={itemVariants}
          >
            {content.title.value}
          </motion.h1>

          <motion.p
            id={descId}
            className="text-lg md:text-xl text-muted-foreground mb-8 md:mb-12 font-dm-sans select-none"
            variants={itemVariants}
          >
            {content.description.value}
          </motion.p>

          <motion.div
            variants={itemVariants}
            whileHover={
              shouldReduceMotion
                ? undefined
                : {
                    scale: 1.05,
                    transition: {
                      duration: 0.3,
                      ease: [0.43, 0.13, 0.23, 0.96] as const,
                    },
                  }
            }
          >
            <LocalizedLink
              to="/"
              className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-full text-lg font-medium hover:bg-primary/90 transition-colors font-dm-sans select-none"
            >
              {content.home.value}
            </LocalizedLink>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
