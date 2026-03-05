"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function IntelligenceEdge() {
    return (
        <section className="py-12 sm:py-16 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="relative overflow-hidden min-h-[400px] sm:min-h-[500px] flex items-center justify-center"
                >
                    {/* Background image */}
                    <Image
                        src="/intelligence_bg.png"
                        alt="Digital whale visualization representing market intelligence"
                        fill
                        className="object-cover"
                        sizes="(max-width: 1280px) 100vw, 1280px"
                    />

                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-[#060B1A]/80 z-1" />

                    {/* Content */}
                    <div className="relative z-10 text-center px-6 py-16 sm:py-20 max-w-3xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <span className="text-sm font-display text-blue-light uppercase tracking-widest">Intelligence Edge</span>

                            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold mt-4 mb-6 leading-tight uppercase tracking-tight">
                                <span className="text-white">Move With</span>
                                <br />
                                <span className="text-blue-primary">The Smart Money</span>
                            </h2>

                            <p className="text-base sm:text-lg text-white/60 max-w-xl mx-auto mb-4 leading-relaxed">
                                The biggest traders win because they see the signal first.
                            </p>
                            <p className="text-base sm:text-lg text-white/45 max-w-xl mx-auto mb-10 leading-relaxed">
                                HeyAnna helps you identify those signals before they become obvious.
                            </p>

                            <a
                                href="https://t.me/+i9D5bDox8lNmNDk9"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center px-10 py-4 rounded-sm bg-blue-primary text-white font-bold text-sm uppercase tracking-widest hover:bg-[#5A7FFF] transition-all duration-300 glow-primary hover:scale-[1.02]"
                            >
                                Start Using HeyAnna
                                <svg className="ml-3 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </a>
                        </motion.div>
                    </div>

                    {/* Decorative border */}
                    <div className="absolute inset-0 border border-blue-primary/20 z-2 pointer-events-none" />
                </motion.div>
            </div>
        </section>
    );
}
