import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import type { CarouselApi } from "@/components/atoms/ui/carousel"

import { Card, CardContent } from "@/components/atoms/ui/card"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/atoms/ui/carousel"

export interface Slide {
    imageUrl: string
    title: string
    description: string
}

interface CarouselPluginProps {
    slides: Slide[]
}

export function CarouselPlugin({ slides }: CarouselPluginProps) {
    const AUTOPLAY_DELAY_MS = 7000
    const plugin = React.useRef(Autoplay({ delay: AUTOPLAY_DELAY_MS, stopOnInteraction: true }))
    const [api, setApi] = React.useState<CarouselApi>()
    const resumeTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
    const deadlineRef = React.useRef<number | null>(null)
    const remainingMsRef = React.useRef(AUTOPLAY_DELAY_MS)

    const clearResumeTimeout = React.useCallback(() => {
        if (!resumeTimeoutRef.current) return
        clearTimeout(resumeTimeoutRef.current)
        resumeTimeoutRef.current = null
    }, [])

    const scheduleResume = React.useCallback((delayMs: number) => {
        clearResumeTimeout()

        if (!api) return

        const safeDelay = Math.max(0, delayMs)
        remainingMsRef.current = safeDelay
        deadlineRef.current = Date.now() + safeDelay

        resumeTimeoutRef.current = setTimeout(() => {
            api.scrollNext()
            plugin.current.reset()
            remainingMsRef.current = AUTOPLAY_DELAY_MS
            deadlineRef.current = Date.now() + AUTOPLAY_DELAY_MS
            resumeTimeoutRef.current = null
        }, safeDelay)
    }, [api, clearResumeTimeout])

    const handleMouseEnter = React.useCallback(() => {
        if (deadlineRef.current) {
            remainingMsRef.current = Math.max(0, deadlineRef.current - Date.now())
        }
        clearResumeTimeout()
        plugin.current.stop()
    }, [clearResumeTimeout])

    const handleMouseLeave = React.useCallback(() => {
        scheduleResume(remainingMsRef.current)
    }, [scheduleResume])

    React.useEffect(() => {
        if (!api) return

        deadlineRef.current = Date.now() + AUTOPLAY_DELAY_MS
        remainingMsRef.current = AUTOPLAY_DELAY_MS
    }, [api])

    React.useEffect(() => {
        return () => clearResumeTimeout()
    }, [clearResumeTimeout])

    return (
        <div className="flex flex-col w-full justify-center items-center">
            <Carousel
                setApi={setApi}
                opts={{ loop: true }}
                plugins={[plugin.current]}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <CarouselContent>
                    {slides.map((slide, index) => (
                        <CarouselItem key={index}>
                            <div className="p-0 relative">
                                <Card>
                                    <CardContent className="p-0 relative">
                                        <div className="aspect-square relative">
                                            <img
                                                src={slide.imageUrl}
                                                alt="Imagen del slide"
                                                className="h-full w-full object-cover  rounded-xl"
                                            />
                                            <div className="absolute bottom-10 left-8 bg-opacity-50 p-2 rounded-xl">
                                                <h3 className="text-white text-3xl font-bold">{slide.title}</h3>
                                                <p className="text-white text-xl w-8/12">{slide.description}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </div>
    )
}
