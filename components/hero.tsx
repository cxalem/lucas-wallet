"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useAnimation } from "framer-motion"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

type HeroProps = {
   title: string
   subtitle: string
}

export default function Hero({ title, subtitle }: HeroProps) {
   const [animationComplete, setAnimationComplete] = useState(false)
   const [showSuccess, setShowSuccess] = useState(false)
   const [loading, setLoading] = useState(false)
   const [showCursor, setShowCursor] = useState(false)
   const [isConfirming, setIsConfirming] = useState(false)
   const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
   const cursorControls = useAnimation()
   const buttonRef = useRef(null)
   const chatContainerRef = useRef<HTMLDivElement>(null)

   useEffect(() => {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
      setPrefersReducedMotion(mediaQuery.matches)

      const handleChange = () => setPrefersReducedMotion(mediaQuery.matches)
      mediaQuery.addEventListener("change", handleChange)

      return () => mediaQuery.removeEventListener("change", handleChange)
   }, [])

   // Scroll to bottom when new messages appear
   useEffect(() => {
      if (chatContainerRef.current) {
         chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
      }
   }, [animationComplete, showSuccess])

   useEffect(() => {
      if (prefersReducedMotion) {
         setAnimationComplete(true)
         setShowSuccess(true)
      } else if (animationComplete) {
         // Show cursor and animate it to the button
         setShowCursor(true)

         const animateCursor = async () => {
            // Start position (center of screen)
            await cursorControls.start({
               opacity: 1,
               x: 0,
               y: 0,
               transition: { duration: 0.3 },
            })

            // Move to button
            await cursorControls.start({
               x: 150,
               y: -60,
               transition: { duration: 0.8, ease: "easeInOut" },
            })

            // Click animation (scale down and up quickly)
            await cursorControls.start({
               scale: 0.8,
               transition: { duration: 0.1 },
            })
            await cursorControls.start({
               scale: 1,
               transition: { duration: 0.1 },
            })

            // Start loading and hide cursor
            setLoading(true)
            await cursorControls.start({
               opacity: 0,
               transition: { duration: 0.3 },
            })
            setShowCursor(false)

            // Complete the transaction after loading
            setTimeout(() => {
               setLoading(false)
               setShowSuccess(true)
            }, 1000)
         }

         // Delay before starting cursor animation
         const timer = setTimeout(() => {
            animateCursor()
         }, 1000)

         return () => clearTimeout(timer)
      }
   }, [prefersReducedMotion, animationComplete, cursorControls])

   const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
         opacity: 1,
         transition: {
            staggerChildren: 1.2,
            delayChildren: 0.5,
         },
      },
   }

   const itemVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
   }

   return (
      <section className="relative flex flex-col items-center justify-center font-[family-name:var(--font-geist-sans)] bg-gradient-radial from-neutral-950 via-neutral-900 to-neutral-950 text-white overflow-hidden">
         <div className="mt-8">
            <div className="flex flex-col">
               <h1 className="text-4xl md:text-6xl font-bold md:font-black text-center">
                  {title}
               </h1>
               <p className="text-center text-3xl md:text-5xl font-extralight">
                  {subtitle}
               </p>
            </div>

            <div className="mx-auto h-[550px] rounded-2xl border bg-neutral-900 border-neutral-700/50 backdrop-blur py-4 sm:px-6 w-full sm:w-[90%] md:w-[600px] mb-8 flex flex-col [mask-image:linear-gradient(to_bottom,transparent,black_60%,black)]">
               <div className="pb-3 border-b border-neutral-800">
                  <h3 className="text-lg sm:text-xl font-semibold text-neutral-50">Lucas Assistant</h3>
                  <p className="text-xs sm:text-sm text-neutral-400">
                     This assistant will help you to execute transactions like buying crypto, sending payments, and more.
                  </p>
               </div>

               <div
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto h-[340px] sm:h-[380px] py-4 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent"
                  style={{ scrollBehavior: "smooth" }}
               >
                  <motion.div
                     className="flex flex-col gap-4"
                     variants={containerVariants}
                     initial={prefersReducedMotion ? "visible" : "hidden"}
                     animate="visible"
                     onAnimationComplete={() => setTimeout(() => setAnimationComplete(true), 800)}
                  >
                     <motion.div className="self-end max-w-[80%]" variants={itemVariants}>
                        <div className="bg-gradient-to-l from-violet-600 to-indigo-600 text-white p-2 sm:p-3 rounded-2xl rounded-tr-sm text-sm sm:text-base">
                           Send $20 to @meowy for today&apos;s dinner
                        </div>
                     </motion.div>
                     <motion.div
                        className="self-start max-w-[80%]"
                        variants={itemVariants}
                        onAnimationComplete={() => setIsConfirming(true)}
                     >
                        <div className="bg-neutral-800 text-start text-neutral-50 p-2 sm:p-3 rounded-2xl rounded-tl-sm text-sm sm:text-base">
                           Sending $20 to @meowy, please confirm the transaction details.
                        </div>
                     </motion.div>

                     {isConfirming && (
                        <motion.div className="self-start relative" variants={itemVariants}>
                           <Card className="bg-neutral-900 rounded-xl px-4 sm:px-6 py-6 sm:py-8 w-full sm:w-72 md:w-80 border-neutral-800">
                              <div className="flex flex-col items-center">
                                 <div className="bg-violet-600/10 rounded-full p-3 sm:p-4 mb-3 sm:mb-4">
                                    <Send className="h-5 w-5 sm:h-6 sm:w-6 text-violet-500" />
                                 </div>
                                 <div className="text-lg sm:text-xl font-bold mb-1 text-neutral-50">$20.00 USD</div>
                                 <div className="text-neutral-400 mb-4 sm:mb-6 text-sm sm:text-base">to @meowy</div>
                                 <Button
                                    ref={buttonRef}
                                    className={`w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-2 sm:py-2.5 rounded-lg text-sm sm:text-base ${loading ? "relative overflow-hidden" : ""}`}
                                    disabled={loading || showSuccess}
                                 >
                                    {loading ? (
                                       <>
                                          <span className="opacity-0">Confirm Transfer</span>
                                          <span className="absolute inset-0 flex items-center justify-center">
                                             <div className="h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                          </span>
                                       </>
                                    ) : (
                                       "Confirm Transfer"
                                    )}
                                 </Button>
                              </div>
                           </Card>
                           {showCursor && (
                              <motion.div
                                 className="absolute z-10 pointer-events-none"
                                 initial={{ opacity: 0, x: 0, y: 0 }}
                                 animate={cursorControls}
                              >
                                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                       d="M4 4L12 20L15 15L20 12L4 4Z"
                                       fill="white"
                                       stroke="black"
                                       strokeWidth="1.5"
                                       strokeLinecap="round"
                                       strokeLinejoin="round"
                                    />
                                 </svg>
                              </motion.div>
                           )}
                        </motion.div>
                     )}
                     {(showSuccess || prefersReducedMotion) && (
                        <motion.div
                           className="self-start max-w-[80%]"
                           initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ duration: 0.5 }}
                        >
                           <div className="bg-emerald-600/20 text-emerald-300 p-2 sm:p-3 rounded-2xl rounded-tl-sm text-sm text-start sm:text-base">
                               ✅ Your transaction has been sent, I&apos;ve let @meowy know that you paid for today&apos;s dinner.
                           </div>
                        </motion.div>
                     )}

                     <div className="h-4"></div>
                  </motion.div>
               </div>

               {/* User Input Field */}
               <div className="mt-4 relative">
                  <div className="relative">
                     <input
                        type="text"
                        placeholder="Type your message..."
                        className="w-full bg-neutral-800/80 text-neutral-100 rounded-full py-2 sm:py-3 pl-3 sm:pl-4 pr-12 sm:pr-14 focus:outline-none focus:ring-1 focus:ring-violet-500 text-sm sm:text-base"
                        disabled
                        defaultValue=""
                     />
                     <div className="absolute right-1.5 top-1/2 transform -translate-y-1/2">
                        <button
                           className="bg-neutral-700 hover:bg-neutral-600 text-neutral-300 p-2 sm:p-2.5 rounded-full"
                           aria-label="Send message"
                           disabled
                        >
                           <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                     </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex flex-wrap gap-2 mt-3 sm:mt-4 pb-1 sm:pb-2">
                     <button
                        className="bg-neutral-800/80 text-neutral-300 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-full hover:bg-neutral-700"
                        disabled
                     >
                        Send Transaction
                     </button>
                     <button
                        className="bg-neutral-800/80 text-neutral-300 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-full hover:bg-neutral-700"
                        disabled
                     >
                        Get Transactions
                     </button>
                     <button
                        className="bg-neutral-800/80 text-neutral-300 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-full hover:bg-neutral-700"
                        disabled
                     >
                        Buy SOL
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}