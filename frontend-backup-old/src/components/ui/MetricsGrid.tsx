import React from 'react';
import Slider from 'react-slick';
import { MetricCard } from './MetricCard';
import { SlickStyles } from './SlickStyles';
import type { LucideIcon } from 'lucide-react';

export interface MetricData {
  title: string;
  value: string;
  icon: LucideIcon;
  bgClass: string;
  colorClass: string;
  tooltipText?: string;
}

interface MetricsGridProps {
  metrics: MetricData[];
}

const sliderSettings = {
  dots: true,
  infinite: false,
  speed: 500,
  slidesToShow: 1.1,
  slidesToScroll: 1,
  arrows: false,
  centerMode: true,
  centerPadding: '20px',
};

export const MetricsGrid = ({ metrics }: MetricsGridProps) => {
  return (
    <>
      <SlickStyles />
      
      {/* Desktop Grid - 5 columns on large screens */}
      <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-0">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Mobile Carousel - Swipeable with dots */}
      <div className="block lg:hidden mb-2 -mx-4">
        <Slider {...sliderSettings}>
          {metrics.map((metric, index) => (
            <div key={index} className="px-2 py-2">
              <MetricCard {...metric} />
            </div>
          ))}
        </Slider>
      </div>
    </>
  );
};