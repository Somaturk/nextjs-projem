"use client"

import * as React from "react"
import { Smartphone, Tablet, Monitor } from "lucide-react"
import { usePortfolio } from "@/context/portfolio-context"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function ViewModeToggle() {
  const { viewMode, setViewMode } = usePortfolio()

  const toggleViewMode = () => {
    if (viewMode === 'mobile') {
        setViewMode('tablet');
    } else if (viewMode === 'tablet') {
        setViewMode('desktop');
    } else {
        setViewMode('mobile');
    }
  };
  
  const tooltipText = {
      mobile: 'Tablet Görünümüne Geç',
      tablet: 'Masaüstü Görünümüne Geç',
      desktop: 'Mobil Görünüme Geç'
  }[viewMode];

  return (
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>
                <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleViewMode}
                aria-label="Toggle view mode"
                >
                    {viewMode === 'mobile' && <Smartphone className="h-[1.2rem] w-[1.2rem]" />}
                    {viewMode === 'tablet' && <Tablet className="h-[1.2rem] w-[1.2rem]" />}
                    {viewMode === 'desktop' && <Monitor className="h-[1.2rem] w-[1.2rem]" />}
                    <span className="sr-only">Toggle view mode</span>
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>{tooltipText}</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
  )
}
