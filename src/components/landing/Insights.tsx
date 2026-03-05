"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const articles = [
    {
        category: "Prediction Markets",
        categoryColor: "text-blue-light",
        title: "How Prediction Markets Work",
        description: "Understand the mechanics behind prediction markets. Learn how odds form, how trading works, and why these markets matter.",
        readTime: "9 min read",
    },
    {
        category: "Trading Strategy",
        categoryColor: "text-blue-light",
        title: "Strategies for Trading Prediction Markets",
        description: "Learn realistic approaches to finding alpha. Understand signal detection, position sizing, and risk management.",
        readTime: "10 min read",
    },
    {
        category: "Market Analysis",
        categoryColor: "text-blue-light",
        title: "Understanding Market Narratives",
        description: "How narratives move prediction markets, and how to detect when a narrative shift is about to create an opportunity.",
        readTime: "8 min read",
    },
];

export function Insights() {
    return (
        <section id="insights" className="py-24 relative">
            <div className="absolute inset-0 grid-bg opacity-20" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4"
                >
                    <div>
                        <span className="text-sm font-display text-blue-primary uppercase tracking-widest">Insights</span>
                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mt-4 uppercase tracking-tight">
                            <span className="text-white">Intelligence</span>{" "}
                            <span className="accent-blue">Feed</span>
                        </h2>
                    </div>
                    <a
                        href="#"
                        className="inline-flex items-center gap-1 text-sm text-blue-primary hover:text-blue-light transition-colors font-medium"
                    >
                        View all articles
                        <ArrowRight className="w-4 h-4" />
                    </a>
                </motion.div>

                {/* Article Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {articles.map((article, i) => (
                        <motion.a
                            key={article.title}
                            href="#"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.12 }}
                            className="glass-card p-6 sm:p-7 group cursor-pointer block"
                        >
                            {/* Category */}
                            <span className={`text-[10px] font-mono uppercase tracking-[0.15em] ${article.categoryColor}`}>
                                {article.category}
                            </span>

                            {/* Title */}
                            <h3 className="text-lg font-semibold text-white mt-3 mb-3 group-hover:text-blue-light transition-colors leading-snug">
                                {article.title}
                            </h3>

                            {/* Description */}
                            <p className="text-sm text-white/50 leading-relaxed mb-5 line-clamp-3">
                                {article.description}
                            </p>

                            {/* Read time */}
                            <span className="text-xs font-mono text-white/35">{article.readTime}</span>
                        </motion.a>
                    ))}
                </div>
            </div>
        </section>
    );
}
